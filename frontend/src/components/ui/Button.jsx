import React from 'react';
import { ButtonLoader } from '@/components/ui/PrepNestLoader';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon = null,
  iconRight = null,
  ...props
}) {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-3.5 py-2 rounded-lg gap-2',
    lg: 'text-base px-5 py-2.5 rounded-lg gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-[#FFA116] hover:bg-[#E68F0F] text-white font-semibold shadow-sm active:translate-y-[1px]',
    secondary:
      'bg-white hover:bg-[#F7F8FA] text-[#262626] border border-[#E5E7EB] hover:border-[#D1D5DB] font-medium shadow-sm',
    outline:
      'bg-transparent hover:bg-[#FFF8EE] text-[#FFA116] border border-[#FFA116]/40 hover:border-[#FFA116] font-semibold',
    ghost:
      'bg-transparent hover:bg-[#F1F3F5] text-[#64748B] hover:text-[#262626] font-medium',
    danger:
      'bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold shadow-sm',
    success:
      'bg-[#16A34A] hover:bg-[#15803D] text-white font-semibold shadow-sm',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 outline-none select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <ButtonLoader
          size="sm"
          tone={variant === 'secondary' || variant === 'outline' || variant === 'ghost' ? 'brand' : 'light'}
          className="-ml-0.5"
        />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}

