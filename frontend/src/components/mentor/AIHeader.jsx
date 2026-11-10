import React from 'react';
import {
  Sparkles,
  Target,
  Compass,
  Code2,
  Zap,
  PanelRight,
  PanelLeft,
  PanelTopClose,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export function AIHeader({
  contextSummary,
  userCredits,
  isContextOpen,
  onToggleContext,
  onToggleMobileHistory,
  isGlobalSidebarCollapsed,
  onToggleGlobalSidebar,
  onToggleTopBar
}) {
  return (
    <header className="bg-[#FFFFFF] border-b border-[#E5E7EB] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Left: Brand AI Icon, Title, Subtitle, Sync Badge */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Collapse/Expand Main Nav Sidebar (Desktop) */}
        <button
          onClick={onToggleGlobalSidebar}
          aria-label={isGlobalSidebarCollapsed ? 'Show navigation sidebar' : 'Hide navigation sidebar'}
          title={isGlobalSidebarCollapsed ? 'Show navigation sidebar' : 'Hide navigation sidebar'}
          className="hidden md:flex p-1.5 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] hover:bg-[#F1F3F5] text-[#64748B] hover:text-[#262626] transition shrink-0"
        >
          {isGlobalSidebarCollapsed ? (
            <ChevronsRight className="w-4 h-4 text-[#FFA116]" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>

        {/* Mobile Conversations Drawer Toggle */}
        <button
          onClick={onToggleMobileHistory}
          aria-label="Toggle conversations sidebar"
          className="lg:hidden p-1.5 rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] text-[#64748B] hover:text-[#262626] transition shrink-0"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="w-8 h-8 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116] shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm sm:text-base font-bold text-[#262626] tracking-tight truncate">
              AI Placement Mentor
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6FAF6] text-[#16A34A] border border-[#16A34A]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
              Live Profile Synced
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] truncate hidden sm:block">
            Your personal AI placement preparation assistant.
          </p>
        </div>
      </div>

      {/* Right: Compact Inline Statistics + Context Drawer Toggle + Top Bar Collapse */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="hidden md:flex items-center divide-x divide-[#E5E7EB] bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-1 py-1 text-xs">
          <div className="flex items-center gap-1.5 px-2.5">
            <Target className="w-3.5 h-3.5 text-[#FFA116]" />
            <span className="text-[11px] text-[#64748B]">Skill Match</span>
            <span className="font-bold text-[#262626]">{contextSummary?.skill_match_percentage ?? 70}%</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5">
            <Compass className="w-3.5 h-3.5 text-[#FFA116]" />
            <span className="text-[11px] text-[#64748B]">Roadmap</span>
            <span className="font-bold text-[#262626]">{contextSummary?.roadmap_percentage ?? 0}%</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5">
            <Code2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="text-[11px] text-[#64748B]">DSA Solved</span>
            <span className="font-bold text-[#262626]">{contextSummary?.dsa_solved ?? 0}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5">
            <Zap className="w-3.5 h-3.5 text-[#FFA116]" />
            <span className="text-[11px] text-[#64748B]">Credits</span>
            <span className="font-bold text-[#262626]">{userCredits ?? 250}</span>
          </div>
        </div>

        {/* Context Drawer Toggle Button */}
        <button
          onClick={onToggleContext}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
            isContextOpen
              ? 'bg-[#FFA116] border-[#FFA116] text-white'
              : 'bg-[#FFFFFF] hover:bg-[#F7F8FA] border-[#E5E7EB] text-[#262626]'
          }`}
          title="Toggle student context drawer"
        >
          <PanelRight className="w-3.5 h-3.5" />
          <span>Context</span>
        </button>

        {/* Collapse Top Bar Button */}
        <button
          onClick={onToggleTopBar}
          aria-label="Collapse top bar"
          title="Collapse top bar for distraction-free chat"
          className="p-1.5 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#64748B] hover:text-[#262626] transition"
        >
          <PanelTopClose className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
