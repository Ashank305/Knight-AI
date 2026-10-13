import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    DSA: { label: 'DSA', variant: 'purple' },
    CORE_CS: { label: 'Core CS', variant: 'info' },
    LANGUAGE: { label: 'Language', variant: 'default' },
    SYSTEM_DESIGN: { label: 'System Design', variant: 'warning' },
    PROJECTS: { label: 'Projects', variant: 'success' },
    RESUME: { label: 'Resume', variant: 'default' },
    BEHAVIORAL: { label: 'Behavioral', variant: 'success' },
    MOCK_INTERVIEW: { label: 'Mock Interview', variant: 'danger' },
    REVISION: { label: 'Revision', variant: 'purple' },
    OTHER: { label: 'General', variant: 'default' },
  };

  const item = map[category] || { label: category, variant: 'default' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    HIGH: { label: 'High Priority', variant: 'danger' },
    MEDIUM: { label: 'Medium', variant: 'warning' },
    LOW: { label: 'Low', variant: 'default' },
  };

  const item = map[priority] || { label: priority, variant: 'default' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
