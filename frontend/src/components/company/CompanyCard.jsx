import React from 'react';
import { Bookmark, ArrowRight } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { Badge } from '@/components/ui/Badge';

export function CompanyCard({
  company,
  isBookmarked,
  onToggleBookmark,
  onExplore
}) {
  const diffVariant =
    company.hiringDifficulty === 'Extreme'
      ? 'hard'
      : company.hiringDifficulty === 'Hard'
      ? 'medium'
      : 'easy';

  return (
    <div
      onClick={() => onExplore(company)}
      className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/60 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all duration-150 shadow-2xs hover:shadow-sm cursor-pointer group"
    >
      {/* TOP: Logo, Name, Category, Difficulty, Bookmark */}
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo
              companyName={company.name}
              logo={company.logo}
              size="md"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#262626] group-hover:text-[#FFA116] transition-colors truncate">
                  {company.name}
                </h3>
              </div>
              <span className="text-[11px] font-medium text-[#64748B] block truncate">
                {company.category} · {company.assessmentType}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={diffVariant} size="xs">
              {company.hiringDifficulty}
            </Badge>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(company.name);
              }}
              aria-label={isBookmarked ? `Remove ${company.name} bookmark` : `Bookmark ${company.name}`}
              title={isBookmarked ? 'Saved' : 'Save company'}
              className={`p-1.5 rounded-lg border transition ${
                isBookmarked
                  ? 'bg-[#FFF8EE] border-[#FFA116]/40 text-[#FFA116]'
                  : 'bg-[#FFFFFF] border-transparent hover:border-[#E5E7EB] text-[#94A3B8] hover:text-[#262626] hover:bg-[#F7F8FA]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#FFA116]' : ''}`} />
            </button>
          </div>
        </div>

        {/* MIDDLE: Role & Assessment Summary */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#262626] truncate" title={company.role}>
            {company.role || 'Software Engineer'}
          </p>
          <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
            {company.testPattern || 'Online Assessment & Technical Interviews'}
          </p>
        </div>

        {/* Clean 3-column inline metrics strip */}
        <div className="grid grid-cols-3 divide-x divide-[#E5E7EB] py-2 border-y border-[#F1F3F5] text-center">
          <div className="px-1">
            <p className="text-xs font-bold text-[#262626] font-mono">
              {(company.dsaTotal || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5">DSA</p>
          </div>
          <div className="px-1">
            <p className="text-xs font-bold text-[#262626] font-mono">
              {(company.totalQuestions || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5">Aptitude</p>
          </div>
          <div className="px-1">
            <p className="text-xs font-bold text-[#262626] font-mono">
              {company.roundsCount || 3}
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5">Rounds</p>
          </div>
        </div>
      </div>

      {/* BOTTOM: Preparation Progress & Subtle Explore CTA */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#64748B]">
              Preparation Progress
            </span>
            <span className="font-semibold text-[#262626]">
              {company.combinedProgress}%
              <span className="text-[#94A3B8] font-normal ml-1">
                ({company.combinedSolved}/{company.combinedTotal})
              </span>
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FFA116] rounded-full transition-all duration-300"
              style={{
                width: `${company.combinedSolved > 0 ? Math.max(4, company.combinedProgress) : 0}%`
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExplore(company);
          }}
          className="w-full py-2 px-3 rounded-lg bg-[#F7F8FA] group-hover:bg-[#FFA116] text-[#262626] group-hover:text-white border border-[#E5E7EB] group-hover:border-[#FFA116] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <span>Explore Company</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
