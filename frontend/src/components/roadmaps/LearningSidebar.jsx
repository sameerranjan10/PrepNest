import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  Clock,
  Code2,
  Compass,
  FolderGit2,
  Lock,
  Play,
  X,
} from 'lucide-react';
import { getTrackIcon } from './roadmapHelpers';

function SidebarListContent({
  domain,
  topics = [],
  activeTopicId,
  hasProject = false,
  onSelectTopic,
  onSelectProject,
  onCloseMobile,
}) {
  const completedCount = topics.filter((t) => t.completed).length;
  const pct = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  return (
    <div className="flex flex-col">
      <div className="px-4 py-3.5 border-b border-[#E5E7EB] space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Track Curriculum
            </p>
            <h3 className="text-sm font-semibold text-[#262626] truncate mt-0.5">
              {domain?.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#FFA116] bg-[#FFF8EE] border border-[#FFA116]/25 px-2 py-0.5 rounded-full tabular-nums">
              {completedCount}/{topics.length}
            </span>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded-md text-[#64748B] hover:bg-[#F7F8FA] hover:text-[#262626] cursor-pointer"
                aria-label="Close outline"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="h-1.5 w-full bg-[#F1F3F5] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pct >= 100 ? 'bg-[#16A34A]' : 'bg-[#FFA116]'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        </div>
      </div>

      <nav className="p-2.5 space-y-1">
        {topics.map((topic, index) => {
          const isCompleted = Boolean(topic.completed);
          const isUnlocked = Boolean(topic.unlocked);
          const isActive = Number(activeTopicId) === Number(topic.id);

          return (
            <button
              key={topic.id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => {
                if (!isUnlocked) return;
                onSelectTopic?.(topic.id);
                onCloseMobile?.();
              }}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-start gap-2.5 transition-colors border ${
                !isUnlocked
                  ? 'opacity-55 cursor-not-allowed border-transparent text-[#64748B]'
                  : isActive
                  ? 'bg-[#FFF8EE] border-[#FFA116]/40 text-[#262626] cursor-pointer'
                  : 'border-transparent hover:bg-[#F7F8FA] text-[#262626] cursor-pointer'
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                ) : isUnlocked ? (
                  <Circle
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#FFA116] fill-[#FFA116]/20' : 'text-[#FFA116]'
                    }`}
                  />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#64748B]" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-[#64748B] tabular-nums">
                    Topic {String(index + 1).padStart(2, '0')}
                  </span>
                  {topic.estimated_hours ? (
                    <span className="text-[11px] text-[#64748B] tabular-nums">
                      {topic.estimated_hours}h
                    </span>
                  ) : null}
                </div>
                <p
                  className={`text-xs leading-snug mt-0.5 truncate ${
                    isActive ? 'font-semibold text-[#262626]' : 'font-medium'
                  }`}
                >
                  {topic.title}
                </p>
              </div>
            </button>
          );
        })}

        {hasProject && (
          <button
            type="button"
            onClick={() => {
              onSelectProject?.();
              onCloseMobile?.();
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 mt-2 pt-3 border-t border-[#E5E7EB] hover:bg-[#F7F8FA] text-[#262626] transition-colors cursor-pointer"
          >
            <FolderGit2 className="w-4 h-4 text-[#FFA116] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#FFA116]">
                Milestone
              </p>
              <p className="text-xs font-medium truncate">Capstone Mini-Project</p>
            </div>
          </button>
        )}
      </nav>
    </div>
  );
}

export function LearningSidebar({
  domain,
  domains = [],
  topics = [],
  totalHours = 0,
  completedHours = 0,
  activeTopicId,
  hasProject = false,
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
  onSelectTopic,
  onSelectProject,
  onSwitchTrack,
}) {
  const navigate = useNavigate();

  const remainingHours = Math.max(0, Number(totalHours) - Number(completedHours));
  const nextMilestone =
    topics.find((t) => !t.completed && t.unlocked) ||
    topics.find((t) => !t.completed) ||
    null;
  const otherDomains = domains.filter((d) => String(d.id) !== String(domain?.id));

  return (
    <>
      {/* Desktop Sticky Sidebar Column */}
      {!collapsed && (
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-[calc(var(--header-offset,0px)+1.5rem)] max-h-[calc(100vh-var(--header-offset,0px)-3rem)] overflow-y-auto space-y-3 pb-4 pr-0.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#E5E7EB]">
            {/* 1. Curriculum Outline */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl overflow-hidden">
              <SidebarListContent
                domain={domain}
                topics={topics}
                activeTopicId={activeTopicId}
                hasProject={hasProject}
                onSelectTopic={onSelectTopic}
                onSelectProject={onSelectProject}
              />
            </div>

            {/* 2. Study Companion Card */}
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Study Companion
                </span>
                {totalHours > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] tabular-nums">
                    <Clock className="w-3 h-3 text-[#FFA116]" />
                    {remainingHours}h left
                  </span>
                )}
              </div>

              {nextMilestone ? (
                <button
                  type="button"
                  onClick={() => onSelectTopic?.(nextMilestone.id)}
                  className="w-full text-left p-2.5 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 hover:border-[#FFA116] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFA116]">
                      Up Next Milestone
                    </span>
                    <Play className="w-3 h-3 text-[#FFA116] fill-[#FFA116]" />
                  </div>
                  <p className="text-xs font-semibold text-[#262626] mt-0.5 truncate group-hover:text-[#FFA116] transition-colors">
                    {nextMilestone.title}
                  </p>
                </button>
              ) : (
                <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#16A34A]/25 text-xs text-[#16A34A] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All track topics completed!</span>
                </div>
              )}

              <div className="space-y-1.5 pt-1 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => navigate('/ai-assistant')}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#F7F8FA] hover:bg-[#FFF8EE] border border-[#E5E7EB] hover:border-[#FFA116]/40 text-xs font-medium text-[#262626] transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-[#FFA116]" />
                    <span>Ask AI Mentor</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dsa')}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#F7F8FA] hover:bg-[#FFF8EE] border border-[#E5E7EB] hover:border-[#FFA116]/40 text-xs font-medium text-[#262626] transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-[#FFA116]" />
                    <span>Practice Related DSA</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
                </button>
              </div>
            </div>

            {/* 3. Quick Switch Tracks */}
            {otherDomains.length > 0 && (
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  <Compass className="w-3.5 h-3.5 text-[#FFA116]" />
                  <span>Switch Learning Track</span>
                </div>

                <div className="space-y-1">
                  {otherDomains.map((d) => {
                    const TrackIcon = getTrackIcon(d.icon_name);
                    const done = Number(d.completed_topics || 0);
                    const total = Number(d.total_topics || 0);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => onSwitchTrack?.(d.id)}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#F7F8FA] text-left transition-colors cursor-pointer group"
                      >
                        <span className="inline-flex items-center gap-2 min-w-0">
                          <TrackIcon className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#FFA116] shrink-0" />
                          <span className="text-xs font-medium text-[#262626] truncate group-hover:text-[#FFA116]">
                            {d.name}
                          </span>
                        </span>
                        <span className="text-[11px] text-[#64748B] tabular-nums shrink-0">
                          {done}/{total}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#262626]/30 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-80 max-w-[85vw] bg-[#FFFFFF] h-full border-r border-[#E5E7EB] shadow-xl flex flex-col overflow-y-auto">
            <SidebarListContent
              domain={domain}
              topics={topics}
              activeTopicId={activeTopicId}
              hasProject={hasProject}
              onSelectTopic={onSelectTopic}
              onSelectProject={onSelectProject}
              onCloseMobile={onCloseMobile}
            />
          </aside>
        </div>
      )}
    </>
  );
}
