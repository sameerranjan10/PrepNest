import React from 'react';

export function Input({
  className = '',
  icon = null,
  error = null,
  ...props
}) {
  return (
    <div className="w-full">
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-[#94A3B8] pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`w-full bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#262626] placeholder-[#94A3B8] transition-all duration-150 outline-none focus:border-[#FFA116] focus:ring-2 focus:ring-[#FFA116]/15 disabled:bg-[#F7F8FA] disabled:cursor-not-allowed ${
            icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2'
          } ${error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/15' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#DC2626] mt-1">{error}</p>}
    </div>
  );
}

export function Select({
  children,
  className = '',
  icon = null,
  ...props
}) {
  return (
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-3 text-[#94A3B8] pointer-events-none">
          {icon}
        </span>
      )}
      <select
        className={`bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#262626] transition-all duration-150 outline-none focus:border-[#FFA116] focus:ring-2 focus:ring-[#FFA116]/15 disabled:bg-[#F7F8FA] cursor-pointer ${
          icon ? 'pl-9 pr-8 py-2' : 'px-3 py-2'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

