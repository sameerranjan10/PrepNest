import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Code2 } from 'lucide-react';
import { DifficultyBadge } from '@/components/ui/Badge';

function formatTopics(topics, category) {
  if (Array.isArray(topics)) return topics.slice(0, 2).join(', ') || category || 'Algorithms';
  if (typeof topics === 'string' && topics.trim()) {
    return topics.trim().split(/\s+/).slice(0, 2).join(', ');
  }
  return category || 'Algorithms';
}

const FEATURED_KNOWN_COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'TCS', 'Infosys', 'Wipro', 'Apple', 'Netflix', 'Goldman Sachs', 'Uber', 'Adobe', 'Deloitte', 'Cognizant', 'Capgemini'];

function extractCompanyChips(companies) {
  if (Array.isArray(companies)) return companies.slice(0, 2);
  if (typeof companies === 'string' && companies.trim()) {
    const matched = FEATURED_KNOWN_COMPANIES.filter((c) => companies.includes(c));
    if (matched.length >= 2) return matched.slice(0, 2);
    const tokens = companies.trim().split(/\s+/);
    return (matched.length ? [...matched, ...tokens.filter((t) => !matched.includes(t))] : tokens).slice(0, 2);
  }
  return [];
}

export function RecommendedProblems({
  problems = [],
  totalProblems = 0,
  loading = false,
}) {
  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-3 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-base font-semibold text-[#262626] flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#FFA116]" />
            <span>Recommended Problems</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            High-frequency interview questions curated for placement readiness.
          </p>
        </div>

        <Link
          to="/dsa"
          className="text-xs font-semibold text-[#FFA116] hover:text-[#E68F0F] inline-flex items-center gap-1 shrink-0"
        >
          <span>View all {totalProblems > 0 ? `(${totalProblems})` : ''}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-[#F1F3F5]">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-4 w-40 rounded skeleton-shimmer" />
                <div className="h-5 w-14 rounded-full skeleton-shimmer shrink-0" />
                <div className="h-3.5 w-24 rounded skeleton-shimmer hidden sm:block shrink-0" />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="h-3.5 w-10 rounded skeleton-shimmer hidden md:block" />
                <div className="h-7 w-14 rounded-md skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : problems.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-[#262626]">No problems loaded right now</p>
          <p className="text-xs text-[#64748B] mt-1">
            Open the DSA Directory to browse all problems by company or topic.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                <th className="py-2.5 pl-4 pr-2">Problem</th>
                <th className="py-2.5 px-2.5">Difficulty</th>
                <th className="py-2.5 px-2.5 hidden sm:table-cell">Topic</th>
                <th className="py-2.5 px-2.5 hidden md:table-cell text-right">Accept</th>
                <th className="py-2.5 px-2.5 hidden xl:table-cell">Companies</th>
                <th className="py-2.5 pl-2 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F3F5] text-sm">
              {problems.map((prob) => {
                const topicLabel = formatTopics(prob.topics, prob.category);
                const acceptance = prob.acceptance_rate ?? prob.acceptanceRate ?? 0;
                const companyList = extractCompanyChips(prob.companies);
                const isSolved = Boolean(prob.is_solved ?? prob.solved);

                return (
                  <tr
                    key={prob.id}
                    className="hover:bg-[#F7F8FA]/80 transition-colors"
                  >
                    <td className="py-3 pl-4 pr-2 font-medium text-[#262626] max-w-[190px]">
                      <Link
                        to={`/dsa?search=${encodeURIComponent(prob.title)}`}
                        className="hover:text-[#FFA116] transition-colors flex items-center gap-1.5 min-w-0"
                      >
                        {isSolved && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A] shrink-0" title="Solved" />
                        )}
                        <span className="truncate">{prob.title}</span>
                      </Link>
                    </td>

                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <DifficultyBadge difficulty={prob.difficulty} size="xs" />
                    </td>

                    <td className="py-3 px-2.5 text-xs text-[#64748B] hidden sm:table-cell max-w-[130px] truncate">
                      {topicLabel}
                    </td>

                    <td className="py-3 px-2.5 text-xs text-[#64748B] hidden md:table-cell text-right tabular-nums whitespace-nowrap">
                      {acceptance}%
                    </td>

                    <td className="py-3 px-2.5 hidden xl:table-cell whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {companyList.length > 0 ? (
                          companyList.map((comp, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-[#F7F8FA] text-[#64748B] px-1.5 py-0.5 rounded border border-[#E5E7EB] max-w-[78px] truncate"
                            >
                              {comp}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#94A3B8]">—</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 pl-2 pr-4 text-right whitespace-nowrap">
                      <Link
                        to={`/dsa?search=${encodeURIComponent(prob.title)}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] hover:border-[#FFA116] hover:text-[#FFA116] text-[#262626] transition-colors"
                      >
                        Solve
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
