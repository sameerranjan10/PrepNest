import React, { useId } from 'react';
import { useTheme } from '@/context/ThemeContext';

/**
 * Dual-theme PrepNest brand mark & wordmark:
 * - Light Mode: uses the crisp original /logo-horizontal.png & /logo-icon.png assets.
 * - Dark Mode: uses the transparent 2-color (#E6EDF3 + #FFA116) vector SVG so it blends
 *   cleanly onto dark frosted glass without a light background pill.
 */
export function BrandLogo({ iconOnly = false, size = 'md', className = '' }) {
  const { isDark } = useTheme();
  const uid = useId().replace(/:/g, '');
  const gradId = `prepnest-p-grad-${uid}`;

  if (!isDark) {
    if (iconOnly) {
      const miniSize =
        size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-9 h-9' : 'w-8 h-8';
      return (
        <img
          src="/logo-icon.png"
          alt="PrepNest"
          className={`${miniSize} object-contain select-none ${className}`}
        />
      );
    }

    const fullSize =
      size === 'sm'
        ? 'h-7 w-auto object-contain'
        : size === 'lg'
        ? 'h-8 w-auto object-contain'
        : 'h-7 max-w-[154px] w-auto object-contain';

    return (
      <img
        src="/logo-horizontal.png"
        alt="PrepNest"
        className={`${fullSize} select-none ${className}`}
      />
    );
  }

  const iconDimensions =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-9 h-9' : 'w-8 h-8';
  const textSize =
    size === 'sm' ? 'text-[18px]' : size === 'lg' ? 'text-[23px]' : 'text-[21px]';

  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 64 64"
        className={`${iconDimensions} shrink-0`}
        aria-label="PrepNest"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA116" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>

        {/* Graduation Cap (#E6EDF3 on dark glass) */}
        <g fill="#E6EDF3">
          {/* Mortarboard diamond */}
          <path d="M9 17.5L33.5 6.5L56 14.5L31.5 25.5Z" />
          {/* Cap base dome */}
          <path d="M18.5 21.8C22.5 18.2 38.5 17.6 46 21.5L43.5 24.5C37 21.5 25.5 21.8 20.5 24.6Z" />
          {/* Tassel string + tip */}
          <rect x="11.2" y="18.2" width="2.2" height="12.5" rx="1.1" />
          <circle cx="12.3" cy="31.5" r="2.1" />
          <path d="M10.3 33.2C10.3 32.1 14.3 32.1 14.3 33.2L15 37.5C15 38.2 9.6 38.2 9.6 37.5Z" />
        </g>

        {/* Orange Stylized 'P' Outer Glyph */}
        <path
          fill={`url(#${gradId})`}
          d="M17.5 25.2C23.5 21.8 34.5 21.5 41.8 24.8C48.5 27.8 51.2 34.5 48.2 41.5C45.3 48.2 37.5 51.2 28.5 50.8V57.5C28.5 58.9 27.6 59.8 26.2 60.2L17.5 62.2V25.2Z"
        />

        {/* Crisp White Nesting Bird Silhouette Cutout */}
        <path
          fill="#FFFFFF"
          d="M17.5 53.5C18.5 42.5 24.2 31.8 33.8 29.8C39.2 28.7 42.8 31.8 44.5 34.8L48.5 35.8L44.6 38.2C42.2 44.8 34.5 48.2 25.2 47.6C22.2 47.4 19.6 49.5 17.5 53.5Z"
        />

        {/* Bird Eye */}
        <circle cx="37.6" cy="34.2" r="2.1" fill="#FFA116" />
      </svg>

      {!iconOnly && (
        <span
          style={{ color: '#E6EDF3' }}
          className={`font-extrabold tracking-tight leading-none ${textSize}`}
        >
          Prep<span style={{ color: '#FFA116' }}>Nest</span>
        </span>
      )}
    </span>
  );
}
