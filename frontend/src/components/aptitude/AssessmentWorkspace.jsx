import React from 'react';
import {
  BrainCircuit,
  Clock,
  Play,
  Pause,
  Check,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { BlurDrop } from '@/components/ui/BlurDrop';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/aptitudeData';
import { MinimalDiffBadge } from './QuestionRow';
import { AnswerOption } from './AnswerOption';
import { QuestionNavigator } from './QuestionNavigator';

export function AssessmentWorkspace({
  activeTestCategory = 'all',
  questions = [],
  currentIndex = 0,
  userAnswers = {},
  markedForReview = {},
  timerMode = 'standard',
  timeRemaining = 0,
  timeSpentSeconds = 0,
  isTimerPaused = false,
  isSubmitModalOpen = false,
  isSubmitting = false,
  onTogglePause,
  onSelectOption,
  onClearOption,
  onToggleReviewMark,
  onPrevQuestion,
  onNextQuestion,
  onJumpToQuestion,
  onOpenSubmitModal,
  onCloseSubmitModal,
  onConfirmSubmit,
  onExitTest,
}) {
  const currentQ = questions[currentIndex] || {};
  const answeredCount = Object.keys(userAnswers).length;
  const isAnswered = Boolean(userAnswers[currentQ.id]);
  const isFlagged = Boolean(markedForReview[currentQ.id]);
  const isTimerLow = timeRemaining < 120 && timerMode !== 'untimed';
  const progressPct =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] text-[var(--foreground)] font-sans flex flex-col">
      {/* Sticky Assessment Header */}
      <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-3 sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#FFA116] text-white flex items-center justify-center shrink-0">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-xs sm:text-sm text-[var(--foreground)] flex items-center gap-2 truncate">
              <span>Aptitude Assessment</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#D97706] dark:text-[#FFA116] border border-[#FFA116]/30 uppercase">
                {activeTestCategory === 'all' ? 'Mock' : activeTestCategory}
              </span>
            </h2>
            <p className="text-[11px] text-[var(--foreground-secondary)] tabular-nums">
              Completed:{' '}
              <strong className="text-[#16A34A] dark:text-[#3FB950]">
                {answeredCount}
              </strong>{' '}
              of {questions.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {timerMode !== 'untimed' ? (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold tabular-nums ${
                isTimerLow
                  ? 'bg-[#FEF2F2] dark:bg-[#F85149]/15 border-[#DC2626]/30 text-[#DC2626] dark:text-[#F85149] animate-pulse'
                  : 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              <Clock
                className={`w-3.5 h-3.5 ${
                  isTimerLow ? 'text-[#DC2626] dark:text-[#F85149]' : 'text-[#FFA116]'
                }`}
              />
              <span>{formatDuration(timeRemaining)}</span>
              <button
                type="button"
                onClick={onTogglePause}
                title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
                aria-label={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
                className="p-0.5 rounded hover:bg-[var(--surface-hover)] text-[var(--foreground-secondary)] transition cursor-pointer"
              >
                {isTimerPaused ? (
                  <Play className="w-3 h-3" />
                ) : (
                  <Pause className="w-3 h-3" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground-secondary)] text-xs tabular-nums">
              <Clock className="w-3.5 h-3.5 text-[#FFA116]" />
              <span>{formatDuration(timeSpentSeconds)}</span>
            </div>
          )}

          {onExitTest && (
            <Button variant="ghost" size="sm" onClick={onExitTest}>
              Exit
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenSubmitModal}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            Submit Test
          </Button>
        </div>
      </header>

      {/* Main Assessment Layout */}
      <BlurDrop className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Question Area */}
        <div className="lg:col-span-2 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#D97706] dark:text-[#FFA116] bg-[#FFF8EE] dark:bg-[#FFA116]/12 border border-[#FFA116]/30 px-2.5 py-0.5 rounded-md tabular-nums">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                {currentQ.company_tag && currentQ.company_tag !== 'General' && (
                  <span className="text-xs font-medium text-[var(--foreground-secondary)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                    {currentQ.company_tag}
                  </span>
                )}
                <span className="text-xs font-medium text-[var(--foreground-secondary)] bg-[var(--surface-secondary)] px-2.5 py-0.5 rounded-md">
                  {currentQ.subtopic || 'General Aptitude'}
                </span>
                <MinimalDiffBadge difficulty={currentQ.difficulty} />
              </div>

              <button
                type="button"
                onClick={() => onToggleReviewMark?.(currentQ.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  isFlagged
                    ? 'bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#FFA116] border-[#FFA116]/40'
                    : 'bg-[var(--surface)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] border-[var(--border)]'
                }`}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${
                    isFlagged ? 'fill-[#FFA116] text-[#FFA116]' : ''
                  }`}
                />
                <span>{isFlagged ? 'Marked' : 'Mark for Review'}</span>
              </button>
            </div>

            <div className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#FFA116] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="p-5 sm:p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <p className="text-sm sm:text-base font-medium text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                {currentQ.question_text}
              </p>
            </div>

            <div className="space-y-2.5">
              {currentQ.options &&
                Object.entries(currentQ.options).map(([optKey, optValue]) => (
                  <AnswerOption
                    key={optKey}
                    optionKey={optKey}
                    optionText={optValue}
                    isSelected={userAnswers[currentQ.id] === optKey}
                    onSelect={(k) => onSelectOption?.(currentQ.id, k)}
                  />
                ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-4">
            <div>
              {isAnswered && (
                <button
                  type="button"
                  onClick={() => onClearOption?.(currentQ.id)}
                  className="text-xs text-[var(--foreground-secondary)] hover:text-[#DC2626] dark:hover:text-[#F85149] transition underline underline-offset-4 cursor-pointer"
                >
                  Clear Response
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onPrevQuestion}
                disabled={currentIndex === 0}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onNextQuestion}
                iconRight={<ChevronRight className="w-3.5 h-3.5" />}
              >
                {currentIndex === questions.length - 1
                  ? 'Review & Submit'
                  : 'Next'}
              </Button>
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div>
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            markedForReview={markedForReview}
            onJumpTo={onJumpToQuestion}
          />
        </div>
      </BlurDrop>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-5 shadow-2xl">
            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] dark:bg-[#3FB950]/15 text-[#16A34A] dark:text-[#3FB950] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Submit Assessment?
              </h3>
              <p className="text-xs text-[var(--foreground-secondary)]">
                Review your completion summary before submitting.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-center">
              <div>
                <div className="text-base font-bold text-[var(--foreground)] tabular-nums">
                  {questions.length}
                </div>
                <div className="text-[10px] text-[var(--foreground-muted)] uppercase">
                  Total
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-[#16A34A] dark:text-[#3FB950] tabular-nums">
                  {answeredCount}
                </div>
                <div className="text-[10px] text-[var(--foreground-muted)] uppercase">
                  Answered
                </div>
              </div>
              <div>
                <div className="text-base font-bold text-[#DC2626] dark:text-[#F85149] tabular-nums">
                  {questions.length - answeredCount}
                </div>
                <div className="text-[10px] text-[var(--foreground-muted)] uppercase">
                  Unanswered
                </div>
              </div>
            </div>

            {questions.length - answeredCount > 0 && (
              <div className="p-3 rounded-lg bg-[#FFF9E6] dark:bg-[#D29922]/15 border border-[#D97706]/25 text-xs text-[#D97706] dark:text-[#D29922] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  You have {questions.length - answeredCount} unanswered questions remaining.
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-1/2"
                onClick={onCloseSubmitModal}
              >
                Keep Solving
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-1/2"
                onClick={onConfirmSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Evaluating...' : 'Confirm Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

