import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ContinueLearningButton } from './ContinueLearningButton';
import { LearningStatistics } from './LearningStatistics';
import { Button } from '@/components/ui/Button';

export function LearningHeader({
  overall,
  totalTracks,
  completedTracks,
  hoursSummary,
  totalWeeks,
  continueTarget,
  onContinueLearning,
  onResetProgress,
  resetting = false,
}) {
  const hasStartedAny = Number(overall?.completed_topics || 0) > 0;

  return (
    <section className="space-y-5">
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#FFA116]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Structured Placement Curriculum
              </span>
            </div>
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#262626] tracking-tight">
              Learning Centre
            </h1>
            <p className="text-sm text-[#64748B]">
              Your personalised roadmap to becoming placement-ready.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {hasStartedAny && (
              <Button
                variant="ghost"
                size="md"
                onClick={onResetProgress}
                loading={resetting}
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs text-[#64748B] hover:text-[#DC2626]"
                title="Reset all roadmap progress"
              >
                Reset
              </Button>
            )}
            <ContinueLearningButton
              onClick={onContinueLearning}
              disabled={!continueTarget}
              label={hasStartedAny ? 'Continue Learning' : 'Start Learning'}
              sublabel={continueTarget?.topicTitle || continueTarget?.domainName}
            />
          </div>
        </div>
      </div>

      <LearningStatistics
        overall={overall}
        totalTracks={totalTracks}
        completedTracks={completedTracks}
        hoursSummary={hoursSummary}
        totalWeeks={totalWeeks}
      />
    </section>
  );
}

