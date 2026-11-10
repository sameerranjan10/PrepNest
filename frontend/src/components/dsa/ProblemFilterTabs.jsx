import React from 'react';
import { CheckCircle2, Circle, Star, SlidersHorizontal } from 'lucide-react';

export function ProblemFilterTabs({
  status = 'all',
  onStatusChange,
  difficulty = 'all',
  onDifficultyChange,
  totalProblems = 0,
  solvedCount = 0,
  starredCount = 0,
  activeFilterCount = 0,
  onOpenAdvancedFilters,
}) {
  const statusTabs = [
    { id: 'all', label: 'All Problems', count: totalProblems },
    { id: 'unsolved', label: 'Unsolved', icon: Circle },
    { id: 'solved', label: 'Solved', count: solvedCount, icon: CheckCircle2 },
    { id: 'bookmarked', label: 'Starred', count: starredCount, icon: Star },
  ];

  const difficulties = [
    { id: 'all', label: 'All Difficulties' },
    { id: 'Easy', label: 'Easy' },
    { id: 'Medium', label: 'Medium' },
    { id: 'Hard', label: 'Hard' },
  ];

  const getDiffActiveClass = (diff) => {
    if (diff === 'Easy') {
      return 'bg-[var(--surface)] text-[#16A34A] dark:text-[#3FB950] shadow-sm border-[var(--border)]';
    }
    if (diff === 'Medium') {
      return 'bg-[var(--surface)] text-[#D97706] dark:text-[#FFA116] shadow-sm border-[var(--border)]';
    }
    if (diff === 'Hard') {
      return 'bg-[var(--surface)] text-[#DC2626] dark:text-[#F85149] shadow-sm border-[var(--border)]';
    }
    return 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm border-[var(--border)]';
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Status Tabs (Horizontally scrollable on small mobile viewports) */}
      <div className="inline-flex items-center p-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg gap-0.5 overflow-x-auto max-w-full">
        {statusTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = status === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange?.(tab.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap border transition cursor-pointer ${
                isActive
                  ? 'bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)] font-semibold shadow-sm'
                  : 'border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    tab.id === 'solved'
                      ? 'text-[#16A34A] dark:text-[#3FB950]'
                      : tab.id === 'bookmarked'
                      ? 'text-[#FFA116] fill-[#FFA116]'
                      : 'text-[var(--foreground-muted)]'
                  }`}
                />
              )}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] tabular-nums">
                  {Number(tab.count).toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Side: Difficulty Segmented Filter + Advanced Filters Drawer Trigger */}
      <div className="flex flex-wrap items-center gap-2 max-w-full">
        <div className="inline-flex items-center p-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg gap-0.5 overflow-x-auto max-w-full">
          {difficulties.map((diff) => {
            const isActive = difficulty === diff.id;
            return (
              <button
                key={diff.id}
                type="button"
                onClick={() => onDifficultyChange?.(diff.id)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap border transition cursor-pointer ${
                  isActive
                    ? `${getDiffActiveClass(diff.id)} font-semibold`
                    : 'border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                {diff.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenAdvancedFilters}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer whitespace-nowrap ${
            activeFilterCount > 0
              ? 'border-[#FFA116]/50 bg-[#FFF8EE] text-[#D97706] dark:bg-[#FFA116]/12 dark:text-[#FFA116] dark:border-[#FFA116]/40 font-semibold'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FFA116] text-white font-bold tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
