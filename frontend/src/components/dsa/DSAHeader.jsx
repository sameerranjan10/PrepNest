import React from 'react';
import { Code2 } from 'lucide-react';
import { DifficultyDistribution } from './DifficultyDistribution';

export function DSAHeader({
  totalProblems = 0,
  solvedCount = 0,
  starredCount = 0,
  difficultyCounts = {},
  activeDifficulty = 'all',
  onSelectDifficulty,
}) {
  const completionPct =
    totalProblems > 0
      ? Math.min(100, Math.round((solvedCount / totalProblems) * 100))
      : 0;

  return (
    <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 md:pr-[124px] lg:pr-[132px] border-b border-[var(--border)]">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-[#FFA116]/12 border border-[#FFA116]/25 text-[#FFA116] flex items-center justify-center shrink-0">
            <Code2 className="w-4 h-4" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            DSA Problem Explorer
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--foreground-secondary)] leading-relaxed">
          Practice interview-focused coding problems from leading technology companies.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-5 shrink-0">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[var(--foreground-muted)] block text-[10px] uppercase tracking-wider font-semibold">
              Total
            </span>
            <span className="font-bold text-[var(--foreground)] text-sm tabular-nums">
              {totalProblems.toLocaleString()}
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div>
            <span className="text-[var(--foreground-muted)] block text-[10px] uppercase tracking-wider font-semibold">
              Solved
            </span>
            <span className="font-bold text-[#16A34A] dark:text-[#3FB950] text-sm tabular-nums">
              {solvedCount.toLocaleString()}
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div>
            <span className="text-[var(--foreground-muted)] block text-[10px] uppercase tracking-wider font-semibold">
              Starred
            </span>
            <span className="font-bold text-[#FFA116] text-sm tabular-nums">
              {starredCount.toLocaleString()}
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--border)]" />
          <div>
            <span className="text-[var(--foreground-muted)] block text-[10px] uppercase tracking-wider font-semibold">
              Completion
            </span>
            <span className="font-bold text-[var(--foreground)] text-sm tabular-nums">
              {completionPct}%
            </span>
          </div>
        </div>

        <div className="hidden sm:block w-px h-8 bg-[var(--border)]" />

        <DifficultyDistribution
          difficultyCounts={difficultyCounts}
          activeDifficulty={activeDifficulty}
          onSelectDifficulty={onSelectDifficulty}
        />
      </div>
    </header>
  );
}

