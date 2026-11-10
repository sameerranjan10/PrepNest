import React from 'react';
import { BarChart3 } from 'lucide-react';

export function PreparationProgress({
  dsaScore = 0,
  aptitudeScore = 0,
  resumeScore = 0,
  interviewScore = 0,
}) {
  const items = [
    {
      label: 'DSA Preparation',
      value: Math.min(100, Math.max(0, Math.round(Number(dsaScore) || 0))),
      color: 'bg-[#16A34A] dark:bg-[#3FB950]',
    },
    {
      label: 'Aptitude Preparation',
      value: Math.min(100, Math.max(0, Math.round(Number(aptitudeScore) || 0))),
      color: 'bg-[#D97706] dark:bg-[#D29922]',
    },
    {
      label: 'Resume Readiness',
      value: Math.min(100, Math.max(0, Math.round(Number(resumeScore) || 0))),
      color: 'bg-[#FFA116]',
    },
    {
      label: 'Interview Preparation',
      value: Math.min(100, Math.max(0, Math.round(Number(interviewScore) || 0))),
      color: 'bg-[#2563EB] dark:bg-[#58A6FF]',
    },
  ];

  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
        <h2 className="text-base font-semibold text-[#262626] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#FFA116]" />
          <span>Placement Preparation</span>
        </h2>
        <span className="text-[11px] font-medium text-[#64748B]">By pillar</span>
      </div>

      <div className="space-y-3.5">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#262626]">{item.label}</span>
              <span className="font-semibold text-[#262626] tabular-nums">{item.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#F1F3F5] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${item.color}`}
                style={{ width: `${Math.max(item.value > 0 ? 4 : 0, item.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

