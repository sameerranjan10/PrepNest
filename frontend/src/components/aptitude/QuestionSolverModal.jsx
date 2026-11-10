import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MinimalDiffBadge } from './QuestionRow';
import { AnswerOption } from './AnswerOption';
import { AnswerFeedback } from './AnswerFeedback';

const CATEGORY_NAMES = {
  quantitative: 'Quantitative Aptitude',
  logical: 'Logical Reasoning',
  verbal: 'Verbal Ability',
};

export function QuestionSolverModal({
  question,
  loadingDetail = false,
  submitError = null,
  selectedOption,
  solveResult,
  submitting = false,
  isStarred = false,
  hasPrev = false,
  hasNext = false,
  onSelectOption,
  onSubmitAnswer,
  onRetry,
  onPrevQuestion,
  onNextQuestion,
  onToggleStar,
  onClose,
}) {
  useEffect(() => {
    if (!question) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [question, onClose]);

  if (!question) return null;

  const categoryName = CATEGORY_NAMES[question.category] || question.category || 'Aptitude';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Question ${question.id}`}
        className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-xs font-mono font-bold text-[#FFA116] bg-[#FFF8EE] dark:bg-[#FFA116]/12 border border-[#FFA116]/30 px-2 py-0.5 rounded-md tabular-nums">
              #{question.id}
            </span>
            <span className="text-xs font-semibold text-[var(--foreground)]">
              {categoryName}
            </span>
            {question.subtopic && (
              <span className="text-xs text-[var(--foreground-secondary)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded-md truncate max-w-[180px]">
                {question.subtopic}
              </span>
            )}
            <MinimalDiffBadge difficulty={question.difficulty} />
            {question.company_tag && question.company_tag !== 'General' && (
              <span className="text-[11px] font-medium text-[var(--foreground-secondary)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                {question.company_tag}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onToggleStar && (
              <button
                type="button"
                onClick={() => onToggleStar(question.id)}
                title={isStarred ? 'Remove Star' : 'Star Question'}
                aria-label={isStarred ? 'Unstar question' : 'Star question'}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] transition cursor-pointer"
              >
                <Star
                  className={`w-4 h-4 ${
                    isStarred
                      ? 'text-[#FFA116] fill-[#FFA116]'
                      : 'hover:text-[#FFA116]'
                  }`}
                />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close question modal"
              className="p-1.5 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loadingDetail ? (
            <div className="space-y-4">
              <div className="h-28 rounded-xl skeleton-shimmer" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 rounded-xl skeleton-shimmer" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Separated Question Prompt Container */}
              <div className="p-4 sm:p-5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-3">
                <p className="text-sm sm:text-[15px] font-medium text-[var(--foreground)] leading-relaxed whitespace-pre-line font-sans">
                  {question.question_text}
                </p>
                {question.image_url && (
                  <img
                    src={question.image_url}
                    alt={`Diagram for question ${question.id}`}
                    className="max-h-60 rounded-lg border border-[var(--border)] object-contain"
                  />
                )}
              </div>

              {/* Selectable Multiple Choice Options */}
              <div className="space-y-2.5">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                  Choose an Answer
                </span>
                <div className="space-y-2">
                  {question.options &&
                    Object.entries(question.options).map(([optKey, optVal]) => {
                      const isSelected = selectedOption === optKey;
                      const isCorrect =
                        Boolean(solveResult) && solveResult.correct_option === optKey;
                      const isWrong =
                        Boolean(solveResult) && !solveResult.is_correct && isSelected;

                      return (
                        <AnswerOption
                          key={optKey}
                          optionKey={optKey}
                          optionText={optVal}
                          isSelected={isSelected}
                          isCorrect={isCorrect}
                          isWrong={isWrong}
                          disabled={Boolean(solveResult)}
                          onSelect={onSelectOption}
                        />
                      );
                    })}
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-lg bg-[#FEF2F2] dark:bg-[#F85149]/12 border border-[#DC2626]/25 text-xs text-[#DC2626] dark:text-[#F85149]">
                  {submitError}
                </div>
              )}

              {/* Post-Submission Structured Feedback & Explanation */}
              <AnswerFeedback result={solveResult} selectedOption={selectedOption} />
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[var(--border)] bg-[var(--surface-secondary)] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {hasPrev && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onPrevQuestion}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {!solveResult ? (
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedOption || submitting}
                loading={submitting}
                onClick={onSubmitAnswer}
              >
                {submitting ? 'Checking...' : 'Check Answer'}
              </Button>
            ) : (
              <>
                {!solveResult.is_correct && onRetry && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRetry}
                    icon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Retry
                  </Button>
                )}
                {hasNext && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onNextQuestion}
                    iconRight={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Next Question
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

