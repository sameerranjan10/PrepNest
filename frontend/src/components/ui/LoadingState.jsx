import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      <svg
        className={`animate-spin text-[#FFA116] ${sizeClasses[size] || sizeClasses.md}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}

export function SkeletonRow({ count = 5 }) {
  return (
    <div className="divide-y divide-[#F1F3F5]">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-4 h-4 rounded-full skeleton-shimmer shrink-0" />
            <div className="h-4 w-48 max-w-full rounded skeleton-shimmer" />
            <div className="h-4 w-20 rounded skeleton-shimmer hidden sm:block" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-5 w-14 rounded-full skeleton-shimmer" />
            <div className="h-7 w-14 rounded-md skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

