import React from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FolderGit2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ContinueLearningButton } from './ContinueLearningButton';
import {
  getDifficultyBadgeVariant,
  getTrackIcon,
  normalizeTrackDifficulty,
} from './roadmapHelpers';

export function TrackHeader({
  domain,
  topics = [],
  totalHours = 0,
  completedHours = 0,
  domainProject = null,
  sidebarCollapsed = false,
  onToggleSidebar,
  onOpenMobileSidebar,
  onBackToTracks,
  onContinueTopic,
  onScrollToProject,
}) {
  if (!domain) return null;

  const Icon = getTrackIcon(domain.icon_name);
  const completedCount = topics.filter((t) => t.completed).length;
  const totalCount = topics.length || Number(domain.total_topics || 0);
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : Number(domain.progress_percentage || 0);
  const isCompleted = totalCount > 0 && completedCount >= totalCount;

  const nextAvailableTopic =
    topics.find((t) => !t.completed && t.unlocked) ||
    topics.find((t) => !t.completed) ||
    topics[0] ||
    null;

  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 sm:p-6 space-y-5">
      {/* Top Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBackToTracks}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back to Learning Tracks
          </Button>

          {/* Mobile Outline Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenMobileSidebar}
            icon={<PanelLeftOpen className="w-4 h-4" />}
            className="lg:hidden border border-[#E5E7EB]"
          >
            Track Outline
          </Button>

          {/* Desktop Sidebar Collapse Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            icon={
              sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )
            }
            className="hidden lg:inline-flex border border-[#E5E7EB]"
            title={sidebarCollapsed ? 'Expand track sidebar' : 'Collapse track sidebar'}
          >
            {sidebarCollapsed ? 'Show Outline' : 'Hide Outline'}
          </Button>
        </div>

        <div className="flex items-center gap-2.5">
          {domainProject && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onScrollToProject}
              icon={<FolderGit2 className="w-3.5 h-3.5 text-[#FFA116]" />}
            >
              Capstone Project
            </Button>
          )}
          <ContinueLearningButton
            label={isCompleted ? 'Review Topic 1' : completedCount > 0 ? 'Continue Learning' : 'Start Topic 1'}
            sublabel={nextAvailableTopic?.title}
            disabled={!nextAvailableTopic}
            onClick={() => nextAvailableTopic && onContinueTopic?.(nextAvailableTopic.id)}
          />
        </div>
      </div>

      {/* Main Track Metadata */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pt-2 border-t border-[#E5E7EB]">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
              isCompleted
                ? 'bg-[#F0FDF4] border-[#16A34A]/25 text-[#16A34A]'
                : 'bg-[#FFF8EE] border-[#FFA116]/30 text-[#FFA116]'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <button
                type="button"
                onClick={onBackToTracks}
                className="hover:text-[#FFA116] transition-colors cursor-pointer"
              >
                Learning Centre
              </button>
              <span>/</span>
              <span className="text-[#262626] font-medium truncate">{domain.name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#262626] tracking-tight">
                {domain.name}
              </h1>
              <Badge variant={getDifficultyBadgeVariant(domain.difficulty)} size="sm">
                {normalizeTrackDifficulty(domain.difficulty)}
              </Badge>
              {isCompleted && (
                <Badge variant="success" size="sm">
                  Track Completed
                </Badge>
              )}
            </div>
            <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
              {domain.description}
            </p>
          </div>
        </div>

        {/* Metrics & Progress */}
        <div className="lg:w-80 shrink-0 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                <strong className="text-[#262626]">{completedCount}</strong> / {totalCount} topics
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {totalHours > 0 ? `${completedHours}h / ${totalHours}h` : `${domain.estimated_weeks} weeks`}
              </span>
            </span>
          </div>

          <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted ? 'bg-[#16A34A]' : 'bg-[#FFA116]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B]">Track Completion</span>
            <span className={`font-bold tabular-nums ${isCompleted ? 'text-[#16A34A]' : 'text-[#262626]'}`}>
              {pct}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

