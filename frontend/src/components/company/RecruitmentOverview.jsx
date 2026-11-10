import React from 'react';
import { Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export function RecruitmentOverview({ company }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FFA116]" />
          <h3 className="text-sm font-bold text-[#262626]">
            Recruitment Overview & OA Pattern
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-[#64748B] bg-[#F7F8FA] border border-[#E5E7EB] px-2.5 py-0.5 rounded-full">
          {company.roundsCount || 3} Stages
        </span>
      </div>

      {/* Assessment Pattern */}
      <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
          Assessment Pattern ({company.assessmentType})
        </span>
        <p className="text-xs text-[#262626] leading-relaxed font-mono">
          {company.testPattern || 'Online Assessment covering Quantitative, Logical, Verbal & Coding tasks.'}
        </p>
      </div>

      {/* Interview Stages */}
      {company.stages && company.stages.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
            Hiring Rounds Breakdown
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {company.stages.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-[#FFF8EE] border border-[#FFA116]/30 text-[#FFA116] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#262626] truncate">{item.stage}</p>
                  <p className="text-[11px] text-[#64748B] leading-snug mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Syllabus Sections */}
      {company.sections && company.sections.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#F1F3F5]">
          <span className="text-[11px] font-semibold text-[#64748B] inline-flex items-center gap-1 mr-1">
            <Layers className="w-3 h-3" /> Key Topics:
          </span>
          {company.sections.map((sec, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-md bg-[#F7F8FA] border border-[#E5E7EB] text-[#262626] font-medium"
            >
              <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
              {sec}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

