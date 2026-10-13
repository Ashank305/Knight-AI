import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbRepository } from '@/lib/repository';
import { taskUpdateSchema } from '@/lib/validations';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const task = await dbRepository.getTaskById(id, session.userId);

  if (!task) {
    return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PUT(
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
    const result = taskUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid task update inputs', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const dataToUpdate: any = { ...result.data };
    if (dataToUpdate.plannedDate) {
      dataToUpdate.plannedDate = new Date(dataToUpdate.plannedDate);
    }

    const updated = await dbRepository.updateTask(id, session.userId, dataToUpdate);
    if (!updated) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ task: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const success = await dbRepository.deleteTask(id, session.userId);

  if (!success) {
    return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Task deleted successfully' });
}
