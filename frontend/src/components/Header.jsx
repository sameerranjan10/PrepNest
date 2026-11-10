import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BrandLogo } from './BrandLogo';
import {
  Search,
  Flame,
  Zap,
  Sparkles,
  Settings,
  Menu,
  ChevronDown,
  User,
  LogOut,
  PanelTopClose,
  PanelTopOpen,
  Maximize2,
  Minimize2,
  LayoutDashboard,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { apiFetch } from '@/lib/apiClient';
import { UserAvatar } from '@/components/UserAvatar';

const SMOOTH_EASE = [0.16, 1, 0.3, 1];

const ROUTE_LABELS = {
  '/dashboard': 'Dashboard',
  '/dsa': 'DSA Directory',
  '/aptitude': 'Aptitude Hub',
  '/company-prep': 'Company Tracker',
  '/roadmaps': 'Learning Roadmaps',
  '/resume-analyzer': 'Resume Analyzer',
  '/mock-interview': 'Mock Interview',
  '/projects': 'Projects & Portfolio',
  '/ai-assistant': 'AI Mentor',
  '/leaderboard': 'Leaderboard',
  '/community': 'Community',
  '/settings': 'Settings',
};

export const Header = ({
  defaultCollapsed = false,
  enableWorkspaceControls = true,
  onTopBarChange,
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [headerStats, setHeaderStats] = useState({
    streak: null,
    credits: null,
    plan: null,
  });
  const [isTopBarCollapsed, setIsTopBarCollapsed] = useState(defaultCollapsed);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('prepnest_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const pageTitle = ROUTE_LABELS[location.pathname] || 'Workspace';

  // Sync top-bar CSS offset so sticky sub-sidebars clear the floating glass navbar cleanly
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--header-offset',
      isTopBarCollapsed ? '0px' : '60px'
    );
    onTopBarChange?.(isTopBarCollapsed);
    return () => {
      document.documentElement.style.setProperty('--header-offset', '0px');
    };
  }, [isTopBarCollapsed, onTopBarChange]);

  // Listen to desktop sidebar collapse/expand events
  useEffect(() => {
    const handleSidebarChange = (e) => {
      setIsSidebarCollapsed(Boolean(e?.detail?.collapsed));
    };
    window.addEventListener('desktop-sidebar-changed', handleSidebarChange);
    return () => {
      window.removeEventListener('desktop-sidebar-changed', handleSidebarChange);
    };
  }, []);

  // Fetch live streak, credits, and plan from PostgreSQL
  useEffect(() => {
    let active = true;
    const loadHeaderStats = async () => {
      try {
        const res = await apiFetch('/api/user/header-stats');
        if (res.ok && active) {
          const data = await res.json();
          setHeaderStats({
            streak: Number(data.streak ?? 0),
            credits: Number(data.credits ?? 0),
            plan: data.plan || null,
          });
        }
      } catch {
        // Leave null on error so fake values are never shown
      }
    };
    loadHeaderStats();
    window.addEventListener('prepnest:stats-updated', loadHeaderStats);
    return () => {
      active = false;
      window.removeEventListener('prepnest:stats-updated', loadHeaderStats);
    };
  }, [user?.id, location.pathname]);

  // Keyboard shortcut: press '/' to focus global search when top bar is open
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isTopBarCollapsed) return;
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }
      e.preventDefault();
      searchInputRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTopBarCollapsed]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileSearchOpen(false);
      navigate(`/dsa?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close open dropdowns/search on route change, Escape, or outside pointer click
  useEffect(() => {
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!dropdownOpen && !mobileDropdownOpen) return undefined;
    const onPointerDown = (e) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target)) {
        setMobileDropdownOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dropdownOpen, mobileDropdownOpen]);

  useEffect(() => {
    if (mobileSearchOpen) {
      mobileSearchInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  const toggleMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
  };

  const isFocusMode = isTopBarCollapsed && isSidebarCollapsed;

  const toggleFocusMode = () => {
    const nextFocus = !isFocusMode;
    setIsTopBarCollapsed(nextFocus);
    window.dispatchEvent(
      new CustomEvent('set-desktop-sidebar', { detail: { collapsed: nextFocus } })
    );
  };

  const displayName = user?.full_name || user?.name || 'Student';
  const firstName = displayName.split(' ')[0];

  return (
    <>
      {/* Mobile Compact Frosted Glass Header */}
      <header className="md:hidden border-b border-white/75 dark:border-[#30363D] bg-white/75 dark:bg-[#161B22]/85 backdrop-blur-xl sticky top-0 z-30 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)]">
        <div className="h-14 px-3 sm:px-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <button
              type="button"
              onClick={toggleMobileSidebar}
              aria-label="Toggle navigation menu"
              className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-[#64748B] hover:text-[#262626] hover:bg-white/70 transition cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link to="/dashboard" className="min-w-0 flex items-center" aria-label="PrepNest Dashboard">
              <span className="min-[380px]:hidden">
                <BrandLogo iconOnly size="sm" />
              </span>
              <span className="hidden min-[380px]:inline-flex">
                <BrandLogo size="sm" />
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMobileDropdownOpen(false);
                setMobileSearchOpen((o) => !o);
              }}
              aria-label={mobileSearchOpen ? 'Close search' : 'Search problems and companies'}
              aria-expanded={mobileSearchOpen}
              className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-white/70 border border-[#E5E7EB]/80 text-[#64748B] hover:text-[#FFA116] transition cursor-pointer"
            >
              {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
              className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-white/70 border border-[#E5E7EB]/80 text-[#64748B] hover:text-[#FFA116] transition cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#FFA116]" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="hidden min-[360px]:flex items-center gap-1 bg-[#FFF8EE]/90 border border-[#FFA116]/30 text-[#FFA116] px-2 py-1 rounded-full text-[11px] font-bold">
              <Flame className="w-3 h-3 fill-[#FFA116] text-[#FFA116]" />
              <span>{headerStats.streak !== null ? `${headerStats.streak}d` : '—'}</span>
            </div>

            <div className="relative" ref={mobileDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setMobileDropdownOpen((o) => !o);
                }}
                aria-label="Open account menu"
                aria-expanded={mobileDropdownOpen}
                className="w-10 h-10 inline-flex items-center justify-center rounded-full cursor-pointer"
              >
                <UserAvatar
                  src={user?.avatar_url}
                  name={displayName}
                  size="custom"
                  className="w-8 h-8 text-xs shadow-sm ring-1 ring-[#E5E7EB]/80"
                />
              </button>

              <AnimatePresence>
                {mobileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: SMOOTH_EASE }}
                    className="absolute right-0 mt-2 w-[min(17rem,calc(100vw-1.5rem))] bg-white/95 dark:bg-[#161B22]/95 backdrop-blur-2xl border border-white/85 dark:border-[#30363D] ring-1 ring-[#E5E7EB]/80 dark:ring-[#30363D] rounded-xl shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)] py-1.5 z-50"
                  >
                    <div className="px-3.5 py-2.5 border-b border-[#E5E7EB]/60 flex items-center gap-2.5">
                      <UserAvatar
                        src={user?.avatar_url}
                        name={displayName}
                        size="sm"
                        className="shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#262626] truncate">{displayName}</p>
                        <p className="text-[11px] text-[#64748B] truncate">
                          {user?.email || 'Logged In'}
                        </p>
                      </div>
                    </div>

                    <div className="px-3.5 py-2 border-b border-[#E5E7EB]/60 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-bold text-[#FFA116]">
                        <Flame className="w-3.5 h-3.5 fill-[#FFA116] text-[#FFA116]" />
                        {headerStats.streak !== null ? `${headerStats.streak}d` : '—'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#262626]">
                        <Sparkles className="w-3.5 h-3.5 text-[#FFA116]" />
                        {headerStats.credits ?? user?.credits ?? '—'} Credits
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-[#16A34A] ml-auto">
                        <Zap className="w-3 h-3 text-[#16A34A]" />
                        {headerStats.plan || user?.plan || 'Free'}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setMobileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-[#64748B] hover:text-[#262626] hover:bg-white/80 transition min-h-[44px]"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMobileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-[#64748B] hover:text-[#262626] hover:bg-white/80 transition min-h-[44px]"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings &amp; Profile</span>
                    </Link>
                    <div className="my-1 border-t border-[#E5E7EB]/60" />
                    <button
                      type="button"
                      onClick={() => {
                        setMobileDropdownOpen(false);
                        navigate('/landing', { replace: true });
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2]/90 transition text-left cursor-pointer min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Expandable Mobile Search Bar */}
        <AnimatePresence initial={false}>
          {mobileSearchOpen && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: SMOOTH_EASE }}
              onSubmit={handleSearchSubmit}
              className="overflow-hidden border-t border-[#E5E7EB]/60 px-3 py-2.5"
            >
              <div className="relative flex items-center gap-2">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search problems, companies, topics..."
                  className="w-full bg-white/80 border border-[#E5E7EB]/80 focus:border-[#FFA116] text-xs text-[#262626] placeholder-[#94A3B8] pl-9 pr-9 py-2.5 rounded-xl outline-none transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#262626] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </header>

      {/* Desktop Floating Frosted Glass Navbar + Stationary Control Pill */}
      <div
        className={`hidden md:block sticky top-0 z-40 px-4 sm:px-6 lg:px-8 pointer-events-none ${
          isTopBarCollapsed ? '' : 'pt-2.5'
        }`}
      >
        <AnimatePresence initial={false}>
          {!isTopBarCollapsed && (
            <motion.header
              key="desktop-topbar-expanded"
              initial={{ height: 0, opacity: 0, y: -12, filter: 'blur(6px)' }}
              animate={{
                height: 52,
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transitionEnd: { overflow: 'visible', filter: 'none', transform: 'none' },
              }}
              exit={{ height: 0, opacity: 0, y: -10, filter: 'blur(6px)', overflow: 'hidden' }}
              transition={{ duration: 0.26, ease: SMOOTH_EASE }}
              className={`pointer-events-auto rounded-2xl bg-white/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/80 ring-1 ring-[#E5E7EB]/65 pl-4 lg:pl-5 flex items-center justify-between gap-4 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] ${
                enableWorkspaceControls ? 'pr-[118px] lg:pr-[126px]' : 'pr-4 lg:pr-5'
              }`}
            >
              {/* Left Cluster: Page Title & Frosted Global Search */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="hidden xl:flex items-center gap-2.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFA116]" />
                  <span className="text-xs font-semibold text-[#262626] tracking-tight">
                    {pageTitle}
                  </span>
                  <span className="h-4 w-px bg-[#E5E7EB]/80" />
                </div>

                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex-1 max-w-sm lg:max-w-md group"
                >
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] group-focus-within:text-[#FFA116] transition-colors absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problems, companies, topics..."
                    className="w-full bg-white/65 hover:bg-white/85 focus:bg-white/95 border border-[#E5E7EB]/80 focus:border-[#FFA116] focus:ring-2 focus:ring-[#FFA116]/15 text-xs text-[#262626] placeholder-[#94A3B8] pl-9 pr-12 py-1.5 rounded-xl outline-none transition shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)]"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#262626] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold text-[#94A3B8] bg-white/80 border border-[#E5E7EB]/80 rounded-md absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      /
                    </kbd>
                  )}
                </form>
              </div>

              {/* Right Cluster: Unified Frosted Metrics Capsule & Account Trigger */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-xl bg-white/60 backdrop-blur-md border border-white/85 ring-1 ring-[#E5E7EB]/60 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <span
                    title="Daily Learning Streak"
                    className="inline-flex items-center gap-1 font-bold text-[#FFA116]"
                  >
                    <Flame className="w-3.5 h-3.5 fill-[#FFA116] text-[#FFA116]" />
                    <span>{headerStats.streak !== null ? `${headerStats.streak}d` : '—'}</span>
                  </span>

                  <span className="w-px h-3 bg-[#E5E7EB]" />

                  <span
                    title="AI Mentorship & Analysis Credits"
                    className="inline-flex items-center gap-1 font-semibold text-[#262626]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFA116]" />
                    <span>{headerStats.credits ?? user?.credits ?? '—'}</span>
                    <span className="hidden lg:inline text-[#64748B] font-medium">Credits</span>
                  </span>

                  <span className="hidden xl:inline-block w-px h-3 bg-[#E5E7EB]" />

                  <span className="hidden xl:inline-flex items-center gap-1 font-bold text-[#16A34A]">
                    <Zap className="w-3 h-3 text-[#16A34A]" />
                    <span>{headerStats.plan || user?.plan || 'Free'}</span>
                  </span>
                </div>

                {/* User Dropdown Trigger */}
                <div className="relative" ref={desktopDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-1.5 py-1 pl-1 pr-2 rounded-xl bg-white/55 hover:bg-white/85 border border-white/80 ring-1 ring-[#E5E7EB]/60 transition cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                  >
                    <div className="relative">
                      <UserAvatar
                        src={user?.avatar_url}
                        name={displayName}
                        size="xs"
                        className="shadow-sm"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#16A34A] ring-2 ring-white" />
                    </div>
                    <span className="hidden lg:inline text-xs font-medium text-[#262626] max-w-[84px] truncate">
                      {firstName}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-150 ${
                        dropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: SMOOTH_EASE }}
                        onMouseLeave={() => setDropdownOpen(false)}
                        className="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-2xl border border-white/85 ring-1 ring-[#E5E7EB]/80 rounded-xl shadow-[0_12px_32px_-8px_rgba(15,23,42,0.12)] py-1.5 z-50"
                      >
                        <div className="px-3.5 py-2.5 border-b border-[#E5E7EB]/60 flex items-center gap-2.5">
                          <UserAvatar
                            src={user?.avatar_url}
                            name={displayName}
                            size="sm"
                            className="shadow-sm"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#262626] truncate">
                              {displayName}
                            </p>
                            <p className="text-[11px] text-[#64748B] truncate">
                              {user?.email || 'Logged In'}
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#64748B] hover:text-[#262626] hover:bg-white/80 transition"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#64748B] hover:text-[#262626] hover:bg-white/80 transition"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Settings &amp; Profile</span>
                        </Link>
                        <div className="my-1 border-t border-[#E5E7EB]/60" />
                        <button
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/landing', { replace: true });
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#DC2626] hover:bg-[#FEF2F2]/90 transition text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        {/* ONE Stationary Frosted Glass Control Pill (Theme, Top Bar & Focus Controls) */}
        {enableWorkspaceControls && (
          <div className="pointer-events-auto absolute top-[17px] right-6 sm:right-8 lg:right-10 z-50 inline-flex items-center gap-0.5 p-1 rounded-xl bg-white/65 backdrop-blur-xl border border-white/85 ring-1 ring-[#E5E7EB]/70 shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95)]">
            {/* Light / Dark Mode Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-7 h-7 rounded-lg hover:bg-white/90 text-[#64748B] hover:text-[#FFA116] flex items-center justify-center transition cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-[#FFA116]" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>

            <div className="w-px h-3.5 bg-[#E5E7EB]" />

            {/* Top Bar Collapse / Re-emerge */}
            <button
              type="button"
              onClick={() => setIsTopBarCollapsed((prev) => !prev)}
              title={isTopBarCollapsed ? 'Show top bar' : 'Collapse top bar'}
              aria-label={isTopBarCollapsed ? 'Show top bar' : 'Collapse top bar'}
              className="w-7 h-7 rounded-lg hover:bg-white/90 text-[#64748B] hover:text-[#FFA116] flex items-center justify-center transition cursor-pointer"
            >
              {isTopBarCollapsed ? (
                <PanelTopOpen className="w-3.5 h-3.5 text-[#FFA116]" />
              ) : (
                <PanelTopClose className="w-3.5 h-3.5" />
              )}
            </button>

            <div className="w-px h-3.5 bg-[#E5E7EB]" />

            {/* Focus Mode (sidebar + top bar together) */}
            <button
              type="button"
              onClick={toggleFocusMode}
              title={
                isFocusMode
                  ? 'Restore sidebar & top bar'
                  : 'Focus mode (collapse sidebar & top bar)'
              }
              aria-label="Toggle focus mode"
              className="w-7 h-7 rounded-lg hover:bg-white/90 text-[#64748B] hover:text-[#FFA116] flex items-center justify-center transition cursor-pointer"
            >
              {isFocusMode ? (
                <Minimize2 className="w-3.5 h-3.5 text-[#FFA116]" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
