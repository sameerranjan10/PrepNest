import React from 'react';
import { BrainCircuit, Flame, Play, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AptitudeHeader({
  accuracy = 0,
  testsCompleted = 0,
  streakDays = 0,
  onQuickPractice,
  onOpenMockAssessments,
}) {
  return (
    <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 md:pr-[124px] lg:pr-[132px] border-b border-[var(--border)]">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-[#FFA116]/12 border border-[#FFA116]/25 text-[#FFA116] flex items-center justify-center shrink-0">
            <BrainCircuit className="w-4 h-4" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Aptitude Practice Centre
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] leading-relaxed">
          Master Quantitative Aptitude, Logical Reasoning and Verbal Ability through structured practice and timed assessments.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 shrink-0">
        <div className="flex items-center gap-3.5 text-xs">
          <div>
            <span className="text-[var(--foreground-muted)] block text-[10px] uppercase tracking-wider font-semibold">
              Accuracy
            </span>
            <span className="font-bold text-[#16A34A] dark:text-[#3FB950] text-sm tabular-nums">
              {accuracy}%
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div>
            <span className="text-[var(--foreground-muted)] block text-[10px] uppercase tracking-wider font-semibold">
              Tests
            </span>
            <span className="font-bold text-[var(--foreground)] text-sm tabular-nums">
              {testsCompleted}
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div>
            <span className="text-[var(--foreground-muted)] block text-[10px] uppercase tracking-wider font-semibold">
              Streak
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-[#FFA116] text-sm tabular-nums">
              <Flame className="w-3.5 h-3.5 fill-[#FFA116]" />
              {streakDays}d
            </span>
          </div>
        </div>

        <div className="hidden sm:block w-px h-7 bg-[var(--border)]" />

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onQuickPractice}
            icon={<Zap className="w-3.5 h-3.5 text-[#FFA116]" />}
          >
            Quick Practice
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenMockAssessments}
            icon={<Play className="w-3.5 h-3.5 fill-white" />}
          >
            Start Mock Assessment
          </Button>
        </div>
      </div>
    </header>
  );
}

