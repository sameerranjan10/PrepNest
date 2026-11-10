import React from 'react';
import { ArrowRight, ArrowUpDown, Bookmark } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { Badge } from '@/components/ui/Badge';

export function CompanyTable({
  companies,
  bookmarkedSet,
  onToggleBookmark,
  onExplore,
  sortBy,
  onSortChange
}) {
  const toggleNameSort = () => {
    onSortChange(sortBy === 'name_asc' ? 'name_desc' : 'name_asc');
  };

  const toggleQuestionsSort = () => {
    onSortChange('questions_desc');
  };

  const toggleProgressSort = () => {
    onSortChange('progress_desc');
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl overflow-hidden shadow-2xs">
      {/* Mobile / Narrow Tablet Card List */}
      <div className="md:hidden divide-y divide-[#F1F3F5]">
        {companies.map((company) => {
          const isBookmarked = bookmarkedSet.has(company.name);
          const diffVariant =
            company.hiringDifficulty === 'Extreme'
              ? 'hard'
              : company.hiringDifficulty === 'Hard'
              ? 'medium'
              : 'easy';

          return (
            <div
              key={company.id || company.name}
              onClick={() => onExplore(company)}
              className="p-4 space-y-3 hover:bg-[#F7F8FA] transition cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <CompanyLogo
                    companyName={company.name}
                    logo={company.logo}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#262626] truncate">
                      {company.name}
                    </h3>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {company.category} · {company.role || 'Software Engineer'}
                    </p>
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
                    aria-label={`Bookmark ${company.name}`}
                    className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#FFA116] transition cursor-pointer"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isBookmarked ? 'fill-[#FFA116] text-[#FFA116]' : ''}`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#F7F8FA] rounded-lg p-2.5 border border-[#E5E7EB]/60">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#64748B] block">DSA</span>
                  <span className="font-mono font-semibold text-[#262626]">
                    <span className="text-[#FFA116]">{(company.dsaSolved || 0).toLocaleString()}</span>
                    <span className="text-[#94A3B8]"> / {(company.dsaTotal || 0).toLocaleString()}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#64748B] block">Aptitude</span>
                  <span className="font-mono font-semibold text-[#262626]">
                    <span className="text-[#16A34A]">{(company.solvedQuestions || 0).toLocaleString()}</span>
                    <span className="text-[#94A3B8]"> / {(company.totalQuestions || 0).toLocaleString()}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFA116] rounded-full transition-all duration-300"
                      style={{
                        width: `${company.combinedSolved > 0 ? Math.max(4, company.combinedProgress) : 0}%`
                      }}
                    />
                  </div>
                  <span className="font-bold text-xs text-[#262626] shrink-0">
                    {company.combinedProgress}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onExplore(company);
                  }}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 min-h-[40px] rounded-lg bg-[#FFF8EE] hover:bg-[#FFA116] text-[#FFA116] hover:text-white border border-[#FFA116]/30 text-xs font-semibold transition shrink-0 cursor-pointer"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={toggleNameSort}
                  className="inline-flex items-center gap-1 hover:text-[#262626] transition"
                >
                  <span>Company</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Job Roles</th>
              <th className="py-3 px-4">Difficulty</th>
              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={toggleQuestionsSort}
                  className="inline-flex items-center gap-1 hover:text-[#262626] transition"
                >
                  <span>DSA Questions</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4">Aptitude Questions</th>
              <th className="py-3 px-4">
                <button
                  type="button"
                  onClick={toggleProgressSort}
                  className="inline-flex items-center gap-1 hover:text-[#262626] transition"
                >
                  <span>Preparation Progress</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F3F5] text-xs">
            {companies.map((company) => {
              const isBookmarked = bookmarkedSet.has(company.name);
              const diffVariant =
                company.hiringDifficulty === 'Extreme'
                  ? 'hard'
                  : company.hiringDifficulty === 'Hard'
                  ? 'medium'
                  : 'easy';

              return (
                <tr
                  key={company.id || company.name}
                  onClick={() => onExplore(company)}
                  className="hover:bg-[#F7F8FA] transition cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        companyName={company.name}
                        logo={company.logo}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#262626] group-hover:text-[#FFA116] transition">
                            {company.name}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleBookmark(company.name);
                            }}
                            aria-label={`Bookmark ${company.name}`}
                            className="p-0.5 text-[#94A3B8] hover:text-[#FFA116] transition"
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#FFA116] text-[#FFA116]' : ''}`}
                            />
                          </button>
                        </div>
                        <span className="text-[11px] text-[#64748B]">{company.category}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-[#262626] max-w-[220px] truncate" title={company.role}>
                    {company.role || 'Software Engineer'}
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={diffVariant} size="xs">
                      {company.hiringDifficulty}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-[#262626]">
                    <span className="text-[#FFA116]">{(company.dsaSolved || 0).toLocaleString()}</span>
                    <span className="text-[#94A3B8]"> / {(company.dsaTotal || 0).toLocaleString()}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-[#262626]">
                    <span className="text-[#16A34A]">{(company.solvedQuestions || 0).toLocaleString()}</span>
                    <span className="text-[#94A3B8]"> / {(company.totalQuestions || 0).toLocaleString()}</span>
                  </td>

                  <td className="py-3.5 px-4 min-w-[160px]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FFA116] rounded-full transition-all duration-300"
                          style={{
                            width: `${company.combinedSolved > 0 ? Math.max(4, company.combinedProgress) : 0}%`
                          }}
                        />
                      </div>
                      <span className="font-bold text-[#262626] w-9 text-right">
                        {company.combinedProgress}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExplore(company);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFF8EE] hover:bg-[#FFA116] text-[#FFA116] hover:text-white border border-[#FFA116]/30 text-xs font-semibold transition"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

