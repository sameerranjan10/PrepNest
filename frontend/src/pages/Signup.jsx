import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { BlurDrop } from '@/components/ui/BlurDrop';
import { ButtonLoader } from '@/components/ui/PrepNestLoader';
import { SignupShowcasePanel } from '@/components/auth/SignupShowcasePanel';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function evaluatePasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: 'bg-[#E5E7EB] dark:bg-[#30363D]', textColor: '' };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) score += 1;

  if (score <= 1) {
    return { score: 1, label: 'Weak', color: 'bg-[#DC2626]', textColor: 'text-[#DC2626]' };
  }
  if (score === 2) {
    return { score: 2, label: 'Fair', color: 'bg-[#F59E0B]', textColor: 'text-[#D97706] dark:text-[#FBBF24]' };
  }
  if (score === 3) {
    return { score: 3, label: 'Good', color: 'bg-[#2563EB]', textColor: 'text-[#2563EB] dark:text-[#60A5FA]' };
  }
  return { score: 4, label: 'Strong', color: 'bg-[#16A34A]', textColor: 'text-[#16A34A] dark:text-[#3FB950]' };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const trimmedName = fullName.trim();
  const trimmedEmail = email.trim();

  const nameValid = trimmedName.length >= 2;
  const emailValid = EMAIL_RE.test(trimmedEmail);
  const passwordMinLengthValid = password.length >= 8;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const isFormValid =
    nameValid && emailValid && passwordMinLengthValid && passwordsMatch && acceptedTerms;

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true,
    });

    if (!isFormValid) {
      setError('Please complete all required fields and resolve any validation hints below.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: trimmedName,
          email: trimmedEmail,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      login(data.user, data.access_token);
      navigate(redirectParam, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-bg relative min-h-screen bg-gradient-to-br from-[#FFFDF8] via-[#F7F8FA] to-[#EEF4FF] dark:from-[#0D1117] dark:via-[#0D1117] dark:to-[#101826] text-[#1E293B] dark:text-[#E6EDF3] font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-[#FFA116] selection:text-white overflow-x-hidden">
      {/* Preserved Background Illustration */}
      <img
        src="/signup-bg.jpg"
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

      {/* Two-Panel Registration Container */}
      <BlurDrop
        duration={0.35}
        yOffset={10}
        blurAmount={6}
        className="relative z-10 w-full max-w-5xl mt-12 sm:mt-8 lg:mt-0 grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white/92 dark:bg-[#161B22]/92 backdrop-blur-2xl backdrop-saturate-150 border border-white/90 dark:border-white/10 ring-1 ring-[#E5E7EB]/75 dark:ring-[#30363D]/80 shadow-[0_24px_64px_-16px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.95)] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden"
      >
        {/* LEFT PANEL: Branding, Illustration, Highlights & Placement Journey */}
        <div className="lg:col-span-6 flex">
          <SignupShowcasePanel />
        </div>

        {/* RIGHT PANEL: Registration Form */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-9 flex flex-col justify-center space-y-5">
          {/* Header + Auth Switcher */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#FF9800]">
                Student Registration
              </span>

              <div className="inline-flex items-center p-1 rounded-xl bg-[#F1F5F9]/90 dark:bg-[#0D1117]/90 border border-[#E5E7EB]/80 dark:border-[#30363D] text-xs font-semibold">
                <Link
                  to={`/login?redirect=${encodeURIComponent(redirectParam)}`}
                  className="px-3 py-1 rounded-lg text-[#64748B] dark:text-[#8B949E] hover:text-[#1E293B] dark:hover:text-[#E6EDF3] transition"
                >
                  Sign In
                </Link>
                <span className="px-3 py-1 rounded-lg bg-white dark:bg-[#21262D] text-[#1E293B] dark:text-[#E6EDF3] shadow-xs">
                  Register
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3]">
                Create Your Account
              </h2>
              <p className="text-sm text-[#64748B] dark:text-[#8B949E]">
                Start building your path towards your dream tech career.
              </p>
            </div>
          </div>

          {/* Backend / Submission Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] dark:bg-[#F85149]/15 border border-[#DC2626]/25 text-[#DC2626] dark:text-[#F85149] text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* 1. Full Name */}
            <div className="space-y-1">
              <label
                htmlFor="signup-name"
                className="block text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]"
              >
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#64748B] dark:text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => markTouched('fullName')}
                  placeholder="Enter your full name"
                  className="w-full bg-white/95 dark:bg-[#0D1117]/90 border border-[#E2E8F0] dark:border-[#30363D] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#1E293B] dark:text-[#E6EDF3] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF9800] focus:ring-2 focus:ring-[#FF9800]/15 transition-all"
                />
              </div>
              {touched.fullName && !nameValid && (
                <p className="text-[11px] font-medium text-[#DC2626] dark:text-[#F85149]">
                  Please enter your full name (at least 2 characters).
                </p>
              )}
            </div>

            {/* 2. Email Address */}
            <div className="space-y-1">
              <label
                htmlFor="signup-email"
                className="block text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] dark:text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched('email')}
                  placeholder="you@example.com"
                  className="w-full bg-white/95 dark:bg-[#0D1117]/90 border border-[#E2E8F0] dark:border-[#30363D] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#1E293B] dark:text-[#E6EDF3] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF9800] focus:ring-2 focus:ring-[#FF9800]/15 transition-all"
                />
              </div>
              {touched.email && !emailValid && (
                <p className="text-[11px] font-medium text-[#DC2626] dark:text-[#F85149]">
                  Enter a valid email address.
                </p>
              )}
            </div>

            {/* 3. Password + Strength Indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]"
                >
                  Password
                </label>
                {password && (
                  <span className={`text-[11px] font-bold ${strength.textColor}`}>
                    {strength.label}
                  </span>
                )}
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] dark:text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => markTouched('password')}
                  placeholder="Minimum 8 characters"
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

              {/* 4-Segment Strength Bar */}
              <div className="grid grid-cols-4 gap-1.5 pt-0.5" aria-label="Password strength meter">
                {[1, 2, 3, 4].map((seg) => (
                  <span
                    key={seg}
                    className={`h-1 rounded-full transition-colors ${
                      strength.score >= seg
                        ? strength.color
                        : 'bg-[#E5E7EB] dark:bg-[#21262D]'
                    }`}
                  />
                ))}
              </div>

              {touched.password && !passwordMinLengthValid && (
                <p className="text-[11px] font-medium text-[#DC2626] dark:text-[#F85149]">
                  Password must be at least 8 characters long.
                </p>
              )}
            </div>

            {/* 4. Confirm Password */}
            <div className="space-y-1">
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-semibold text-[#334155] dark:text-[#CBD5E1]"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] dark:text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => markTouched('confirmPassword')}
                  placeholder="Re-enter your password"
                  className="w-full bg-white/95 dark:bg-[#0D1117]/90 border border-[#E2E8F0] dark:border-[#30363D] rounded-xl py-2.5 pl-10 pr-10 text-sm text-[#1E293B] dark:text-[#E6EDF3] placeholder-[#94A3B8] focus:outline-none focus:border-[#FF9800] focus:ring-2 focus:ring-[#FF9800]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#8B949E] hover:text-[#1E293B] dark:hover:text-[#E6EDF3] transition cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <p
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    passwordsMatch
                      ? 'text-[#16A34A] dark:text-[#3FB950]'
                      : 'text-[#DC2626] dark:text-[#F85149]'
                  }`}
                >
                  {passwordsMatch && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </p>
              )}
            </div>

            {/* Terms & Privacy Checkbox */}
            <div className="pt-1">
              <label className="inline-flex items-start gap-2.5 cursor-pointer select-none">
                <span className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      markTouched('terms');
                    }}
                    className="peer sr-only"
                  />
                  <span className="w-4 h-4 rounded border border-[#CBD5E1] dark:border-[#30363D] bg-white dark:bg-[#0D1117] peer-checked:bg-[#FF9800] peer-checked:border-[#FF9800] flex items-center justify-center transition-colors">
                    {acceptedTerms && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </span>
                </span>
                <span className="text-xs text-[#64748B] dark:text-[#8B949E] leading-snug">
                  I agree to the{' '}
                  <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
              {touched.terms && !acceptedTerms && (
                <p className="mt-1 text-[11px] font-medium text-[#DC2626] dark:text-[#F85149]">
                  Please accept the Terms of Service and Privacy Policy to continue.
                </p>
              )}
            </div>

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-[#FF9800] hover:bg-[#E68900] active:bg-[#CC7A00] text-white shadow-[0_8px_20px_-6px_rgba(255,152,0,0.55)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <ButtonLoader size="sm" tone="light" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create My Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="pt-3 border-t border-[#E5E7EB]/80 dark:border-[#21262D] text-center text-xs text-[#64748B] dark:text-[#8B949E]">
            Already have an account?{' '}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirectParam)}`}
              className="text-[#FF9800] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </BlurDrop>
    </div>
  );
}
