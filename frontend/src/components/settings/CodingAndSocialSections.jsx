import React, { useState } from 'react';
import {
  ExternalLink,
  CheckCircle2,
  Link2,
  Globe,
  FileText,
  Plus,
  Trash2,
  Code2,
  Terminal,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  CODING_PLATFORMS,
  extractHandleOrUrl,
  normalizeExternalUrl,
} from './settingsConfig';

function PlatformLogo({ id }) {
  if (id === 'github') {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#1E293B] dark:text-[#E6EDF3]" aria-hidden="true">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.07.78 2.15v3.19c0 .31.21.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
      </svg>
    );
  }
  if (id === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-[#0A66C2]" aria-hidden="true">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    );
  }
  if (id === 'leetcode') {
    return <Code2 className="w-5 h-5 text-[#F59E0B]" />;
  }
  if (id === 'codeforces') {
    return <Terminal className="w-5 h-5 text-[#2563EB]" />;
  }
  if (id === 'hackerrank' || id === 'gfg') {
    return <Code2 className="w-5 h-5 text-[#16A34A]" />;
  }
  return <Code2 className="w-5 h-5 text-[#B45309]" />;
}

export function CodingProfilesSection({ formData, onFieldChange }) {
  const connectedCount = CODING_PLATFORMS.filter(
    (p) => Boolean((formData[p.field] || '').trim())
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-[#30363D]">
        <div>
          <h3 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
            Coding Platform Profiles
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Link your competitive programming &amp; developer handles. Open any connected profile directly.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3] shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
          <span>
            {connectedCount} / {CODING_PLATFORMS.length} Connected
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CODING_PLATFORMS.map((platform) => {
          const rawVal = formData[platform.field] || '';
          const { handle, url } = extractHandleOrUrl(rawVal, platform.id);
          const isConnected = Boolean(handle);

          return (
            <div
              key={platform.id}
              className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-3 transition hover:border-[#F59E0B]/40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${platform.bgTint} ${platform.borderTint}`}
                  >
                    <PlatformLogo id={platform.id} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                      {platform.name}
                    </h4>
                    <span className="text-[11px] text-[#64748B]">
                      {isConnected ? `@${handle}` : 'Username or profile URL'}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isConnected
                      ? 'bg-[#F0FDF4] dark:bg-[#16A34A]/15 border-[#16A34A]/25 text-[#16A34A]'
                      : 'bg-white dark:bg-[#161B22] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'
                    }`}
                  />
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name={platform.field}
                  value={rawVal}
                  onChange={(e) => {
                    const val = e.target.value;
                    onFieldChange(platform.field, val);
                    if (platform.id === 'github') {
                      const extracted = extractHandleOrUrl(val, 'github');
                      if (extracted.url && !formData.github_url) {
                        onFieldChange('github_url', extracted.url);
                      }
                    }
                  }}
                  placeholder={platform.placeholder}
                  className="lc-input text-xs flex-1"
                />

                {isConnected && url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open ${platform.name} profile`}
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3] hover:border-[#F59E0B] hover:text-[#F59E0B] transition shrink-0"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-2 rounded-lg bg-white/60 dark:bg-[#161B22]/60 border border-[#E2E8F0] dark:border-[#30363D] text-xs text-[#94A3B8] shrink-0 select-none">
                    Open
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SocialPortfolioSection({ formData, onFieldChange }) {
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [linkError, setLinkError] = useState('');

  const primaryLinks = [
    {
      name: 'github_url',
      label: 'GitHub URL',
      placeholder: 'https://github.com/yourusername',
      iconId: 'github',
      helper: 'Source repositories and open-source contributions',
    },
    {
      name: 'linkedin_url',
      label: 'LinkedIn URL',
      placeholder: 'https://linkedin.com/in/yourusername',
      iconId: 'linkedin',
      helper: 'Professional experience and networking profile',
    },
    {
      name: 'portfolio_url',
      label: 'Personal Portfolio',
      placeholder: 'https://yourportfolio.dev',
      iconId: 'portfolio',
      helper: 'Personal website, project showcase, or engineering blog',
    },
    {
      name: 'resume_url',
      label: 'Resume Link',
      placeholder: 'https://drive.google.com/... or hosted PDF URL',
      iconId: 'resume',
      helper: 'Public link used during recruiter & resume audits',
    },
  ];

  const handleAddOtherLink = () => {
    setLinkError('');
    const label = newLinkLabel.trim();
    const rawUrl = newLinkUrl.trim();
    if (!label || !rawUrl) {
      setLinkError('Provide both a platform label and URL.');
      return;
    }
    const normalized = normalizeExternalUrl(rawUrl);
    try {
      new URL(normalized);
    } catch {
      setLinkError('Please enter a valid URL.');
      return;
    }

    const nextLinks = [...(formData.other_links || []), { label, url: normalized }];
    onFieldChange('other_links', nextLinks);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveOtherLink = (index) => {
    const nextLinks = (formData.other_links || []).filter((_, i) => i !== index);
    onFieldChange('other_links', nextLinks);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#30363D]">
        <h3 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
          Social &amp; Portfolio Links
        </h3>
        <p className="text-xs text-[#64748B] mt-0.5">
          Manage verifiable engineering links used across your candidate profile and resume analyzer.
        </p>
      </div>

      <div className="space-y-4">
        {primaryLinks.map((item) => {
          const val = formData[item.name] || '';
          const validHref = val.trim() ? normalizeExternalUrl(val) : null;

          return (
            <div
              key={item.name}
              className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] flex items-center justify-center">
                    {item.iconId === 'portfolio' ? (
                      <Globe className="w-4 h-4 text-[#F59E0B]" />
                    ) : item.iconId === 'resume' ? (
                      <FileText className="w-4 h-4 text-[#16A34A]" />
                    ) : (
                      <PlatformLogo id={item.iconId} />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] block">
                      {item.label}
                    </label>
                    <span className="text-[11px] text-[#64748B]">{item.helper}</span>
                  </div>
                </div>

                {validHref && (
                  <a
                    href={validHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#F59E0B] hover:underline"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <input
                type="url"
                name={item.name}
                value={val}
                onChange={(e) => {
                  const nextVal = e.target.value;
                  onFieldChange(item.name, nextVal);
                  if (item.name === 'github_url' && !formData.github_username) {
                    const extracted = extractHandleOrUrl(nextVal, 'github');
                    if (extracted.handle) {
                      onFieldChange('github_username', extracted.handle);
                    }
                  }
                }}
                placeholder={item.placeholder}
                className="lc-input text-xs"
              />
            </div>
          );
        })}
      </div>

      {/* Other Professional Links */}
      <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#30363D] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#F59E0B]" />
              <span>Other Professional Links</span>
            </h4>
            <p className="text-[11px] text-[#64748B]">
              Add Kaggle, Medium, Behance, Devpost, X/Twitter, or published research links.
            </p>
          </div>
        </div>

        {(formData.other_links || []).length > 0 && (
          <div className="space-y-2">
            {(formData.other_links || []).map((link, idx) => (
              <div
                key={`${link.label}-${idx}`}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Link2 className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] block truncate">
                      {link.label}
                    </span>
                    <a
                      href={normalizeExternalUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#64748B] hover:text-[#F59E0B] truncate block"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={normalizeExternalUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-[#64748B] hover:text-[#F59E0B] hover:bg-white dark:hover:bg-[#161B22] transition"
                    title="Open link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveOtherLink(idx)}
                    className="p-1.5 rounded-md text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition cursor-pointer"
                    title="Remove link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            value={newLinkLabel}
            onChange={(e) => setNewLinkLabel(e.target.value)}
            placeholder="Platform (e.g. Kaggle)"
            className="lc-input text-xs sm:col-span-4"
          />
          <input
            type="url"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddOtherLink();
              }
            }}
            placeholder="https://kaggle.com/username"
            className="lc-input text-xs sm:col-span-6"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddOtherLink}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="sm:col-span-2"
          >
            Add
          </Button>
        </div>

        {linkError && <p className="text-xs text-[#DC2626] font-medium">{linkError}</p>}
      </div>
    </div>
  );
}

