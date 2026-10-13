import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbRepository } from '@/lib/repository';
import { candidateProfileSchema } from '@/lib/validations';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await dbRepository.getProfile(session.userId);
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = candidateProfileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await dbRepository.upsertProfile(session.userId, result.data);
    return NextResponse.json({ profile: updated });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Failed to update candidate profile' }, { status: 500 });
  }
}
