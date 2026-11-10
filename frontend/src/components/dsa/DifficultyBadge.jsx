import React from 'react';

const DIFFICULTY_STYLES = {
  easy: {
    label: 'Easy',
    badge:
      'bg-[#E6FAF6] text-[#059669] border-[#059669]/20 dark:bg-[#3FB950]/14 dark:text-[#3FB950] dark:border-[#3FB950]/30',
  },
  medium: {
    label: 'Medium',
    badge:
      'bg-[#FFF8EE] text-[#D97706] border-[#D97706]/25 dark:bg-[#FFA116]/14 dark:text-[#FFA116] dark:border-[#FFA116]/30',
  },
  hard: {
    label: 'Hard',
    badge:
      'bg-[#FFEBEF] text-[#DC2626] border-[#DC2626]/20 dark:bg-[#F85149]/14 dark:text-[#F85149] dark:border-[#F85149]/30',
  },
};

export function DifficultyBadge({ difficulty, size = 'xs', className = '' }) {
  const key = (difficulty || '').trim().toLowerCase();
  const cfg = DIFFICULTY_STYLES[key] || {
    label: difficulty || 'General',
    badge:
      'bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] border-[var(--border)]',
  };

  const sizeClass =
    size === 'sm' ? 'text-[11px] px-2.5 py-0.5' : 'text-[11px] px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold leading-none whitespace-nowrap ${sizeClass} ${cfg.badge} ${className}`}
    >
      {cfg.label}
    </span>
  );
}

