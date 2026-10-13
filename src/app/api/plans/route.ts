import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbRepository } from '@/lib/repository';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plans = await dbRepository.getUserPlans(session.userId);
  return NextResponse.json({ plans });
}
