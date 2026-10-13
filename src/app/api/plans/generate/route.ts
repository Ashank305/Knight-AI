import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbRepository } from '@/lib/repository';
import { planGenerationInputSchema } from '@/lib/validations';
import { generatePreparationPlan } from '@/lib/ai/generator';

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = planGenerationInputSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid plan generation inputs', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const input = result.data;

    // Generate structured plan via Gemini or deterministic fallback
    const generated = await generatePreparationPlan(input);

    // Compute dates for tasks
    const startDate = new Date();
    startDate.setHours(9, 0, 0, 0);

    const interviewDateObj = input.interviewDate ? new Date(input.interviewDate) : null;

    const tasksToCreate = generated.tasks.map((t, idx) => {
      const plannedDate = new Date(startDate);
      // Offset by dayOffset - 1 days
      const daysToAdd = Math.max((t.dayOffset || 1) - 1, 0);
      plannedDate.setDate(startDate.getDate() + daysToAdd);

      return {
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        plannedDate,
        estimatedDuration: t.estimatedDuration,
        completionCriteria: t.completionCriteria,
        resourceLinks: t.resourceLinks || [],
        order: idx + 1,
      };
    });

    const savedPlan = await dbRepository.createPlan(session.userId, {
      title: generated.title,
      targetCompany: input.targetCompany,
      targetRole: input.targetRole,
      applicationSource: input.applicationSource,
      interviewType: input.interviewType,
      interviewDate: interviewDateObj,
      planningHorizon: input.planningHorizonDays,
      dailyAvailability: input.dailyStudyHours,
      goals: generated.goals,
      skillGaps: generated.skillGaps,
      phases: generated.phases,
      isDemoPlan: generated.isDemo,
      tasks: tasksToCreate,
    });

    // Update candidate profile with newly specified preferences
    await dbRepository.upsertProfile(session.userId, {
      targetRole: input.targetRole,
      educationLevel: input.educationLevel,
      experienceLevel: input.experienceLevel,
      primaryLanguages: input.primaryLanguages,
      existingSkills: input.existingSkills,
      improvementAreas: input.improvementAreas,
      dailyStudyHours: input.dailyStudyHours,
    });

    return NextResponse.json({
      success: true,
      plan: savedPlan,
      isDemo: generated.isDemo,
      aiDisclaimer: generated.aiDisclaimer,
    });
  } catch (err: any) {
    console.error('Plan generation route error:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred during preparation plan generation.' },
      { status: 500 }
    );
  }
}
