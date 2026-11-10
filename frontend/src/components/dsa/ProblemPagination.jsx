import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ProblemPagination({
  page = 1,
  totalPages = 1,
  limit = 25,
  totalMatching = 0,
  onPageChange,
  onLimitChange,
}) {
  if (totalMatching === 0 && totalPages <= 1) return null;

  const startItem = totalMatching === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(totalMatching, page * limit);

  const buildPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (page > 3) pages.push('ellipsis-left');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (page < totalPages - 2) pages.push('ellipsis-right');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="px-4 py-3 bg-[var(--surface-secondary)] border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--foreground-secondary)]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="tabular-nums">
          Showing{' '}
          <strong className="text-[var(--foreground)] font-semibold">
            {startItem}–{endItem}
          </strong>{' '}
          of{' '}
          <strong className="text-[var(--foreground)] font-semibold">
            {totalMatching.toLocaleString()}
          </strong>
        </span>

        <div className="flex items-center gap-1.5">
          <label
            htmlFor="dsa-page-size"
            className="text-[11px] text-[var(--foreground-muted)]"
          >
            Per page:
          </label>
          <select
            id="dsa-page-size"
            value={limit}
            onChange={(e) => onLimitChange?.(Number(e.target.value))}
            className="h-7 px-2 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] outline-none focus:border-[#FFA116] cursor-pointer"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange?.(Math.max(1, page - 1))}
          icon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </Button>

        <div className="hidden md:inline-flex items-center gap-1 mx-1">
          {buildPageNumbers().map((item, idx) =>
            typeof item === 'string' ? (
              <span
                key={`${item}-${idx}`}
                className="px-1.5 text-[var(--foreground-muted)] select-none"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange?.(item)}
                className={`min-w-[28px] h-7 px-2 rounded-md text-xs font-semibold tabular-nums transition cursor-pointer ${
                  item === page
                    ? 'bg-[#FFA116] text-white shadow-sm'
                    : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>

        <span className="md:hidden text-xs tabular-nums px-2">
          Page <strong className="text-[var(--foreground)]">{page}</strong> /{' '}
          {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
          iconRight={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

