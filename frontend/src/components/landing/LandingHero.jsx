import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Building2,
  ChevronDown,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';

const HERO_EASE = [0.16, 1, 0.3, 1];

export function LandingHero({ isAuthenticated }) {
  const scrollToFeatures = (e) => {
    e.preventDefault();
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] flex flex-col justify-between pt-8 pb-7 lg:pt-10 lg:pb-9">
        {/* Vertically Centered Hero Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-4">
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0.92, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: HERO_EASE }}
            className="lg:col-span-6 space-y-6"
          >
            <motion.div
              initial={{ opacity: 0.85, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: HERO_EASE }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/30 text-[#D97706] dark:text-[#FFA116] text-xs font-bold tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Placement Preparation</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3] leading-[1.1]">
              Your Placement Journey.
              <br />
              <span className="text-[#FF9800] dark:text-[#FFA116]">One Platform.</span>{' '}
              Every Opportunity.
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] dark:text-[#8B949E] leading-relaxed max-w-xl">
              Master coding interviews, strengthen your fundamentals, prepare for company-specific
              assessments, and build the confidence to land your dream tech role.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <motion.div whileHover={{ y: -2, scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                <Link
                  to={isAuthenticated ? '/dashboard' : '/signup?redirect=/dashboard'}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm sm:text-[15px] font-semibold bg-[#FF9800] hover:bg-[#E68900] text-white shadow-[0_6px_20px_-6px_rgba(255,152,0,0.55)] hover:shadow-[0_10px_24px_-6px_rgba(255,152,0,0.65)] transition-all"
                >
                  <span>{isAuthenticated ? 'Open Dashboard' : 'Start Preparing'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }}>
                <a
                  href="#features"
                  onClick={scrollToFeatures}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm sm:text-[15px] font-semibold bg-white dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#30363D] hover:border-[#FF9800]/60 text-[#1E293B] dark:text-[#E6EDF3] shadow-xs transition-all"
                >
                  <Compass className="w-4 h-4 text-[#FF9800]" />
                  <span>Explore Platform</span>
                </a>
              </motion.div>
            </div>

            {/* Three Compact Benefit Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8]">
              <div className="inline-flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/25 text-[#FF9800] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </span>
                <span>Structured Learning</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/25 text-[#FF9800] flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </span>
                <span>AI-Powered Guidance</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/25 text-[#FF9800] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </span>
                <span>Company-Specific Practice</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN – SEAMLESS BLENDED STUDENT ILLUSTRATION WITH SUBTLE FLOAT */}
          <motion.div
            initial={{ opacity: 0.9, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: HERO_EASE }}
            className="lg:col-span-6 relative"
          >
            <div className="relative mx-auto max-w-2xl">
              {/* Warm Atmospheric Halo behind Illustration */}
              <div className="pointer-events-none absolute inset-4 rounded-full bg-gradient-to-tr from-[#FF9800]/16 via-amber-100/35 to-transparent dark:from-[#FFA116]/16 dark:via-[#FFA116]/5 blur-2xl" />

              {/* Seamless Illustration: subtle continuous gentle levitation */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative rounded-3xl dark:bg-[#FFF9F2] dark:p-2 dark:ring-1 dark:ring-white/15 dark:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)]"
              >
                <img
                  src="/illustrations/roadmap-hero.jpg"
                  alt="PrepNest student following a structured placement roadmap with live coding practice and analytics"
                  className="w-full h-auto aspect-[3/2] object-cover block rounded-2xl mix-blend-multiply dark:mix-blend-normal [mask-image:radial-gradient(ellipse_96%_94%_at_50%_50%,#000_78%,transparent_100%)] dark:[mask-image:none]"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom-Anchored Animated Scroll Down Cue */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: HERO_EASE }}
          className="pt-4 flex justify-center"
        >
          <a
            href="#features"
            onClick={scrollToFeatures}
            className="group inline-flex flex-col items-center gap-2 text-[#64748B] dark:text-[#8B949E] hover:text-[#FF9800] dark:hover:text-[#FFA116] transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Scroll Down to Explore
            </span>
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
              className="w-9 h-9 rounded-full border border-[#E5E7EB] dark:border-[#30363D] group-hover:border-[#FF9800]/60 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md flex items-center justify-center shadow-xs"
            >
              <ChevronDown className="w-4 h-4 text-[#FF9800]" />
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
