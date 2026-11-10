import React from 'react';

export function QuestionNavigator({
  questions = [],
  currentIndex = 0,
  userAnswers = {},
  markedForReview = {},
  onJumpTo,
}) {
  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);

  return (
    <aside className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 space-y-4">
      <div>
        <h4 className="text-[11px] font-semibold uppercase text-[var(--foreground-muted)] tracking-wider mb-3">
          Question Navigator
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--foreground-secondary)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A] dark:bg-[#3FB950]" />
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FFA116]" />
            <span>Marked ({flaggedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--surface-secondary)] border border-[var(--border)]" />
            <span>Unanswered ({unansweredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm border-2 border-[#FFA116] bg-[var(--surface)]" />
            <span>Current</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-[var(--border)]">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          Jump to Question
        </span>
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, idx) => {
            const isQAnswered = Boolean(userAnswers[q.id]);
            const isQFlagged = Boolean(markedForReview[q.id]);
            const isQCurrent = idx === currentIndex;

            let btnClass =
              'bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)]';

            if (isQCurrent) {
              btnClass =
                'border-2 border-[#FFA116] bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#D97706] dark:text-[#FFA116] font-bold';
            } else if (isQAnswered && isQFlagged) {
              btnClass =
                'bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#D97706] dark:text-[#FFA116] border-[#FFA116] font-semibold';
            } else if (isQAnswered) {
              btnClass =
                'bg-[#F0FDF4] dark:bg-[#3FB950]/15 text-[#16A34A] dark:text-[#3FB950] border-[#16A34A]/35 font-semibold';
            } else if (isQFlagged) {
              btnClass =
                'bg-[#FFF8EE] dark:bg-[#FFA116]/12 text-[#FFA116] border-[#FFA116]/40 font-semibold';
            }

            return (
              <button
                key={q.id ?? idx}
                type="button"
                onClick={() => onJumpTo?.(idx)}
                className={`h-8 rounded-lg border text-xs flex items-center justify-center tabular-nums transition cursor-pointer ${btnClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

