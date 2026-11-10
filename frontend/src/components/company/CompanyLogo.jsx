import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  siMeta,
  siTcs,
  siInfosys,
  siWipro,
  siAccenture,
  siApple,
  siNetflix,
  siUber,
  siCisco,
  siGoldmansachs,
  siAtlassian,
  siPaytm,
  siZomato
} from 'simple-icons';

// Official pure-vector SVG brand marks for brands unavailable or monochrome in simple-icons
function renderCustomBrandSvg(key, isDark) {
  const darkInkFill = isDark ? '#E6EDF3' : '#232F3E';
  const deloitteInkFill = isDark ? '#E6EDF3' : '#111827';

  switch (key) {
    case 'google':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" aria-label="Google">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
          />
        </svg>
      );
    case 'microsoft':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" aria-label="Microsoft">
          <rect x="1.5" y="1.5" width="9.75" height="9.75" rx="0.5" fill="#F25022" />
          <rect x="12.75" y="1.5" width="9.75" height="9.75" rx="0.5" fill="#7FBA00" />
          <rect x="1.5" y="12.75" width="9.75" height="9.75" rx="0.5" fill="#00A4EF" />
          <rect x="12.75" y="12.75" width="9.75" height="9.75" rx="0.5" fill="#FFB900" />
        </svg>
      );
    case 'amazon':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" aria-label="Amazon">
          {/* Pure vector lowercase 'a' (adapts cleanly on dark tiles) */}
          <path
            fill={darkInkFill}
            d="M14.3 13.7c0 1.25.03 2.28-.6 3.38-.51.9-1.32 1.45-2.22 1.45-1.23 0-1.95-.94-1.95-2.32 0-2.73 2.45-3.23 4.77-3.23v.72zm1.92 4.56c-.18.17-.45.18-.66.07-.35-.22-.5-.68-.69-1.23-1.53 1.56-2.61 2.03-4.6 2.03-2.35 0-4.18-1.45-4.18-4.35 0-2.27 1.23-3.81 2.98-4.57 1.52-.67 3.64-.79 5.26-.97v-.36c0-.67.05-1.46-.34-2.04-.35-.52-1-.74-1.58-.74-1.07 0-2.03.55-2.26 1.69-.05.25-.23.5-.49.51l-2.72-.29c-.23-.05-.49-.24-.42-.59C6.95 4.4 9.7 3.5 12.18 3.5c1.27 0 2.93.34 3.93 1.3 1.27 1.19 1.15 2.77 1.15 4.5v4.08c0 1.23.51 1.77.99 2.43.17.24.21.52-.01.7-.54.45-1.5 1.29-2.02 1.75z"
          />
          {/* Signature Amazon smile arrow */}
          <path
            fill="#FF9900"
            d="M19.86 19.72c-2.36 1.74-5.78 2.67-8.72 2.67-4.13 0-7.84-1.53-10.65-4.07-.22-.2-.02-.47.24-.32 3.03 1.76 6.78 2.82 10.66 2.82 2.62 0 5.5-.54 8.15-1.66.4-.17.73.26.32.56z"
          />
          <path
            fill="#FF9900"
            d="M20.84 18.6c-.3-.39-1.99-.18-2.75-.09-.23.03-.27-.17-.06-.32 1.35-.95 3.56-.67 3.82-.36.26.32-.07 2.53-1.33 3.58-.19.16-.38.07-.29-.14.28-.71.91-2.29.61-2.67z"
          />
        </svg>
      );
    case 'cognizant':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" aria-label="Cognizant">
          <path fill="#0033A0" d="M2.5 12L9.2 4H16.5L9.8 12L16.5 20H9.2L2.5 12Z" />
          <path fill="#00A9E0" d="M9.8 12L16.5 4H21.5L14.8 12L21.5 20H16.5L9.8 12Z" opacity="0.9" />
        </svg>
      );
    case 'capgemini':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" aria-label="Capgemini">
          <path
            fill="#0070AD"
            d="M12.2 2.5C8.9 6.7 4 9.9 4 14.6C4 18.5 7.4 21 11.1 20.1C10.3 17.6 11.4 15.1 13.8 13.5C16.1 12 18.1 10.1 19 7.6C16.4 6.2 14 4.5 12.2 2.5Z"
          />
          <path
            fill="#12ABDB"
            d="M20 13.9C20 10.5 17.2 8.2 14.4 10C12 11.6 11.3 14.8 12.2 17.9C12.9 19.9 14.8 21.1 16.9 20.4C18.9 19.7 20 17.1 20 13.9Z"
          />
        </svg>
      );
    case 'deloitte':
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" aria-label="Deloitte">
          {/* Pure vector bold 'D' */}
          <path
            fill={deloitteInkFill}
            d="M3 4.5H9.2C14.1 4.5 17 7.4 17 12C17 16.6 14.1 19.5 9.2 19.5H3V4.5ZM6.8 7.7V16.3H9.1C11.7 16.3 13.2 14.7 13.2 12C13.2 9.3 11.7 7.7 9.1 7.7H6.8Z"
          />
          {/* Deloitte signature green dot */}
          <circle cx="19.6" cy="17.2" r="2.5" fill="#86BC25" />
        </svg>
      );
    default:
      return null;
  }
}

