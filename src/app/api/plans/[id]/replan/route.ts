import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbRepository } from '@/lib/repository';
import { replanRequestSchema } from '@/lib/validations';
import { computeAdaptiveReplan } from '@/lib/ai/replanner';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const plan = await dbRepository.getPlanById(id, session.userId);
  if (!plan) {
    return NextResponse.json({ error: 'Plan not found or unauthorized' }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const validated = replanRequestSchema.safeParse({ planId: id, ...body });

    const newDailyHours = validated.success ? validated.data.newDailyHours : undefined;
    const newInterviewDate = validated.success ? validated.data.newInterviewDate : undefined;

    const preview = await computeAdaptiveReplan({
      plan,
      tasks: plan.tasks,
      newDailyHours,
      newInterviewDate,
    });

    return NextResponse.json({ preview });
  } catch (err: any) {
    console.error('Replan calculation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to calculate adaptive replan schedule' },
      { status: 500 }
    );
  }
}
