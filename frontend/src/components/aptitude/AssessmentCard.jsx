import React from 'react';
import { Clock, HelpCircle, Play, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AssessmentCard({
  title,
  description,
  questionCount,
  durationLabel,
  difficultyLabel,
  categoriesLabel,
  icon: Icon,
  badge,
  highlight = false,
  onStart,
  actionLabel = 'Start Assessment',
}) {
  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition ${
        highlight
          ? 'border-[#FFA116]/45 bg-[#FFF8EE]/45 dark:bg-[#FFA116]/[0.06]'
          : 'bg-[var(--surface)] border-[var(--border)] hover:border-[#FFA116]/40'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="w-9 h-9 rounded-lg bg-[#FFF8EE] dark:bg-[#FFA116]/12 border border-[#FFA116]/25 text-[#FFA116] flex items-center justify-center shrink-0">
            {Icon ? <Icon className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </span>
          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground-secondary)]">
              {badge}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
          <p className="text-xs text-[var(--foreground-secondary)] mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-[var(--foreground-secondary)]">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--foreground-muted)] shrink-0" />
            <span className="tabular-nums">{questionCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--foreground-muted)] shrink-0" />
            <span className="tabular-nums">{durationLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] font-medium">
            {difficultyLabel}
          </span>
          <span className="px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] font-medium">
            {categoriesLabel}
          </span>
        </div>
      </div>

      <Button
        variant={highlight ? 'primary' : 'secondary'}
        size="sm"
        className="w-full"
        onClick={onStart}
        icon={<Play className="w-3.5 h-3.5 fill-current" />}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

