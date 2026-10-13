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
  Search,
  Filter,
  Calendar,
  AlertCircle,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [viewFilter, setViewFilter] = useState<'ALL' | 'TODAY' | 'OVERDUE' | 'COMPLETED' | 'TODO'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/login');
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);

      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
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
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const todayStr = new Date().toDateString();
  const now = new Date();

  const filteredTasks = tasks.filter((t) => {
    // Search query
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (categoryFilter !== 'ALL' && t.category !== categoryFilter) {
      return false;
    }

    // View tab filter
    if (viewFilter === 'TODAY') {
      return new Date(t.plannedDate).toDateString() === todayStr;
    }
    if (viewFilter === 'COMPLETED') {
      return t.status === 'COMPLETED';
    }
    if (viewFilter === 'TODO') {
      return t.status !== 'COMPLETED';
    }
    if (viewFilter === 'OVERDUE') {
      return (
        t.status !== 'COMPLETED' &&
        new Date(t.plannedDate) < new Date(now.getFullYear(), now.getMonth(), now.getDate())
      );
    }

    return true;
  });

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Task Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Search, filter, and track daily preparation tasks across all your roadmaps.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              <option value="DSA">DSA</option>
              <option value="CORE_CS">Core CS</option>
              <option value="SYSTEM_DESIGN">System Design</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="MOCK_INTERVIEW">Mock Interview</option>
              <option value="REVISION">Revision</option>
            </select>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-3 overflow-x-auto">
          {(
            [
              { key: 'ALL', label: `All Tasks (${tasks.length})` },
              {
                key: 'TODAY',
                label: `Today (${tasks.filter((t) => new Date(t.plannedDate).toDateString() === todayStr).length})`,
              },
              {
                key: 'OVERDUE',
                label: `Overdue (${tasks.filter((t) => t.status !== 'COMPLETED' && new Date(t.plannedDate) < new Date(now.getFullYear(), now.getMonth(), now.getDate())).length})`,
              },
              {
                key: 'TODO',
                label: `Remaining (${tasks.filter((t) => t.status !== 'COMPLETED').length})`,
              },
              {
                key: 'COMPLETED',
                label: `Completed (${tasks.filter((t) => t.status === 'COMPLETED').length})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setViewFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                viewFilter === tab.key
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No matching tasks</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your filter or search query.
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="divide-y divide-slate-100 p-0">
              {filteredTasks.map((task) => {
                const isCompleted = task.status === 'COMPLETED';
                const isOverdue =
                  !isCompleted &&
                  new Date(task.plannedDate) < new Date(now.getFullYear(), now.getMonth(), now.getDate());

                return (
                  <div
                    key={task.id}
                    className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        disabled={updatingTaskId === task.id}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
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

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <CategoryBadge category={task.category} />
                          <PriorityBadge priority={task.priority} />
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.estimatedDuration}m
                          </span>
                          {task.plan?.title && (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {task.plan.targetCompany}
                            </span>
                          )}
                          {isOverdue && (
                            <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-medium text-slate-600 block">
                        {new Date(task.plannedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <Link
                        href={`/tasks/${task.id}`}
                        className="mt-2 inline-block text-xs text-indigo-600 hover:underline"
                      >
                        View & Notes →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
