import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  ArrowUpDown,
  AlertCircle,
  RefreshCw,
  Shuffle,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BlurDrop } from '@/components/ui/BlurDrop';
import DSAPracticeModal from '@/components/DSAPracticeModal';
import { apiFetch, notifyStatsUpdated } from '@/lib/apiClient';

import { DSAHeader } from '@/components/dsa/DSAHeader';
import { ProblemStatistics } from '@/components/dsa/ProblemStatistics';
import { ProblemSearch } from '@/components/dsa/ProblemSearch';
import { ActiveFilterChips } from '@/components/dsa/ActiveFilterChips';
import { AdvancedFilters } from '@/components/dsa/AdvancedFilters';
import { ProblemTable } from '@/components/dsa/ProblemTable';
import { ProblemPagination } from '@/components/dsa/ProblemPagination';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function DSAPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCompany = searchParams.get('company');
  const urlTopic = searchParams.get('topic');
  const urlDifficulty = searchParams.get('difficulty');
  const urlSearch = searchParams.get('search');

  const [activePracticeProblemId, setActivePracticeProblemId] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Data State
  const [problems, setProblems] = useState([]);
  const [meta, setMeta] = useState({
    total_problems: 0,
    solved_count: 0,
    bookmarked_count: 0,
    difficulty_counts: {},
    top_companies: [],
    top_topics: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Pagination State
  const [search, setSearch] = useState(urlSearch || '');
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch || '');
  const [difficulty, setDifficulty] = useState(urlDifficulty || 'all');
  const [company, setCompany] = useState(urlCompany || 'all');
  const [topic, setTopic] = useState(urlTopic || 'all');
  const [status, setStatus] = useState('all'); // 'all' | 'solved' | 'unsolved' | 'bookmarked'
  const [sortBy, setSortBy] = useState('id'); // 'id' | 'difficulty' | 'acceptance' | 'title'
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatching, setTotalMatching] = useState(0);

  const searchTimeoutRef = useRef(null);

  // Sync URL query params when navigating from Company Tracker, Roadmaps, or Header Search
  useEffect(() => {
    const compParam = searchParams.get('company');
    if (compParam && compParam !== company) {
      setCompany(compParam);
      setPage(1);
    }
    const topicParam = searchParams.get('topic');
    if (topicParam && topicParam !== topic) {
      setTopic(topicParam);
      setPage(1);
    }
    const diffParam = searchParams.get('difficulty');
    if (diffParam && diffParam !== difficulty) {
      setDifficulty(diffParam);
      setPage(1);
    }
    const searchParam = searchParams.get('search');
    if (searchParam && searchParam !== search) {
      setSearch(searchParam);
      setDebouncedSearch(searchParam);
      setPage(1);
    }
  }, [searchParams]);

  const handleSearchInputChange = (val) => {
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 280);
  };

  const handleSearchSubmitImmediate = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setDebouncedSearch(search);
    setPage(1);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await apiFetch('/api/dsa/meta');
      if (res.ok) {
        const data = await res.json();
        setMeta(data);
      }
    } catch (err) {
      console.log('Error fetching DSA metadata:', err);
    }
  }, []);

  const fetchProblems = useCallback(
    async (pageToFetch = 1) => {
      setLoading(true);
      setError(null);
      try {
        let url = `/api/dsa/problems?page=${pageToFetch}&limit=${limit}`;
        if (difficulty !== 'all') url += `&difficulty=${encodeURIComponent(difficulty)}`;
        if (company !== 'all') url += `&company=${encodeURIComponent(company)}`;
        if (topic !== 'all') url += `&topic=${encodeURIComponent(topic)}`;
        if (status !== 'all') url += `&status=${encodeURIComponent(status)}`;
        if (sortBy !== 'id') url += `&sort_by=${encodeURIComponent(sortBy)}`;
        if (debouncedSearch.trim()) {
          url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
        }

        const res = await apiFetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setProblems(data.problems || []);
        setTotalMatching(data.total || 0);
        setTotalPages(data.total_pages || 1);
        setPage(data.page || 1);
      } catch (err) {
        console.log('Error fetching DSA problems:', err);
        setError('Unable to load DSA problems right now. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [difficulty, company, topic, status, sortBy, debouncedSearch, limit]
  );

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    fetchProblems(page);
  }, [fetchProblems, page]);

  const updateUrlCompanyParam = (nextCompany) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextCompany === 'all') {
      nextParams.delete('company');
    } else {
      nextParams.set('company', nextCompany);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleCompanyChange = (val) => {
    setCompany(val);
    setPage(1);
    updateUrlCompanyParam(val);
  };

  const handleResetAllFilters = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setSearch('');
    setDebouncedSearch('');
    setDifficulty('all');
    setCompany('all');
    setTopic('all');
    setStatus('all');
    setSortBy('id');
    setPage(1);
    setSearchParams({}, { replace: true });
  };

  const handleToggleSolved = async (problemId) => {
    try {
      const res = await apiFetch('/api/dsa/toggle-solved', {
        method: 'POST',
        body: JSON.stringify({ problem_id: problemId }),
      });
      if (res.ok) {
        const data = await res.json();
        setProblems((prev) =>
          prev.map((p) => (p.id === problemId ? { ...p, is_solved: data.is_solved } : p))
        );
        setMeta((prev) => ({
          ...prev,
          solved_count: Math.max(0, prev.solved_count + (data.is_solved ? 1 : -1)),
        }));
        notifyStatsUpdated();
      }
    } catch (err) {
      console.log('Error toggling solved:', err);
    }
  };

  const handleToggleStar = async (problemId) => {
    try {
      const res = await apiFetch('/api/dsa/toggle-bookmark', {
        method: 'POST',
        body: JSON.stringify({ problem_id: problemId }),
      });
      if (res.ok) {
        const data = await res.json();
        setProblems((prev) =>
          prev.map((p) =>
            p.id === problemId ? { ...p, is_bookmarked: data.is_bookmarked } : p
          )
        );
        setMeta((prev) => ({
          ...prev,
          bookmarked_count: Math.max(
            0,
            prev.bookmarked_count + (data.is_bookmarked ? 1 : -1)
          ),
        }));
      }
    } catch (err) {
      console.log('Error toggling bookmark:', err);
    }
  };

  const handlePickRandom = () => {
    if (!problems.length) return;
    const unsolved = problems.filter((p) => !p.is_solved);
    const pool = unsolved.length > 0 ? unsolved : problems;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    if (chosen?.id) setActivePracticeProblemId(chosen.id);
  };

  const activeFilterCount =
    (status !== 'all' ? 1 : 0) +
    (difficulty !== 'all' ? 1 : 0) +
    (company !== 'all' ? 1 : 0) +
    (topic !== 'all' ? 1 : 0);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
      <Sidebar activeRoute="dsa" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header defaultCollapsed />

        <BlurDrop as="main" className="p-4 sm:p-6 lg:p-8 space-y-4 w-full">
          {/* Compact Header & Difficulty Distribution */}
          <DSAHeader
            totalProblems={meta.total_problems || 0}
            solvedCount={meta.solved_count || 0}
            starredCount={meta.bookmarked_count || 0}
            difficultyCounts={meta.difficulty_counts || {}}
            activeDifficulty={difficulty}
            onSelectDifficulty={(diff) => {
              setDifficulty(diff);
              setPage(1);
            }}
          />

          {/* Interactive Performance Overview Cards */}
          <ProblemStatistics
            totalProblems={meta.total_problems || 0}
            solvedCount={meta.solved_count || 0}
            starredCount={meta.bookmarked_count || 0}
            activeStatus={status}
            onSelectStatus={(nextStatus) => {
              setStatus(nextStatus);
              setPage(1);
            }}
          />

          {/* Unified Coding Problem Explorer */}
          <section
            aria-label="Coding Problem Explorer"
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden"
          >
            {/* Streamlined Single-Row Search & Unified Filters Toolbar */}
            <div className="p-3.5 sm:px-4 border-b border-[var(--border)] space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-full sm:flex-1 sm:min-w-[220px]">
                  <ProblemSearch
                    value={search}
                    onChange={handleSearchInputChange}
                    onSubmit={handleSearchSubmitImmediate}
                    onClear={() => {
                      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                      setSearch('');
                      setDebouncedSearch('');
                      setPage(1);
                    }}
                  />
                </div>

                {/* Single Unified Filter Drawer Trigger */}
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className={`inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border text-xs font-medium transition cursor-pointer shrink-0 ${
                    activeFilterCount > 0
                      ? 'border-[#FFA116]/50 bg-[#FFF8EE] text-[#D97706] dark:bg-[#FFA116]/12 dark:text-[#FFA116] dark:border-[#FFA116]/40 font-semibold'
                      : 'border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FFA116] text-white font-bold tabular-nums">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Selector */}
                <div className="relative flex items-center shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-3 pointer-events-none" />
                  <select
                    aria-label="Sort problems"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] pl-8 pr-3 rounded-lg outline-none focus:bg-[var(--surface)] focus:border-[#FFA116] focus:ring-2 focus:ring-[#FFA116]/15 cursor-pointer transition"
                  >
                    <option value="id">Default Order (ID)</option>
                    <option value="title">Problem Name (A–Z)</option>
                    <option value="difficulty">Difficulty (Easy → Hard)</option>
                    <option value="acceptance">Acceptance Rate</option>
                  </select>
                </div>

                {/* Random Problem CTA */}
                <button
                  type="button"
                  disabled={loading || problems.length === 0}
                  onClick={handlePickRandom}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold bg-[#FFF8EE] text-[#D97706] border border-[#FFA116]/30 hover:bg-[#FFA116] hover:text-white dark:bg-[#FFA116]/12 dark:text-[#FFA116] dark:hover:bg-[#FFA116] dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer shrink-0"
                  title="Open a random problem from your current list"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Pick One</span>
                </button>
              </div>

              {/* Active Removable Filter Chips (shown only when filtered) */}
              <ActiveFilterChips
                search={debouncedSearch}
                status={status}
                difficulty={difficulty}
                company={company}
                topic={topic}
                onClearSearch={() => {
                  if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
                  setSearch('');
                  setDebouncedSearch('');
                  setPage(1);
                }}
                onClearStatus={() => {
                  setStatus('all');
                  setPage(1);
                }}
                onClearDifficulty={() => {
                  setDifficulty('all');
                  setPage(1);
                }}
                onClearCompany={() => handleCompanyChange('all')}
                onClearTopic={() => {
                  setTopic('all');
                  setPage(1);
                }}
                onClearAll={handleResetAllFilters}
              />
            </div>

            {/* API Error State Banner */}
            {error && !loading && (
              <div className="px-4 py-3 bg-[#FEF2F2] dark:bg-[#F85149]/12 border-b border-[#DC2626]/20 flex items-center justify-between gap-3 text-xs text-[#DC2626] dark:text-[#F85149]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchProblems(page)}
                  className="inline-flex items-center gap-1 font-semibold underline hover:opacity-80 cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}

            {/* Problem Directory Table / Mobile Cards */}
            <ProblemTable
              problems={problems}
              loading={loading}
              sortBy={sortBy}
              onSortChange={(nextSort) => {
                setSortBy(nextSort);
                setPage(1);
              }}
              onToggleSolved={handleToggleSolved}
              onToggleStar={handleToggleStar}
              onOpenProblem={setActivePracticeProblemId}
              onSelectTopic={(t) => {
                setTopic(t);
                setPage(1);
              }}
              onSelectCompany={handleCompanyChange}
              onResetFilters={handleResetAllFilters}
            />

            {/* Pagination Footer */}
            {!loading && problems.length > 0 && (
              <ProblemPagination
                page={page}
                totalPages={totalPages}
                limit={limit}
                totalMatching={totalMatching}
                onPageChange={(nextPage) => setPage(nextPage)}
                onLimitChange={(nextLimit) => {
                  setLimit(nextLimit);
                  setPage(1);
                }}
              />
            )}
          </section>
        </BlurDrop>
      </div>

      {/* Unified Filter Drawer (Status, Difficulty, Company, Topic, Sort) */}
      <AdvancedFilters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        status={status}
        difficulty={difficulty}
        company={company}
        topic={topic}
        sortBy={sortBy}
        companies={meta.top_companies || []}
        topics={meta.top_topics || []}
        onApply={({ status: s, difficulty: d, company: c, topic: t, sortBy: sb }) => {
          setStatus(s);
          setDifficulty(d);
          setCompany(c);
          updateUrlCompanyParam(c);
          setTopic(t);
          setSortBy(sb || 'id');
          setPage(1);
        }}
        onReset={handleResetAllFilters}
      />

      {/* In-Platform Code Practice Modal */}
      {activePracticeProblemId && (
        <DSAPracticeModal
          problemId={activePracticeProblemId}
          onClose={() => setActivePracticeProblemId(null)}
          onProblemUpdated={(id, updates) => {
            setProblems((prev) => {
              const target = prev.find((p) => p.id === id);
              if (target) {
                setMeta((m) => ({
                  ...m,
                  solved_count:
                    updates.is_solved !== undefined && updates.is_solved !== target.is_solved
                      ? Math.max(0, m.solved_count + (updates.is_solved ? 1 : -1))
                      : m.solved_count,
                  bookmarked_count:
                    updates.is_bookmarked !== undefined &&
                    updates.is_bookmarked !== target.is_bookmarked
                      ? Math.max(0, m.bookmarked_count + (updates.is_bookmarked ? 1 : -1))
                      : m.bookmarked_count,
                }));
              }
              return prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
            });
          }}
        />
      )}
    </div>
  );
}
