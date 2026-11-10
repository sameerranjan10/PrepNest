import React from 'react';
import { Building2, Layers, Code2, BookOpen } from 'lucide-react';

export function CompanyStatistics({
  totalCompanies,
  totalQuestions,
  totalDsa,
  totalAptitude
}) {
  const stats = [
    {
      label: 'Total Companies',
      value: totalCompanies,
      sub: 'Active hiring tracks',
      icon: Building2,
      iconClass: 'text-[#FFA116] bg-[#FFF8EE]'
    },
    {
      label: 'Total Questions',
      value: totalQuestions.toLocaleString(),
      sub: 'Combined archives',
      icon: Layers,
      iconClass: 'text-[#262626] bg-[#F1F3F5]'
    },
    {
      label: 'DSA Problems',
      value: totalDsa.toLocaleString(),
      sub: 'Company-tagged coding',
      icon: Code2,
      iconClass: 'text-[#FFA116] bg-[#FFF8EE]'
    },
    {
      label: 'Aptitude Archives',
      value: totalAptitude.toLocaleString(),
      sub: 'Timed OA questions',
      icon: BookOpen,
      iconClass: 'text-[#16A34A] bg-[#E6FAF6]'
    }
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E7EB] shadow-2xs overflow-hidden">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`px-4 py-3.5 flex items-center gap-3 ${
              idx % 2 === 1 ? 'border-l lg:border-l-0 border-[#E5E7EB]' : ''
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stat.iconClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#64748B] truncate">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#262626] tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[10px] text-[#94A3B8] hidden xl:inline truncate">
                  {stat.sub}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
