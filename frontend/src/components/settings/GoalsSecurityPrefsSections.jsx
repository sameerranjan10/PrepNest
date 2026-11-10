import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  Clock,
  Calendar,
  BookOpen,
  X,
  Plus,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Bell,
  Mail,
  Flame,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  SUGGESTED_COMPANIES,
  SUGGESTED_ROLES,
  SUBJECT_OPTIONS,
} from './settingsConfig';

export function PreparationGoalsSection({
  formData,
  onFieldChange,
  onAddCompany,
  onRemoveCompany,
}) {
  const [companyInput, setCompanyInput] = useState('');

  const handleToggleSubject = (subject) => {
    const current = formData.preferred_subjects || [];
    const next = current.includes(subject)
      ? current.filter((s) => s !== subject)
      : [...current, subject];
    onFieldChange('preferred_subjects', next);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#30363D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
            Preparation Goals &amp; Study Targets
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure your placement targets, daily commitment, and focus subjects.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#F59E0B]/30 text-[11px] font-semibold text-[#D97706] dark:text-[#FFA116] shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Synced with AI Placement Mentor</span>
        </div>
      </div>

      {/* Target Job Role & Difficulty / Pacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Target Job Role</span>
          </label>
          <input
            type="text"
            value={formData.target_role}
            onChange={(e) => onFieldChange('target_role', e.target.value)}
            placeholder="e.g. Software Development Engineer (SDE-1)"
            className="lc-input text-sm"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTED_ROLES.slice(0, 5).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onFieldChange('target_role', role)}
                className={`px-2 py-0.5 rounded-md text-[11px] border transition cursor-pointer ${
                  formData.target_role === role
                    ? 'bg-[#FFF8EE] border-[#F59E0B]/50 text-[#D97706] font-semibold'
                    : 'bg-[#F8FAFC] dark:bg-[#0D1117] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B] hover:text-[#1E293B]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B]">Preferred Difficulty</label>
          <select
            value={formData.preferred_difficulty}
            onChange={(e) => onFieldChange('preferred_difficulty', e.target.value)}
            className="lc-input cursor-pointer"
          >
            <option value="Easy">Easy (Concept Building)</option>
            <option value="Medium">Medium (Standard Placement Bar)</option>
            <option value="Hard">Hard (Tier-1 Product Interviews)</option>
            <option value="Balanced">Balanced Mix (All Levels)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B]">Preparation Pacing Level</label>
          <select
            value={formData.prep_level}
            onChange={(e) => onFieldChange('prep_level', e.target.value)}
            className="lc-input cursor-pointer"
          >
            <option value="Beginner">Beginner (Foundations)</option>
            <option value="Intermediate">Intermediate (Active Placement Drive)</option>
            <option value="Advanced">Advanced (Tier 1 Product Companies)</option>
          </select>
        </div>
      </div>

      {/* Target Companies */}
      <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-2.5">
        <label className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] block">
          Target Companies
        </label>
        <div className="flex flex-wrap gap-1.5">
          {formData.target_companies.length === 0 ? (
            <span className="text-xs text-[#64748B]">No target companies selected yet.</span>
          ) : (
            formData.target_companies.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#F59E0B]/30 text-xs font-semibold text-[#D97706] dark:text-[#FFA116]"
              >
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => onRemoveCompany(c)}
                  className="hover:text-[#DC2626] cursor-pointer"
                  aria-label={`Remove ${c}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (companyInput.trim()) {
                  onAddCompany(companyInput);
                  setCompanyInput('');
                }
              }
            }}
            placeholder="Add target company..."
            className="lc-input text-xs"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              if (companyInput.trim()) {
                onAddCompany(companyInput);
                setCompanyInput('');
              }
            }}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#64748B]">
          <span>Quick add:</span>
          {SUGGESTED_COMPANIES.filter((c) => !formData.target_companies.includes(c))
            .slice(0, 6)
            .map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onAddCompany(c)}
                className="px-2 py-0.5 rounded bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] hover:border-[#F59E0B] hover:text-[#F59E0B] transition cursor-pointer"
              >
                + {c}
              </button>
            ))}
        </div>
      </div>

      {/* Study Commitment & Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Daily Study Hours</span>
          </label>
          <input
            type="number"
            min="0.5"
            max="16"
            step="0.5"
            value={formData.daily_study_hours}
            onChange={(e) => onFieldChange('daily_study_hours', parseFloat(e.target.value) || 0)}
            className="lc-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B]">Daily DSA Goal</label>
          <input
            type="number"
            min="1"
            max="15"
            value={formData.daily_dsa_goal}
            onChange={(e) => onFieldChange('daily_dsa_goal', parseInt(e.target.value, 10) || 1)}
            className="lc-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B]">Daily Aptitude Drills</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.daily_aptitude_goal}
            onChange={(e) => onFieldChange('daily_aptitude_goal', parseInt(e.target.value, 10) || 1)}
            className="lc-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#64748B] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Prep Deadline</span>
          </label>
          <input
            type="date"
            value={formData.prep_deadline}
            onChange={(e) => onFieldChange('prep_deadline', e.target.value)}
            className="lc-input"
          />
        </div>
      </div>

      {/* Weekly Preparation Goals */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#64748B]">Weekly Preparation Goal</label>
        <textarea
          rows={2}
          value={formData.weekly_prep_goal}
          onChange={(e) => onFieldChange('weekly_prep_goal', e.target.value)}
          placeholder="e.g. Solve 15 medium graph/DP problems, complete 2 mock interviews, and finish DBMS revision."
          className="lc-input resize-none"
        />
      </div>

      {/* Preferred Technical Subjects */}
      <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0] dark:border-[#30363D]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Preferred Technical Subjects</span>
          </label>
          <span className="text-[11px] text-[#64748B]">
            {(formData.preferred_subjects || []).length} selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_OPTIONS.map((subj) => {
            const active = (formData.preferred_subjects || []).includes(subj);
            return (
              <button
                key={subj}
                type="button"
                onClick={() => handleToggleSubject(subj)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  active
                    ? 'bg-[#FFF8EE] dark:bg-[#FFA116]/15 border-[#F59E0B] text-[#D97706] dark:text-[#FFA116]'
                    : 'bg-[#F8FAFC] dark:bg-[#0D1117] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B] hover:text-[#1E293B] hover:border-[#CBD5E1]'
                }`}
              >
                {active ? '✓ ' : ''}
                {subj}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SecuritySection({
  user,
  passwordData,
  setPasswordData,
  passwordStatus,
  isChangingPass,
  onChangePasswordSubmit,
  onLogout,
}) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordsMatch =
    passwordData.new_password &&
    passwordData.confirm_password &&
    passwordData.new_password === passwordData.confirm_password;

  const formattedJoinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Active Account';

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#30363D]">
        <h3 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
          Security &amp; Authentication
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          Update your password, inspect account session details, or sign out securely.
        </p>
      </div>

      {/* Account Security Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-1">
          <span className="text-[11px] font-medium text-[#64748B]">Signed-in Email</span>
          <p className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] truncate">
            {user?.email || 'Not available'}
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-1">
          <span className="text-[11px] font-medium text-[#64748B]">Session Protection</span>
          <p className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated Session</span>
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-1">
          <span className="text-[11px] font-medium text-[#64748B]">Account Created</span>
          <p className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
            {formattedJoinedDate}
          </p>
        </div>
      </div>

      {/* Change Password Form */}
      <form
        onSubmit={onChangePasswordSubmit}
        className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-4"
      >
        <div>
          <h4 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-[#F59E0B]" />
            <span>Change Password</span>
          </h4>
          <p className="text-xs text-[#64748B] mt-0.5">
            Verify your current password before setting a new one (minimum 6 characters).
          </p>
        </div>

        {passwordStatus && (
          <div
            className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
              passwordStatus.type === 'success'
                ? 'bg-[#F0FDF4] border-[#16A34A]/30 text-[#16A34A]'
                : 'bg-[#FEF2F2] border-[#DC2626]/30 text-[#DC2626]'
            }`}
          >
            {passwordStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordStatus.text}</span>
          </div>
        )}

        <div className="space-y-3 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B]">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current_password: e.target.value })
                }
                required
                className="lc-input pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B]">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new_password: e.target.value })
                }
                required
                minLength={6}
                className="lc-input pr-10"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B]">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={passwordData.confirm_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirm_password: e.target.value })
                }
                required
                className="lc-input pr-10"
                placeholder="Re-enter new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordData.confirm_password && (
              <p
                className={`text-[11px] font-medium ${
                  passwordsMatch ? 'text-[#16A34A]' : 'text-[#DC2626]'
                }`}
              >
                {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={isChangingPass}
            icon={<KeyRound className="w-3.5 h-3.5" />}
          >
            Update Password
          </Button>
        </div>
      </form>

      {/* Logout Option */}
      <div className="p-4 rounded-xl bg-[#FEF2F2]/60 dark:bg-[#F85149]/10 border border-[#DC2626]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3]">
            Sign Out of PrepNest
          </h4>
          <p className="text-xs text-[#64748B]">
            End your active session and clear authentication credentials on this device.
          </p>
        </div>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={onLogout}
          icon={<LogOut className="w-3.5 h-3.5" />}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function AccountPreferencesSection({ formData, onFieldChange, isDark, setTheme }) {
  const togglePreference = (field) => {
    onFieldChange(field, !formData[field]);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#30363D]">
        <h3 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
          Account Preferences
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          Personalize workspace appearance, coding defaults, and study notification preferences.
        </p>
      </div>

      {/* Appearance */}
      <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3]">
              Workspace Theme
            </h4>
            <p className="text-xs text-[#64748B]">
              Choose between Clean Light and Midnight Dark mode across PrepNest.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#F59E0B]">
            {isDark ? 'Midnight Dark' : 'Clean Light'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 max-w-sm">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              !isDark
                ? 'bg-[#F59E0B] border-[#F59E0B] text-white shadow-sm'
                : 'bg-white dark:bg-[#161B22] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light Theme</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isDark
                ? 'bg-[#F59E0B] border-[#F59E0B] text-white shadow-sm'
                : 'bg-white dark:bg-[#161B22] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark Theme</span>
          </button>
        </div>
      </div>

      {/* Default Coding Language */}
      <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-[#F59E0B]" />
            <span>Primary Programming Language</span>
          </h4>
          <p className="text-xs text-[#64748B]">
            Default language used by DSA hints, code editor templates, and AI Mentor examples.
          </p>
        </div>
        <select
          value={formData.preferred_language}
          onChange={(e) => onFieldChange('preferred_language', e.target.value)}
          className="lc-input w-full sm:w-44 cursor-pointer"
        >
          <option value="Python">Python 3</option>
          <option value="Java">Java</option>
          <option value="C++">C++</option>
          <option value="JavaScript">JavaScript</option>
          <option value="TypeScript">TypeScript</option>
        </select>
      </div>

      {/* Notification Toggles */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Notifications &amp; Reminders</span>
        </h4>

        {[
          {
            field: 'email_notifications',
            icon: Mail,
            title: 'Email Notifications',
            desc: 'Receive placement readiness updates and account notifications via email.',
          },
          {
            field: 'streak_reminders',
            icon: Flame,
            title: 'Daily Streak Reminders',
            desc: 'Remind me when my daily DSA or aptitude goal is still pending.',
          },
          {
            field: 'weekly_digest',
            icon: Calendar,
            title: 'Weekly Progress Digest',
            desc: 'Weekly summary of solved problems, mock scores, and roadmap velocity.',
          },
        ].map((pref) => {
          const Icon = pref.icon;
          const enabled = Boolean(formData[pref.field]);
          return (
            <div
              key={pref.field}
              className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D]"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                    {pref.title}
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{pref.desc}</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => togglePreference(pref.field)}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                  enabled ? 'bg-[#16A34A]' : 'bg-[#CBD5E1] dark:bg-[#30363D]'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                    enabled ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

