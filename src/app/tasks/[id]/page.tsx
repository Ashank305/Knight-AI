'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryBadge, PriorityBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  FileText,
  ExternalLink,
  Save,
  Trash2,
  AlertCircle,
  History,
} from 'lucide-react';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;

  const [task, setTask] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('TODO');
  const [error, setError] = useState<string | null>(null);

  const fetchTask = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/login');
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);

      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error('Task not found');
      const data = await res.json();
      setTask(data.task);
      setNotes(data.task.notes || '');
      setStatus(data.task.status);
    } catch (err: any) {
      setError(err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchTask();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        await fetchTask();
      }
    } catch (err) {
      console.error('Failed to save notes', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this preparation task?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push(task?.planId ? `/plans/${task.planId}` : '/tasks');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AppShell user={user}>
        <div className="space-y-4 max-w-4xl mx-auto">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (error || !task) {
    return (
      <AppShell user={user}>
        <div className="text-center py-12">
          <p className="text-rose-600 font-semibold">{error || 'Task not found'}</p>
          <Link href="/tasks" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">
            ← Return to Tasks
          </Link>
        </div>
      </AppShell>
    );
  }

  const isCompleted = status === 'COMPLETED';

  return (
    <AppShell user={user}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href={task.planId ? `/plans/${task.planId}` : '/tasks'}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Roadmap
          </Link>

          <button
            onClick={handleDeleteTask}
            title="Delete Task"
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Task
          </button>
        </div>

        {/* Task Header & Status Bar */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <CategoryBadge category={task.category} />
                  <PriorityBadge priority={task.priority} />
                  {task.plan?.targetCompany && (
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                      {task.plan.targetCompany} • {task.plan.targetRole}
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl sm:text-2xl">{task.title}</CardTitle>
                <CardDescription className="text-sm mt-1.5 leading-relaxed text-slate-600">
                  {task.description}
                </CardDescription>
              </div>

              {/* Status Selector */}
              <div className="flex flex-col sm:items-end gap-1 shrink-0">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Task Status
                </label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : status === 'IN_PROGRESS'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="SKIPPED">Skipped</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Meta details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block">Scheduled Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(task.plannedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Estimated Duration</span>
                <span className="font-semibold text-slate-800 mt-0.5 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {task.estimatedDuration} Minutes
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Completed On</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {task.completedAt
                    ? new Date(task.completedAt).toLocaleDateString()
                    : 'Not yet completed'}
                </span>
              </div>
            </div>

            {/* Completion Criteria */}
            <div className="p-4 rounded-lg bg-indigo-50/70 border border-indigo-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 block mb-1">
                Objective Completion Criteria
              </span>
              <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                {task.completionCriteria}
              </p>
            </div>

            {/* Resource Links */}
            {task.resourceLinks && task.resourceLinks.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Suggested Learning References:
                </span>
                <div className="flex flex-wrap gap-2">
                  {task.resourceLinks.map((link: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-400" /> {link}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidate Learning Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Candidate Study Notes & Learnings
            </CardTitle>
            <CardDescription>
              Record your notes, algorithmic tricks, edge cases, or STAR talking points for this session.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Learned how to identify monotonically increasing stacks; careful with integer overflow in Java..."
              className="w-full p-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
            />
            <div className="flex justify-end">
              <Button onClick={handleSaveNotes} isLoading={savingNotes} size="sm">
                <Save className="w-3.5 h-3.5 mr-1" /> Save Notes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        {task.activities && task.activities.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                <History className="w-4 h-4 text-slate-400" /> Task History Log
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-slate-100 text-xs">
              {task.activities.map((act: any) => (
                <div key={act.id} className="py-2 flex items-center justify-between text-slate-500">
                  <span>Action: {act.activityType}</span>
                  <span>{new Date(act.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
