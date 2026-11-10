import React from 'react';
import { ArrowUpRight, Minus } from 'lucide-react';

function getReadinessCategory(score) {
  if (score >= 80) return 'Top Tier Candidate';
  if (score >= 60) return 'Interview Ready';
  if (score >= 35) return 'Building Momentum';
  return 'Early Preparation';
}

export function PlacementReadiness({
  readiness = 0,
  weeklyDelta = 0,
  categoryLabel = null,
}) {
  const safeScore = Math.min(100, Math.max(0, Math.round(Number(readiness) || 0)));
  const radius = 26;
  const circumference = 2 * Math.PI * radius; // ~163.36
  const strokeDashoffset = circumference * (1 - safeScore / 100);
  const category = categoryLabel || getReadinessCategory(safeScore);

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-[#F7F8FA]/80 backdrop-blur-sm rounded-xl border border-[#E5E7EB] shrink-0 self-start md:self-auto">
      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={safeScore >= 80 ? '#16A34A' : '#FFA116'}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute font-bold text-sm text-[#262626] tabular-nums">
          {safeScore}%
        </span>
      </div>

      <div className="min-w-0">
        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block">
          Placement Readiness
        </span>
        <span className="text-sm font-bold text-[#262626] block truncate">
          {category}
        </span>
        {Number(weeklyDelta) > 0 ? (
          <span className="text-xs text-[#16A34A] font-semibold inline-flex items-center gap-0.5 mt-0.5 tabular-nums">
            <ArrowUpRight className="w-3.5 h-3.5" />+{weeklyDelta}% this week
          </span>
        ) : (
          <span className="text-xs text-[#64748B] font-medium inline-flex items-center gap-1 mt-0.5">
            <Minus className="w-3 h-3" />
            <span>Live readiness score</span>
          </span>
        )}
      </div>
    </div>
  );
}

