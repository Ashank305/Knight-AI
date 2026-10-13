'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, CategoryBadge, PriorityBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Check auth
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/login');
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);

      // Fetch plans
      const plansRes = await fetch('/api/plans');
      const plansData = await plansRes.json();
      setPlans(plansData.plans || []);
      const currentActive = plansData.plans?.[0] || null;
      setActivePlan(currentActive);

      // Fetch tasks (all user tasks)
      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      setTasks(tasksData.tasks || []);

      // Fetch analytics
      const analyticsRes = await fetch('/api/analytics');
      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData.analytics);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTaskStatus = async (task: any) => {
    setUpdatingTaskId(task.id);
    const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';

    try {
      const res = await fetch(`/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Optimistically update local state & refresh analytics
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
        );
        const analyticsRes = await fetch('/api/analytics');
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics);
      }
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <AppShell user={user}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

  // EMPTY STATE: User has zero preparation plans
  if (!plans || plans.length === 0) {
    return (
      <AppShell user={user}>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome to Knight AI, {user?.name || 'Candidate'}!
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            You don&apos;t have an active interview preparation plan yet. Generate a personalized roadmap tailored to your target company and interview date.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/onboarding"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Preparation Plan</span>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // Filter today's tasks or next upcoming tasks
  const todayStr = new Date().toDateString();
  const todayTasks = tasks.filter(
    (t) => new Date(t.plannedDate).toDateString() === todayStr
  );
  const displayTasks = todayTasks.length > 0 ? todayTasks : tasks.slice(0, 5);

  // Compute active plan completion
  const planTasks = activePlan?.tasks || [];
  const planCompleted = planTasks.filter((t: any) => t.status === 'COMPLETED').length;
  const planProgressPct =
    planTasks.length > 0 ? Math.round((planCompleted / planTasks.length) * 100) : 0;

  // AI Recommendation derived from highest priority incomplete task
  const nextIncompleteTask = tasks.find((t) => t.status !== 'COMPLETED');

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Candidate'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span>Target:</span>
              <strong className="text-slate-800 font-semibold">
                {activePlan?.targetRole} at {activePlan?.targetCompany}
              </strong>
              {activePlan?.isDemoPlan && (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] border border-slate-200">
                  Demo Plan
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/plans/${activePlan?.id}`}
              className="text-xs sm:text-sm font-medium px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors"
            >
              View Full Roadmap
            </Link>
            <Link
              href="/onboarding"
              className="text-xs sm:text-sm font-medium px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" /> New Plan
            </Link>
          </div>
        </div>

        {/* Real Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Plan Completion
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {analytics?.completionRate || planProgressPct}%
                </span>
                <span className="text-xs text-slate-400">
                  {analytics?.completedTasks || 0}/{analytics?.totalTasks || 0} tasks
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${analytics?.completionRate || planProgressPct}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Today&apos;s Planned Time
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {Math.round((analytics?.todayPlannedMinutes || 0) / 60 * 10) / 10}h
                </span>
                <span className="text-xs text-slate-400">
                  {analytics?.todayTasksCount || todayTasks.length} tasks today
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 truncate">
                {analytics?.todayCompletedMinutes || 0} mins completed today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Overdue Tasks
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className={`text-2xl sm:text-3xl font-extrabold ${analytics?.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {analytics?.overdueTasks || 0}
                </span>
                <span className="text-xs text-slate-400">
                  needs replan
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {analytics?.overdueTasks > 0 ? 'Use Adaptive Replan' : 'All up to date'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Active Roadmaps
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {plans.length}
                </span>
                <span className="text-xs text-slate-400">
                  {activePlan?.planningHorizon || 30}-day horizon
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 truncate">
                {activePlan?.targetCompany}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Next-Step Recommendation */}
        {nextIncompleteTask && (
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                  Knight AI Immediate Recommendation
                </span>
                <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                  {nextIncompleteTask.title}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                  {nextIncompleteTask.description}
                </p>
              </div>
            </div>
            <Link
              href={`/tasks/${nextIncompleteTask.id}`}
              className="text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-white px-3.5 py-2 rounded-lg border border-indigo-200 shrink-0 self-start sm:self-auto"
            >
              Start Focus Session →
            </Link>
          </div>
        )}

        {/* Main Grid: Today's Tasks & Weekly Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Today's & Upcoming Tasks (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle>
                    {todayTasks.length > 0 ? "Today's Scheduled Tasks" : "Upcoming Next Tasks"}
                  </CardTitle>
                  <CardDescription>
                    {todayTasks.length > 0
                      ? 'Mark tasks complete directly as you finish practice.'
                      : 'No tasks scheduled specifically for today. Here are the next priority items.'}
                  </CardDescription>
                </div>
                <Link
                  href="/tasks"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View All ({tasks.length}) <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 pt-0">
                {displayTasks.map((task) => {
                  const isCompleted = task.status === 'COMPLETED';

                  return (
                    <div
                      key={task.id}
                      className="py-3.5 flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => toggleTaskStatus(task)}
                          disabled={updatingTaskId === task.id}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <Link
                            href={`/tasks/${task.id}`}
                            className={`text-sm font-semibold hover:text-indigo-600 transition-colors line-clamp-1 ${
                              isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {task.description}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <CategoryBadge category={task.category} />
                            <PriorityBadge priority={task.priority} />
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {task.estimatedDuration}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-slate-400 block">
                          {new Date(task.plannedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right: Weekly Activity & Roadmap Summary (1 col) */}
          <div className="space-y-6">
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>7-Day Activity Velocity</CardTitle>
                <CardDescription>
                  Tasks completed over the previous 7 days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.weeklyData || []}>
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} width={20} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="completed" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Active Plan Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Current Roadmap</CardTitle>
                <CardDescription>
                  {activePlan?.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Planning Horizon</span>
                  <span className="font-semibold text-slate-800">
                    {activePlan?.planningHorizon} Days
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Daily Study Target</span>
                  <span className="font-semibold text-slate-800">
                    {activePlan?.dailyAvailability} Hours/day
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600">Roadmap Progress</span>
                    <span className="text-indigo-600">{planProgressPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${planProgressPct}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/plans/${activePlan?.id}`}
                  className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  Manage Roadmap & Adaptive Replan <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
