import React from 'react';
import { BookOpen } from 'lucide-react';
import { SkeletonRow } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuestionRow, QuestionMobileCard } from './QuestionRow';

export function QuestionTable({
  questions = [],
  loading = false,
  starredIds = {},
  onToggleStar,
  onOpenQuestion,
  onSelectCategory,
  onSelectSubtopic,
  onResetFilters,
}) {
  if (loading) {
    return <SkeletonRow count={8} />;
  }

  if (!questions.length) {
    return (
      <EmptyState
        icon={<BookOpen className="w-7 h-7" />}
        title="No matching aptitude questions"
        description="Try clearing active filters, adjusting your search keyword, or switching category."
        actionLabel="Reset All Filters"
        onAction={onResetFilters}
      />
    );
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--surface)] border-b border-[var(--border)]">
            <tr className="text-[11px] font-medium uppercase tracking-wider text-[var(--foreground-muted)] h-9 select-none">
              <th className="py-2 pl-4 pr-2 text-center w-14">Status</th>
              <th className="py-2 px-3">Question</th>
              <th className="py-2 px-3 w-48">Category / Subtopic</th>
              <th className="py-2 px-3 w-24">Difficulty</th>
              <th className="py-2 pl-2 pr-4 text-right w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
            {questions.map((q) => (
              <QuestionRow
                key={q.id}
                question={q}
                isStarred={Boolean(q.is_starred ?? starredIds[q.id])}
                onToggleStar={onToggleStar}
                onOpenQuestion={onOpenQuestion}
                onSelectCategory={onSelectCategory}
                onSelectSubtopic={onSelectSubtopic}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-[var(--border-subtle)]">
        {questions.map((q) => (
          <QuestionMobileCard
            key={q.id}
            question={q}
            isStarred={Boolean(q.is_starred ?? starredIds[q.id])}
            onToggleStar={onToggleStar}
            onOpenQuestion={onOpenQuestion}
            onSelectSubtopic={onSelectSubtopic}
          />
        ))}
      </div>
    </>
  );
}

