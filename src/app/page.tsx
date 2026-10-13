import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/public-navbar';
import {
  Compass,
  Calendar,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Clock,
  Briefcase,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Your Referral. Your Roadmap. Your Next Opportunity.
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Turn Your Career Opportunity Into a{' '}
            <span className="text-indigo-600">Preparation Plan.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Build a personalized interview roadmap, know what to practice each day, and adapt your preparation as your schedule changes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group"
            >
              <span>Create My Preparation Plan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-base rounded-lg transition-colors"
            >
              Explore How It Works
            </a>
          </div>

          {/* Product Dashboard CSS Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200/80 bg-white p-2 sm:p-3 shadow-xl">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6 text-left">
              {/* Mockup Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    G
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">
                      Google L4 Software Engineer — 28-Day Roadmap
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tailored for Referral Candidate • 3.5 hrs/day study capacity
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    On Schedule (38% Completed)
                  </span>
                </div>
              </div>

              {/* Mockup Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Today&apos;s Focus
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                      Day 11 of 28
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Binary Search on Rotated Arrays
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Solve Search in Rotated Sorted Array & Find Minimum in Rotated Array.
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> 60 mins
                    </span>
                    <span className="text-indigo-600 font-medium text-xs">DSA Pattern</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      System Architecture
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                      Tomorrow
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Distributed Caching & Redis Eviction
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Compare Write-Through vs Write-Back caches; analyze LRU and LFU policies.
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> 75 mins
                    </span>
                    <span className="text-amber-600 font-medium text-xs">System Design</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Adaptive Replan
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                      Automated
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Missed a Study Day?
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Knight AI automatically redistributes unfinished tasks without overloading your daily hours.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <span className="text-emerald-700 text-xs font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Preserves Completed Progress
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Clear Three-Step Journey
            </h2>
            <h3 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl tracking-tight">
              From Referral or Application to Interview Ready
            </h3>
            <p className="mt-4 text-base text-slate-600">
              Receiving a referral gets you through the door. Knight AI gives you the structured preparation engine to ace the interview.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-base flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-lg font-semibold text-slate-900">Share Your Target Role</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Enter your target company, interview format, daily study hours, experience level, and areas where you need the most practice.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-base flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-lg font-semibold text-slate-900">Generate Structured Roadmap</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Knight AI creates phased daily tasks balanced across DSA, System Design, Core CS, Behavioral STAR stories, and timed mock interviews.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-base flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-lg font-semibold text-slate-900">Track & Adapt Dynamically</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Mark tasks complete, visualize daily velocity, and use one-click adaptive replanning if interview dates move or life happens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Complete Preparation System
            </h2>
            <h3 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl tracking-tight">
              Engineered for Practical Preparation Results
            </h3>
            <p className="mt-4 text-base text-slate-600">
              No generic motivational fluff. Just granular daily tasks, realistic workloads, and adaptive rescheduling.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Personalized AI Roadmaps</h4>
              <p className="mt-2 text-sm text-slate-600">
                Generated based on your exact target company, role seniority, available daily study hours, and weak areas.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Resume & Skill-Gap Analysis</h4>
              <p className="mt-2 text-sm text-slate-600">
                Compare your resume against target job requirements to identify missing concepts and prioritize high-yield topics.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Automatic Daily Task Scheduling</h4>
              <p className="mt-2 text-sm text-slate-600">
                Every study day has clear, concrete tasks with estimated durations and specific completion criteria.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Adaptive Replanning</h4>
              <p className="mt-2 text-sm text-slate-600">
                Overdue or unfinished tasks are rebalanced across remaining days without modifying your completed achievements.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Real Progress Analytics</h4>
              <p className="mt-2 text-sm text-slate-600">
                Visual charts track your weekly velocity, category breakdown, and completed study minutes over time.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-slate-900">Multi-Channel Support</h4>
              <p className="mt-2 text-sm text-slate-600">
                Tailored for referral candidates, direct applicants, campus placements, and internship interviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section id="product-preview" className="py-20 bg-slate-50/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">
              Illustrative Demo Data
            </span>
            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              Actionable Daily Roadmap Preview
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Here is an example of how Knight AI structures tasks into actionable units with tangible completion requirements.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-3">
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded border border-slate-300 flex items-center justify-center text-white bg-indigo-600">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">Day 1 • Completed</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                      DSA
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mt-0.5">
                    Array Hashing & Sliding Window Review
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Criteria: Solved Two Sum, Group Anagrams, and Longest Substring Without Repeating Characters in Python.
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium shrink-0">60 mins</span>
            </div>

            <div className="p-4 bg-white rounded-lg border border-indigo-200 ring-1 ring-indigo-100 shadow-xs flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded border border-indigo-500 flex items-center justify-center" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-600">Day 2 • Today&apos;s Focus</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                      System Design
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                    Design a Distributed Rate Limiter
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Criteria: Diagram Token Bucket vs Sliding Window Log; calculate Redis memory footprint for 10M active users.
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium shrink-0">75 mins</span>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs flex items-start justify-between gap-4 opacity-80">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded border border-slate-300" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Day 3 • Upcoming</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                      Behavioral
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mt-0.5">
                    STAR Stories: Leadership & Cross-Team Conflict
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Criteria: Formulate two distinct 3-minute behavioral examples highlighting ownership and technical disagreements.
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium shrink-0">45 mins</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Ready to Build Your Personalized Roadmap?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
            Take control of your interview preparation with actionable daily plans tailored to your timeline.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-base rounded-lg shadow-sm transition-all"
            >
              Get Started with Knight AI
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">Knight AI</span>
            <span>— Personalized Interview Preparation Assistant</span>
          </div>
          <p>© 2026 Knight AI. Built for focused career preparation.</p>
        </div>
      </footer>
    </div>
  );
}
