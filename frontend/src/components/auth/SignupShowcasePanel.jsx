import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Code2,
  Flame,
  Map,
  ShieldCheck,
  Target,
  Video,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

const SIGNUP_FEATURES = [
  {
    icon: Map,
    title: 'Smart Learning Roadmaps',
    description: 'Follow structured learning paths designed for technical placements.',
    iconClass: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  {
    icon: Video,
    title: 'AI Mock Interviews',
    description: 'Practice real-world technical and HR interviews.',
    iconClass: 'bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#FF9800]',
  },
  {
    icon: Building2,
    title: 'Company Preparation',
    description: 'Prepare with company-specific questions and recruitment patterns.',
    iconClass: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  },
];

const LOGIN_FEATURES = [
  {
    icon: Code2,
    title: 'DSA & Aptitude Practice',
    description: 'Resume coding problem sets, company tags, and timed aptitude drills.',
    iconClass: 'bg-[#E6FAF6] dark:bg-[#00B8A3]/15 text-[#00B8A3]',
  },
  {
    icon: Video,
    title: 'Adaptive AI Interviews',
    description: 'Continue Technical, HR, and STAR rounds with detailed evaluations.',
    iconClass: 'bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#FF9800]',
  },
  {
    icon: Flame,
    title: 'Live Readiness & Streaks',
    description: 'Track your daily streak, solved milestones, and leaderboard rank.',
    iconClass: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  },
];

const JOURNEY_STEPS = [
  { label: 'LEARN', icon: BookOpen },
  { label: 'PRACTICE', icon: Code2 },
  { label: 'PREPARE', icon: Target },
  { label: 'GET PLACED', icon: Award },
];

export function SignupShowcasePanel({ variant = 'signup' }) {
  const isLogin = variant === 'login';
  const features = isLogin ? LOGIN_FEATURES : SIGNUP_FEATURES;

  return (
    <div className="relative w-full p-6 sm:p-8 lg:p-9 bg-gradient-to-br from-[#FFFBF3]/80 via-[#FFFFFF]/75 to-[#F3F8FF]/80 dark:from-[#12171F]/70 dark:via-[#161B22]/65 dark:to-[#0F1722]/70 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-[#E5E7EB]/85 dark:border-[#30363D] flex flex-col justify-between gap-6 overflow-hidden">
      {/* Subtle Decorative Backdrop Glows */}
      <div className="pointer-events-none hidden sm:block absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#FF9800]/12 dark:bg-[#FFA116]/10 blur-2xl" />
      <div className="pointer-events-none hidden sm:block absolute -bottom-16 -right-12 w-52 h-52 rounded-full bg-sky-200/35 dark:bg-sky-500/10 blur-2xl" />

      {/* Top Section: Brand + Headline + Description */}
      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Link to="/landing" className="inline-flex items-center">
            <BrandLogo size="lg" className="hover:opacity-90 transition-opacity" />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/25 text-[11px] font-bold text-[#D97706] dark:text-[#FFA116]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Built for your placement journey</span>
          </span>
        </div>

        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3] leading-tight">
            {isLogin ? (
              <>
                Welcome Back to{' '}
                <span className="text-[#FF9800] dark:text-[#FFA116]">PrepNest.</span>
              </>
            ) : (
              <>
                Your Placement Journey{' '}
                <span className="text-[#FF9800] dark:text-[#FFA116]">Starts Here.</span>
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E] leading-relaxed max-w-lg">
            {isLogin
              ? 'Sign in to pick up right where you left off across DSA coding practice, aptitude drills, company tracks, and AI mock interviews.'
              : 'Create your account and take control of your placement preparation with personalized learning, intelligent practice, and AI-powered guidance.'}
          </p>
        </div>

        {/* Three Feature Highlights */}
        <div className="hidden md:grid grid-cols-1 gap-3 pt-1">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-3.5 rounded-xl bg-white/85 dark:bg-[#0D1117]/80 border border-[#E5E7EB]/85 dark:border-[#30363D] flex items-start gap-3 transition-colors hover:border-[#FF9800]/50"
              >
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${feat.iconClass}`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-xs sm:text-[13px] font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                    {feat.title}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-[#64748B] dark:text-[#8B949E] leading-snug mt-0.5">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Placement Journey Pipeline (Single Line on sm+) */}
      <div className="relative z-10 pt-4 border-t border-[#E5E7EB]/80 dark:border-[#21262D]">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5">
          {JOURNEY_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === JOURNEY_STEPS.length - 1;
            return (
              <React.Fragment key={step.label}>
                <div className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/90 dark:bg-[#0D1117]/85 border border-[#E5E7EB]/85 dark:border-[#30363D] shadow-2xs whitespace-nowrap">
                  <Icon
                    className={`w-3 h-3 shrink-0 ${
                      isLast ? 'text-[#FF9800]' : 'text-[#64748B] dark:text-[#8B949E]'
                    }`}
                  />
                  <span
                    className={`text-[9.5px] font-extrabold tracking-wide ${
                      isLast ? 'text-[#FF9800]' : 'text-[#1E293B] dark:text-[#E6EDF3]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <ArrowRight className="hidden sm:block w-3 h-3 text-[#FF9800]/75 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
