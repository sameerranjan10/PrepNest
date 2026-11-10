import React from 'react';
import { CheckCircle2, XCircle, Check } from 'lucide-react';

export function AnswerOption({
  optionKey,
  optionText,
  isSelected = false,
  isCorrect = false,
  isWrong = false,
  disabled = false,
  onSelect,
}) {
  let rowClass =
    'bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-hover)] hover:border-[var(--foreground-muted)]/40';
  let badgeClass =
    'bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] border border-[var(--border)]';

  if (isCorrect) {
    rowClass =
      'bg-[#F0FDF4] dark:bg-[#3FB950]/12 border-[#16A34A] dark:border-[#3FB950] text-[#16A34A] dark:text-[#3FB950] font-semibold';
    badgeClass = 'bg-[#16A34A] dark:bg-[#3FB950] text-white border-transparent';
  } else if (isWrong) {
    rowClass =
      'bg-[#FEF2F2] dark:bg-[#F85149]/12 border-[#DC2626] dark:border-[#F85149] text-[#DC2626] dark:text-[#F85149] font-semibold';
    badgeClass = 'bg-[#DC2626] dark:bg-[#F85149] text-white border-transparent';
  } else if (isSelected) {
    rowClass =
      'bg-[#FFF8EE] dark:bg-[#FFA116]/12 border-[#FFA116] text-[var(--foreground)] font-semibold';
    badgeClass = 'bg-[#FFA116] text-white border-transparent';
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(optionKey)}
      className={`w-full px-4 py-3.5 rounded-xl border text-left text-xs sm:text-sm transition flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${rowClass}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${badgeClass}`}
        >
          {optionKey}
        </span>
        <span className="leading-snug break-words">{optionText}</span>
      </div>

      <span className="shrink-0">
        {isCorrect ? (
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#3FB950]" />
        ) : isWrong ? (
          <XCircle className="w-4 h-4 text-[#DC2626] dark:text-[#F85149]" />
        ) : (
          <span
            className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
              isSelected
                ? 'border-[#FFA116] bg-[#FFA116] text-white'
                : 'border-[var(--border)]'
            }`}
          >
            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </span>
        )}
      </span>
    </button>
  );
}

