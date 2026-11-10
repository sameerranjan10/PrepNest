import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AdvancedFilters({
  isOpen,
  onClose,
  status = 'all',
  difficulty = 'all',
  company = 'all',
  topic = 'all',
  sortBy = 'id',
  companies = [],
  topics = [],
  onApply,
  onReset,
}) {
  const [draftStatus, setDraftStatus] = useState(status);
  const [draftDifficulty, setDraftDifficulty] = useState(difficulty);
  const [draftCompany, setDraftCompany] = useState(company);
  const [draftTopic, setDraftTopic] = useState(topic);
  const [draftSortBy, setDraftSortBy] = useState(sortBy);

  useEffect(() => {
    if (isOpen) {
      setDraftStatus(status);
      setDraftDifficulty(difficulty);
      setDraftCompany(company);
      setDraftTopic(topic);
      setDraftSortBy(sortBy);
    }
  }, [isOpen, status, difficulty, company, topic, sortBy]);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply?.({
      status: draftStatus,
      difficulty: draftDifficulty,
      company: draftCompany,
      topic: draftTopic,
      sortBy: draftSortBy,
    });
    onClose?.();
  };

  const handleReset = () => {
    setDraftStatus('all');
    setDraftDifficulty('all');
    setDraftCompany('all');
    setDraftTopic('all');
    setDraftSortBy('id');
    onReset?.();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        aria-label="Problem Filters"
        className="relative z-10 w-full max-w-md h-full bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col"
      >
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[var(--foreground)]">
              Filter Problems
            </h2>
            <p className="text-[11px] text-[var(--foreground-secondary)] mt-0.5">
              Choose status, difficulty, topic, company, and sort order.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All Problems' },
                { id: 'unsolved', label: 'Unsolved' },
                { id: 'solved', label: 'Solved' },
                { id: 'bookmarked', label: 'Starred' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDraftStatus(opt.id)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition cursor-pointer ${
                    draftStatus === opt.id
                      ? 'border-[#FFA116] bg-[#FFF8EE] text-[#D97706] dark:bg-[#FFA116]/12 dark:text-[#FFA116] font-semibold'
                      : 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              Difficulty
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDraftDifficulty(diff)}
                  className={`px-2.5 py-2 rounded-lg border text-xs font-semibold text-center transition cursor-pointer ${
                    draftDifficulty === diff
                      ? 'border-[#FFA116] bg-[#FFF8EE] text-[#D97706] dark:bg-[#FFA116]/12 dark:text-[#FFA116]'
                      : 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {diff === 'all' ? 'All' : diff}
                </button>
              ))}
            </div>
          </div>

          {/* Company Selector + Quick Pills */}
          <div className="space-y-2">
            <label
              htmlFor="dsa-filter-company"
              className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] block"
            >
              Company
            </label>
            <select
              id="dsa-filter-company"
              value={draftCompany}
              onChange={(e) => setDraftCompany(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[#FFA116] cursor-pointer"
            >
              <option value="all">All Companies ({companies.length || 40}+)</option>
              {draftCompany !== 'all' &&
                !companies.some(
                  (c) => c.company.toLowerCase() === draftCompany.toLowerCase()
                ) && <option value={draftCompany}>{draftCompany}</option>}
              {companies.map((c) => (
                <option key={c.company} value={c.company}>
                  {c.company} ({c.count})
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {companies.slice(0, 8).map((c) => {
                const selected = draftCompany === c.company;
                return (
                  <button
                    key={c.company}
                    type="button"
                    onClick={() =>
                      setDraftCompany(selected ? 'all' : c.company)
                    }
                    className={`px-2 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                      selected
                        ? 'border-[#FFA116] bg-[#FFF8EE] text-[#D97706] dark:bg-[#FFA116]/12 dark:text-[#FFA116] font-semibold'
                        : 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {c.company}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Selector + Quick Pills */}
          <div className="space-y-2">
            <label
              htmlFor="dsa-filter-topic"
              className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] block"
            >
              Topic
            </label>
            <select
              id="dsa-filter-topic"
              value={draftTopic}
              onChange={(e) => setDraftTopic(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[#FFA116] cursor-pointer"
            >
              <option value="all">All Topics ({topics.length || 50}+)</option>
              {draftTopic !== 'all' &&
                !topics.some(
                  (t) => t.topic.toLowerCase() === draftTopic.toLowerCase()
                ) && <option value={draftTopic}>{draftTopic}</option>}
              {topics.map((t) => (
                <option key={t.topic} value={t.topic}>
                  {t.topic} ({t.count})
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topics.slice(0, 10).map((t) => {
                const selected = draftTopic === t.topic;
                return (
                  <button
                    key={t.topic}
                    type="button"
                    onClick={() => setDraftTopic(selected ? 'all' : t.topic)}
                    className={`px-2 py-1 rounded-md border text-[11px] font-medium transition cursor-pointer ${
                      selected
                        ? 'border-[#FFA116] bg-[#FFF8EE] text-[#D97706] dark:bg-[#FFA116]/12 dark:text-[#FFA116] font-semibold'
                        : 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {t.topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label
              htmlFor="dsa-filter-sort"
              className="text-[11px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] block"
            >
              Sort Order
            </label>
            <select
              id="dsa-filter-sort"
              value={draftSortBy}
              onChange={(e) => setDraftSortBy(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[#FFA116] cursor-pointer"
            >
              <option value="id">Default Order (ID)</option>
              <option value="title">Problem Name (A–Z)</option>
              <option value="difficulty">Difficulty (Easy → Hard)</option>
              <option value="acceptance">Acceptance Rate (High → Low)</option>
            </select>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-[var(--border)] bg-[var(--surface-secondary)] flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset All
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            Apply Filters
          </Button>
        </div>
      </aside>
    </div>
  );
}
