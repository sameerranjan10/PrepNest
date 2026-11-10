import React from 'react';

export function DifficultyDistribution({
  difficultyCounts = {},
  activeDifficulty = 'all',
  onSelectDifficulty,
}) {
  const easy = Number(difficultyCounts?.Easy) || 0;
  const medium = Number(difficultyCounts?.Medium) || 0;
  const hard = Number(difficultyCounts?.Hard) || 0;
  const total = Math.max(1, easy + medium + hard);

  const easyPct = (easy / total) * 100;
  const mediumPct = (medium / total) * 100;
  const hardPct = (hard / total) * 100;

  const tiers = [
    {
      key: 'Easy',
      label: 'Easy',
      count: easy,
      dotClass: 'bg-[#16A34A] dark:bg-[#3FB950]',
      textClass: 'text-[#16A34A] dark:text-[#3FB950]',
      activeClass:
        'bg-[#F0FDF4] border-[#16A34A]/40 dark:bg-[#3FB950]/14 dark:border-[#3FB950]/40',
    },
    {
      key: 'Medium',
      label: 'Med',
      count: medium,
      dotClass: 'bg-[#FFA116]',
      textClass: 'text-[#D97706] dark:text-[#FFA116]',
      activeClass:
        'bg-[#FFF8EE] border-[#FFA116]/40 dark:bg-[#FFA116]/14 dark:border-[#FFA116]/40',
    },
    {
      key: 'Hard',
      label: 'Hard',
      count: hard,
      dotClass: 'bg-[#DC2626] dark:bg-[#F85149]',
      textClass: 'text-[#DC2626] dark:text-[#F85149]',
      activeClass:
        'bg-[#FEF2F2] border-[#DC2626]/40 dark:bg-[#F85149]/14 dark:border-[#F85149]/40',
    },
  ];

  return (
    <div className="flex flex-col gap-1.5 min-w-[210px]">
      <div className="flex items-center gap-1.5">
        {tiers.map((tier) => {
          const isSelected = activeDifficulty === tier.key;
          return (
            <button
              key={tier.key}
              type="button"
              onClick={() =>
                onSelectDifficulty?.(isSelected ? 'all' : tier.key)
              }
              title={`Filter by ${tier.key} problems`}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold transition cursor-pointer ${
                isSelected
                  ? tier.activeClass
                  : 'border-transparent hover:border-[var(--border)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${tier.dotClass}`} />
              <span className="text-[var(--foreground-secondary)] font-medium">
                {tier.label}
              </span>
              <span className={`tabular-nums ${tier.textClass}`}>
                {tier.count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="h-1.5 w-full rounded-full overflow-hidden bg-[var(--surface-secondary)] flex gap-px">
        <div
          className="h-full bg-[#16A34A] dark:bg-[#3FB950] transition-all duration-300"
          style={{ width: `${easyPct}%` }}
        />
        <div
          className="h-full bg-[#FFA116] transition-all duration-300"
          style={{ width: `${mediumPct}%` }}
        />
        <div
          className="h-full bg-[#DC2626] dark:bg-[#F85149] transition-all duration-300"
          style={{ width: `${hardPct}%` }}
        />
      </div>
    </div>
  );
}

