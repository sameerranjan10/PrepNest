import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Map, Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function ContinueLearning({
  domains = [],
  overall = { total_topics: 0, completed_topics: 0, progress_percentage: 0 },
  recommendations = [],
  recentAccess = null,
}) {
  // Determine best incomplete track: recentAccess first, then first In Progress, then first incomplete, then first domain
  const activeDomain =
    (recentAccess?.domainId &&
      domains.find(
        (d) =>
          String(d.id) === String(recentAccess.domainId) &&
          Number(d.completed_topics) < Number(d.total_topics)
      )) ||
    domains.find(
      (d) =>
        Number(d.completed_topics) > 0 &&
        Number(d.completed_topics) < Number(d.total_topics)
    ) ||
    domains.find((d) => Number(d.completed_topics) < Number(d.total_topics)) ||
    domains[0] ||
    null;

  const matchingRecommendation = recommendations.find((r) =>
    activeDomain ? String(r.domain_id) === String(activeDomain.id) : true
  );

  const hasActivity = Number(overall?.completed_topics || 0) > 0;

  if (!activeDomain) {
    return (
      <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 text-[#FFA116] flex items-center justify-center shrink-0">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#262626]">Continue Learning</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Start a structured placement roadmap to track sequential topic milestones.
            </p>
          </div>
        </div>
        <Link to="/roadmaps">
          <Button variant="primary" size="md" iconRight={<ArrowRight className="w-4 h-4" />}>
            Start Learning
          </Button>
        </Link>
      </section>
    );
  }

  const pct = Number(activeDomain.progress_percentage || 0);
  const targetUrl =
    recentAccess?.topicId && String(recentAccess.domainId) === String(activeDomain.id)
      ? `/roadmaps?track=${encodeURIComponent(activeDomain.id)}&topic=${encodeURIComponent(recentAccess.topicId)}`
      : matchingRecommendation?.topic_id &&
        String(matchingRecommendation.domain_id) === String(activeDomain.id)
      ? `/roadmaps?track=${encodeURIComponent(activeDomain.id)}&topic=${encodeURIComponent(matchingRecommendation.topic_id)}`
      : `/roadmaps?track=${encodeURIComponent(activeDomain.id)}`;

  const topicHeadline =
    matchingRecommendation?.title ||
    (hasActivity
      ? `${activeDomain.completed_topics} of ${activeDomain.total_topics} milestones completed`
      : 'Begin with Topic 01 in this structured curriculum');

  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 text-[#FFA116] flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                {hasActivity ? 'Continue Learning' : 'Recommended Starting Track'}
              </span>
              {activeDomain.difficulty && (
                <Badge variant="accent" size="xs">
                  {activeDomain.difficulty}
                </Badge>
              )}
              {recentAccess?.domainId &&
                String(recentAccess.domainId) === String(activeDomain.id) && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B]">
                    <Clock className="w-3 h-3" />
                    Recently accessed
                  </span>
                )}
            </div>

            <h2 className="text-base font-bold text-[#262626] truncate">
              {activeDomain.name}
            </h2>
            <p className="text-xs text-[#64748B] truncate">{topicHeadline}</p>
          </div>
        </div>

        <Link to={targetUrl} className="shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            {hasActivity ? 'Continue Learning' : 'Start Learning'}
          </Button>
        </Link>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-[#F1F3F5]">
        <div className="flex items-center justify-between text-xs tabular-nums">
          <span className="text-[#64748B]">
            Track Progress ({activeDomain.completed_topics}/{activeDomain.total_topics} topics ·{' '}
            {activeDomain.estimated_weeks})
          </span>
          <span className="font-bold text-[#262626]">{pct}%</span>
        </div>
        <div className="h-1.5 w-full bg-[#F1F3F5] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              pct >= 100 ? 'bg-[#16A34A]' : 'bg-[#FFA116]'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          />
        </div>
      </div>
    </section>
  );
}

