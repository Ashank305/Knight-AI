'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryBadge, PriorityBadge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Circle,
} from 'lucide-react';

export default function CalendarPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calendar Date State (Current viewing month)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date('2026-10-13T00:00:00Z'));
  const [selectedDate, setSelectedDate] = useState<string>('Tue Oct 13 2026');

  useEffect(() => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toDateString());
  }, []);

  const fetchCalendarTasks = async () => {
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
    fetchCalendarTasks();
  }, []);

  // Calendar month calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Map tasks by date string
  const tasksByDateString: Record<string, any[]> = {};
  for (const t of tasks) {
    const ds = new Date(t.plannedDate).toDateString();
    if (!tasksByDateString[ds]) tasksByDateString[ds] = [];
    tasksByDateString[ds].push(t);
  }

  // Selected date tasks
  const selectedDayTasks = tasksByDateString[selectedDate] || [];

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Preparation Calendar & Agenda
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View scheduled study milestones by month and inspect day-by-day practice sessions.
          </p>
        </div>

        {loading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Monthly Grid */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="text-base sm:text-lg">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={prevMonth}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md hover:bg-slate-100 text-slate-700"
                    >
                      Today
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>

                  {/* Calendar Matrix */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Padding cells before day 1 */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`pad-${i}`} className="h-20 sm:h-24 p-1 bg-slate-50/50 rounded-lg" />
                    ))}

                    {/* Month Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNumber = i + 1;
                      const dayDate = new Date(year, month, dayNumber);
                      const dayDateStr = dayDate.toDateString();
                      const dayTasks = tasksByDateString[dayDateStr] || [];
                      const isSelected = selectedDate === dayDateStr;
                      const isToday = new Date().toDateString() === dayDateStr;

                      const completedInDay = dayTasks.filter((t) => t.status === 'COMPLETED').length;
                      const hasOverdue = dayTasks.some(
                        (t) =>
                          t.status !== 'COMPLETED' &&
                          dayDate < new Date(new Date().setHours(0, 0, 0, 0))
                      );

                      return (
                        <div
                          key={dayNumber}
                          onClick={() => setSelectedDate(dayDateStr)}
                          className={`h-20 sm:h-24 p-1.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                              : isToday
                              ? 'border-slate-300 bg-slate-50'
                              : 'border-slate-200/80 hover:bg-slate-50/80 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold ${
                                isToday
                                  ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[11px]'
                                  : 'text-slate-700'
                              }`}
                            >
                              {dayNumber}
                            </span>
                            {dayTasks.length > 0 && (
                              <span className="text-[10px] font-bold text-slate-500">
                                {dayTasks.length}
                              </span>
                            )}
                          </div>

                          {/* Task Indicators */}
                          <div className="space-y-1 overflow-hidden">
                            {dayTasks.slice(0, 2).map((t) => (
                              <div
                                key={t.id}
                                className={`text-[10px] truncate px-1 py-0.5 rounded font-medium ${
                                  t.status === 'COMPLETED'
                                    ? 'bg-emerald-100 text-emerald-800 line-through'
                                    : hasOverdue
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                {t.title}
                              </div>
                            ))}
                            {dayTasks.length > 2 && (
                              <span className="text-[9px] text-slate-400 block pl-1">
                                +{dayTasks.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: Selected Day Agenda */}
            <div>
              <Card className="h-full">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                    Day Agenda
                  </span>
                  <CardTitle className="text-base mt-0.5">{selectedDate}</CardTitle>
                  <CardDescription>
                    {selectedDayTasks.length} study tasks scheduled for this day
                  </CardDescription>
                </CardHeader>
                <CardContent className="divide-y divide-slate-100 p-4">
                  {selectedDayTasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No tasks scheduled for this day.
                    </div>
                  ) : (
                    selectedDayTasks.map((task) => (
                      <div key={task.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/tasks/${task.id}`}
                            className={`text-xs font-semibold hover:text-indigo-600 transition-colors line-clamp-1 ${
                              task.status === 'COMPLETED'
                                ? 'line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </Link>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {task.estimatedDuration}m
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2">
                          <CategoryBadge category={task.category} />
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
