import React from 'react';
import { Layers, CheckCircle2, Circle, Star } from 'lucide-react';

export function ProblemStatistics({
  totalProblems = 0,
  solvedCount = 0,
  starredCount = 0,
  activeStatus = 'all',
  onSelectStatus,
}) {
  const unsolvedCount = Math.max(0, totalProblems - solvedCount);

  const items = [
    {
      id: 'all',
      label: 'Total Problems',
      value: totalProblems,
      icon: Layers,
      accentClass: 'text-[var(--foreground-secondary)]',
      activeRing:
        'border-[#FFA116]/50 bg-[#FFF8EE]/70 dark:bg-[#FFA116]/10 dark:border-[#FFA116]/40',
    },
    {
      id: 'solved',
      label: 'Solved',
      value: solvedCount,
      icon: CheckCircle2,
      accentClass: 'text-[#16A34A] dark:text-[#3FB950]',
      activeRing:
        'border-[#16A34A]/45 bg-[#F0FDF4]/80 dark:bg-[#3FB950]/12 dark:border-[#3FB950]/40',
    },
    {
      id: 'unsolved',
      label: 'Unsolved',
      value: unsolvedCount,
      icon: Circle,
      accentClass: 'text-[var(--foreground-muted)]',
      activeRing:
        'border-[#FFA116]/50 bg-[#FFF8EE]/70 dark:bg-[#FFA116]/10 dark:border-[#FFA116]/40',
    },
    {
      id: 'bookmarked',
      label: 'Starred',
      value: starredCount,
      icon: Star,
      accentClass: 'text-[#FFA116]',
      activeRing:
        'border-[#FFA116]/50 bg-[#FFF8EE]/70 dark:bg-[#FFA116]/10 dark:border-[#FFA116]/40',
    },
  ];

  return (
    <section
      aria-label="Performance Overview"
      className="grid grid-cols-2 lg:grid-cols-4 gap-2.5"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeStatus === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              onSelectStatus?.(isActive && item.id !== 'all' ? 'all' : item.id)
            }
            className={`group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-left transition cursor-pointer ${
              isActive
                ? item.activeRing
                : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <div className="min-w-0">
              <span className="block text-[11px] font-medium text-[var(--foreground-secondary)] truncate">
                {item.label}
              </span>
              <span className="block text-lg font-bold text-[var(--foreground)] tabular-nums leading-tight mt-0.5">
                {item.value.toLocaleString()}
              </span>
            </div>
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[var(--surface-secondary)] border border-[var(--border)] transition ${
                isActive ? 'border-transparent' : ''
              }`}
            >
              <Icon
                className={`w-4 h-4 ${item.accentClass} ${
                  item.id === 'bookmarked' && isActive ? 'fill-[#FFA116]' : ''
                }`}
              />
            </span>
          </button>
        );
      })}
    </section>
  );
}

