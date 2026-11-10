import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  Eye,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { calculateTestGrade, formatDuration } from '@/lib/aptitudeData';

const CATEGORY_LABELS = {
  quantitative: 'Quantitative Aptitude',
  logical: 'Logical Reasoning',
  verbal: 'Verbal Ability',
};

export function AssessmentResults({
  result,
  onBackToHub,
  onRetake,
  onReviewSolutions,
}) {
  if (!result) return null;

  const grade = calculateTestGrade(result.score_percentage);
  const attemptedCount =
    result.attempted_questions ??
    Math.max(0, (result.total_questions || 0) - (result.unattempted || 0));
  const accuracy =
    result.accuracy !== undefined && result.accuracy !== null
      ? result.accuracy
      : 0;

  // Prefer authoritative backend category_breakdown
  let categoryBreakdown = Object.entries(result.category_breakdown || {});
  if (categoryBreakdown.length === 0 && Array.isArray(result.detailed_results)) {
    const map = {};
    result.detailed_results.forEach((item) => {
      const cat = item.category || 'aptitude';
      if (!map[cat]) map[cat] = { total: 0, correct: 0 };
      map[cat].total += 1;
      if (item.is_correct) map[cat].correct += 1;
    });
    categoryBreakdown = Object.entries(map);
  }

  return (
    <div className="space-y-5">
      {/* Main Score Summary Card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="var(--border)"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#FFA116"
                  strokeWidth="6"
                  strokeDasharray="251.32"
                  strokeDashoffset={
                    251.32 * (1 - (Number(result.score_percentage) || 0) / 100)
                  }
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-bold text-xl text-[var(--foreground)] tabular-nums">
                  {result.score_percentage}%
                </span>
                <span className="text-[9px] text-[var(--foreground-muted)] font-semibold uppercase">
                  Score
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  result.score_percentage >= 70
                    ? 'bg-[#F0FDF4] dark:bg-[#3FB950]/14 text-[#16A34A] dark:text-[#3FB950] border-[#16A34A]/25'
                    : 'bg-[#FFF8EE] dark:bg-[#FFA116]/14 text-[#D97706] dark:text-[#FFA116] border-[#FFA116]/30'
                }`}
              >
                {grade.label || 'Assessment Complete'}
              </span>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                Assessment Results
              </h2>
              <p className="text-xs text-[var(--foreground-secondary)]">
                Accuracy {accuracy}% across {attemptedCount} attempted of{' '}
                {result.total_questions} questions in{' '}
                {formatDuration(result.time_taken_seconds || 0)}.
              </p>
            </div>
          </div>

          <div className="px-5 py-3.5 rounded-xl bg-[#FFF8EE] dark:bg-[#FFA116]/12 border border-[#FFA116]/30 text-center shrink-0">
            <div className="text-xl font-bold text-[#FFA116] flex items-center justify-center gap-1 tabular-nums">
              <Sparkles className="w-4 h-4" />+{result.xp_earned || 0} XP
            </div>
            <div className="text-[11px] text-[var(--foreground-secondary)]">
              Placement XP Gained
            </div>
          </div>
        </div>
      </div>

      {/* Stats Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] dark:bg-[#3FB950]/14 text-[#16A34A] dark:text-[#3FB950] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">
              {result.correct_answers} / {result.total_questions}
            </div>
            <div className="text-xs text-[var(--foreground-secondary)]">Correct</div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] dark:bg-[#F85149]/14 text-[#DC2626] dark:text-[#F85149] flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">
              {result.incorrect_answers}
            </div>
            <div className="text-xs text-[var(--foreground-secondary)]">Incorrect</div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">
              {result.unattempted}
            </div>
            <div className="text-xs text-[var(--foreground-secondary)]">
              Unattempted
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FFF8EE] dark:bg-[#FFA116]/14 text-[#FFA116] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--foreground)] tabular-nums">
              {formatDuration(result.time_taken_seconds || 0)}
            </div>
            <div className="text-xs text-[var(--foreground-secondary)]">
              Time Taken
            </div>
          </div>
        </div>
      </div>

      {/* Category-Wise Performance Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
            Category-Wise Performance
          </h3>
          <div className="space-y-3">
            {categoryBreakdown.map(([catKey, stats]) => {
              const pct =
                stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              return (
                <div key={catKey} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--foreground)]">
                      {CATEGORY_LABELS[catKey] || catKey}
                    </span>
                    <span className="text-[var(--foreground-secondary)] tabular-nums">
                      {stats.correct}/{stats.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[var(--surface-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#FFA116] transition-all duration-300"
                      style={{ width: `${stats.correct > 0 ? Math.max(4, pct) : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)]">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBackToHub}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Return to Aptitude Hub
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetake}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Retry Assessment
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onReviewSolutions}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            Review Answers
          </Button>
        </div>
      </div>
    </div>
  );
}

