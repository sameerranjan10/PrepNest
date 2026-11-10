import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Flame,
  Lock,
  Mail,
  Moon,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { BlurDrop } from '@/components/ui/BlurDrop';
import { ButtonLoader } from '@/components/ui/PrepNestLoader';
import { SignupShowcasePanel } from '@/components/auth/SignupShowcasePanel';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid email or password');
      }

      login(data.user, data.access_token);
      navigate(redirectParam, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-bg relative min-h-screen bg-gradient-to-br from-[#FFFDF8] via-[#F7F8FA] to-[#EEF4FF] dark:from-[#0D1117] dark:via-[#0D1117] dark:to-[#101826] text-[#1E293B] dark:text-[#E6EDF3] font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-[#FFA116] selection:text-white overflow-x-hidden">
      {/* Preserved Background Illustration */}
      <img
        src="/auth-bg.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 w-full h-full object-cover object-center opacity-60 z-0"
      />

      {/* Top Navigation Controls: Back + Theme Toggle */}
      <Link
        to="/landing"
        aria-label="Back to landing page"
        title="Back to landing page"
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-20 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-[#161B22]/85 backdrop-blur-xl border border-white/85 dark:border-[#30363D] ring-1 ring-[#E5E7EB]/60 dark:ring-0 text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3] hover:border-[#FFA116]/60 hover:text-[#FF9800] shadow-xs transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Link>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-20 w-9 h-9 rounded-xl bg-white/80 dark:bg-[#161B22]/85 backdrop-blur-xl border border-white/85 dark:border-[#30363D] ring-1 ring-[#E5E7EB]/60 dark:ring-0 flex items-center justify-center text-[#64748B] dark:text-[#8B949E] hover:text-[#FF9800] dark:hover:text-[#FFA116] shadow-xs transition-all cursor-pointer"
      >
        {isDark ? <Sun className="w-4 h-4 text-[#FFA116]" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Two-Panel Login Container matching Signup */}
      <BlurDrop
        duration={0.35}
        yOffset={10}
        blurAmount={6}
        className="relative z-10 w-full max-w-5xl mt-12 sm:mt-8 lg:mt-0 grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white/92 dark:bg-[#161B22]/92 backdrop-blur-2xl backdrop-saturate-150 border border-white/90 dark:border-white/10 ring-1 ring-[#E5E7EB]/75 dark:ring-[#30363D]/80 shadow-[0_24px_64px_-16px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden"
      >
        {/* LEFT PANEL: Shared Branding & Placement Journey Storytelling */}
        <div className="lg:col-span-6 flex">
          <SignupShowcasePanel variant="login" />
        </div>

        {/* RIGHT PANEL: Sign In Form */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-9 flex flex-col justify-center space-y-5">
          {/* Header + Mode Switcher */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FF9800]">
                Member Access
              </span>

              <div className="inline-flex items-center p-1 rounded-xl bg-[#F1F5F9]/90 dark:bg-[#0D1117]/90 border border-[#E5E7EB]/80 dark:border-[#30363D] text-xs font-semibold">
                <span className="px-3 py-1 rounded-lg bg-white dark:bg-[#21262D] text-[#1E293B] dark:text-[#E6EDF3] shadow-xs">
                  Sign In
                </span>
                <Link
                  to={`/signup?redirect=${encodeURIComponent(redirectParam)}`}
                  className="px-3 py-1 rounded-lg text-[#64748B] dark:text-[#8B949E] hover:text-[#1E293B] dark:hover:text-[#E6EDF3] transition"
                >
                  Register
                </Link>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3]">
                Sign in to your account
              </h2>
              <p className="text-sm text-[#64748B] dark:text-[#8B949E]">
                Enter your email and password to open your PrepNest workspace.
              </p>
            </div>
          </div>

          {/* Contextual Alerts */}
          {searchParams.has('redirect') && (
            <div className="p-3 rounded-xl bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/30 text-[#B45309] dark:text-[#FBBF24] text-xs font-medium flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 text-[#FF9800]" />
              <span>Sign in to access your dashboard and saved progress.</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-[#F85149]/15 border border-[#DC2626]/25 text-[#DC2626] dark:text-[#F85149] text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] dark:text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/95 dark:bg-[#0D1117]/90 border border-[#E2E8F0] dark:border-[#30363D] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#1E293B] dark:text-[#E6EDF3] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF9800] focus:ring-2 focus:ring-[#FF9800]/15 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] dark:text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/95 dark:bg-[#0D1117]/90 border border-[#E2E8F0] dark:border-[#30363D] rounded-xl py-2.5 pl-10 pr-10 text-sm text-[#1E293B] dark:text-[#E6EDF3] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF9800] focus:ring-2 focus:ring-[#FF9800]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#8B949E] hover:text-[#1E293B] dark:hover:text-[#E6EDF3] transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-[#FF9800] hover:bg-[#E68900] active:bg-[#CC7A00] text-white shadow-[0_8px_20px_-6px_rgba(255,152,0,0.55)] transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <ButtonLoader size="sm" tone="light" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Sync Note + Register Link */}
          <div className="pt-4 border-t border-[#E5E7EB]/80 dark:border-[#21262D] space-y-3">
            <div className="flex items-center justify-center gap-2 text-[11px] text-[#64748B] dark:text-[#8B949E]">
              <Flame className="w-3.5 h-3.5 text-[#FF9800] shrink-0" />
              <span>Your streaks, solved problems &amp; feedback stay synced</span>
            </div>

            <p className="text-center text-xs text-[#64748B] dark:text-[#8B949E]">
              New to PrepNest?{' '}
              <Link
                to={`/signup?redirect=${encodeURIComponent(redirectParam)}`}
                className="text-[#FF9800] font-semibold hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </BlurDrop>
    </div>
  );
}
