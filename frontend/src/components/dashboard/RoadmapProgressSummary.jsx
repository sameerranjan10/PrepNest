import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Map } from 'lucide-react';

export function RoadmapProgressSummary({ domains = [], overall = {} }) {
  if (!domains.length) return null;

  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-base font-semibold text-[#262626] flex items-center gap-2">
            <Map className="w-4 h-4 text-[#FFA116]" />
            <span>Learning Track Progress</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            {overall.completed_topics || 0} of {overall.total_topics || 0} roadmap milestones completed ({overall.progress_percentage || 0}%)
          </p>
        </div>

        <Link
          to="/roadmaps"
          className="text-xs font-semibold text-[#FFA116] hover:text-[#E68F0F] inline-flex items-center gap-1 shrink-0"
        >
          <span>Open Roadmaps</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {domains.slice(0, 6).map((domain) => {
          const pct = Number(domain.progress_percentage || 0);
          const done = Number(domain.completed_topics || 0);
          const total = Number(domain.total_topics || 0);
          const isComplete = total > 0 && done >= total;

          return (
            <Link
              key={domain.id}
              to={`/roadmaps?track=${encodeURIComponent(domain.id)}`}
              className="group space-y-1.5 rounded-lg p-2 -m-2 hover:bg-[#F7F8FA]/80 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium text-[#262626] group-hover:text-[#FFA116] transition-colors truncate inline-flex items-center gap-1.5">
                  {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
                  <span className="truncate">{domain.name}</span>
                </span>
                <span className="text-[#64748B] font-semibold tabular-nums shrink-0">
                  {done}/{total}
                </span>
              </div>

              <div className="h-1.5 w-full bg-[#F1F3F5] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isComplete ? 'bg-[#16A34A]' : 'bg-[#FFA116]'
                  }`}
                  style={{ width: `${Math.max(done > 0 ? 4 : 0, Math.min(100, pct))}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

