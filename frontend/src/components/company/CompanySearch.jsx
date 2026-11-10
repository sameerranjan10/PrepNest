import React from 'react';
import { Search, X } from 'lucide-react';

export function CompanySearch({
  value,
  onChange,
  placeholder = 'Search companies by name, job role, or assessment pattern...',
  className = ''
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#CBD5E1] focus:border-[#FFA116] text-xs sm:text-sm text-[#262626] placeholder-[#94A3B8] pl-10 pr-8 py-2.5 rounded-xl outline-none transition shadow-2xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear company search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#94A3B8] hover:text-[#262626] hover:bg-[#F7F8FA] transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

