import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbRepository } from '@/lib/repository';
import { taskCreateSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') as any;
  const category = searchParams.get('category') as any;
  const priority = searchParams.get('priority') as any;
  const planId = searchParams.get('planId') || undefined;
  const isToday = searchParams.get('isToday') === 'true';

  const tasks = await dbRepository.getUserTasks(session.userId, {
    status: status || undefined,
    category: category || undefined,
    priority: priority || undefined,
    planId,
    isToday,
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = taskCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid task data', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { planId, title, description, category, priority, plannedDate, estimatedDuration, completionCriteria, notes } = result.data;

    const task = await dbRepository.createTask(session.userId, {
      planId,
      title,
      description,
      category,
      priority,
      plannedDate: new Date(plannedDate),
      estimatedDuration,
      completionCriteria,
      notes,
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err: any) {
    console.error('Create task error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create task' }, { status: 500 });
  }
}
