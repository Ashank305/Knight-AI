import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbRepository } from '@/lib/repository';

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
    const body = await req.json();
    const { changes } = body;

    if (!Array.isArray(changes)) {
      return NextResponse.json({ error: 'Changes array required' }, { status: 400 });
    }

    let updatedCount = 0;
    for (const item of changes) {
      if (!item.taskId || !item.proposedDate) continue;

      const existingTask = await dbRepository.getTaskById(item.taskId, session.userId);
      // Security & business rule: Never alter completed tasks during replan
      if (!existingTask || existingTask.status === 'COMPLETED') continue;

      await dbRepository.updateTask(item.taskId, session.userId, {
        plannedDate: new Date(item.proposedDate),
      });
      updatedCount += 1;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully rescheduled ${updatedCount} unfinished tasks without altering completed tasks.`,
      updatedCount,
    });
  } catch (err: any) {
    console.error('Replan confirmation error:', err);
    return NextResponse.json({ error: 'Failed to apply replan changes' }, { status: 500 });
  }
}
