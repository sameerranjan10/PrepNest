import React, { useState, useEffect } from 'react';
import {
  Zap,
  Calculator,
  BrainCircuit,
  BookOpen,
  Layers,
  Building2,
  SlidersHorizontal,
  Clock,
  Eye,
} from 'lucide-react';
import { formatDuration } from '@/lib/aptitudeData';
import { AssessmentCard } from './AssessmentCard';

export function AssessmentDirectory({
  availableCompanies = [],
  recentTests = [],
  historyLoading = false,
  onStartAssessment,
  onOpenCustomModal,
  onInspectResult,
}) {
  const [selectedCompany, setSelectedCompany] = useState('');

  useEffect(() => {
    if (availableCompanies.length > 0 && !availableCompanies.includes(selectedCompany)) {
      setSelectedCompany(availableCompanies[0]);
    }
  }, [availableCompanies, selectedCompany]);

  const presets = [
    {
      id: 'quick',
      title: 'Quick 10-Question Mock',
      description:
        'Balanced warm-up sprint mixing Quantitative, Logical, and Verbal questions.',
      questionCount: '10 Questions',
      durationLabel: '10 Mins (60s/Q)',
      difficultyLabel: 'Mixed Difficulty',
      categoriesLabel: 'All Domains',
      icon: Zap,
      badge: 'Recommended',
      highlight: true,
      onStart: () => onStartAssessment?.('all', 10, 'all', 'standard', 'all', 'all'),
    },
    {
      id: 'quant',
      title: 'Quantitative Aptitude Mock',
      description:
        'Focused drill covering arithmetic, percentages, probability, and speed math.',
      questionCount: '15 Questions',
      durationLabel: '15 Mins',
      difficultyLabel: 'All Levels',
      categoriesLabel: 'Quantitative',
      icon: Calculator,
      badge: 'QA Track',
      onStart: () =>
        onStartAssessment?.('quantitative', 15, 'all', 'standard', 'all', 'all'),
    },
    {
      id: 'logical',
      title: 'Logical Reasoning Mock',
      description:
        'Timed puzzle, syllogism, blood relations, and series deduction drill.',
      questionCount: '15 Questions',
      durationLabel: '15 Mins',
      difficultyLabel: 'All Levels',
      categoriesLabel: 'Logical',
      icon: BrainCircuit,
      badge: 'LR Track',
      onStart: () =>
        onStartAssessment?.('logical', 15, 'all', 'standard', 'all', 'all'),
    },
    {
      id: 'verbal',
      title: 'Verbal Ability Mock',
      description:
        'Rapid accuracy practice in grammar correction, vocabulary, and comprehension.',
      questionCount: '15 Questions',
      durationLabel: '15 Mins',
      difficultyLabel: 'All Levels',
      categoriesLabel: 'Verbal',
      icon: BookOpen,
      badge: 'VA Track',
      onStart: () =>
        onStartAssessment?.('verbal', 15, 'all', 'standard', 'all', 'all'),
    },
    {
      id: 'mixed-full',
      title: 'Mixed Aptitude Assessment',
      description:
        'Full screening simulation testing endurance and accuracy under campus exam timing.',
      questionCount: '25 Questions',
      durationLabel: '25 Mins',
      difficultyLabel: 'Exam Simulation',
      categoriesLabel: 'Quant + LR + Verbal',
      icon: Layers,
      badge: 'Full Length',
      onStart: () => onStartAssessment?.('all', 25, 'all', 'standard', 'all', 'all'),
    },
  ];

  return (
    <section
      id="aptitude-assessments"
      aria-label="Timed Mock Assessments"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[var(--foreground)]">
            Timed Mock Assessments
          </h2>
          <p className="text-xs text-[var(--foreground-secondary)]">
            Simulate timed campus screening rounds or customize your own test drill.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCustomModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--foreground)] hover:border-[#FFA116]/60 hover:text-[#FFA116] transition cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFA116]" />
          <span>Custom Assessment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {presets.map((preset) => (
          <AssessmentCard
            key={preset.id}
            title={preset.title}
            description={preset.description}
            questionCount={preset.questionCount}
            durationLabel={preset.durationLabel}
            difficultyLabel={preset.difficultyLabel}
            categoriesLabel={preset.categoriesLabel}
            icon={preset.icon}
            badge={preset.badge}
            highlight={preset.highlight}
            onStart={preset.onStart}
          />
        ))}

        {/* Company-Specific Assessment (only when DB has real company tags) */}
        {availableCompanies.length > 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-[#FFA116]/40 transition">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="w-9 h-9 rounded-lg bg-[#FFF8EE] dark:bg-[#FFA116]/12 border border-[#FFA116]/25 text-[#FFA116] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground-secondary)]">
                  Company Drive
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  Company-Specific Assessment
                </h3>
                <p className="text-xs text-[var(--foreground-secondary)] mt-1 leading-relaxed">
                  Practice actual aptitude questions tagged for a target hiring company.
                </p>
              </div>

              <div>
                <label
                  htmlFor="company-mock-select"
                  className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-1"
                >
                  Target Company
                </label>
                <select
                  id="company-mock-select"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[#FFA116] cursor-pointer"
                >
                  {availableCompanies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={!selectedCompany}
              onClick={() =>
                onStartAssessment?.(
                  'all',
                  10,
                  'all',
                  'standard',
                  selectedCompany,
                  'all'
                )
              }
              className="w-full py-2 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] hover:bg-[#FFA116] hover:border-[#FFA116] hover:text-white text-xs font-semibold text-[var(--foreground)] transition cursor-pointer disabled:opacity-50"
            >
              Start {selectedCompany} Mock (10 Qs)
            </button>
          </div>
        )}
      </div>

      {/* Real Assessment History */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#FFA116]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Assessment History
            </h3>
          </div>
          <span className="text-[11px] text-[var(--foreground-secondary)] tabular-nums">
            {recentTests.length} {recentTests.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {historyLoading ? (
          <div className="p-4 space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="h-9 rounded-lg skeleton-shimmer" />
            ))}
          </div>
        ) : recentTests.length === 0 ? (
          <div className="p-8 text-center space-y-1">
            <p className="text-xs font-semibold text-[var(--foreground)]">
              No assessments completed yet
            </p>
            <p className="text-[11px] text-[var(--foreground-secondary)]">
              Start any mock assessment above to record your score, accuracy, and solutions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)] text-xs">
            {recentTests.map((t) => (
              <div
                key={t.id}
                className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 hover:bg-[var(--surface-hover)]/50 transition"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[var(--foreground)]">
                    {t.category_name || 'Placement Mock'}
                  </span>
                  <span className="text-[var(--foreground-secondary)] tabular-nums">
                    {t.correct_answers}/{t.total_questions} correct ·{' '}
                    {t.accuracy ?? t.score_percentage}% accuracy ·{' '}
                    {formatDuration(t.time_taken_seconds || 0)}
                  </span>
                  {t.completed_at && (
                    <span className="text-[11px] text-[var(--foreground-muted)]">
                      {String(t.completed_at).slice(0, 10)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold tabular-nums text-[#FFA116]">
                    {Math.round(t.score_percentage || 0)}%
                  </span>
                  {onInspectResult && (
                    <button
                      type="button"
                      onClick={() => onInspectResult(t.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--foreground-secondary)] hover:text-[#FFA116] transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Review</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
