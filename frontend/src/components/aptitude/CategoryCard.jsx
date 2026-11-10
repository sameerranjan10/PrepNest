import React from 'react';
import { ArrowRight } from 'lucide-react';

export function CategoryCard({
  category,
  icon: Icon,
  totalQuestions = 0,
  solvedQuestions = 0,
  subtopics = [],
  isActive = false,
  onExplore,
  onSelectSubtopic,
}) {
  const pct =
    totalQuestions > 0
      ? Math.min(100, Math.round((solvedQuestions / totalQuestions) * 100))
      : 0;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition ${
        isActive
          ? 'border-[#FFA116]/60 bg-[#FFF8EE]/50 dark:bg-[#FFA116]/[0.07] dark:border-[#FFA116]/45'
          : 'bg-[var(--surface)] border-[var(--border)] hover:border-[#FFA116]/40'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-lg bg-[#FFF8EE] dark:bg-[#FFA116]/12 border border-[#FFA116]/25 text-[#FFA116] flex items-center justify-center shrink-0">
              {Icon && <Icon className="w-4 h-4" />}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[var(--foreground)] truncate">
                {category.name}
              </h3>
              <span className="text-[11px] text-[var(--foreground-secondary)] tabular-nums">
                {totalQuestions.toLocaleString()} questions · {solvedQuestions.toLocaleString()} solved
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-[#FFA116] tabular-nums shrink-0">
            {pct}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="h-1.5 w-full rounded-full bg-[var(--surface-secondary)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FFA116] transition-all duration-300"
            style={{ width: `${solvedQuestions > 0 ? Math.max(4, pct) : 0}%` }}
          />
        </div>

        {/* Actual Database Subtopics */}
        {subtopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {subtopics.slice(0, 5).map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => onSelectSubtopic?.(category.id, sub)}
                title={`Practice ${sub}`}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] hover:text-[#FFA116] transition truncate max-w-[155px] cursor-pointer"
              >
                {sub}
              </button>
            ))}
            {subtopics.length > 5 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium text-[var(--foreground-muted)] tabular-nums">
                +{subtopics.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onExplore?.(category.id)}
        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
          isActive
            ? 'bg-[#FFA116] border-[#FFA116] text-white'
            : 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--foreground)] hover:border-[#FFA116]/60 hover:text-[#FFA116]'
        }`}
      >
        <span>{isActive ? 'Filtering Directory' : 'Explore Topics'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

