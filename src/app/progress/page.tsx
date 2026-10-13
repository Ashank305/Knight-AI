'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ProgressPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user);

        const res = await fetch('/api/analytics');
        const data = await res.json();
        setAnalytics(data.analytics);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  if (loading) {
    return (
      <AppShell user={user}>
        <div className="space-y-6">
          <Skeleton className="h-8 w-60" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  // Category breakdown list
  const categoryData = Object.entries(analytics?.categoryCounts || {}).map(
    ([category, stats]: [string, any]) => ({
      name: category,
      total: stats.total,
      completed: stats.completed,
      pct: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    })
  );

  const completedHours = Math.round(((analytics?.completedMinutes || 0) / 60) * 10) / 10;
  const totalHours = Math.round(((analytics?.totalEstimatedMinutes || 0) / 60) * 10) / 10;

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Progress & Performance Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real performance tracking derived from recorded database completion timestamps.
          </p>
        </div>

        {/* Primary Metric Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Overall Completion
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">
                  {analytics?.completionRate || 0}%
                </span>
                <span className="text-xs text-slate-400">
                  {analytics?.completedTasks || 0} / {analytics?.totalTasks || 0} tasks
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${analytics?.completionRate || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Completed Study Time
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">
                  {completedHours}h
                </span>
                <span className="text-xs text-slate-400">
                  of {totalHours}h planned
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Estimated practice invested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Overdue Tasks
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-3xl font-extrabold ${analytics?.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {analytics?.overdueTasks || 0}
                </span>
                <span className="text-xs text-slate-400">
                  unresolved
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {analytics?.overdueTasks > 0 ? 'Reschedule via Replan' : 'Schedule on track'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Roadmaps
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900">
                  {analytics?.activePlansCount || 0}
                </span>
                <span className="text-xs text-slate-400">
                  active targets
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Interview sprints
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Completion Activity Velocity */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Task Completion History (7 Days)</CardTitle>
            <CardDescription>
              Chronological log of verified tasks marked complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.weeklyData || []}>
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="completed" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Tasks Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category-Level Progress Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Topic & Category Mastery Breakdown</CardTitle>
            <CardDescription>
              Completion rate segmented by interview domain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryData.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No categorized tasks found.
              </p>
            ) : (
              categoryData.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                    <span className="text-slate-500">
                      {cat.completed} / {cat.total} tasks ({cat.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Readiness Disclaimer Alert */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Preparation Readiness Note:</strong> Knight AI calculates completion percentage from your finished tasks. While high task completion builds discipline and pattern familiarity, actual interview performance depends on live problem articulation, interviewer interaction, and problem variations.
        </div>
      </div>
    </AppShell>
  );
}
