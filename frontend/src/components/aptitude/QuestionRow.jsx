import React from 'react';
import { CheckCircle2, Circle, Star } from 'lucide-react';

const DIFFICULTY_STYLES = {
  easy:
    'bg-[#E6FAF6] text-[#059669] border-[#059669]/20 dark:bg-[#3FB950]/14 dark:text-[#3FB950] dark:border-[#3FB950]/30',
  medium:
    'bg-[#FFF8EE] text-[#D97706] border-[#D97706]/25 dark:bg-[#FFA116]/14 dark:text-[#FFA116] dark:border-[#FFA116]/30',
  hard:
    'bg-[#FFEBEF] text-[#DC2626] border-[#DC2626]/20 dark:bg-[#F85149]/14 dark:text-[#F85149] dark:border-[#F85149]/30',
};

const CATEGORY_LABELS = {
  quantitative: 'Quantitative',
  logical: 'Logical',
  verbal: 'Verbal',
};

export function MinimalDiffBadge({ difficulty }) {
  const key = (difficulty || '').trim().toLowerCase();
  const cls =
    DIFFICULTY_STYLES[key] ||
    'bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] border-[var(--border)]';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold leading-none whitespace-nowrap ${cls}`}
    >
      {difficulty || 'General'}
    </span>
  );
}

export function QuestionRow({
  question,
  isStarred = false,
  onToggleStar,
  onOpenQuestion,
  onSelectCategory,
  onSelectSubtopic,
}) {
  const isSolved = Boolean(question.is_solved);
  const categoryLabel = CATEGORY_LABELS[question.category] || question.category || 'Aptitude';

  return (
    <tr className="group hover:bg-[var(--surface-hover)]/55 transition-colors">
      {/* 1. STATUS */}
      <td className="py-2.5 pl-4 pr-2 text-center w-14 align-top pt-3">
        <div className="inline-flex items-center gap-1.5">
          {isSolved ? (
            <CheckCircle2
              className="w-4 h-4 text-[#16A34A] dark:text-[#3FB950]"
              title="Solved"
            />
          ) : (
            <Circle
              className="w-4 h-4 text-[var(--foreground-muted)] opacity-45 group-hover:opacity-85"
              title="Unsolved"
            />
          )}
          <button
            type="button"
            onClick={() => onToggleStar?.(question.id)}
            title={isStarred ? 'Remove Star' : 'Star Question'}
            aria-label={isStarred ? 'Remove star' : 'Star question'}
            className="p-0.5 rounded transition cursor-pointer"
          >
            <Star
              className={`w-3.5 h-3.5 transition-colors ${
                isStarred
                  ? 'text-[#FFA116] fill-[#FFA116]'
                  : 'text-[var(--foreground-muted)] opacity-35 group-hover:opacity-80 hover:text-[#FFA116]'
              }`}
            />
          </button>
        </div>
      </td>

      {/* 2. QUESTION */}
      <td className="py-2.5 px-3 min-w-[280px]">
        <button
          type="button"
          onClick={() => onOpenQuestion?.(question)}
          className="text-left flex items-start gap-2 w-full cursor-pointer"
        >
          <span className="text-xs font-mono text-[var(--foreground-muted)] tabular-nums shrink-0 mt-0.5">
            {question.id}.
          </span>
          <span className="text-[13px] font-medium text-[var(--foreground)] group-hover:text-[#FFA116] transition leading-snug line-clamp-2">
            {question.question_text}
          </span>
        </button>
      </td>

      {/* 3. CATEGORY / SUBTOPIC */}
      <td className="py-2.5 px-3 align-top pt-2.5">
        <div className="flex flex-col items-start gap-1">
          <button
            type="button"
            onClick={() => onSelectCategory?.(question.category)}
            className="text-[11px] font-semibold text-[var(--foreground)] hover:text-[#FFA116] transition cursor-pointer"
          >
            {categoryLabel}
          </button>
          {question.subtopic && (
            <button
              type="button"
              onClick={() => onSelectSubtopic?.(question.subtopic)}
              title={`Filter by ${question.subtopic}`}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition max-w-[155px] truncate cursor-pointer"
            >
              {question.subtopic}
            </button>
          )}
        </div>
      </td>

      {/* 4. DIFFICULTY */}
      <td className="py-2.5 px-3 whitespace-nowrap align-top pt-2.5 w-24">
        <MinimalDiffBadge difficulty={question.difficulty} />
      </td>

      {/* 5. ACTION */}
      <td className="py-2.5 pl-2 pr-4 text-right whitespace-nowrap align-top pt-2 w-24">
        <button
          type="button"
          onClick={() => onOpenQuestion?.(question)}
          className="px-2.5 py-1 rounded-md text-xs font-medium text-[#D97706] dark:text-[#FFA116] group-hover:bg-[#FFA116]/12 hover:!bg-[#FFA116] hover:!text-white transition cursor-pointer"
        >
          {isSolved ? 'Review' : 'Solve'}
        </button>
      </td>
    </tr>
  );
}

export function QuestionMobileCard({
  question,
  isStarred = false,
  onToggleStar,
  onOpenQuestion,
  onSelectSubtopic,
}) {
  const isSolved = Boolean(question.is_solved);
  const categoryLabel = CATEGORY_LABELS[question.category] || question.category || 'Aptitude';

  return (
    <div className="p-3.5 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className="mt-0.5 shrink-0">
            {isSolved ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#3FB950]" />
            ) : (
              <Circle className="w-4 h-4 text-[var(--foreground-muted)]" />
            )}
          </div>
          <button
            type="button"
            onClick={() => onOpenQuestion?.(question)}
            className="text-left min-w-0 flex-1 cursor-pointer"
          >
            <span className="text-xs font-mono text-[var(--foreground-muted)] mr-1.5">
              {question.id}.
            </span>
            <span className="text-[13px] font-medium text-[var(--foreground)] hover:text-[#FFA116] leading-snug line-clamp-2">
              {question.question_text}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onToggleStar?.(question.id)}
          aria-label={isStarred ? 'Remove star' : 'Star question'}
          className="p-1 shrink-0 cursor-pointer"
        >
          <Star
            className={`w-4 h-4 ${
              isStarred
                ? 'text-[#FFA116] fill-[#FFA116]'
                : 'text-[var(--foreground-muted)]'
            }`}
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pl-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <MinimalDiffBadge difficulty={question.difficulty} />
          <span className="text-[10px] font-semibold text-[var(--foreground-secondary)]">
            {categoryLabel}
          </span>
          {question.subtopic && (
            <button
              type="button"
              onClick={() => onSelectSubtopic?.(question.subtopic)}
              className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] cursor-pointer"
            >
              {question.subtopic}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onOpenQuestion?.(question)}
          className="px-2.5 py-1 rounded-md text-xs font-medium text-[#D97706] dark:text-[#FFA116] bg-[#FFA116]/10 hover:bg-[#FFA116] hover:text-white transition cursor-pointer"
        >
          {isSolved ? 'Review' : 'Solve'}
        </button>
      </div>
    </div>
  );
}

