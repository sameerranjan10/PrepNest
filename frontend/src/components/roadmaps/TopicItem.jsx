import React from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { TopicDetails } from './TopicDetails';
import { getDifficultyBadgeVariant } from './roadmapHelpers';

export function TopicItem({
  topic,
  index,
  isLast = false,
  prevTopicTitle = null,
  isExpanded = false,
  isCurrentHighlight = false,
  activeAvailableTopic = null,
  detailData = null,
  detailLoading = false,
  detailError = null,
  isUpdatingProgress = false,
  hasNextTopic = false,
  onToggleExpand,
  onToggleComplete,
  onNextTopic,
  onJumpToTopic,
}) {
  const isCompleted = Boolean(topic.completed);
  const isUnlocked = Boolean(topic.unlocked);

  const statusLabel = isCompleted ? 'Completed' : isUnlocked ? 'Available' : 'Locked';
  const statusVariant = isCompleted ? 'success' : isUnlocked ? 'accent' : 'neutral';

  return (
    <div id={`roadmap-topic-${topic.id}`} className="relative flex gap-4 sm:gap-5 scroll-mt-[calc(var(--header-offset,0px)+1.5rem)]">
      {/* Left Vertical Connector Rail + Node */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${
            isCompleted
              ? 'bg-[#16A34A] border-[#16A34A] text-white'
              : isUnlocked
              ? isExpanded || isCurrentHighlight
                ? 'bg-[#FFF8EE] border-[#FFA116] text-[#FFA116]'
                : 'bg-[#FFFFFF] border-[#FFA116] text-[#FFA116]'
              : 'bg-[#F7F8FA] border-[#E5E7EB] text-[#64748B]'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : isUnlocked ? (
            <span className="text-xs font-bold tabular-nums">{index + 1}</span>
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
        </div>

        {!isLast && (
          <div
            className={`w-0.5 flex-1 my-1 rounded-full ${
              isCompleted ? 'bg-[#16A34A]/50' : 'bg-[#E5E7EB]'
            }`}
          />
        )}
      </div>

      {/* Topic Card */}
      <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-5'}`}>
        <div
          className={`rounded-xl border transition-all overflow-hidden ${
            !isUnlocked
              ? 'bg-[#F7F8FA]/80 border-[#E5E7EB] opacity-75'
              : isExpanded
              ? 'bg-[#FFFFFF] border-[#FFA116]/60 shadow-[0_4px_16px_rgba(15,23,42,0.05)]'
              : isCurrentHighlight
              ? 'bg-[#FFFFFF] border-[#FFA116]/45 hover:border-[#FFA116]'
              : 'bg-[#FFFFFF] border-[#E5E7EB] hover:border-[#D1D5DB]'
          }`}
        >
          <div
            onClick={() => isUnlocked && onToggleExpand?.(topic.id)}
            role={isUnlocked ? 'button' : undefined}
            tabIndex={isUnlocked ? 0 : undefined}
            onKeyDown={(e) => {
              if (isUnlocked && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onToggleExpand?.(topic.id);
              }
            }}
            className={`w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 ${
              isUnlocked ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] tabular-nums">
                  Topic {String(index + 1).padStart(2, '0')}
                </span>
                <Badge variant={statusVariant} size="xs">
                  {statusLabel}
                </Badge>
                {topic.difficulty && (
                  <Badge variant={getDifficultyBadgeVariant(topic.difficulty)} size="xs">
                    {topic.difficulty}
                  </Badge>
                )}
                {topic.estimated_hours ? (
                  <span className="inline-flex items-center gap-1 text-xs text-[#64748B] tabular-nums">
                    <Clock className="w-3 h-3" />
                    <span>{topic.estimated_hours}h</span>
                  </span>
                ) : null}
              </div>

              <h3 className="text-base font-semibold text-[#262626] leading-snug">
                {topic.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {!isUnlocked && prevTopicTitle
                  ? `Complete "${prevTopicTitle}" to unlock this milestone.`
                  : topic.description || 'Expand to view concept notes, study materials, and practice quiz.'}
              </p>

              {!isUnlocked && activeAvailableTopic && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onJumpToTopic?.(activeAvailableTopic.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#FFA116] hover:underline cursor-pointer"
                  >
                    Jump to active milestone ({activeAvailableTopic.title}) →
                  </button>
                </div>
              )}
            </div>

            <div className="shrink-0 pt-1">
              {isUnlocked ? (
                <span
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                    isExpanded
                      ? 'bg-[#FFF8EE] border-[#FFA116]/35 text-[#FFA116]'
                      : 'bg-[#F7F8FA] border-[#E5E7EB] text-[#64748B]'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </span>
              ) : (
                <span className="w-8 h-8 rounded-lg bg-[#F1F3F5] border border-[#E5E7EB] flex items-center justify-center text-[#64748B]">
                  <Lock className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>

          {isUnlocked && isExpanded && (
            <TopicDetails
              topicSummary={topic}
              detailData={detailData}
              loading={detailLoading}
              error={detailError}
              hasNextTopic={hasNextTopic}
              isUpdatingProgress={isUpdatingProgress}
              onToggleComplete={onToggleComplete}
              onNextTopic={onNextTopic}
            />
          )}
        </div>
      </div>
    </div>
  );
}