// Verified simple-icons mapping
const SIMPLE_ICON_MAP = {
  meta: siMeta,
  facebook: siMeta,
  tcs: siTcs,
  'tata consultancy services': siTcs,
  infosys: siInfosys,
  wipro: siWipro,
  accenture: siAccenture,
  apple: siApple,
  netflix: siNetflix,
  uber: siUber,
  cisco: siCisco,
  'goldman sachs': siGoldmansachs,
  atlassian: siAtlassian,
  paytm: siPaytm,
  zomato: siZomato
};

const SIZE_CLASSES = {
  xs: 'w-6 h-6 p-1 rounded-md',
  sm: 'w-8 h-8 p-1.5 rounded-lg',
  md: 'w-10 h-10 p-2 rounded-xl',
  lg: 'w-12 h-12 p-2.5 rounded-xl',
  xl: 'w-14 h-14 p-3 rounded-2xl'
};

const TEXT_SIZE_CLASSES = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export function CompanyLogo({
  companyName = '',
  logo = null,
  size = 'md',
  className = ''
}) {
  const { isDark } = useTheme();
  const normalized = (companyName || '').trim().toLowerCase();
  const containerClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const textSizeClass = TEXT_SIZE_CLASSES[size] || TEXT_SIZE_CLASSES.md;

  const isUrlLogo =
    typeof logo === 'string' &&
    (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/') || logo.startsWith('data:image'));

  const customSvg = renderCustomBrandSvg(normalized, isDark);
  const simpleIcon = SIMPLE_ICON_MAP[normalized];
  const simpleIconFill =
    simpleIcon && isDark && ['000000', '111827', '181717', '232F3E'].includes((simpleIcon.hex || '').toUpperCase())
      ? '#E6EDF3'
      : simpleIcon
      ? `#${simpleIcon.hex}`
      : undefined;

  const initials = (companyName || 'CO')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`no-glass bg-[#FFFFFF] border border-[#E5E7EB] flex items-center justify-center shrink-0 overflow-hidden select-none ${containerClass} ${className}`}
      title={companyName}
    >
      {isUrlLogo ? (
        <img
          src={logo}
          alt={`${companyName} logo`}
          className="w-full h-full object-contain"
        />
      ) : customSvg ? (
        customSvg
      ) : simpleIcon ? (
        <svg
          role="img"
          viewBox="0 0 24 24"
          className="w-full h-full object-contain"
          fill={simpleIconFill}
          aria-label={companyName}
        >
          <path d={simpleIcon.path} />
        </svg>
      ) : (
        <span className={`font-bold text-[#262626] tracking-tight ${textSizeClass}`}>
          {initials}
        </span>
      )}
    </div>
  );
}
