import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { CompanyLogo } from '@/components/company/CompanyLogo';

export function TargetCompanies({ companies = [], targetCompany = null }) {
  // Prioritize user's configured target company first if present
  const sorted = [...companies].sort((a, b) => {
    if (!targetCompany) return 0;
    const tc = targetCompany.toLowerCase();
    const aMatch = (a.name || '').toLowerCase() === tc ? -1 : 0;
    const bMatch = (b.name || '').toLowerCase() === tc ? -1 : 0;
    return aMatch - bMatch;
  });

  const displayList = sorted.slice(0, 4);

  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-2 border-b border-[#E5E7EB]">
        <h2 className="text-base font-semibold text-[#262626] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#FFA116]" />
          <span>Target Companies</span>
        </h2>
        <Link
          to="/company-prep"
          className="text-xs font-semibold text-[#FFA116] hover:text-[#E68F0F] inline-flex items-center gap-1"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {displayList.length === 0 ? (
        <div className="p-6 text-center text-xs text-[#64748B]">
          No company tracks loaded yet.
        </div>
      ) : (
        <div className="divide-y divide-[#F1F3F5]">
          {displayList.map((company) => {
            const total =
              Number(company.totalQuestions || 0) + Number(company.dsaTotal || 0);
            const solved =
              Number(company.solvedQuestions || 0) + Number(company.dsaSolved || 0);
            const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;

            return (
              <Link
                key={company.id || company.name}
                to={`/company-prep?company=${encodeURIComponent(company.name)}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#F7F8FA]/80 transition-colors group"
              >
                <CompanyLogo
                  companyName={company.name}
                  logo={company.logo}
                  size="sm"
                />

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-[#262626] group-hover:text-[#FFA116] transition-colors truncate">
                        {company.name}
                      </h3>
                      <p className="text-[11px] text-[#64748B] truncate">
                        {company.role || 'Software Engineer'}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#262626] tabular-nums shrink-0">
                      {solved}/{total}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-[#F1F3F5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#FFA116] transition-all duration-300"
                      style={{ width: `${Math.max(solved > 0 ? 6 : 0, pct)}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
