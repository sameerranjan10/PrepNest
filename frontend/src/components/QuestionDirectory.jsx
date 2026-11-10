import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Zap,
  Layers,
  CheckCircle2,
  Circle,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AptitudeFilters } from '@/components/aptitude/AptitudeFilters';
import { QuestionTable } from '@/components/aptitude/QuestionTable';
import { QuestionSolverModal } from '@/components/aptitude/QuestionSolverModal';
import {
  fetchModules,
  fetchDirectoryQuestions,
  fetchQuestionById,
  submitQuestionAnswer,
  toggleQuestionStar,
} from '@/services/aptitudeService';

export default function QuestionDirectory({
  availableCompanies = [],
  initialCompany = 'all',
  lockCompany = false,
  onStartQuiz,
  controlledCategory = null,
  onCategoryChange = null,
  controlledSubtopic = null,
  onSubtopicChange = null,
  controlledStatus = null,
  onStatusChange = null,
  showInlineStats = true,
  onProgressUpdated = null,
}) {
  const [internalCategory, setInternalCategory] = useState('all');
  const [internalSubtopic, setInternalSubtopic] = useState('all');
  const [internalStatus, setInternalStatus] = useState('all');

  const category = controlledCategory !== null ? controlledCategory : internalCategory;
  const subtopic = controlledSubtopic !== null ? controlledSubtopic : internalSubtopic;
  const status = controlledStatus !== null ? controlledStatus : internalStatus;

  const setCategory = (val) => {
    if (onCategoryChange) onCategoryChange(val);
    else setInternalCategory(val);
  };
  const setSubtopic = (val) => {
    if (onSubtopicChange) onSubtopicChange(val);
    else setInternalSubtopic(val);
  };
  const setStatus = (val) => {
    if (onStatusChange) onStatusChange(val);
    else setInternalStatus(val);
  };

  const [company, setCompany] = useState(initialCompany);
  const [difficulty, setDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Server Data State (Zero hardcoded defaults)
  const [questions, setQuestions] = useState([]);
  const [totalMatching, setTotalMatching] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [totalStarred, setTotalStarred] = useState(0);
  const [companyTotal, setCompanyTotal] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modules, setModules] = useState({});

  // Single Question Solver Modal State
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [loadingModalDetail, setLoadingModalDetail] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [solveResult, setSolveResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (initialCompany) {
      setCompany(initialCompany);
      setPage(1);
    }
  }, [initialCompany]);

  useEffect(() => {
    setPage(1);
  }, [category, subtopic, status]);

  const loadModules = useCallback(
    async (comp = company) => {
      try {
        const data = await fetchModules({ company: comp });
        setModules(data?.modules || {});
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    },
    [company]
  );

  useEffect(() => {
    loadModules(company);
  }, [company, loadModules]);

  const loadDirectory = useCallback(
    async (pageToFetch = 1) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDirectoryQuestions({
          category,
          subtopic,
          company,
          difficulty,
          status,
          sortBy,
          search: debouncedSearch,
          page: pageToFetch,
          limit,
        });
        setQuestions(data?.questions || []);
        setTotalMatching(Number(data?.total) || 0);
        setTotalSolved(Number(data?.total_solved) || 0);
        setTotalStarred(Number(data?.total_starred) || 0);
        setCompanyTotal(data?.company_total ?? null);
        setTotalPages(Number(data?.total_pages) || 1);
        setPage(Number(data?.page) || 1);
      } catch (err) {
        setError(err.message || 'Unable to load aptitude questions right now.');
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    },
    [category, subtopic, company, difficulty, status, sortBy, debouncedSearch, limit]
  );

  useEffect(() => {
    loadDirectory(page);
  }, [loadDirectory, page]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  const subtopicOptions = useMemo(() => {
    if (category === 'all') {
      const list = [];
      Object.values(modules).forEach((subList) => {
        subList.forEach((s) => list.push(s.subtopic));
      });
      return [...new Set(list)];
    }
    return (modules[category] || []).map((s) => s.subtopic);
  }, [category, modules]);

  const handleToggleStar = async (questionId) => {
    try {
      const data = await toggleQuestionStar(questionId);
      setQuestions((prev) => {
        const updated = prev.map((q) =>
          q.id === questionId ? { ...q, is_starred: data.is_starred } : q
        );
        return status === 'starred' && !data.is_starred
          ? updated.filter((q) => q.id !== questionId)
          : updated;
      });
      setTotalStarred(Number(data.starred_count) || 0);
      if (activeQuestion?.id === questionId) {
        setActiveQuestion((prev) =>
          prev ? { ...prev, is_starred: data.is_starred } : prev
        );
      }
      onProgressUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to update bookmark.');
    }
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 280);
  };

  const handleSearchSubmit = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setDebouncedSearch(search);
    setPage(1);
  };

  const handleResetFilters = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setSearch('');
    setDebouncedSearch('');
    setCategory('all');
    setSubtopic('all');
    if (!lockCompany) setCompany('all');
    setDifficulty('all');
    setStatus('all');
    setSortBy('id');
    setPage(1);
  };

  const handleOpenSolveModal = async (q) => {
    setActiveQuestion(q);
    setSubmitError(null);
    setSelectedOption(q.user_selected || null);
    setSolveResult(
      q.is_solved
        ? {
            is_correct: true,
            correct_option: q.correct_option,
            explanation: q.explanation,
            status: 'solved',
          }
        : null
    );
    setLoadingModalDetail(true);
    try {
      const fresh = await fetchQuestionById(q.id);
      if (fresh) {
        setActiveQuestion(fresh);
        setSelectedOption(fresh.user_selected || null);
        setSolveResult(
          fresh.is_solved
            ? {
                is_correct: true,
                correct_option: fresh.correct_option,
                explanation: fresh.explanation,
                status: 'solved',
              }
            : null
        );
      }
    } catch (err) {
      setSubmitError(err.message || 'Could not load question details.');
    } finally {
      setLoadingModalDetail(false);
    }
  };

  const handleCheckAnswer = async () => {
    if (!activeQuestion || !selectedOption) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const data = await submitQuestionAnswer(activeQuestion.id, selectedOption);
      setSolveResult(data);
      const wasSolved = Boolean(activeQuestion.is_solved);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === activeQuestion.id
            ? {
                ...q,
                is_solved: Boolean(data.is_correct) || q.is_solved,
                user_status: data.status,
                user_selected: selectedOption,
                correct_option: data.is_correct ? data.correct_option : q.correct_option,
                explanation: data.is_correct ? data.explanation : q.explanation,
              }
            : q
        )
      );
      setActiveQuestion((prev) =>
        prev
          ? {
              ...prev,
              is_solved: Boolean(data.is_correct) || prev.is_solved,
              user_status: data.status,
              user_selected: selectedOption,
            }
          : prev
      );
      if (data.is_correct && !wasSolved) {
        setTotalSolved((prev) => prev + 1);
      }
      onProgressUpdated?.();
    } catch (err) {
      setSubmitError(err.message || 'Failed to evaluate answer on server.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeModalIdx = activeQuestion
    ? questions.findIndex((q) => q.id === activeQuestion.id)
    : -1;

  const quantTotal = (modules['quantitative'] || []).reduce((acc, m) => acc + m.total, 0);
  const logicalTotal = (modules['logical'] || []).reduce((acc, m) => acc + m.total, 0);
  const verbalTotal = (modules['verbal'] || []).reduce((acc, m) => acc + m.total, 0);
  const sumDomains = quantTotal + logicalTotal + verbalTotal;
  const displayBankCount =
    sumDomains > 0 ? sumDomains : companyTotal ?? totalMatching;
  const progressPercent =
    displayBankCount > 0
      ? Math.min(100, Math.round((totalSolved / displayBankCount) * 100))
      : 0;

  const startItem = totalMatching === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(totalMatching, page * limit);

  return (
    <div className="space-y-4">
      {showInlineStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            {
              id: 'all',
              label: company !== 'all' ? `${company} Questions` : 'Total Questions',
              value: displayBankCount.toLocaleString(),
              icon: Layers,
              iconClass: 'text-[var(--foreground-secondary)]',
              clickable: true,
            },
            {
              id: 'solved',
              label: 'Solved',
              value: totalSolved.toLocaleString(),
              icon: CheckCircle2,
              iconClass: 'text-[#16A34A] dark:text-[#3FB950]',
              clickable: true,
            },
            {
              id: 'unsolved',
              label: 'Unsolved',
              value: Math.max(0, displayBankCount - totalSolved).toLocaleString(),
              icon: Circle,
              iconClass: 'text-[var(--foreground-muted)]',
              clickable: true,
            },
            {
              id: 'completion',
              label: 'Completion',
              value: `${progressPercent}%`,
              icon: BookOpen,
              iconClass: 'text-[#FFA116]',
              clickable: false,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            const isActive = stat.clickable && status === stat.id;
            return (
              <button
                key={stat.id}
                type="button"
                disabled={!stat.clickable}
                onClick={() => {
                  if (!stat.clickable) return;
                  setStatus(isActive && stat.id !== 'all' ? 'all' : stat.id);
                  setPage(1);
                }}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-left transition ${
                  stat.clickable ? 'cursor-pointer' : 'cursor-default'
                } ${
                  isActive
                    ? 'border-[#FFA116]/50 bg-[#FFF8EE]/70 dark:bg-[#FFA116]/10 dark:border-[#FFA116]/40'
                    : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <div className="min-w-0">
                  <span className="block text-[11px] font-medium text-[var(--foreground-secondary)] truncate">
                    {stat.label}
                  </span>
                  <span className="block text-lg font-bold text-[var(--foreground)] tabular-nums leading-tight mt-0.5">
                    {stat.value}
                  </span>
                </div>
                <span className="w-8 h-8 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${stat.iconClass}`} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      <section
        aria-label="Aptitude Question Directory"
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden"
      >
        <AptitudeFilters
          status={status}
          onStatusChange={(nextStatus) => {
            setStatus(nextStatus);
            setPage(1);
          }}
          search={search}
          debouncedSearch={debouncedSearch}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onClearSearch={() => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            setSearch('');
            setDebouncedSearch('');
            setPage(1);
          }}
          category={category}
          onCategoryChange={(nextCat) => {
            setCategory(nextCat);
            setSubtopic('all');
            setPage(1);
          }}
          subtopic={subtopic}
          subtopicOptions={subtopicOptions}
          onSubtopicChange={(nextSub) => {
            setSubtopic(nextSub);
            setPage(1);
          }}
          difficulty={difficulty}
          onDifficultyChange={(nextDiff) => {
            setDifficulty(nextDiff);
            setPage(1);
          }}
          company={company}
          lockCompany={lockCompany}
          onCompanyChange={(nextComp) => {
            setCompany(nextComp);
            setPage(1);
          }}
          sortBy={sortBy}
          onSortChange={(nextSort) => {
            setSortBy(nextSort);
            setPage(1);
          }}
          totalCount={displayBankCount}
          solvedCount={totalSolved}
          starredCount={totalStarred}
          onResetAll={handleResetFilters}
        />

        <div className="px-4 py-2 bg-[var(--surface-secondary)]/60 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[var(--foreground-secondary)] tabular-nums">
            <span>
              <strong className="text-[var(--foreground)] font-semibold">
                {totalMatching.toLocaleString()}
              </strong>{' '}
              {totalMatching === 1 ? 'question' : 'questions'}
            </span>
            <span className="text-[var(--foreground-muted)]">·</span>
            <span>
              Page <strong className="text-[var(--foreground)]">{page}</strong> of{' '}
              {totalPages}
            </span>
          </div>

          {onStartQuiz && (
            <button
              type="button"
              disabled={totalMatching === 0}
              onClick={() =>
                onStartQuiz(category, 10, difficulty, 'standard', company, subtopic)
              }
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#FFF8EE] text-[#D97706] border border-[#FFA116]/30 hover:bg-[#FFA116] hover:text-white dark:bg-[#FFA116]/12 dark:text-[#FFA116] dark:hover:bg-[#FFA116] dark:hover:text-white disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              <Zap className="w-3 h-3" />
              <span>
                {subtopic !== 'all'
                  ? `Practice ${subtopic} (10 Qs)`
                  : 'Practice Filtered Set (10 Qs)'}
              </span>
            </button>
          )}
        </div>

        {error && !loading && (
          <div className="px-4 py-3 bg-[#FEF2F2] dark:bg-[#F85149]/12 border-b border-[#DC2626]/20 flex items-center justify-between gap-3 text-xs text-[#DC2626] dark:text-[#F85149]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => loadDirectory(page)}
              className="inline-flex items-center gap-1 font-semibold underline hover:opacity-80 cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        <QuestionTable
          questions={questions}
          loading={loading}
          onToggleStar={handleToggleStar}
          onOpenQuestion={handleOpenSolveModal}
          onSelectCategory={(cat) => {
            setCategory(cat);
            setSubtopic('all');
            setPage(1);
          }}
          onSelectSubtopic={(sub) => {
            setSubtopic(sub);
            setPage(1);
          }}
          onResetFilters={handleResetFilters}
        />

        {!loading && questions.length > 0 && (
          <div className="px-4 py-3 bg-[var(--surface-secondary)] border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--foreground-secondary)]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="tabular-nums">
                Showing{' '}
                <strong className="text-[var(--foreground)] font-semibold">
                  {startItem}–{endItem}
                </strong>{' '}
                of{' '}
                <strong className="text-[var(--foreground)] font-semibold">
                  {totalMatching.toLocaleString()}
                </strong>
              </span>

              <div className="flex items-center gap-1.5">
                <label
                  htmlFor="apt-page-size"
                  className="text-[11px] text-[var(--foreground-muted)]"
                >
                  Per page:
                </label>
                <select
                  id="apt-page-size"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-7 px-2 rounded-md bg-[var(--surface)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] outline-none focus:border-[#FFA116] cursor-pointer"
                >
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <span className="text-xs tabular-nums px-1">
                Page <strong className="text-[var(--foreground)]">{page}</strong> /{' '}
                {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                iconRight={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      <QuestionSolverModal
        question={activeQuestion}
        loadingDetail={loadingModalDetail}
        submitError={submitError}
        selectedOption={selectedOption}
        solveResult={solveResult}
        submitting={submitting}
        isStarred={Boolean(activeQuestion?.is_starred)}
        hasPrev={activeModalIdx > 0}
        hasNext={activeModalIdx >= 0 && activeModalIdx < questions.length - 1}
        onSelectOption={setSelectedOption}
        onSubmitAnswer={handleCheckAnswer}
        onRetry={() => {
          setSelectedOption(null);
          setSolveResult(null);
          setSubmitError(null);
        }}
        onPrevQuestion={() => {
          if (activeModalIdx > 0) {
            handleOpenSolveModal(questions[activeModalIdx - 1]);
          }
        }}
        onNextQuestion={() => {
          if (activeModalIdx >= 0 && activeModalIdx < questions.length - 1) {
            handleOpenSolveModal(questions[activeModalIdx + 1]);
          }
        }}
        onToggleStar={handleToggleStar}
        onClose={() => setActiveQuestion(null)}
      />
    </div>
  );
}
