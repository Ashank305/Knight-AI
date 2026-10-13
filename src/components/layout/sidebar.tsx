'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  CheckSquare,
  Calendar,
  BarChart3,
  FileSearch,
  Settings,
  PlusCircle,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  user?: {
    name: string;
    email: string;
  } | null;
  onCloseMobile?: () => void;
}

export function Sidebar({ user, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Preparation Plans', href: '/plans', icon: Compass },
    { label: "Today's Tasks", href: '/tasks', icon: CheckSquare },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Progress & Analytics', href: '/progress', icon: BarChart3 },
    { label: 'Resume Analysis', href: '/resume-analysis', icon: FileSearch },
    { label: 'Settings & Profile', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'KA';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-64 h-full bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 font-bold text-white text-lg tracking-tight"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-sm">
            K
          </div>
          <span>Knight AI</span>
        </Link>
      </div>

      {/* Primary Action Button */}
      <div className="p-4">
        <Link
          href="/onboarding"
          onClick={onCloseMobile}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-sm transition-all text-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Plan</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-700/50 text-indigo-300 font-semibold text-xs flex items-center justify-center shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="min-w-0 truncate">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name || 'Candidate'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email || 'Logged In'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
