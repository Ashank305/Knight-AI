'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import {
  Briefcase,
  User,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Career Target
    targetCompany: 'Google',
    targetRole: 'Software Engineer',
    roleCategory: 'Software Engineering',
    interviewType: 'mixed' as 'coding' | 'technical' | 'behavioral' | 'system_design' | 'hr' | 'mixed',
    applicationSource: 'referral' as 'referral' | 'direct' | 'campus' | 'internship' | 'other',
    referralDetails: '',

    // Step 2: Candidate Profile
    educationLevel: "Bachelor's Degree",
    experienceLevel: 'Entry Level (0-2 years)',
    primaryLanguages: ['Python', 'TypeScript'],
    existingSkills: ['Data Structures', 'Algorithms', 'SQL', 'Git', 'REST APIs'],
    confidenceAreas: ['Arrays & HashMaps', 'Two Pointers'],
    improvementAreas: ['Dynamic Programming', 'System Design Scalability', 'Behavioral STAR Method'],
    resumeText: '',

    // Step 3: Preparation Constraints
    hasConfirmedDate: false,
    interviewDate: '',
    planningHorizonDays: 30,
    dailyStudyHours: 3.0,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    preparationPriorities: ['DSA', 'System Design', 'Behavioral'],
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.targetCompany.trim()) {
      setError('Please provide a target company');
      return;
    }
    if (step === 1 && !formData.targetRole.trim()) {
      setError('Please provide a target job role');
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const payload = {
        ...formData,
        interviewDate: formData.hasConfirmedDate && formData.interviewDate ? formData.interviewDate : null,
      };

      const res = await fetch('/api/plans/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate preparation plan.');
      }

      // Successfully saved to database! Redirect to newly generated plan!
      if (data.plan && data.plan.id) {
        router.push(`/plans/${data.plan.id}`);
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error occurred while generating plan. Please try again.');
      setIsGenerating(false);
    }
  };

  const stepsInfo = [
    { num: 1, title: 'Career Target', icon: Briefcase },
    { num: 2, title: 'Candidate Profile', icon: User },
    { num: 3, title: 'Study Constraints', icon: Clock },
    { num: 4, title: 'Review & Generate', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Wizard Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-slate-900 text-lg mb-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
              K
            </div>
            <span>Knight AI Plan Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Design Your Personalized Preparation Roadmap
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tell Knight AI your timeline and goals to get an adaptive, day-by-day plan.
          </p>
        </div>

        {/* Progress Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {stepsInfo.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isPast = step > s.num;

              return (
                <div key={s.num} className="flex-1 flex flex-col items-center relative">
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 -left-1/2 w-full h-0.5 z-0 ${
                        isPast ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    />
                  )}
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm'
                        : isPast
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border-2 border-slate-300 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium hidden sm:block ${
                      isActive ? 'text-indigo-600 font-semibold' : isPast ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-semibold text-rose-800">Generation Error</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Wizard Card Content */}
        <Card className="shadow-md">
          {/* STEP 1: CAREER TARGET */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Step 1: Career Opportunity Details</CardTitle>
                <CardDescription>
                  Specify your target organization and the specific interview role.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Target Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.targetCompany}
                      onChange={(e) => updateField('targetCompany', e.target.value)}
                      placeholder="e.g. Google, Microsoft, Stripe, Startup"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Target Role Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.targetRole}
                      onChange={(e) => updateField('targetRole', e.target.value)}
                      placeholder="e.g. Software Engineer, Backend Engineer"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Application Source
                    </label>
                    <select
                      value={formData.applicationSource}
                      onChange={(e) => updateField('applicationSource', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="referral">Employee Referral</option>
                      <option value="direct">Direct Application</option>
                      <option value="campus">Campus Placement</option>
                      <option value="internship">Internship Conversion</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Interview Format
                    </label>
                    <select
                      value={formData.interviewType}
                      onChange={(e) => updateField('interviewType', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="mixed">Comprehensive Mixed (Coding + System + Behavioral)</option>
                      <option value="coding">Coding & Algorithms Focused</option>
                      <option value="technical">Technical CS Fundamentals</option>
                      <option value="system_design">System Architecture & Design</option>
                      <option value="behavioral">Behavioral & Leadership</option>
                    </select>
                  </div>
                </div>

                {formData.applicationSource === 'referral' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Referral Context (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.referralDetails}
                      onChange={(e) => updateField('referralDetails', e.target.value)}
                      placeholder="e.g. Referred by Senior SWE on Cloud Infrastructure team"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* STEP 2: CANDIDATE PROFILE */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Step 2: Candidate Background & Skills</CardTitle>
                <CardDescription>
                  Help Knight AI personalize the tasks to match your current strengths and weaknesses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Experience Level
                    </label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => updateField('experienceLevel', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Internship Applicant">Internship Applicant</option>
                      <option value="Student / Final Year">Student / Final Year</option>
                      <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                      <option value="Mid Level (2-5 years)">Mid Level (2-5 years)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Primary Programming Languages
                    </label>
                    <input
                      type="text"
                      value={formData.primaryLanguages.join(', ')}
                      onChange={(e) =>
                        updateField(
                          'primaryLanguages',
                          e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      placeholder="Python, Java, TypeScript, C++"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Comma-separated</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Areas Needing Most Improvement (Priority Focus)
                  </label>
                  <input
                    type="text"
                    value={formData.improvementAreas.join(', ')}
                    onChange={(e) =>
                      updateField(
                        'improvementAreas',
                        e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                      )
                    }
                    placeholder="Dynamic Programming, System Design, Graph Algorithms"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Tasks will specifically target these gaps.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Optional Resume Summary or Projects Excerpt
                  </label>
                  <textarea
                    rows={3}
                    value={formData.resumeText}
                    onChange={(e) => updateField('resumeText', e.target.value)}
                    placeholder="Paste bullet points from your resume or key projects to tailor recommendations..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 3: PREPARATION CONSTRAINTS */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Step 3: Timeline & Study Capacity</CardTitle>
                <CardDescription>
                  Define realistic hours and dates. Knight AI will never assign more workload than you specify.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Daily Study Capacity (Hours/Day)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="8"
                        step="0.5"
                        value={formData.dailyStudyHours}
                        onChange={(e) => updateField('dailyStudyHours', parseFloat(e.target.value))}
                        className="flex-1 accent-indigo-600"
                      />
                      <span className="text-sm font-bold text-indigo-700 w-16 text-right">
                        {formData.dailyStudyHours} hrs
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Max {Math.round(formData.dailyStudyHours * 60)} minutes of tasks assigned per day.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Planning Horizon (Days)
                    </label>
                    <select
                      value={formData.planningHorizonDays}
                      onChange={(e) => updateField('planningHorizonDays', parseInt(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={14}>14 Days (Intensive Sprint)</option>
                      <option value={21}>21 Days (Balanced Sprint)</option>
                      <option value={30}>30 Days (Standard 1-Month Roadmap)</option>
                      <option value={45}>45 Days (Comprehensive Preparation)</option>
                      <option value={60}>60 Days (Deep Foundations)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="hasConfirmedDate"
                      checked={formData.hasConfirmedDate}
                      onChange={(e) => updateField('hasConfirmedDate', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="hasConfirmedDate" className="text-sm font-medium text-slate-800">
                      I have an interview date scheduled
                    </label>
                  </div>

                  {formData.hasConfirmedDate && (
                    <div className="max-w-xs">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Interview Date
                      </label>
                      <input
                        type="date"
                        value={formData.interviewDate}
                        onChange={(e) => updateField('interviewDate', e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 4: REVIEW */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Step 4: Review & Generate</CardTitle>
                <CardDescription>
                  Review your parameters before generating your structured preparation plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 divide-y divide-slate-200/80 text-sm">
                  <div className="pb-3 flex justify-between">
                    <span className="text-slate-500">Target Goal:</span>
                    <span className="font-semibold text-slate-900">
                      {formData.targetCompany} • {formData.targetRole}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-500">Application Source:</span>
                    <span className="font-medium text-slate-800 capitalize">
                      {formData.applicationSource}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-500">Languages & Tools:</span>
                    <span className="font-medium text-slate-800">
                      {formData.primaryLanguages.join(', ')}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between">
                    <span className="text-slate-500">Timeline & Capacity:</span>
                    <span className="font-medium text-slate-800">
                      {formData.planningHorizonDays} Days • {formData.dailyStudyHours} hrs/day
                    </span>
                  </div>
                  <div className="pt-3 flex justify-between">
                    <span className="text-slate-500">Focus Areas:</span>
                    <span className="font-medium text-indigo-700 text-right">
                      {formData.improvementAreas.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">AI Plan Synthesis:</span> Knight AI will now generate an ordered roadmap with distinct daily tasks, estimated completion times, and actionable verification criteria.
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Wizard Footer Controls */}
          <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-5">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isGenerating}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button type="button" onClick={handleNext}>
                Continue <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleGenerate}
                isLoading={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-1.5" /> Generate Preparation Plan
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
