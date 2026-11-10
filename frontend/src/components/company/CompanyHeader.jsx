import React from 'react';
import { Briefcase } from 'lucide-react';
import { CompanySearch } from './CompanySearch';
import { CompanyStatistics } from './CompanyStatistics';

export function CompanyHeader({
  searchQuery,
  onSearchChange,
  stats
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#FFA116]">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Recruitment Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#262626] tracking-tight leading-tight">
            Company Preparation Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Explore company-specific placement resources, interview experiences and preparation tracks.
          </p>
        </div>

        <CompanySearch
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full lg:w-80 xl:w-96 shrink-0"
        />
      </div>

      <CompanyStatistics
        totalCompanies={stats.totalCompanies}
        totalQuestions={stats.totalQuestions}
        totalDsa={stats.totalDsa}
        totalAptitude={stats.totalAptitude}
      />
    </section>
  );
}
