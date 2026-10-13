import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbRepository } from '@/lib/repository';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const profile = await dbRepository.getProfile(session.userId);

  return NextResponse.json({
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
    },
    profile,
  });
}
