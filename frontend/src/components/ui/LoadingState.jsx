import React from 'react';
import { ComponentLoader } from '@/components/ui/PrepNestLoader';

export function LoadingSpinner({
  size = 'md',
  message = '',
  className = '',
}) {
  return (
    <ComponentLoader
      size={size}
      message={message}
      className={className}
    />
  );
}

export function SkeletonRow({ count = 5 }) {
  return (
    <div className="divide-y divide-[#F1F3F5] dark:divide-[#21262D]">
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
