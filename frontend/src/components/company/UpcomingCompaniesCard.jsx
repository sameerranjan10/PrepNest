import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Bot, Code2, ArrowRight } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';

export function UpcomingCompaniesCard({ itemCount, upcomingCompanies = [] }) {
  const navigate = useNavigate();
  const upcomingBrands = upcomingCompanies.map((c) => (typeof c === 'string' ? c : c.name)).filter(Boolean);

  if (upcomingBrands.length === 0) {
    return null;
  }

  // Compute exact column spans for 2-col tablet (md) and 3-col desktop (lg)
  const mdRemainder = itemCount % 2;
  const lgRemainder = itemCount % 3;

  const mdSpanClass = mdRemainder === 1 ? 'md:col-span-1' : 'md:col-span-2';
  const lgSpanClass =
    lgRemainder === 1
      ? 'lg:col-span-2'
      : lgRemainder === 2
      ? 'lg:col-span-1'
      : 'lg:col-span-3';

  const isWideOnDesktop = lgRemainder !== 2;

  return (
    <div
      className={`bg-[#FFFFFF] border border-dashed border-[#CBD5E1] rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-5 ${mdSpanClass} ${lgSpanClass}`}
    >
      <div className={`flex flex-col ${isWideOnDesktop ? 'lg:flex-row lg:items-start justify-between gap-6' : 'gap-4'}`}>
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF8EE] border border-[#FFA116]/30 text-[#FFA116] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Stay Tuned</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#262626] tracking-tight">
            More Companies Coming Soon
          </h3>

          <p className="text-xs text-[#64748B] leading-relaxed">
            We are actively curating verified Online Assessment archives, coding rounds, and interview experiences for upcoming drives. In the meantime, practice tagged DSA problems or generate custom company prep with AI Mentor.
          </p>
        </div>

        {/* Upcoming Brand Chips */}
        <div className={`space-y-2 ${isWideOnDesktop ? 'lg:w-72 shrink-0' : ''}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Next in Pipeline
          </p>
          <div className="flex flex-wrap gap-2">
            {upcomingBrands.slice(0, lgRemainder === 2 ? 4 : 8).map((brand) => (
              <div
                key={brand}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] text-[11px] font-medium text-[#262626]"
              >
                <CompanyLogo companyName={brand} size="xs" />
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Helpful Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#F1F3F5]">
        <span className="text-[11px] text-[#64748B]">
          New company tracks are rolled out weekly based on campus placement schedules.
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/dsa')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F8FA] hover:bg-[#F1F3F5] border border-[#E5E7EB] text-xs font-semibold text-[#262626] transition"
          >
            <Code2 className="w-3.5 h-3.5 text-[#FFA116]" />
            <span>Browse Full DSA</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/ai-assistant')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF8EE] hover:bg-[#FFA116] border border-[#FFA116]/30 hover:border-[#FFA116] text-xs font-semibold text-[#FFA116] hover:text-white transition"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Prep with AI Mentor</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

