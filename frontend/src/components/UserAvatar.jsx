import React, { useState, useEffect } from 'react';
import { API_BASE } from '@/lib/apiClient';

export function getInitials(name, fallback = 'ST') {
  if (!name || typeof name !== 'string') return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function resolveAvatarUrl(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== 'string') return null;
  const trimmed = avatarUrl.trim();
  if (!trimmed) return null;
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return `${API_BASE}${trimmed}`;
  }
  return `${API_BASE}/${trimmed}`;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[11px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-14 h-14 text-base',
  '2xl': 'w-24 h-24 text-2xl',
};

export function UserAvatar({
  src,
  name,
  initials,
  size = 'sm',
  shape = 'circle',
  className = '',
  fallbackClassName = 'bg-gradient-to-br from-[#FFA116] to-[#F97316] text-white',
  alt,
}) {
  const [imgError, setImgError] = useState(false);
  const resolvedSrc = resolveAvatarUrl(src);

  useEffect(() => {
    setImgError(false);
  }, [resolvedSrc]);

  const shapeClass = shape === 'rounded' ? 'rounded-lg' : 'rounded-full';
  const sizeClass = SIZE_CLASSES[size] || '';
  const computedInitials = initials || getInitials(name, 'S');
  const altText = alt || (name ? `${name} profile picture` : 'User avatar');

  if (resolvedSrc && !imgError) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden bg-[#F1F3F5] ${shapeClass} ${sizeClass} ${className}`}
      >
        <img
          src={resolvedSrc}
          alt={altText}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover select-none"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={altText}
      className={`shrink-0 flex items-center justify-center font-bold select-none ${shapeClass} ${sizeClass} ${fallbackClassName} ${className}`}
    >
      {computedInitials}
    </div>
  );
}

