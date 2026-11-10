import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, LayoutDashboard, Menu, Moon, Sun, X } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

const NAV_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'platform-showcase', label: 'Platform Overview' },
  { id: 'faq', label: 'FAQ' },
];

export function LandingNavbar({ isAuthenticated, isDark, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('features');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveSection(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-2xl backdrop-saturate-150 ${
        scrolled
          ? 'bg-white/50 dark:bg-[#0D1117]/60 border-b border-white/70 dark:border-white/10 shadow-[0_10px_34px_-12px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'bg-white/35 dark:bg-[#0D1117]/45 border-b border-white/50 dark:border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-none'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: PrepNest Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="PrepNest Home">
          <BrandLogo size="lg" className="hover:opacity-90 transition-opacity" />
        </Link>

        {/* Center: Smooth Section Links with Frosted Glass Pill */}
        <div className="hidden md:flex items-center gap-1 bg-white/45 dark:bg-[#161B22]/55 backdrop-blur-xl backdrop-saturate-150 border border-white/75 dark:border-white/10 ring-1 ring-[#E5E7EB]/60 dark:ring-[#30363D]/70 shadow-[0_4px_18px_-6px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] rounded-full px-1.5 py-1">
          {NAV_LINKS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleScrollTo(e, item.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-[#262626] dark:text-[#E6EDF3]'
                    : 'text-[#64748B] dark:text-[#8B949E] hover:text-[#262626] dark:hover:text-[#E6EDF3]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="landing-nav-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-white/85 dark:bg-[#21262D]/90 backdrop-blur-md shadow-xs ring-1 ring-white/90 dark:ring-white/15"
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </div>

        {/* Right: Theme Toggle + Auth CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-xl border border-white/75 dark:border-white/10 ring-1 ring-[#E5E7EB]/60 dark:ring-[#30363D]/70 bg-white/50 dark:bg-[#161B22]/60 hover:bg-white/80 dark:hover:bg-[#21262D]/80 backdrop-blur-xl flex items-center justify-center text-[#64748B] dark:text-[#8B949E] hover:text-[#FF9800] dark:hover:text-[#FFA116] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-none transition cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FFA116]" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#FF9800] hover:bg-[#E68900] text-white shadow-xs transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Open Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-sm font-semibold text-[#64748B] dark:text-[#8B949E] hover:text-[#262626] dark:hover:text-[#E6EDF3] hover:bg-[#F7F8FA] dark:hover:bg-[#161B22] transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/signup?redirect=/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-[#FF9800] hover:bg-[#E68900] text-white shadow-xs hover:-translate-y-0.5 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden w-9 h-9 rounded-xl border border-[#E5E7EB] dark:border-[#30363D] bg-white/80 dark:bg-[#161B22] flex items-center justify-center text-[#262626] dark:text-[#E6EDF3] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Animated Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-[#E5E7EB] dark:border-[#30363D] bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl px-4 py-4 space-y-2"
          >
            {NAV_LINKS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleScrollTo(e, item.id)}
                className={`block px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  activeSection === item.id
                    ? 'bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#D97706] dark:text-[#FFA116]'
                    : 'text-[#64748B] dark:text-[#8B949E] hover:bg-[#F7F8FA] dark:hover:bg-[#161B22]'
                }`}
              >
                {item.label}
              </a>
            ))}

            <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#30363D] flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#FF9800] text-white text-center flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border border-[#E5E7EB] dark:border-[#30363D] text-[#262626] dark:text-[#E6EDF3] text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup?redirect=/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#FF9800] text-white text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
