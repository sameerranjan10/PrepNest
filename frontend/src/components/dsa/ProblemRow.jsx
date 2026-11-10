import React, { useState } from 'react';
import { CheckCircle2, Circle, Star, ExternalLink } from 'lucide-react';
import { DifficultyBadge } from './DifficultyBadge';
import { CompanyTags } from './CompanyTags';

function TopicTags({ topics = [], onSelectTopic }) {
  const [expanded, setExpanded] = useState(false);

  if (!Array.isArray(topics) || topics.length === 0) {
    return <span className="text-[var(--foreground-muted)]">—</span>;
  }

  const visible = expanded ? topics : topics.slice(0, 2);
  const overflow = topics.slice(2);

  return (
    <div className="inline-flex flex-wrap items-center gap-1 max-w-[220px]">
      {visible.map((topic) => (
        <button
          key={topic}
          type="button"
          onClick={() => onSelectTopic?.(topic)}
          title={`Filter by ${topic}`}
          className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition max-w-[104px] truncate cursor-pointer"
        >
          {topic}
        </button>
      ))}

      {overflow.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          title={
            expanded
              ? 'Show fewer topics'
              : `More topics: ${overflow.join(', ')}`
          }
          aria-label={
            expanded
              ? 'Collapse extra topics'
              : `Show ${overflow.length} more topics`
          }
          className="px-1 text-[11px] font-medium text-[var(--foreground-muted)] hover:text-[#FFA116] transition cursor-pointer tabular-nums"
        >
          {expanded ? 'Less' : `+${overflow.length}`}
        </button>
      )}
    </div>
  );
}

