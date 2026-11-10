import React from 'react';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export function AnswerFeedback({ result, selectedOption }) {
  if (!result) return null;

  const isCorrect = Boolean(result.is_correct);
  const explanation =
    typeof result.explanation === 'string' && result.explanation.trim().length > 0
      ? result.explanation.trim()
      : null;

  return (
    <div
      className={`p-4 rounded-xl border space-y-3 ${
        isCorrect
          ? 'bg-[#F0FDF4] dark:bg-[#3FB950]/10 border-[#16A34A]/30 dark:border-[#3FB950]/30'
          : 'bg-[#FEF2F2] dark:bg-[#F85149]/10 border-[#DC2626]/30 dark:border-[#F85149]/30'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <span className="text-[#16A34A] dark:text-[#3FB950] font-bold text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Correct Answer</span>
            </span>
          ) : (
            <span className="text-[#DC2626] dark:text-[#F85149] font-bold text-sm flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              <span>Incorrect Answer</span>
            </span>
          )}

          {isCorrect && Number(result.xp_earned) > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#D97706] dark:text-[#FFA116] border border-[#FFA116]/30">
              <Sparkles className="w-3 h-3" />+{result.xp_earned} XP
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-[var(--foreground-secondary)]">
          {selectedOption && (
            <span>
              Your choice:{' '}
              <strong className="text-[var(--foreground)] font-semibold">
                {selectedOption}
              </strong>
            </span>
          )}
          <span>
            Correct:{' '}
            <strong className="text-[#16A34A] dark:text-[#3FB950] font-bold">
              {result.correct_option}
            </strong>
          </span>
        </div>
      </div>

      <div className="pt-2.5 border-t border-[var(--border)] space-y-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-secondary)]">
          Explanation & Solution Steps
        </span>
        {explanation ? (
          <p className="text-xs sm:text-[13px] text-[var(--foreground)] leading-relaxed whitespace-pre-line">
            {explanation}
          </p>
        ) : (
          <p className="text-xs text-[var(--foreground-muted)] italic">
            No step-by-step explanation is available for this question.
          </p>
        )}
      </div>
    </div>
  );
}

