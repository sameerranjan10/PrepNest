import React from 'react';
import { ArrowRight, BookOpen, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useTheme } from '@/context/ThemeContext';
import { AnimatedProgressRing } from './OverallProgress';
import {
  getDifficultyBadgeVariant,
  getTrackIcon,
  getTrackStatus,
  normalizeTrackDifficulty,
} from './roadmapHelpers';

export function LearningTrackCard({ domain, totalHours = 0, onOpenTrack }) {
  const { isDark } = useTheme();
  const Icon = getTrackIcon(domain.icon_name);
  const total = Number(domain.total_topics || 0);
  const completed = Math.min(total, Math.max(0, Number(domain.completed_topics || 0)));
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const status = getTrackStatus(domain);
  const isCompleted = status === 'Completed';
  const isInProgress = status === 'In Progress';

  const ringColor = isCompleted
    ? '#16A34A'
    : isInProgress
    ? '#F59E0B'
    : isDark
    ? '#484F58'
    : '#CBD5E1';

  const handleOpen = () => onOpenTrack?.(domain.id);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      aria-label={`${domain.name}: ${status}, ${completed} of ${total} topics completed (${pct}%)`}
      className="group bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] hover:border-[#F59E0B]/70 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] h-full"
    >
      {/* TOP SECTION: Icon + Title + Badges on left, Circular Progress on right */}
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                isCompleted
                  ? 'bg-[#F0FDF4] border-[#16A34A]/25 text-[#16A34A] dark:bg-[#16A34A]/15'
                  : isInProgress
                  ? 'bg-[#FFFBEB] border-[#F59E0B]/30 text-[#D97706] dark:bg-[#F59E0B]/15'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] group-hover:text-[#F59E0B] dark:bg-[#21262D] dark:border-[#30363D]'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0 space-y-1.5">
              <h3 className="text-[15px] font-semibold text-[#1E293B] dark:text-[#E6EDF3] group-hover:text-[#D97706] transition-colors leading-snug">
                {domain.name}
              </h3>

              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant={getDifficultyBadgeVariant(domain.difficulty)} size="xs">
                  {normalizeTrackDifficulty(domain.difficulty)}
                </Badge>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isCompleted
                      ? 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/25 dark:bg-[#16A34A]/15'
                      : isInProgress
                      ? 'bg-[#FFFBEB] text-[#D97706] border-[#F59E0B]/30 dark:bg-[#F59E0B]/15'
                      : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] dark:bg-[#21262D] dark:border-[#30363D] dark:text-[#8B949E]'
                  }`}
                >
                  {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                  {status}
                </span>
              </div>
            </div>
          </div>

          <AnimatedProgressRing
            percentage={pct}
            size={52}
            strokeWidth={5}
            accentColor={ringColor}
            trackColor={isDark ? '#30363D' : '#E2E8F0'}
            sizeClass="w-[52px] h-[52px]"
            labelClass="text-[11px] font-bold text-[#1E293B] dark:text-[#E6EDF3]"
          />
        </div>

        {/* MIDDLE SECTION: Description + Topic Count + Duration + Hours */}
        <div className="space-y-3">
          <p className="text-xs text-[#64748B] dark:text-[#8B949E] leading-relaxed line-clamp-2 min-h-[38px]">
            {domain.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#64748B] dark:text-[#8B949E]">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>{total} topics</span>
            </span>

            {domain.estimated_weeks && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>{domain.estimated_weeks}</span>
              </span>
            )}

            {totalHours > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>{totalHours} hrs</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Divider + Counts + Bar + Full-Width Action Button */}
      <div className="space-y-3.5 pt-3.5 border-t border-[#E2E8F0] dark:border-[#30363D]">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs tabular-nums">
            <span className="text-[#64748B] dark:text-[#8B949E]">
              <strong className="text-[#1E293B] dark:text-[#E6EDF3] font-semibold">
                {completed}
              </strong>{' '}
              / {total} topics
            </span>
            <span
              className={`font-semibold ${
                isCompleted
                  ? 'text-[#16A34A]'
                  : isInProgress
                  ? 'text-[#D97706]'
                  : 'text-[#64748B]'
              }`}
            >
              {pct}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-[#E2E8F0] dark:bg-[#21262D] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleOpen();
          }}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            isCompleted
              ? 'bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/30 dark:bg-[#16A34A]/15 dark:hover:bg-[#16A34A]/25'
              : isInProgress
              ? 'bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-xs'
              : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#1E293B] border border-[#E2E8F0] dark:bg-[#21262D] dark:hover:bg-[#30363D] dark:text-[#E6EDF3] dark:border-[#30363D]'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Completed</span>
            </>
          ) : isInProgress ? (
            <>
              <span>Continue Learning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Start Learning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
