import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbRepository } from '@/lib/repository';
import { TaskStatus } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !Object.values(TaskStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid task status' }, { status: 400 });
    }

    const updated = await dbRepository.updateTask(id, session.userId, { status });
    if (!updated) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ task: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
  }
}
