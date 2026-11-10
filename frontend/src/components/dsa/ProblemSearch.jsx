import React from 'react';
import { Search, X } from 'lucide-react';

export function ProblemSearch({ value = '', onChange, onSubmit, onClear }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="relative flex items-center w-full"
    >
      <Search className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-3 pointer-events-none" />
      <input
        type="text"
        aria-label="Search coding problems"
        placeholder="Search problems by title or keyword..."
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-9 bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] placeholder-[var(--foreground-muted)] pl-8 pr-8 rounded-lg outline-none focus:bg-[var(--surface)] focus:border-[#FFA116] focus:ring-2 focus:ring-[#FFA116]/15 transition"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] cursor-pointer p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
}

