import React from 'react';
import { FolderKanban } from 'lucide-react';

export function TopicFilter({
  value = 'all',
  topics = [],
  onChange,
}) {
  const hasCustomTopic =
    value !== 'all' &&
    !topics.some((t) => t.topic.toLowerCase() === value.toLowerCase());

  return (
    <div className="relative flex items-center w-full">
      <FolderKanban className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-3 pointer-events-none" />
      <select
        aria-label="Filter by topic"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-9 bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] pl-8 pr-3 rounded-lg outline-none focus:bg-[var(--surface)] focus:border-[#FFA116] focus:ring-2 focus:ring-[#FFA116]/15 cursor-pointer transition"
      >
        <option value="all">All Topics ({topics.length || 50}+)</option>
        {hasCustomTopic && <option value={value}>{value}</option>}
        {topics.map((t) => (
          <option key={t.topic} value={t.topic}>
            {t.topic} ({t.count})
          </option>
        ))}
      </select>
    </div>
  );
}

