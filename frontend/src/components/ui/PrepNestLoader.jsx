import React, { useEffect, useState } from 'react';
import { subscribePendingRequests } from '@/lib/apiClient';

const DEFAULT_SUBTITLES = [
  'Preparing your workspace...',
  'Preparing your dashboard...',
  'Loading your learning tracks...',
  'Syncing your progress...',
  'Fetching interview questions...',
  'Almost ready...',
];

/**
 * Compact branded gradient ring indicator for buttons & inline actions.
 */
export function ButtonLoader({
  size = 'sm',
  tone = 'light',
  label = 'Loading',
  className = '',
}) {
  const sizeClass =
    size === 'xs' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  const toneClass =
    tone === 'brand' ? 'prepnest-btn-orbit--brand' : 'prepnest-btn-orbit--light';

  return (
    <span
      role="status"
      aria-label={label}
      className={`prepnest-btn-orbit ${toneClass} ${sizeClass} shrink-0 ${className}`}
    />
  );
}

/**
 * Branded PrepNest logo loader for cards, dashboards, tables, and individual modules.
 */
export function ComponentLoader({
  message = 'Preparing your workspace...',
  size = 'md',
  className = '',
}) {
  const isCompact = size === 'sm';
  const ringDim = isCompact
    ? 'w-11 h-11 prepnest-orbit-ring--sm'
    : size === 'lg'
      ? 'w-16 h-16'
      : 'w-14 h-14';
  const logoDim = isCompact ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={`flex flex-col items-center justify-center gap-3 py-6 text-center ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className={`prepnest-orbit-ring ${ringDim} flex items-center justify-center p-2 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md shadow-xs`}>
          <div className="prepnest-sheen-layer prepnest-logo-stage w-full h-full flex items-center justify-center">
            <img
              src="/logo-icon.png"
              alt="PrepNest"
              className={`${logoDim} object-contain select-none`}
            />
          </div>
        </div>
      </div>

      {message && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-[#64748B] dark:text-[#8B949E]">
            {message}
          </p>
          <div className="mx-auto w-20 h-[2px] rounded-full prepnest-gradient-bar opacity-80" />
        </div>
      )}
    </div>
  );
}

/**
 * Full-page branded loader used during initial application bootstrap and session verification.
 */
export function FullPageLoader({
  message,
  cycleSubtitles = false,
  className = '',
}) {
  const [subtitleIdx, setSubtitleIdx] = useState(0);

  useEffect(() => {
    if (message || !cycleSubtitles) return;
    const interval = setInterval(() => {
      setSubtitleIdx((prev) => (prev + 1) % DEFAULT_SUBTITLES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [message, cycleSubtitles]);

  const activeMessage = message || DEFAULT_SUBTITLES[subtitleIdx];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`PrepNest — ${activeMessage}`}
      className={`min-h-screen bg-[#F7F8FA] dark:bg-[#0D1117] flex flex-col items-center justify-center px-6 py-12 text-center select-none ${className}`}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Central Original PrepNest Logo with Continuous Thin Gradient Orbit */}
        <div className="relative flex items-center justify-center">
          <div className="prepnest-orbit-ring w-24 h-24 rounded-full flex items-center justify-center p-4 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-xl shadow-[0_12px_36px_-10px_rgba(249,115,22,0.22)] dark:shadow-[0_14px_40px_-10px_rgba(0,0,0,0.65)]">
            <div className="prepnest-sheen-layer prepnest-logo-stage w-full h-full flex items-center justify-center">
              <img
                src="/logo-icon.png"
                alt="PrepNest"
                className="w-14 h-14 object-contain select-none"
              />
            </div>
          </div>
        </div>

        {/* Brand Wordmark + Dynamic Subtitle + Flowing Gradient Bar */}
        <div className="space-y-2">
          <p className="text-lg font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3]">
            Prep<span className="text-[#FF9800]">Nest</span>
          </p>
          <p className="text-xs sm:text-sm font-medium text-[#64748B] dark:text-[#8B949E] min-h-[1.25rem]">
            {activeMessage}
          </p>
          <div className="mx-auto w-28 h-[2.5px] rounded-full prepnest-gradient-bar" />
        </div>
      </div>
    </div>
  );
}

/**
 * Non-blocking top request progress bar synchronized passively with apiFetch().
 * Never interrupts or overlays the page for small API calls.
 */
export function GlobalRequestBar() {
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    return subscribePendingRequests(setActiveCount);
  }, []);

  if (activeCount <= 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 inset-x-0 z-[100] h-[2.5px] pointer-events-none prepnest-gradient-bar opacity-90"
    />
  );
}

/**
 * Unified reusable entry point supporting variant="full" | "component" | "button".
 */
export function PrepNestLoader({ variant = 'component', ...props }) {
  if (variant === 'full') return <FullPageLoader {...props} />;
  if (variant === 'button') return <ButtonLoader {...props} />;
  return <ComponentLoader {...props} />;
}

export default PrepNestLoader;

