'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

export default function ResumeAnalysisPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetCompany, setTargetCompany] = useState('Google');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription.trim() || undefined,
          targetRole,
          targetCompany,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysisResult(data.analysis);
    } catch (err: any) {
      alert(err.message || 'Failed to analyze resume');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSampleResume = () => {
    setResumeText(`ALEX MERCER
Email: alex.mercer@example.com | GitHub: github.com/alex-mercer

EDUCATION:
B.S. in Computer Science, GPA: 3.8/4.0

TECHNICAL SKILLS:
Languages: Python, TypeScript, Java, SQL, C++
Frameworks & Tools: React, Next.js, FastAPI, Node.js, Docker, Git, PostgreSQL, Redis

PROJECTS:
1. Distributed Task Queue & Scheduler (Python, Redis, Docker)
- Designed an asynchronous job worker processing 5,000 requests/sec with Redis Streams.
- Implemented exponential backoff retries and dead-letter queues.

2. Full-Stack Collaborative Document Editor (TypeScript, React, WebSockets)
- Built real-time conflict-free replicated data type (CRDT) sync engine.
- Deployed on AWS ECS with automated CI/CD GitHub Actions pipelines.

EXPERIENCE:
Software Engineering Intern, Cloud Tech (Summer 2024)
- Optimized SQL database query indexing, cutting API p99 latency by 34%.`);

    setJobDescription(`Google Software Engineer (L4)
Requirements:
- Bachelor's degree in CS or equivalent.
- Experience with general-purpose programming languages (Python, Java, C++, Go).
- Strong proficiency in Data Structures, Algorithms, and System Design.
- Knowledge of distributed systems, high availability, database scaling, and Kubernetes.`);
  };

  if (loading) {
    return (
      <AppShell user={user}>
        <Skeleton className="h-64 rounded-xl" />
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Resume & Skill-Gap Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Compare candidate resume credentials against target role expectations to pinpoint preparation priorities.
          </p>
        </div>

        {/* Input Form Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resume & Target Role Details</CardTitle>
                <CardDescription>
                  Paste your resume text and optional job description for tailored feedback.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleSampleResume}>
                Load Sample Candidate Resume
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Company
                  </label>
                  <input
                    type="text"
                    required
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Role Title
                  </label>
                  <input
                    type="text"
                    required
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Resume Text or Projects Excerpt *
                </label>
                <textarea
                  rows={5}
                  required
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste resume skills, education, and projects here..."
                  className="w-full p-3.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Job Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description requirements and qualifications..."
                  className="w-full p-3.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isAnalyzing}>
                  <Sparkles className="w-4 h-4 mr-1.5" /> Analyze Skills & Gaps
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Analysis Results View */}
        {analysisResult && (
          <div className="space-y-5 animate-fade-in">
            {/* Match Indicator Card */}
            <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-white">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                      Estimated Match Indicator
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {analysisResult.estimatedMatchScore}% Alignment Score
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      {analysisResult.scoreExplanation}
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex items-center justify-center font-extrabold text-indigo-600 text-lg shrink-0">
                    {analysisResult.estimatedMatchScore}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Demonstrated Skills */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-700">
                    <CheckCircle className="w-4 h-4" /> Demonstrated Technical Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.demonstratedSkills?.map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 text-xs text-slate-600 space-y-1">
                    {analysisResult.inferredStrengths?.map((str: string, i: number) => (
                      <p key={i}>• {str}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Identified Gaps */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4" /> Priority Skill Gaps to Prepare
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.potentialGaps?.map((gap: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-xs font-medium"
                      >
                        {gap}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 text-xs text-slate-600 space-y-1">
                    <span className="font-semibold text-slate-700 block mb-1">
                      Recommended Action Items:
                    </span>
                    {analysisResult.recommendedActionItems?.map((act: string, i: number) => (
                      <p key={i}>• {act}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
