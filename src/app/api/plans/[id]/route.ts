import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbRepository } from '@/lib/repository';

export async function GET(
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
    return NextResponse.json({ error: 'Preparation plan not found' }, { status: 404 });
  }

  return NextResponse.json({ plan });
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
    const updated = await dbRepository.updatePlan(id, session.userId, body);

    if (!updated) {
      return NextResponse.json({ error: 'Plan not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ plan: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
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
  const success = await dbRepository.deletePlan(id, session.userId);

  if (!success) {
    return NextResponse.json({ error: 'Plan not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Plan deleted successfully' });
}