export function ProblemRow({
  problem,
  onToggleSolved,
  onToggleStar,
  onOpenProblem,
  onSelectTopic,
  onSelectCompany,
}) {
  const isSolved = Boolean(problem.is_solved);
  const isStarred = Boolean(problem.is_bookmarked);
  const acceptance = problem.acceptance_rate ?? problem.acceptanceRate ?? 50;

  return (
    <tr className="group hover:bg-[var(--surface-hover)]/55 transition-colors">
      {/* 1. Status */}
      <td className="py-2.5 pl-4 pr-2 text-center w-11">
        <button
          type="button"
          onClick={() => onToggleSolved?.(problem.id)}
          title={isSolved ? 'Mark as Unsolved' : 'Mark as Solved'}
          aria-label={
            isSolved
              ? `Mark ${problem.title} unsolved`
              : `Mark ${problem.title} solved`
          }
          className="inline-flex items-center justify-center p-1 rounded text-[var(--foreground-muted)] hover:text-[#16A34A] dark:hover:text-[#3FB950] transition cursor-pointer"
        >
          {isSolved ? (
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#3FB950]" />
          ) : (
            <Circle className="w-4 h-4 opacity-45 group-hover:opacity-90" />
          )}
        </button>
      </td>

      {/* 2. Star */}
      <td className="py-2.5 px-2 text-center w-10">
        <button
          type="button"
          onClick={() => onToggleStar?.(problem.id)}
          title={isStarred ? 'Remove Star' : 'Star Problem'}
          aria-label={
            isStarred ? `Unstar ${problem.title}` : `Star ${problem.title}`
          }
          className="inline-flex items-center justify-center p-1 rounded transition cursor-pointer"
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              isStarred
                ? 'text-[#FFA116] fill-[#FFA116]'
                : 'text-[var(--foreground-muted)] opacity-45 hover:opacity-90 hover:text-[#FFA116]'
            }`}
          />
        </button>
      </td>

      {/* 3. Problem Title */}
      <td className="py-2.5 px-3 min-w-[240px]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-mono text-[var(--foreground-muted)] tabular-nums shrink-0">
            {problem.id}.
          </span>
          <button
            type="button"
            onClick={() => onOpenProblem?.(problem.id)}
            className="text-[13px] font-medium text-[var(--foreground)] group-hover:text-[#FFA116] transition text-left truncate cursor-pointer"
            title={problem.title}
          >
            {problem.title}
          </button>
          {problem.link && (
            <a
              href={problem.link}
              target="_blank"
              rel="noopener noreferrer"
              title="Open original problem"
              aria-label={`Open ${problem.title} externally`}
              className="text-[var(--foreground-muted)] hover:text-[#FFA116] opacity-0 group-hover:opacity-100 transition shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </td>

      {/* 4. Topics */}
      <td className="py-2.5 px-3">
        <TopicTags topics={problem.topics} onSelectTopic={onSelectTopic} />
      </td>

      {/* 5. Difficulty */}
      <td className="py-2.5 px-3 whitespace-nowrap w-24">
        <DifficultyBadge difficulty={problem.difficulty} />
      </td>

      {/* 6. Acceptance */}
      <td className="py-2.5 px-3 text-xs text-[var(--foreground-secondary)] tabular-nums whitespace-nowrap w-24 text-right">
        {acceptance}%
      </td>

      {/* 7. Companies */}
      <td className="py-2.5 px-3">
        <CompanyTags
          companies={problem.companies}
          onSelectCompany={onSelectCompany}
        />
      </td>

      {/* 8. Action */}
      <td className="py-2.5 pl-2 pr-4 text-right whitespace-nowrap w-20">
        <button
          type="button"
          onClick={() => onOpenProblem?.(problem.id)}
          className="px-2.5 py-1 rounded-md text-xs font-medium text-[#D97706] dark:text-[#FFA116] group-hover:bg-[#FFA116]/12 hover:!bg-[#FFA116] hover:!text-white transition cursor-pointer"
        >
          Solve
        </button>
      </td>
    </tr>
  );
}

export function ProblemMobileCard({
  problem,
  onToggleSolved,
  onToggleStar,
  onOpenProblem,
  onSelectTopic,
  onSelectCompany,
}) {
  const isSolved = Boolean(problem.is_solved);
  const isStarred = Boolean(problem.is_bookmarked);
  const acceptance = problem.acceptance_rate ?? problem.acceptanceRate ?? 50;

  return (
    <div className="p-3.5 space-y-2">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2 min-w-0">
          <button
            type="button"
            onClick={() => onToggleSolved?.(problem.id)}
            aria-label={isSolved ? 'Mark unsolved' : 'Mark solved'}
            className="mt-0.5 shrink-0 cursor-pointer"
          >
            {isSolved ? (
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] dark:text-[#3FB950]" />
            ) : (
              <Circle className="w-4 h-4 text-[var(--foreground-muted)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onOpenProblem?.(problem.id)}
            className="text-left min-w-0 cursor-pointer"
          >
            <span className="text-xs font-mono text-[var(--foreground-muted)] mr-1.5">
              {problem.id}.
            </span>
            <span className="text-sm font-medium text-[var(--foreground)] hover:text-[#FFA116] transition break-words">
              {problem.title}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onToggleStar?.(problem.id)}
          aria-label={isStarred ? 'Unstar' : 'Star'}
          className="p-1 shrink-0 cursor-pointer"
        >
          <Star
            className={`w-4 h-4 ${
              isStarred
                ? 'text-[#FFA116] fill-[#FFA116]'
                : 'text-[var(--foreground-muted)]'
            }`}
          />
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pl-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <DifficultyBadge difficulty={problem.difficulty} />
          <span className="text-[11px] text-[var(--foreground-secondary)] tabular-nums">
            {acceptance}%
          </span>
          {(problem.topics || []).slice(0, 2).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onSelectTopic?.(t)}
              className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] cursor-pointer"
            >
              {t}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onOpenProblem?.(problem.id)}
          className="px-2.5 py-1 rounded-md text-xs font-medium text-[#D97706] dark:text-[#FFA116] bg-[#FFA116]/10 hover:bg-[#FFA116] hover:text-white transition cursor-pointer"
        >
          Solve
        </button>
      </div>

      {Array.isArray(problem.companies) && problem.companies.length > 0 && (
        <div className="pl-6">
          <CompanyTags
            companies={problem.companies}
            onSelectCompany={onSelectCompany}
          />
        </div>
      )}
    </div>
  );
}
