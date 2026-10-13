import { getAIClient, getAIModelName, isAIAvailable } from './client';
import { buildReplanPrompt } from './prompts';

export interface ProposedTaskChange {
  taskId: string;
  title: string;
  category: string;
  priority: string;
  currentDate: string;
  proposedDate: string;
  durationMinutes: number;
  reason: string;
}

export interface ReplanPreviewResult {
  planId: string;
  summary: string;
  totalTasks: number;
  completedPreservedCount: number;
  unfinishedCount: number;
  rescheduledTasks: ProposedTaskChange[];
  deferredTasks: Array<{ taskId: string; title: string; priority: string; reason: string }>;
  isAiPowered: boolean;
}

export async function computeAdaptiveReplan(params: {
  plan: any;
  tasks: any[];
  newDailyHours?: number;
  newInterviewDate?: string | null;
}): Promise<ReplanPreviewResult> {
  const { plan, tasks } = params;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const unfinishedTasks = tasks.filter((t) => t.status !== 'COMPLETED');

  const dailyHours = params.newDailyHours || plan.dailyAvailability || 3;
  const maxDailyMinutes = Math.round(dailyHours * 60);

  // Calculate remaining days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let targetEndDate: Date;
  if (params.newInterviewDate) {
    targetEndDate = new Date(params.newInterviewDate);
  } else if (plan.interviewDate) {
    targetEndDate = new Date(plan.interviewDate);
  } else {
    targetEndDate = new Date(today);
    targetEndDate.setDate(today.getDate() + (plan.planningHorizon || 30));
  }

  const remainingDays = Math.max(
    Math.ceil((targetEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    3
  );

  const totalAvailableCapacityMinutes = remainingDays * maxDailyMinutes;
  const totalUnfinishedWorkMinutes = unfinishedTasks.reduce(
    (acc, t) => acc + (t.estimatedDuration || 60),
    0
  );

  // Deterministic scheduling logic
  const runDeterministicReplan = (summaryPrefix: string, isAi = false): ReplanPreviewResult => {
    // Sort unfinished: Overdue and HIGH priority first, then MEDIUM, then LOW
    const sorted = [...unfinishedTasks].sort((a, b) => {
      const aOverdue = new Date(a.plannedDate) < today ? 1 : 0;
      const bOverdue = new Date(b.plannedDate) < today ? 1 : 0;
      if (aOverdue !== bOverdue) return bOverdue - aOverdue;

      const priorityWeight: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
    });

    const dailyBucketMinutes: number[] = new Array(remainingDays).fill(0);
    const rescheduled: ProposedTaskChange[] = [];
    const deferred: Array<{ taskId: string; title: string; priority: string; reason: string }> = [];

    for (const task of sorted) {
      const taskDuration = task.estimatedDuration || 60;
      let placedDayIndex = -1;

      // Find the earliest day with capacity
      for (let day = 0; day < remainingDays; day++) {
        if (dailyBucketMinutes[day] + taskDuration <= maxDailyMinutes) {
          placedDayIndex = day;
          break;
        }
      }

      // If cannot fit within strict capacity, allow slightly or defer if low priority
      if (placedDayIndex === -1) {
        if (task.priority === 'LOW' && totalUnfinishedWorkMinutes > totalAvailableCapacityMinutes) {
          deferred.push({
            taskId: task.id,
            title: task.title,
            priority: task.priority,
            reason: `Deferred to protect critical preparation capacity within ${remainingDays} remaining days.`,
          });
          continue;
        } else {
          // Find day with minimum load
          let minDay = 0;
          let minLoad = dailyBucketMinutes[0];
          for (let d = 1; d < remainingDays; d++) {
            if (dailyBucketMinutes[d] < minLoad) {
              minLoad = dailyBucketMinutes[d];
              minDay = d;
            }
          }
          placedDayIndex = minDay;
        }
      }

      dailyBucketMinutes[placedDayIndex] += taskDuration;
      const proposedDate = new Date(today);
      proposedDate.setDate(today.getDate() + placedDayIndex + 1);

      const isOverdue = new Date(task.plannedDate) < today;
      const reason = isOverdue
        ? 'Rescheduled from overdue date to next available study window'
        : `Balanced to maintain optimal daily load of ${dailyHours} hours`;

      rescheduled.push({
        taskId: task.id,
        title: task.title,
        category: task.category,
        priority: task.priority,
        currentDate: new Date(task.plannedDate).toISOString().split('T')[0],
        proposedDate: proposedDate.toISOString().split('T')[0],
        durationMinutes: taskDuration,
        reason,
      });
    }

    return {
      planId: plan.id,
      summary: `${summaryPrefix} Analyzed ${unfinishedTasks.length} unfinished tasks across ${remainingDays} days. Preserved ${completedTasks.length} completed tasks intact. Rebalanced daily load to stay within ${dailyHours} hours/day.`,
      totalTasks: tasks.length,
      completedPreservedCount: completedTasks.length,
      unfinishedCount: unfinishedTasks.length,
      rescheduledTasks: rescheduled,
      deferredTasks: deferred,
      isAiPowered: isAi,
    };
  };

  // If AI is available, attempt AI-guided replanning
  if (isAIAvailable()) {
    const aiClient = getAIClient();
    if (aiClient) {
      try {
        const prompt = buildReplanPrompt({
          targetCompany: plan.targetCompany,
          targetRole: plan.targetRole,
          dailyHours,
          remainingDays,
          unfinishedTasks: unfinishedTasks.map((t) => ({
            id: t.id,
            title: t.title,
            category: t.category,
            priority: t.priority,
            estimatedDuration: t.estimatedDuration,
          })),
        });

        const modelsToTry = Array.from(new Set([getAIModelName(), 'gemini-3.5-flash', 'gemini-3.8-flash']));
        let text = '';
        for (const model of modelsToTry) {
          try {
            const response = await aiClient.models.generateContent({
              model,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            });
            text = response.text?.trim() || '';
            if (text) break;
          } catch (e) {
            // Try next model
          }
        }
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.scheduledTasks) && parsed.scheduledTasks.length > 0) {
            const rescheduled: ProposedTaskChange[] = [];
            const deferred: Array<{ taskId: string; title: string; priority: string; reason: string }> = [];

            const taskMap = new Map(unfinishedTasks.map((t) => [t.id, t]));

            for (const item of parsed.scheduledTasks) {
              const orig = taskMap.get(item.id);
              if (orig) {
                const dayOffset = Math.min(Math.max(item.dayOffset || 1, 1), remainingDays);
                const proposedDate = new Date(today);
                proposedDate.setDate(today.getDate() + dayOffset);

                rescheduled.push({
                  taskId: orig.id,
                  title: orig.title,
                  category: orig.category,
                  priority: orig.priority,
                  currentDate: new Date(orig.plannedDate).toISOString().split('T')[0],
                  proposedDate: proposedDate.toISOString().split('T')[0],
                  durationMinutes: orig.estimatedDuration,
                  reason: 'AI prioritized and scheduled based on target company requirements and available hours',
                });
              }
            }

            if (Array.isArray(parsed.deferredTaskIds)) {
              for (const defId of parsed.deferredTaskIds) {
                const orig = taskMap.get(defId);
                if (orig) {
                  deferred.push({
                    taskId: orig.id,
                    title: orig.title,
                    priority: orig.priority,
                    reason: 'AI deferred to prioritize high-yield interview topics within remaining timeframe.',
                  });
                }
              }
            }

            return {
              planId: plan.id,
              summary: parsed.summary || `AI optimized schedule across ${remainingDays} remaining days.`,
              totalTasks: tasks.length,
              completedPreservedCount: completedTasks.length,
              unfinishedCount: unfinishedTasks.length,
              rescheduledTasks: rescheduled,
              deferredTasks: deferred,
              isAiPowered: true,
            };
          }
        }
      } catch (err) {
        console.warn('AI replanning failed, using deterministic scheduler fallback', err);
      }
    }
  }

  // Deterministic fallback
  return runDeterministicReplan('Adaptive Scheduler:');
}
