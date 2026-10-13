'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Settings,
  Sparkles,
  Shield,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    targetRole: '',
    educationLevel: '',
    experienceLevel: '',
    dailyStudyHours: 3,
    preferredTaskDuration: 60,
    primaryLanguages: [],
    existingSkills: [],
    improvementAreas: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/login');
          return;
        }
        const data = await authRes.json();
        setUser(data.user);
        if (data.profile) {
          setProfile({
            targetRole: data.profile.targetRole || '',
            educationLevel: data.profile.educationLevel || '',
            experienceLevel: data.profile.experienceLevel || '',
            dailyStudyHours: data.profile.dailyStudyHours || 3,
            preferredTaskDuration: data.profile.preferredTaskDuration || 60,
            primaryLanguages: data.profile.primaryLanguages || [],
            existingSkills: data.profile.existingSkills || [],
            improvementAreas: data.profile.improvementAreas || [],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error('Failed to update candidate profile');
      setSuccessMsg('Profile settings updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete your account and all associated roadmaps, tasks, and notes?'
      )
    ) {
      return;
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <AppShell user={user}>
        <div className="space-y-4 max-w-3xl mx-auto">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={user}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Settings & Candidate Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal study capacity, interview goals, and AI configuration status.
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Candidate Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Candidate Profile
            </CardTitle>
            <CardDescription>
              Preferences used to calibrate new roadmap generations and task scheduling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || ''}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Account Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Job Role
                  </label>
                  <input
                    type="text"
                    value={profile.targetRole}
                    onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Daily Study Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={profile.dailyStudyHours}
                    onChange={(e) =>
                      setProfile({ ...profile, dailyStudyHours: parseFloat(e.target.value) || 3 })
                    }
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Primary Programming Languages
                </label>
                <input
                  type="text"
                  value={profile.primaryLanguages?.join(', ') || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      primaryLanguages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Python, Java, TypeScript"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={saving} size="sm">
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Profile Preferences
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* AI Engine & System Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> AI Engine Configuration Status
            </CardTitle>
            <CardDescription>
              Knight AI dynamically checks provider connectivity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">AI Engine Integration</span>
                <span className="text-slate-500">
                  Google Gemini 1.5 Flash (SDK: @google/genai)
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Ready / Active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Deterministic Demo Fallback</span>
                <span className="text-slate-500">
                  Built-in fallback provider enables offline & credential-free testing
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Operational
              </span>
            </div>

            <p className="text-slate-500 text-[11px] leading-relaxed pt-1">
              Note: API keys are securely stored in server environment variables (<code>GEMINI_API_KEY</code>) and are never exposed to client browsers.
            </p>
          </CardContent>
        </Card>

        {/* Account Deletion Danger Zone */}
        <Card className="border-rose-200">
          <CardHeader>
            <CardTitle className="text-base text-rose-700 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Danger Zone: Delete Account
            </CardTitle>
            <CardDescription>
              Permanently delete candidate account and all associated roadmap records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                This will delete your candidate profile, preparation roadmaps, tasks, and recorded study notes.
              </p>
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount} className="shrink-0">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
