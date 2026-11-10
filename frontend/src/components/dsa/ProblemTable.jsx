import React from 'react';
import { Code2, ArrowUpDown } from 'lucide-react';
import { SkeletonRow } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProblemRow, ProblemMobileCard } from './ProblemRow';

export function ProblemTable({
  problems = [],
  loading = false,
  sortBy = 'id',
  onSortChange,
  onToggleSolved,
  onToggleStar,
  onOpenProblem,
  onSelectTopic,
  onSelectCompany,
  onResetFilters,
}) {
  if (loading) {
    return <SkeletonRow count={10} />;
  }

  if (!problems.length) {
    return (
      <EmptyState
        icon={<Code2 className="w-7 h-7" />}
        title="No matching coding problems"
        description="Try clearing active filters, broadening your search keyword, or choosing another topic or company."
        actionLabel="Reset All Filters"
        onAction={onResetFilters}
      />
    );
  }

  const handleHeaderSort = (key) => {
    if (!onSortChange) return;
    onSortChange(sortBy === key ? 'id' : key);
  };

  return (
    <>
      {/* Desktop & Tablet Explorer Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border)]">
            <tr className="text-[11px] font-medium uppercase tracking-wider text-[var(--foreground-muted)] h-9 select-none">
              <th className="py-2.5 pl-4 pr-2 text-center w-12">Status</th>
              <th className="py-2.5 px-2 text-center w-10">Star</th>
              <th className="py-2.5 px-3">
                <button
                  type="button"
                  onClick={() => handleHeaderSort('title')}
                  className={`inline-flex items-center gap-1 uppercase tracking-wider hover:text-[var(--foreground)] transition cursor-pointer ${
                    sortBy === 'title' ? 'text-[#FFA116]' : ''
                  }`}
                >
                  <span>Problem</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3">Topics</th>
              <th className="py-2.5 px-3 w-24">
                <button
                  type="button"
                  onClick={() => handleHeaderSort('difficulty')}
                  className={`inline-flex items-center gap-1 uppercase tracking-wider hover:text-[var(--foreground)] transition cursor-pointer ${
                    sortBy === 'difficulty' ? 'text-[#FFA116]' : ''
                  }`}
                >
                  <span>Difficulty</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3 w-28 text-right">
                <button
                  type="button"
                  onClick={() => handleHeaderSort('acceptance')}
                  className={`inline-flex items-center justify-end gap-1 uppercase tracking-wider hover:text-[var(--foreground)] transition cursor-pointer ml-auto ${
                    sortBy === 'acceptance' ? 'text-[#FFA116]' : ''
                  }`}
                >
                  <span>Acceptance</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3">Companies</th>
              <th className="py-2.5 pl-2 pr-4 text-right w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
            {problems.map((problem) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                onToggleSolved={onToggleSolved}
                onToggleStar={onToggleStar}
                onOpenProblem={onOpenProblem}
                onSelectTopic={onSelectTopic}
                onSelectCompany={onSelectCompany}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact Problem Cards */}
      <div className="md:hidden divide-y divide-[var(--border-subtle)]">
        {problems.map((problem) => (
          <ProblemMobileCard
            key={problem.id}
            problem={problem}
            onToggleSolved={onToggleSolved}
            onToggleStar={onToggleStar}
            onOpenProblem={onOpenProblem}
            onSelectTopic={onSelectTopic}
            onSelectCompany={onSelectCompany}
          />
        ))}
      </div>
    </>
  );
}
