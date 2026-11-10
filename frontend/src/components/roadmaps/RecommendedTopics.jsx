import React from 'react';
import { Sparkles, Clock, ArrowRight, Compass } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getDifficultyBadgeVariant, normalizeTrackDifficulty } from './roadmapHelpers';

export function RecommendedTopics({
  recommendations = [],
  hasResumeScan = false,
  targetRole = null,
  targetCompany = null,
  topicsByDomain = {},
  onStartTopic,
}) {
  const findTopicHours = (domainId, topicId) => {
    const list = topicsByDomain?.[domainId] || [];
    const match = list.find((t) => Number(t.id) === Number(topicId));
    return match?.estimated_hours || null;
  };

  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/25 flex items-center justify-center text-[#FFA116] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#262626]">
              Recommended Next Steps
            </h2>
            <p className="text-xs text-[#64748B]">
              {hasResumeScan
                ? `Tailored from your resume scan${targetRole ? ` for ${targetRole}` : ''}${targetCompany ? ` (${targetCompany})` : ''}`
                : targetRole
                ? `Prioritised for your target role: ${targetRole}`
                : 'High-impact foundational topics based on your curriculum progress'}
            </p>
          </div>
        </div>

        {hasResumeScan && (
          <Badge variant="accent" size="sm">
            Resume-Aligned
          </Badge>
        )}
      </div>

      {recommendations.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#64748B] mb-2.5">
            <Compass className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-[#262626]">No recommendations right now</p>
          <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
            Complete a resume scan or begin a learning track below to receive personalised topic recommendations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
          {recommendations.slice(0, 3).map((rec) => {
            const hours = findTopicHours(rec.domain_id, rec.topic_id);
            return (
              <div
                key={`${rec.domain_id}-${rec.topic_id}`}
                className="border border-[#E5E7EB] bg-[#F7F8FA]/50 hover:bg-[#FFFFFF] hover:border-[#FFA116]/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B] truncate">
                      {rec.domain_name}
                    </span>
                    <Badge
                      variant={getDifficultyBadgeVariant(rec.difficulty)}
                      size="xs"
                    >
                      {normalizeTrackDifficulty(rec.difficulty)}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-semibold text-[#262626] leading-snug">
                    {rec.title}
                  </h3>

                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                    {rec.reason}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E7EB]/80">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                    {hours ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>~{hours}h</span>
                      </>
                    ) : rec.matched_skill ? (
                      <span className="truncate max-w-[120px]">{rec.matched_skill}</span>
                    ) : null}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStartTopic?.(rec.domain_id, rec.topic_id)}
                    iconRight={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Start Learning
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

