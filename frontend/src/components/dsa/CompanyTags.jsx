import React, { useState } from 'react';

export function CompanyTags({ companies = [], onSelectCompany }) {
  const [expanded, setExpanded] = useState(false);

  if (!Array.isArray(companies) || companies.length === 0) {
    return <span className="text-[var(--foreground-muted)]">—</span>;
  }

  const visible = expanded ? companies : companies.slice(0, 2);
  const overflow = companies.slice(2);

  return (
    <div className="inline-flex flex-wrap items-center gap-1 max-w-[220px]">
      {visible.map((company) => (
        <button
          key={company}
          type="button"
          onClick={() => onSelectCompany?.(company)}
          title={`Filter by ${company}`}
          className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] hover:text-[#FFA116] transition max-w-[100px] truncate cursor-pointer"
        >
          {company}
        </button>
      ))}

      {overflow.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          title={
            expanded
              ? 'Show fewer companies'
              : `More companies: ${overflow.join(', ')}`
          }
          aria-label={
            expanded
              ? 'Collapse extra companies'
              : `Show ${overflow.length} more companies`
          }
          className="px-1 text-[11px] font-medium text-[var(--foreground-muted)] hover:text-[#FFA116] transition cursor-pointer shrink-0 tabular-nums"
        >
          {expanded ? 'Less' : `+${overflow.length}`}
        </button>
      )}
    </div>
  );
}
