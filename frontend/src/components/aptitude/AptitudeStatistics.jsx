import React from 'react';
import { Layers, CheckCircle2, Circle, Target, ClipboardCheck } from 'lucide-react';

export function AptitudeStatistics({
  totalQuestions = 0,
  solvedCount = 0,
  accuracy = 0,
  testsCompleted = 0,
  activeStatus = 'all',
  onSelectStatus,
  onJumpToAssessments,
}) {
  const unsolvedCount = Math.max(0, totalQuestions - solvedCount);
  const completionPct =
    totalQuestions > 0 ? Math.min(100, Math.round((solvedCount / totalQuestions) * 100)) : 0;

  const stats = [
    {
      id: 'all',
      label: 'Total Questions',
      value: totalQuestions.toLocaleString(),
      sub: `${completionPct}% completed`,
      progress: completionPct,
      icon: Layers,
      iconColor: 'text-[var(--foreground-secondary)]',
      barColor: 'bg-[var(--foreground-muted)]',
      onClick: () => onSelectStatus?.('all'),
      isActive: activeStatus === 'all',
    },
    {
      id: 'solved',
      label: 'Questions Solved',
      value: solvedCount.toLocaleString(),
      sub: totalQuestions > 0 ? `${completionPct}% of bank` : 'Track progress',
      progress: completionPct,
      icon: CheckCircle2,
      iconColor: 'text-[#16A34A] dark:text-[#3FB950]',
      barColor: 'bg-[#16A34A] dark:bg-[#3FB950]',
      onClick: () => onSelectStatus?.(activeStatus === 'solved' ? 'all' : 'solved'),
      isActive: activeStatus === 'solved',
    },
    {
      id: 'unsolved',
      label: 'Unsolved Questions',
      value: unsolvedCount.toLocaleString(),
      sub: 'Remaining to master',
      progress: totalQuestions > 0 ? Math.round((unsolvedCount / totalQuestions) * 100) : 0,
      icon: Circle,
      iconColor: 'text-[var(--foreground-muted)]',
      barColor: 'bg-[#FFA116]',
      onClick: () => onSelectStatus?.(activeStatus === 'unsolved' ? 'all' : 'unsolved'),
      isActive: activeStatus === 'unsolved',
    },
    {
      id: 'accuracy',
      label: 'Accuracy',
      value: `${accuracy}%`,
      sub: 'Across assessments',
      progress: Math.min(100, Math.max(0, Math.round(Number(accuracy) || 0))),
      icon: Target,
      iconColor: 'text-[#FFA116]',
      barColor: 'bg-[#FFA116]',
      onClick: onJumpToAssessments,
      isActive: false,
    },
    {
      id: 'tests',
      label: 'Tests Completed',
      value: testsCompleted.toLocaleString(),
      sub: 'View mock drills',
      progress: Math.min(100, testsCompleted * 10),
      icon: ClipboardCheck,
      iconColor: 'text-[#2563EB] dark:text-[#58A6FF]',
      barColor: 'bg-[#2563EB] dark:bg-[#58A6FF]',
      onClick: onJumpToAssessments,
      isActive: false,
    },
  ];

  return (
    <section
      aria-label="Aptitude Performance Overview"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <button
            key={stat.id}
            type="button"
            onClick={stat.onClick}
            className={`group flex flex-col justify-between gap-2 px-3.5 py-3 rounded-xl border text-left transition cursor-pointer ${
              stat.isActive
                ? 'border-[#FFA116]/50 bg-[#FFF8EE]/70 dark:bg-[#FFA116]/10 dark:border-[#FFA116]/40'
                : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="min-w-0">
                <span className="block text-[11px] font-medium text-[var(--foreground-secondary)] truncate">
                  {stat.label}
                </span>
                <span className="block text-lg font-bold text-[var(--foreground)] tabular-nums leading-tight mt-0.5">
                  {stat.value}
                </span>
              </div>
              <span className="w-7 h-7 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0">
                <Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
              </span>
            </div>

            <div className="space-y-1 w-full">
              <div className="h-1 w-full rounded-full bg-[var(--surface-secondary)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${stat.barColor}`}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
              <span className="block text-[10px] text-[var(--foreground-muted)] truncate">
                {stat.sub}
              </span>
            </div>
          </button>
        );
      })}
    </section>
  );
}

