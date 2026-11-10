import React from 'react';
import { Building2 } from 'lucide-react';

export function CompanyFilter({
  value = 'all',
  companies = [],
  onChange,
}) {
  const hasCustomCompany =
    value !== 'all' &&
    !companies.some((c) => c.company.toLowerCase() === value.toLowerCase());

  return (
    <div className="relative flex items-center w-full">
      <Building2 className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-3 pointer-events-none" />
      <select
        aria-label="Filter by company"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-9 bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] pl-8 pr-3 rounded-lg outline-none focus:bg-[var(--surface)] focus:border-[#FFA116] focus:ring-2 focus:ring-[#FFA116]/15 cursor-pointer transition"
      >
        <option value="all">All Companies ({companies.length || 40}+)</option>
        {hasCustomCompany && (
          <option value={value}>{value} (Selected)</option>
        )}
        {companies.map((c) => (
          <option key={c.company} value={c.company}>
            {c.company} ({c.count})
          </option>
        ))}
      </select>
    </div>
  );
}

