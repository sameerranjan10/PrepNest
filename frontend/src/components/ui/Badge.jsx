import React from 'react';

export function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'sm', 
  className = '', 
  icon = null,
  ...props 
}) {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  const variantClasses = {
    easy: 'bg-[#E6FAF6] text-[#00B8A3] border border-[#00B8A3]/20 font-semibold',
    medium: 'bg-[#FFF9E6] text-[#D97706] border border-[#D97706]/20 font-semibold',
    hard: 'bg-[#FFEBEF] text-[#DC2626] border border-[#DC2626]/20 font-semibold',
    accent: 'bg-[#FFF8EE] text-[#FFA116] border border-[#FFA116]/30 font-semibold',
    success: 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20 font-semibold',
    neutral: 'bg-[#F1F3F5] text-[#64748B] border border-[#E5E7EB] font-medium',
    outline: 'bg-white text-[#64748B] border border-[#E5E7EB] font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full leading-none transition-colors ${sizeClasses[size] || sizeClasses.sm} ${variantClasses[variant] || variantClasses.neutral} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty, size = 'sm', className = '' }) {
  const diff = (difficulty || '').toLowerCase();
  let variant = 'neutral';
  let label = difficulty || 'General';

  if (diff === 'easy') {
    variant = 'easy';
    label = 'Easy';
  } else if (diff === 'medium') {
    variant = 'medium';
    label = 'Medium';
  } else if (diff === 'hard') {
    variant = 'hard';
    label = 'Hard';
  }

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  );
}

