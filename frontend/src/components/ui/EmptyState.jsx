import React from 'react';
import { Button } from './Button';

export function EmptyState({
  icon = null,
  title = 'No items found',
  description = 'Try adjusting your filters or search query.',
  actionLabel = null,
  onAction = null,
  className = '',
}) {
  return (
    <div className={`p-12 text-center flex flex-col items-center justify-center ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-[#F1F3F5] text-[#64748B] flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h4 className="text-base font-semibold text-[#262626]">{title}</h4>
      {description && (
        <p className="text-sm text-[#64748B] max-w-sm mt-1 mb-5">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

