import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { resumeAnalyzeSchema } from '@/lib/validations';
import { analyzeResumeAndJob } from '@/lib/ai/resume-analyzer';

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = resumeAnalyzeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid resume analysis input', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const analysis = await analyzeResumeAndJob(result.data);
    return NextResponse.json({ analysis });
  } catch (err: any) {
    console.error('Resume analysis route error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
