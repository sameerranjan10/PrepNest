import React from 'react';
import { CheckCircle2, Circle, Star, ArrowUpDown, X } from 'lucide-react';
import { QuestionSearch } from './QuestionSearch';

export function AptitudeFilters({
  status = 'all',
  onStatusChange,
  search = '',
  debouncedSearch = '',
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  category = 'all',
  onCategoryChange,
  subtopic = 'all',
  subtopicOptions = [],
  onSubtopicChange,
  difficulty = 'all',
  onDifficultyChange,
  company = 'all',
  lockCompany = false,
  onCompanyChange,
  sortBy = 'id',
  onSortChange,
  totalCount = 0,
  solvedCount = 0,
  starredCount = 0,
  onResetAll,
}) {
  const statusTabs = [
    { id: 'all', label: 'All Questions', count: totalCount },
    { id: 'unsolved', label: 'Unsolved', icon: Circle },
    { id: 'solved', label: 'Solved', count: solvedCount, icon: CheckCircle2 },
    { id: 'starred', label: 'Starred', count: starredCount, icon: Star },
  ];

  const chips = [];
  if (debouncedSearch.trim()) {
    chips.push({
      key: 'search',
      label: `Search: "${debouncedSearch.trim()}"`,
      onRemove: onClearSearch,
    });
  }
  if (status !== 'all') {
    chips.push({
      key: 'status',
      label: `Status: ${
        status === 'solved' ? 'Solved' : status === 'starred' ? 'Starred' : 'Unsolved'
      }`,
      onRemove: () => onStatusChange?.('all'),
    });
  }
  if (category !== 'all') {
    const names = {
      quantitative: 'Quantitative Aptitude',
      logical: 'Logical Reasoning',
      verbal: 'Verbal Ability',
    };
    chips.push({
      key: 'category',
      label: `Category: ${names[category] || category}`,
      onRemove: () => onCategoryChange?.('all'),
    });
  }
  if (subtopic !== 'all') {
    chips.push({
      key: 'subtopic',
      label: `Subtopic: ${subtopic}`,
      onRemove: () => onSubtopicChange?.('all'),
    });
  }
  if (difficulty !== 'all') {
    chips.push({
      key: 'difficulty',
      label: `Difficulty: ${difficulty}`,
      onRemove: () => onDifficultyChange?.('all'),
    });
  }
  if (!lockCompany && company !== 'all') {
    chips.push({
      key: 'company',
      label: `Company: ${company}`,
      onRemove: () => onCompanyChange?.('all'),
    });
  }

  return (
    <div className="p-3.5 sm:px-4 border-b border-[var(--border)] space-y-3">
      {/* Row 1: Compact Status Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
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
                        : tab.id === 'starred'
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
      </div>

      {/* Row 2: Search, Category, Subtopic, Difficulty, Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="sm:col-span-2 lg:col-span-2">
          <QuestionSearch
            value={search}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            onClear={onClearSearch}
          />
        </div>

        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => onCategoryChange?.(e.target.value)}
          className="h-9 px-2.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:bg-[var(--surface)] focus:border-[#FFA116] cursor-pointer transition"
        >
          <option value="all">All Categories</option>
          <option value="quantitative">Quantitative</option>
          <option value="logical">Logical</option>
          <option value="verbal">Verbal</option>
        </select>

        <select
          aria-label="Filter by subtopic"
          value={subtopic}
          onChange={(e) => onSubtopicChange?.(e.target.value)}
          className="h-9 px-2.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:bg-[var(--surface)] focus:border-[#FFA116] cursor-pointer transition"
        >
          <option value="all">All Subtopics ({subtopicOptions.length})</option>
          {subtopicOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by difficulty"
          value={difficulty}
          onChange={(e) => onDifficultyChange?.(e.target.value)}
          className="h-9 px-2.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:bg-[var(--surface)] focus:border-[#FFA116] cursor-pointer transition"
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <div className="relative flex items-center">
          <ArrowUpDown className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-2.5 pointer-events-none" />
          <select
            aria-label="Sort aptitude questions"
            value={sortBy}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="w-full h-9 pl-7 pr-2 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:bg-[var(--surface)] focus:border-[#FFA116] cursor-pointer transition"
          >
            <option value="id">Default Order</option>
            <option value="difficulty">Difficulty</option>
            <option value="subtopic">Subtopic (A–Z)</option>
            <option value="status">Solved First</option>
          </select>
        </div>
      </div>

      {/* Active Removable Chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[11px] font-medium text-[var(--foreground-muted)]">
            Active:
          </span>
          {chips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF8EE] text-[#D97706] border border-[#FFA116]/30 dark:bg-[#FFA116]/12 dark:text-[#FFA116] dark:border-[#FFA116]/30"
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
            onClick={onResetAll}
            className="text-[11px] font-semibold text-[var(--foreground-secondary)] hover:text-[#FFA116] px-1.5 py-0.5 transition cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}

