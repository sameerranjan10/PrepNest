import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BrandLogo } from './BrandLogo';
import {
  LayoutDashboard,
  FileText,
  BrainCircuit,
  Code2,
  Video,
  Building2,
  Map,
  FolderGit2,
  Bot,
  Trophy,
  Users,
  Settings,
  LogOut,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { UserAvatar, getInitials } from '@/components/UserAvatar';

const SMOOTH_EASE = [0.16, 1, 0.3, 1];
const SIDEBAR_STORAGE_KEY = 'prepnest_sidebar_collapsed';

function readStoredSidebarState() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export const Sidebar = ({ activeRoute = 'dashboard', hiddenOnDesktop }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(() => readStoredSidebarState());
  const [hoveredItem, setHoveredItem] = useState(null);
  const [dsaCountBadge, setDsaCountBadge] = useState(null);

  useEffect(() => {
    let active = true;
    apiFetch('/api/user/header-stats')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data || !data.dsa_total) return;
        const n = Number(data.dsa_total);
        setDsaCountBadge(n >= 1000 ? `${Math.floor(n / 100) / 10}K+` : String(n));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const isExternallyControlled = hiddenOnDesktop !== undefined;
  const isMiniDesktop = isExternallyControlled ? Boolean(hiddenOnDesktop) : desktopCollapsed;

  useEffect(() => {
    const handleToggle = () => setMobileOpen((prev) => !prev);
    const handleClose = () => setMobileOpen(false);
    const handleSetDesktopSidebar = (e) => {
      if (isExternallyControlled) return;
      const nextVal = e?.detail?.collapsed;
      setDesktopCollapsed((prev) => {
        const resolved = nextVal === undefined || nextVal === 'toggle' ? !prev : Boolean(nextVal);
        window.dispatchEvent(
          new CustomEvent('desktop-sidebar-changed', { detail: { collapsed: resolved } })
        );
        return resolved;
      });
    };

    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('close-sidebar', handleClose);
    window.addEventListener('set-desktop-sidebar', handleSetDesktopSidebar);
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('close-sidebar', handleClose);
      window.removeEventListener('set-desktop-sidebar', handleSetDesktopSidebar);
    };
  }, [isExternallyControlled]);

  useEffect(() => {
    if (!isExternallyControlled) {
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(desktopCollapsed));
      } catch {
        // Ignore storage errors
      }
      if (!desktopCollapsed) setHoveredItem(null);
      window.dispatchEvent(
        new CustomEvent('desktop-sidebar-changed', { detail: { collapsed: desktopCollapsed } })
      );
    }
  }, [desktopCollapsed, isExternallyControlled]);

  const handleLogout = () => {
    setMobileOpen(false);
    navigate('/landing', { replace: true });
    logout();
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'dsa', label: 'DSA Directory', icon: Code2, href: '/dsa', ...(dsaCountBadge ? { badge: dsaCountBadge } : {}) },
    { id: 'aptitude', label: 'Aptitude Hub', icon: BrainCircuit, href: '/aptitude' },
    { id: 'company-prep', label: 'Company Tracker', icon: Building2, href: '/company-prep' },
    { id: 'roadmaps', label: 'Learning Roadmaps', icon: Map, href: '/roadmaps' },
    { id: 'resume-analyzer', label: 'Resume Analyzer', icon: FileText, href: '/resume-analyzer' },
    { id: 'mock-interview', label: 'Mock Interview', icon: Video, href: '/mock-interview' },
    { id: 'projects', label: 'Projects & Portfolio', icon: FolderGit2, href: '/projects' },
    { id: 'ai-assistant', label: 'AI Mentor', icon: Bot, href: '/ai-assistant' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
    { id: 'community', label: 'Community', icon: Users, href: '/community' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const renderContent = ({ isFloatingDesktop = false, mini = false } = {}) => (
    <div
      className={`flex flex-col h-full text-[#262626] select-none transition-all ${
        isFloatingDesktop
          ? 'rounded-2xl bg-white/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/80 ring-1 ring-[#E5E7EB]/65 shadow-[0_12px_36px_-10px_rgba(15,23,42,0.09),inset_0_1px_0_rgba(255,255,255,0.95)]'
          : 'bg-white/80 backdrop-blur-2xl border-r border-[#E5E7EB]/80 shadow-[inset_-1px_0_0_rgba(255,255,255,0.75)]'
      }`}
    >
      {/* Brand Header + Sidebar Collapse/Expand Control */}
      <div
        className={`h-16 flex items-center border-b border-[#E5E7EB]/55 ${
          mini ? 'px-2 justify-center flex-col gap-1.5 py-2 h-auto' : 'px-3.5 justify-between'
        }`}
      >
        {mini && !isExternallyControlled ? (
          <button
            type="button"
            onClick={() => setDesktopCollapsed(false)}
            className="flex items-center justify-center group cursor-pointer"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <BrandLogo
              iconOnly
              size="sm"
              className="group-hover:opacity-90 group-hover:scale-105 transition-all"
            />
          </button>
        ) : (
          <Link
            to="/dashboard"
            className="flex items-center justify-center group"
            title="PrepNest Dashboard"
          >
            <BrandLogo
              iconOnly={mini}
              size={mini ? 'sm' : 'md'}
              className="group-hover:opacity-90 transition-opacity"
            />
          </Link>
        )}

        {/* Desktop Sidebar Collapse / Expand Toggle Inside Sidebar Header */}
        {isFloatingDesktop && !isExternallyControlled && (
          <button
            type="button"
            onClick={() => setDesktopCollapsed((prev) => !prev)}
            title={mini ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={mini ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:inline-flex w-7 h-7 rounded-lg border border-white/85 ring-1 ring-[#E5E7EB]/70 bg-white/65 hover:bg-white text-[#64748B] hover:text-[#FFA116] items-center justify-center transition cursor-pointer shadow-sm shrink-0"
          >
            {mini ? (
              <ChevronsRight className="w-3.5 h-3.5 text-[#FFA116]" />
            ) : (
              <ChevronsLeft className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#262626] hover:bg-white/70 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Section Label */}
      {!mini && (
        <div className="px-4 pt-3.5 pb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">
            Platform
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav
        className={`flex-1 overflow-y-auto px-2.5 pb-2 space-y-0.5 ${
          mini ? 'pt-2.5' : ''
        }`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          return (
            <Link
              key={item.id}
              to={item.href}
              aria-label={item.label}
              onClick={() => setMobileOpen(false)}
              onMouseEnter={(e) => {
                if (!mini) return;
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredItem({
                  label: item.label,
                  badge: item.badge || null,
                  top: rect.top + rect.height / 2,
                });
              }}
              onMouseLeave={() => mini && setHoveredItem(null)}
              className={`group relative flex items-center rounded-xl text-[13px] font-medium border transition-all duration-150 ${
                mini ? 'justify-center p-1.5' : 'justify-between px-2.5 py-2'
              } ${
                isActive
                  ? 'bg-gradient-to-r from-[#FFF8EE]/95 via-[#FFF8EE]/75 to-white/70 dark:bg-none dark:bg-[#FFA116]/12 backdrop-blur-md border-[#FFA116]/35 text-[#E68F0F] dark:text-[#FFA116] font-semibold shadow-[0_3px_12px_-3px_rgba(255,161,22,0.22),inset_0_1px_0_rgba(255,255,255,0.9)] dark:shadow-none'
                  : 'border-transparent text-[#64748B] dark:text-[#8B949E] hover:text-[#262626] dark:hover:text-[#E6EDF3] hover:bg-white/60 dark:hover:bg-[#21262D]/85 hover:border-white/80 dark:hover:border-[#30363D] hover:shadow-[0_2px_8px_-3px_rgba(15,23,42,0.05)] dark:hover:shadow-none'
              }`}
            >
              <div className={`flex items-center ${mini ? '' : 'gap-2.5 min-w-0'}`}>
                {isActive && !mini && (
                  <span className="w-1 h-4 rounded-full bg-[#FFA116] shrink-0 -ml-0.5" />
                )}
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 ${
                    isActive
                      ? 'bg-[#FFA116]/15 text-[#FFA116]'
                      : 'bg-transparent text-[#64748B] dark:text-[#8B949E] group-hover:bg-white/80 dark:group-hover:bg-[#30363D]/70 group-hover:text-[#262626] dark:group-hover:text-[#E6EDF3]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#FFA116] stroke-[2.2]' : 'text-current'
                    }`}
                  />
                </span>
                {!mini && <span className="truncate">{item.label}</span>}
              </div>

              {!mini && item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 backdrop-blur-sm border ${
                    isActive
                      ? 'bg-[#FFA116]/15 border-[#FFA116]/25 text-[#E68F0F] dark:text-[#FFA116]'
                      : 'bg-white/65 border-[#E5E7EB]/80 text-[#64748B] dark:text-[#8B949E]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Frosted User Profile Footer */}
      <div className="p-2.5 pt-1.5 border-t border-[#E5E7EB]/50">
        {mini ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <Link
              to="/settings"
              title={`${user?.full_name || user?.name || 'Student Account'} (Settings)`}
              className="relative"
            >
              <UserAvatar
                src={user?.avatar_url}
                name={user?.full_name || user?.name || 'Student'}
                initials={getInitials(user?.full_name || user?.name)}
                size="sm"
                className="shadow-sm ring-1 ring-white/80"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-2 ring-white" />
            </Link>
            <button
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-white/75 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 hover:bg-white/80 backdrop-blur-md border border-white/85 ring-1 ring-[#E5E7EB]/60 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] transition-all">
            <div className="relative shrink-0">
              <UserAvatar
                src={user?.avatar_url}
                name={user?.full_name || user?.name || 'Student'}
                initials={getInitials(user?.full_name || user?.name)}
                size="sm"
                className="shadow-sm ring-1 ring-white/80"
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-2 ring-white"
                title="Active session"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-[#262626] truncate leading-tight">
                {user?.full_name || user?.name || 'Student Account'}
              </h4>
              <p className="text-[10px] text-[#64748B] truncate">
                {user?.email || 'Logged In'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2]/90 transition cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Floating Glass Sidebar with Smooth Expanded <-> Mini Rail Transition */}
      <motion.aside
        initial={false}
        animate={{ width: isMiniDesktop ? 82 : 256 }}
        transition={{ duration: 0.26, ease: SMOOTH_EASE }}
        className="hidden md:flex h-screen sticky top-0 shrink-0 z-40 overflow-hidden"
      >
        <div className="w-full h-full p-2.5 pr-0">
          {renderContent({ isFloatingDesktop: true, mini: isMiniDesktop })}
        </div>
      </motion.aside>

      {/* Instant Frosted Glass Tooltip for Collapsed Mini Sidebar */}
      <AnimatePresence>
        {isMiniDesktop && hoveredItem && (
          <motion.div
            key={hoveredItem.label}
            initial={{ opacity: 0, x: -6, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.96 }}
            transition={{ duration: 0.12, ease: SMOOTH_EASE }}
            style={{ top: hoveredItem.top }}
            className="hidden md:flex fixed left-[88px] -translate-y-1/2 z-50 pointer-events-none items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-xl border border-white/90 ring-1 ring-[#E5E7EB]/80 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.12)] whitespace-nowrap"
          >
            <span className="text-xs font-semibold text-[#262626]">{hoveredItem.label}</span>
            {hoveredItem.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFF8EE] text-[#FFA116] border border-[#FFA116]/30 font-bold">
                {hoveredItem.badge}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              {renderContent({ isFloatingDesktop: false, mini: false })}
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
