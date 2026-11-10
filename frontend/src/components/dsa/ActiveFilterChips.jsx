import React from 'react';
import { X } from 'lucide-react';

export function ActiveFilterChips({
  search = '',
  status = 'all',
  difficulty = 'all',
  company = 'all',
  topic = 'all',
  onClearSearch,
  onClearStatus,
  onClearDifficulty,
  onClearCompany,
  onClearTopic,
  onClearAll,
}) {
  const chips = [];

  if (search.trim()) {
    chips.push({
      key: 'search',
      label: `Search: "${search.trim()}"`,
      onRemove: onClearSearch,
    });
  }
  if (status !== 'all') {
    const labelMap = {
      solved: 'Status: Solved',
      unsolved: 'Status: Unsolved',
      bookmarked: 'Status: Starred',
    };
    chips.push({
      key: 'status',
      label: labelMap[status] || `Status: ${status}`,
      onRemove: onClearStatus,
    });
  }
  if (difficulty !== 'all') {
    chips.push({
      key: 'difficulty',
      label: `Difficulty: ${difficulty}`,
      onRemove: onClearDifficulty,
    });
  }
  if (company !== 'all') {
    chips.push({
      key: 'company',
      label: `Company: ${company}`,
      onRemove: onClearCompany,
    });
  }
  if (topic !== 'all') {
    chips.push({
      key: 'topic',
      label: `Topic: ${topic}`,
      onRemove: onClearTopic,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
        Active:
      </span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#FFF8EE] text-[#D97706] border border-[#FFA116]/30 dark:bg-[#FFA116]/12 dark:text-[#FFA116] dark:border-[#FFA116]/30"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label}`}
            className="hover:text-[var(--foreground)] cursor-pointer rounded-full"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] font-semibold text-[var(--foreground-secondary)] hover:text-[#FFA116] px-1.5 py-0.5 transition cursor-pointer"
      >
        Clear All
      </button>
    </div>
  );
}

