import React, { useMemo } from 'react';
import { ArrowRight, Flame, Code2, BookOpen } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { Badge } from '@/components/ui/Badge';

const PRIORITY_FEATURED = ['google', 'microsoft', 'amazon', 'tcs'];

export function FeaturedCompanies({ companies, onSelectCompany }) {
  const featured = useMemo(() => {
    if (!companies || companies.length === 0) return [];

    const byName = new Map(companies.map((c) => [c.name.toLowerCase(), c]));
    const picked = [];

    PRIORITY_FEATURED.forEach((key) => {
      const found = byName.get(key);
      if (found) picked.push(found);
    });

    if (picked.length < 4) {
      companies.forEach((c) => {
        if (picked.length < 4 && !picked.some((p) => p.name === c.name)) {
          picked.push(c);
        }
      });
    }

    return picked;
  }, [companies]);

  if (featured.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#FFA116]" />
          <h2 className="text-sm font-bold text-[#262626] tracking-tight">
            Featured Tracks
          </h2>
          <span className="text-[11px] font-medium text-[#64748B] bg-[#FFFFFF] border border-[#E5E7EB] px-2 py-0.5 rounded-full">
            Popular Drives
          </span>
        </div>
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-1 scrollbar-thin">
        {featured.map((company) => {
          const diffVariant =
            company.hiringDifficulty === 'Extreme'
              ? 'hard'
              : company.hiringDifficulty === 'Hard'
              ? 'medium'
              : 'easy';

          return (
            <div
              key={company.id || company.name}
              onClick={() => onSelectCompany(company)}
              className="min-w-[260px] flex-1 bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116] rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer transition-all duration-150 shadow-2xs hover:shadow-sm group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <CompanyLogo
                    companyName={company.name}
                    logo={company.logo}
                    size="md"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#262626] group-hover:text-[#FFA116] transition-colors truncate">
                      {company.name}
                    </h3>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {company.role}
                    </p>
                  </div>
                </div>

                <Badge variant={diffVariant} size="xs">
                  {company.hiringDifficulty}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-[#F1F3F5] text-[11px]">
                <div className="flex items-center gap-3 text-[#64748B]">
                  <span className="inline-flex items-center gap-1">
                    <Code2 className="w-3 h-3 text-[#FFA116]" />
                    <strong className="text-[#262626] font-semibold">
                      {(company.dsaTotal || 0).toLocaleString()}
                    </strong>
                    <span>DSA</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#16A34A]" />
                    <strong className="text-[#262626] font-semibold">
                      {(company.totalQuestions || 0).toLocaleString()}
                    </strong>
                    <span>OA</span>
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 font-semibold text-[#FFA116] group-hover:translate-x-0.5 transition-transform">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
