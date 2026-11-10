import React from 'react';
import { Code2, BookOpen, Target } from 'lucide-react';

export function CompanyProgress({ company }) {
  const dsaSolved = company.dsaSolved || 0;
  const dsaTotal = company.dsaTotal || 0;
  const dsaPct = dsaTotal > 0 ? Math.round((dsaSolved / dsaTotal) * 100) : 0;

  const aptSolved = company.solvedQuestions || 0;
  const aptTotal = company.totalQuestions || 0;
  const aptPct = aptTotal > 0 ? Math.round((aptSolved / aptTotal) * 100) : 0;

  const overallPct = company.combinedProgress || 0;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#FFA116]" />
          <h3 className="text-sm font-bold text-[#262626]">
            Preparation Progress
          </h3>
        </div>
        <span className="text-xs font-bold text-[#FFA116] bg-[#FFF8EE] border border-[#FFA116]/30 px-2.5 py-0.5 rounded-full">
          {overallPct}% Overall
        </span>
      </div>

      {/* Overall Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span>Combined Mastery ({company.combinedSolved} of {company.combinedTotal} solved)</span>
          <span className="font-bold text-[#262626]">{overallPct}%</span>
        </div>
        <div className="w-full h-2 bg-[#F1F3F5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFA116] rounded-full transition-all duration-300"
            style={{ width: `${company.combinedSolved > 0 ? Math.max(4, overallPct) : 0}%` }}
          />
        </div>
      </div>

      {/* Individual Module Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#262626] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#FFA116]" />
              DSA Questions
            </span>
            <span className="font-mono font-bold text-[#262626]">
              {dsaSolved} / {dsaTotal}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFA116] rounded-full transition-all duration-300"
              style={{ width: `${dsaSolved > 0 ? Math.max(4, dsaPct) : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-[#64748B]">{dsaPct}% DSA track solved</p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#262626] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#16A34A]" />
              Aptitude Archive
            </span>
            <span className="font-mono font-bold text-[#262626]">
              {aptSolved} / {aptTotal}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#16A34A] rounded-full transition-all duration-300"
              style={{ width: `${aptSolved > 0 ? Math.max(4, aptPct) : 0}%` }}
            />
          </div>
          <p className="text-[11px] text-[#64748B]">{aptPct}% aptitude archive completed</p>
        </div>
      </div>
    </div>
  );
}

