'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, CategoryBadge, PriorityBadge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  PlusCircle,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Layers,
  Target,
  Edit2,
  Trash2,
} from 'lucide-react';

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const planId = resolvedParams.id;

  const [plan, setPlan] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Replan Modal State
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);
  const [isCalculatingReplan, setIsCalculatingReplan] = useState(false);
  const [isApplyingReplan, setIsApplyingReplan] = useState(false);
  const [replanPreview, setReplanPreview] = useState<any>(null);

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    category: 'DSA',
    priority: 'MEDIUM',
    plannedDate: new Date().toISOString().split('T')[0],
    estimatedDuration: 60,
    completionCriteria: 'Mark complete once practiced and understood',
  });

  const fetchPlan = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/login');
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);

      const res = await fetch(`/api/plans/${planId}`);
      if (!res.ok) throw new Error('Plan not found or unauthorized');
      const data = await res.json();
      setPlan(data.plan);
    } catch (err: any) {
      setError(err.message || 'Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const toggleTaskStatus = async (task: any) => {
    const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      const res = await fetch(`/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPlan((prev: any) => {
          if (!prev) return prev;
          const updatedTasks = prev.tasks.map((t: any) =>
            t.id === task.id ? { ...t, status: newStatus } : t
          );
          return { ...prev, tasks: updatedTasks };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // OPEN REPLAN PREVIEW
  const handleOpenReplan = async () => {
    setIsReplanModalOpen(true);
    setIsCalculatingReplan(true);
    setReplanPreview(null);

    try {
      const res = await fetch(`/api/plans/${planId}/replan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to calculate adaptive replan.');
      setReplanPreview(data.preview);
    } catch (err: any) {
      setError(err.message || 'Adaptive replan failed.');
    } finally {
      setIsCalculatingReplan(false);
    }
  };

  // CONFIRM REPLAN APPLICATION
  const handleApplyReplan = async () => {
    if (!replanPreview?.rescheduledTasks) return;
    setIsApplyingReplan(true);

    try {
      const changes = replanPreview.rescheduledTasks.map((t: any) => ({
        taskId: t.taskId,
        proposedDate: t.proposedDate,
      }));

      const res = await fetch(`/api/plans/${planId}/replan/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });

      if (!res.ok) throw new Error('Failed to apply replan changes.');

      setIsReplanModalOpen(false);
      await fetchPlan(); // reload fresh plan with updated dates
    } catch (err: any) {
      setError(err.message || 'Could not apply replanned schedule.');
    } finally {
      setIsApplyingReplan(false);
    }
  };

  // CREATE CUSTOM TASK
  const handleCreateCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          ...newTaskForm,
        }),
      });

      if (!res.ok) throw new Error('Failed to create task');

      setIsAddTaskModalOpen(false);
      setNewTaskForm({
        title: '',
        description: '',
        category: 'DSA',
        priority: 'MEDIUM',
        plannedDate: new Date().toISOString().split('T')[0],
        estimatedDuration: 60,
        completionCriteria: 'Mark complete once practiced and understood',
      });
      await fetchPlan();
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    } finally {
      setIsSavingTask(false);
    }
  };

  if (loading) {
    return (
      <AppShell user={user}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (error || !plan) {
    return (
      <AppShell user={user}>
        <div className="text-center py-12">
          <p className="text-rose-600 font-semibold">{error || 'Plan not found'}</p>
          <Link href="/plans" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">
            ← Return to Plans List
          </Link>
        </div>
      </AppShell>
    );
  }

  const tasks = plan.tasks || [];
  const completedCount = tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/plans"
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Plans
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {plan.targetCompany} • {plan.targetRole}
                </span>
                {plan.isDemoPlan && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Demo Mode Plan
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                {plan.title}
              </h1>
            </div>

            {/* Plan Actions */}
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenReplan}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Replan My Schedule
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddTaskModalOpen(true)}
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Custom Task
              </Button>
            </div>
          </div>
        </div>

        {/* Roadmap Overview Card */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Planning Horizon</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {plan.planningHorizon} Days
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Daily Target</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {plan.dailyAvailability} Hours/day
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Interview Format</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block capitalize">
                  {plan.interviewType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Tasks Completed</span>
                <span className="font-semibold text-indigo-700 text-sm mt-0.5 block">
                  {completedCount} of {tasks.length} ({progressPct}%)
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Goals & Skill Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" /> Preparation Goals
                </span>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  {plan.goals?.map((g: string, i: number) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" /> Targeted Improvement Areas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {plan.skillGaps?.map((gap: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px]"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phased Daily Tasks List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Roadmap Tasks ({tasks.length})</CardTitle>
              <CardDescription>
                Chronologically ordered study tasks with specific verification criteria.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 pt-0">
            {tasks.map((task: any) => {
              const isCompleted = task.status === 'COMPLETED';

              return (
                <div
                  key={task.id}
                  className="py-4 flex items-start justify-between gap-4 group hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/tasks/${task.id}`}
                          className={`text-sm font-semibold hover:text-indigo-600 transition-colors ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </Link>
                      </div>

                      <p className="text-xs text-slate-500 mt-1">{task.description}</p>

                      <div className="mt-2 text-xs bg-slate-50 border border-slate-200/80 rounded-md p-2 text-slate-600">
                        <strong className="text-slate-700">Completion Criteria: </strong>
                        {task.completionCriteria}
                      </div>

                      <div className="flex items-center gap-2 mt-2.5">
                        <CategoryBadge category={task.category} />
                        <PriorityBadge priority={task.priority} />
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.estimatedDuration}m
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium text-slate-600 block">
                      {new Date(task.plannedDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="mt-2 inline-block text-xs text-indigo-600 hover:underline"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* MODAL: ADAPTIVE REPLAN PREVIEW & CONFIRMATION */}
        <Dialog
          isOpen={isReplanModalOpen}
          onClose={() => setIsReplanModalOpen(false)}
          title="Adaptive Schedule Replanning"
          description="Rebalance overdue and unfinished tasks without modifying your completed achievements."
          maxWidth="2xl"
        >
          {isCalculatingReplan ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-sm font-medium text-slate-700">
                Evaluating unfinished workloads and capacity...
              </p>
              <p className="text-xs text-slate-400">
                Preserving completed milestones and redistributing dates.
              </p>
            </div>
          ) : replanPreview ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs">
                <span className="font-semibold block mb-0.5">Proposed Adjustment Summary:</span>
                <p>{replanPreview.summary}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                  <span className="font-bold text-base block">
                    {replanPreview.completedPreservedCount}
                  </span>
                  <span>Preserved Intact</span>
                </div>
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800">
                  <span className="font-bold text-base block">
                    {replanPreview.rescheduledTasks?.length || 0}
                  </span>
                  <span>Rescheduled Tasks</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
                  <span className="font-bold text-base block">
                    {replanPreview.deferredTasks?.length || 0}
                  </span>
                  <span>Deferred (Low Priority)</span>
                </div>
              </div>

              {/* Proposed Rescheduled Tasks Preview Table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Proposed Schedule Changes
                </h4>
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                  {replanPreview.rescheduledTasks?.map((item: any) => (
                    <div key={item.taskId} className="p-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-800">{item.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="line-through text-slate-400 mr-2">{item.currentDate}</span>
                        <span className="font-semibold text-indigo-600">→ {item.proposedDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Confirmation Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setIsReplanModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyReplan}
                  isLoading={isApplyingReplan}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm & Apply Revised Schedule
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-500">Failed to generate preview.</p>
          )}
        </Dialog>

        {/* MODAL: ADD CUSTOM TASK */}
        <Dialog
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          title="Add Custom Preparation Task"
          description="Add a candidate-authored study or practice session to this roadmap."
        >
          <form onSubmit={handleCreateCustomTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={newTaskForm.title}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                placeholder="e.g. Graph Traversal: Dijkstra's Algorithm Practice"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={newTaskForm.description}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                placeholder="Details of problem sets or concept review..."
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={newTaskForm.category}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="DSA">DSA</option>
                  <option value="CORE_CS">Core CS</option>
                  <option value="SYSTEM_DESIGN">System Design</option>
                  <option value="BEHAVIORAL">Behavioral</option>
                  <option value="MOCK_INTERVIEW">Mock Interview</option>
                  <option value="REVISION">Revision</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  value={newTaskForm.priority}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Planned Date
                </label>
                <input
                  type="date"
                  required
                  value={newTaskForm.plannedDate}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, plannedDate: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="360"
                  step="15"
                  value={newTaskForm.estimatedDuration}
                  onChange={(e) =>
                    setNewTaskForm({ ...newTaskForm, estimatedDuration: parseInt(e.target.value) || 60 })
                  }
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Completion Criteria
              </label>
              <input
                type="text"
                value={newTaskForm.completionCriteria}
                onChange={(e) =>
                  setNewTaskForm({ ...newTaskForm, completionCriteria: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSavingTask}>
                Save Task
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </AppShell>
  );
}
