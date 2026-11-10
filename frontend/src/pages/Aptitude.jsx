import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BlurDrop } from '@/components/ui/BlurDrop';
import QuestionDirectory from '@/components/QuestionDirectory';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  X,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

import { AptitudeHeader } from '@/components/aptitude/AptitudeHeader';
import { AptitudeStatistics } from '@/components/aptitude/AptitudeStatistics';
import { PracticeCategoryExplorer } from '@/components/aptitude/PracticeCategoryExplorer';
import { AssessmentDirectory } from '@/components/aptitude/AssessmentDirectory';
import { AssessmentWorkspace } from '@/components/aptitude/AssessmentWorkspace';
import { AssessmentResults } from '@/components/aptitude/AssessmentResults';
import {
  fetchCategoriesAndOverview,
  fetchAssessmentHistory,
  fetchAssessmentResultDetail,
  generateAssessment,
  fetchAssessmentSession,
  saveAssessmentProgress,
  submitAssessment,
} from '@/services/aptitudeService';

const ACTIVE_ASSESSMENT_KEY = 'prepnest_active_aptitude_assessment';

const CATEGORY_LABEL_MAP = {
  quantitative: 'Quantitative Aptitude',
  logical: 'Logical Reasoning',
  verbal: 'Verbal Ability',
};

export default function AptitudePage() {
  const [searchParams] = useSearchParams();
  const companyFromUrl = searchParams.get('company');

  // Navigation & View Mode: 'hub' | 'test' | 'results' | 'review'
  const [viewMode, setViewMode] = useState('hub');

  // Section C -> Section D linked filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubtopic, setSelectedSubtopic] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const directoryRef = useRef(null);
  const assessmentsRef = useRef(null);

  // Real Backend State (zero mock defaults)
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [hubError, setHubError] = useState(null);
  const [overallStats, setOverallStats] = useState({
    total_questions: 0,
    solved_questions: 0,
    unsolved_questions: 0,
    starred_questions: 0,
    evaluated_attempts: 0,
    total_tests_completed: 0,
    overall_accuracy: 0,
    current_streak: 0,
  });
  const [recentTests, setRecentTests] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [availableCompanies, setAvailableCompanies] = useState([]);

  // Custom Assessment Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedCategoryConfig, setSelectedCategoryConfig] = useState('all');
  const [selectedCompanyConfig, setSelectedCompanyConfig] = useState(
    companyFromUrl || 'all'
  );
  const [questionCountConfig, setQuestionCountConfig] = useState(10);
  const [difficultyConfig, setDifficultyConfig] = useState('all');
  const [timerModeConfig, setTimerModeConfig] = useState('standard');

  // Active Assessment State (server-backed)
  const [activeAssessmentId, setActiveAssessmentId] = useState(null);
  const [activeTestCategory, setActiveTestCategory] = useState('all');
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentError, setAssessmentError] = useState(null);
  const [startingAssessment, setStartingAssessment] = useState(false);

  // Results & Review State
  const [testResult, setTestResult] = useState(null);
  const [reviewFilter, setReviewFilter] = useState('all');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const timerRef = useRef(null);
  const progressSyncTimeoutRef = useRef(null);

  useEffect(() => {
    if (companyFromUrl) {
      setSelectedCompanyConfig(companyFromUrl);
      setIsConfigModalOpen(true);
    }
  }, [companyFromUrl]);

  const loadHubOverview = useCallback(async ({ force = false } = {}) => {
    setCategoriesLoading(true);
    setHubError(null);
    try {
      const data = await fetchCategoriesAndOverview({ force });
      setCategories(Array.isArray(data?.categories) ? data.categories : []);
      setAvailableCompanies(Array.isArray(data?.companies) ? data.companies : []);
      if (data?.overall_stats) {
        setOverallStats(data.overall_stats);
      }
    } catch (err) {
      setHubError(err.message || 'Unable to connect to Aptitude backend.');
      setCategories([]);
      setAvailableCompanies([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async ({ force = false } = {}) => {
    setHistoryLoading(true);
    try {
      const data = await fetchAssessmentHistory(10, { force });
      const rows = Array.isArray(data?.results) ? data.results : [];
      setRecentTests(
        rows.map((r) => ({
          ...r,
          category_name: CATEGORY_LABEL_MAP[r.category] || 'Full Placement Mock',
        }))
      );
    } catch {
      setRecentTests([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHubOverview();
    loadHistory();
  }, [loadHubOverview, loadHistory]);

  // Resume active in-progress backend assessment session on refresh if any
  useEffect(() => {
    let savedId = null;
    try {
      savedId = sessionStorage.getItem(ACTIVE_ASSESSMENT_KEY);
    } catch {
      savedId = null;
    }
    if (!savedId) return;

    fetchAssessmentSession(savedId)
      .then((session) => {
        if (session && session.status === 'in_progress' && session.questions?.length) {
          setActiveAssessmentId(session.assessment_id);
          setActiveTestCategory(session.category || 'all');
          setTimerModeConfig(session.timer_mode || 'standard');
          setTestQuestions(session.questions);
          const restoredAnswers = {};
          Object.entries(session.saved_answers || {}).forEach(([k, v]) => {
            restoredAnswers[Number(k)] = v;
          });
          const restoredMarks = {};
          Object.entries(session.marked_review || {}).forEach(([k, v]) => {
            restoredMarks[Number(k)] = Boolean(v);
          });
          setUserAnswers(restoredAnswers);
          setMarkedForReview(restoredMarks);
          setTimeRemaining(session.time_limit_seconds || session.questions.length * 60);
          setTimeSpentSeconds(0);
          setCurrentQuestionIndex(0);
          setViewMode('test');
        } else {
          sessionStorage.removeItem(ACTIVE_ASSESSMENT_KEY);
        }
      })
      .catch(() => {
        try {
          sessionStorage.removeItem(ACTIVE_ASSESSMENT_KEY);
        } catch {}
      });
  }, []);

  // Countdown Timer
  useEffect(() => {
    if (viewMode === 'test' && !isTimerPaused && timerModeConfig !== 'untimed') {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    } else if (viewMode === 'test' && timerModeConfig === 'untimed') {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewMode, isTimerPaused, timerModeConfig]);

  // Persist in-progress assessment answers/review flags to FastAPI backend
  const syncProgressToServer = useCallback(
    (nextAnswers, nextMarks) => {
      if (!activeAssessmentId) return;
      if (progressSyncTimeoutRef.current) clearTimeout(progressSyncTimeoutRef.current);
      progressSyncTimeoutRef.current = setTimeout(() => {
        saveAssessmentProgress(activeAssessmentId, {
          savedAnswers: nextAnswers,
          markedReview: nextMarks,
        }).catch(() => {});
      }, 350);
    },
    [activeAssessmentId]
  );

  useEffect(() => {
    return () => {
      if (progressSyncTimeoutRef.current) clearTimeout(progressSyncTimeoutRef.current);
    };
  }, []);

  const handleOptionSelect = (questionId, optionKey) => {
    setUserAnswers((prev) => {
      const next = { ...prev, [questionId]: optionKey };
      syncProgressToServer(next, markedForReview);
      return next;
    });
  };

  const handleClearSelection = (questionId) => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      syncProgressToServer(next, markedForReview);
      return next;
    });
  };

  const handleToggleMarkForReview = (questionId) => {
    setMarkedForReview((prev) => {
      const next = { ...prev, [questionId]: !prev[questionId] };
      syncProgressToServer(userAnswers, next);
      return next;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== 'test' || isSubmitModalOpen) return;
      const currentQ = testQuestions[currentQuestionIndex];
      if (!currentQ) return;
      if (['1', 'a', 'A'].includes(e.key)) handleOptionSelect(currentQ.id, 'A');
      else if (['2', 'b', 'B'].includes(e.key)) handleOptionSelect(currentQ.id, 'B');
      else if (['3', 'c', 'C'].includes(e.key)) handleOptionSelect(currentQ.id, 'C');
      else if (['4', 'd', 'D'].includes(e.key)) handleOptionSelect(currentQ.id, 'D');
      else if (e.key === 'ArrowRight' || e.key === 'Enter') handleNextQuestion();
      else if (e.key === 'ArrowLeft') handlePrevQuestion();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentQuestionIndex, testQuestions, isSubmitModalOpen]);

  const startQuiz = async (
    categoryId = 'all',
    count = 10,
    difficulty = 'all',
    timerMode = 'standard',
    company = 'all',
    subtopic = 'all'
  ) => {
    setStartingAssessment(true);
    setAssessmentError(null);
    setIsConfigModalOpen(false);

    try {
      const session = await generateAssessment({
        category: categoryId,
        difficulty,
        company,
        subtopic,
        limit: count,
        timerMode,
      });

      if (!session?.questions || session.questions.length === 0) {
        setAssessmentError(
          'No aptitude questions matched those filters in the database. Try broader filters.'
        );
        return;
      }

      setActiveAssessmentId(session.assessment_id);
      try {
        if (session.assessment_id) {
          sessionStorage.setItem(ACTIVE_ASSESSMENT_KEY, String(session.assessment_id));
        }
      } catch {}

      setActiveTestCategory(categoryId);
      setTimerModeConfig(timerMode);
      setTestQuestions(session.questions);
      setUserAnswers({});
      setMarkedForReview({});
      setCurrentQuestionIndex(0);
      setTimeSpentSeconds(0);
      setTimeRemaining(
        session.time_limit_seconds || (timerMode === 'blitz' ? count * 30 : count * 60)
      );
      setIsTimerPaused(false);
      setViewMode('test');
    } catch (err) {
      setAssessmentError(err.message || 'Unable to generate mock assessment from server.');
    } finally {
      setStartingAssessment(false);
    }
  };

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    setAssessmentError(null);
    if (timerRef.current) clearInterval(timerRef.current);

    const answersPayload = testQuestions.map((q) => ({
      question_id: q.id,
      selected_option: userAnswers[q.id] || null,
    }));

    try {
      const evaluated = await submitAssessment(activeAssessmentId, {
        category: activeTestCategory,
        timeTakenSeconds: timeSpentSeconds,
        answers: answersPayload,
      });

      try {
        sessionStorage.removeItem(ACTIVE_ASSESSMENT_KEY);
      } catch {}

      setIsSubmitModalOpen(false);
      setActiveAssessmentId(null);
      setTestResult(evaluated);
      setViewMode('results');

      loadHubOverview({ force: true });
      loadHistory({ force: true });
    } catch (err) {
      setIsSubmitModalOpen(false);
      setAssessmentError(
        err.message || 'Failed to submit assessment to server. Please retry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspectPastResult = async (resultId) => {
    setAssessmentError(null);
    try {
      const detail = await fetchAssessmentResultDetail(resultId);
      if (detail) {
        setTestResult(detail);
        setActiveTestCategory(detail.category || 'all');
        setViewMode('results');
      }
    } catch (err) {
      setAssessmentError(err.message || 'Could not load saved assessment breakdown.');
    }
  };

  const getFilteredReviewQuestions = () => {
    if (!testResult || !testResult.detailed_results) return [];
    if (reviewFilter === 'correct') {
      return testResult.detailed_results.filter((q) => q.is_correct);
    }
    if (reviewFilter === 'incorrect') {
      return testResult.detailed_results.filter((q) => !q.is_correct && !q.is_unattempted);
    }
    if (reviewFilter === 'unattempted') {
      return testResult.detailed_results.filter((q) => q.is_unattempted);
    }
    return testResult.detailed_results;
  };

  // =============================================================
  // VIEW 1: APTITUDE HUB (SECTIONS A, B, C, D, E)
  // =============================================================
  if (viewMode === 'hub') {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
        <Sidebar activeRoute="aptitude" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header defaultCollapsed />

          <BlurDrop as="main" className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
            <AptitudeHeader
              accuracy={overallStats.overall_accuracy || 0}
              testsCompleted={overallStats.total_tests_completed || 0}
              streakDays={overallStats.current_streak || 0}
              onQuickPractice={() => {
                setSelectedStatus('unsolved');
                directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              onOpenMockAssessments={() => {
                assessmentsRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            />

            {(hubError || assessmentError) && (
              <div className="px-4 py-3 rounded-xl bg-[#FEF2F2] dark:bg-[#F85149]/12 border border-[#DC2626]/25 flex items-center justify-between gap-3 text-xs text-[#DC2626] dark:text-[#F85149]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{hubError || assessmentError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAssessmentError(null);
                    loadHubOverview({ force: true });
                    loadHistory({ force: true });
                  }}
                  className="inline-flex items-center gap-1 font-semibold underline hover:opacity-80 cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            )}

            <AptitudeStatistics
              totalQuestions={overallStats.total_questions || 0}
              solvedCount={overallStats.solved_questions || 0}
              accuracy={overallStats.overall_accuracy || 0}
              testsCompleted={overallStats.total_tests_completed || 0}
              activeStatus={selectedStatus}
              onSelectStatus={(nextStatus) => {
                setSelectedStatus(nextStatus);
                directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              onJumpToAssessments={() =>
                assessmentsRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }
            />

            <PracticeCategoryExplorer
              categories={categories}
              loading={categoriesLoading}
              activeCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setSelectedSubtopic('all');
                if (cat !== 'all') {
                  directoryRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }
              }}
              onSelectSubtopic={(cat, sub) => {
                setSelectedCategory(cat);
                setSelectedSubtopic(sub);
                directoryRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            />

            <div ref={directoryRef} className="space-y-3">
              <div>
                <h2 className="text-sm font-bold text-[var(--foreground)]">
                  Question Directory
                </h2>
                <p className="text-xs text-[var(--foreground-secondary)]">
                  Filter by category, subtopic, difficulty, or status and solve questions with server-side validation.
                </p>
              </div>

              <QuestionDirectory
                availableCompanies={availableCompanies}
                initialCompany={companyFromUrl || 'all'}
                controlledCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                controlledSubtopic={selectedSubtopic}
                onSubtopicChange={setSelectedSubtopic}
                controlledStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                showInlineStats={false}
                onProgressUpdated={() => loadHubOverview({ force: true })}
                onStartQuiz={(cat, count, diff, mode, comp, sub) =>
                  startQuiz(cat, count, diff, mode, comp, sub)
                }
              />
            </div>

            <div ref={assessmentsRef}>
              <AssessmentDirectory
                availableCompanies={availableCompanies}
                recentTests={recentTests}
                historyLoading={historyLoading}
                onStartAssessment={(cat, count, diff, mode, comp, sub) =>
                  startQuiz(cat, count, diff, mode, comp, sub)
                }
                onOpenCustomModal={() => {
                  setSelectedCategoryConfig('all');
                  setIsConfigModalOpen(true);
                }}
                onInspectResult={handleInspectPastResult}
              />
            </div>
          </BlurDrop>
        </div>

        {/* Custom Assessment Modal */}
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF8EE] dark:bg-[#FFA116]/12 text-[#FFA116] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--foreground)]">
                      Configure Custom Assessment
                    </h3>
                    <p className="text-xs text-[var(--foreground-secondary)]">
                      Generate a timed assessment from real database questions.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  aria-label="Close modal"
                  className="p-1.5 rounded-md text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground-secondary)]">
                  Assessment Domain
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'All Domains' },
                    ...categories.map((c) => ({ id: c.id, label: c.name.split(' ')[0] })),
                  ].map((dom) => (
                    <button
                      key={dom.id}
                      type="button"
                      onClick={() => setSelectedCategoryConfig(dom.id)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
                        selectedCategoryConfig === dom.id
                          ? 'bg-[#FFF8EE] dark:bg-[#FFA116]/12 text-[#D97706] dark:text-[#FFA116] border-[#FFA116]'
                          : 'bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {dom.label}
                    </button>
                  ))}
                </div>
              </div>

              {availableCompanies.length > 0 && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="custom-apt-company"
                    className="text-xs font-semibold text-[var(--foreground-secondary)] block"
                  >
                    Target Company Track
                  </label>
                  <select
                    id="custom-apt-company"
                    value={selectedCompanyConfig}
                    onChange={(e) => setSelectedCompanyConfig(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] outline-none focus:border-[#FFA116] cursor-pointer"
                  >
                    <option value="all">All Companies</option>
                    {availableCompanies.map((comp) => (
                      <option key={comp} value={comp}>
                        {comp}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground-secondary)]">
                  Number of Questions
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[5, 10, 15, 20, 30, 50].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCountConfig(cnt)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        questionCountConfig === cnt
                          ? 'bg-[#FFF8EE] dark:bg-[#FFA116]/12 text-[#D97706] dark:text-[#FFA116] border-[#FFA116]'
                          : 'bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground-secondary)]">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'Mixed' },
                    { id: 'Easy', label: 'Easy' },
                    { id: 'Medium', label: 'Medium' },
                    { id: 'Hard', label: 'Hard' },
                  ].map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setDifficultyConfig(diff.id)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        difficultyConfig === diff.id
                          ? 'bg-[#FFF8EE] dark:bg-[#FFA116]/12 text-[#D97706] dark:text-[#FFA116] border-[#FFA116]'
                          : 'bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground-secondary)]">
                  Timer Pacing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'standard', label: 'Standard (60s/Q)' },
                    { id: 'blitz', label: 'Blitz (30s/Q)' },
                    { id: 'untimed', label: 'Untimed' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTimerModeConfig(mode.id)}
                      className={`p-2 rounded-lg text-xs font-medium border text-center transition cursor-pointer ${
                        timerModeConfig === mode.id
                          ? 'bg-[#FFF8EE] dark:bg-[#FFA116]/12 text-[#D97706] dark:text-[#FFA116] border-[#FFA116] font-semibold'
                          : 'bg-[var(--surface-secondary)] text-[var(--foreground-secondary)] border-[var(--border)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[var(--border)]">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsConfigModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={startingAssessment}
                  onClick={() =>
                    startQuiz(
                      selectedCategoryConfig,
                      questionCountConfig,
                      difficultyConfig,
                      timerModeConfig,
                      selectedCompanyConfig,
                      'all'
                    )
                  }
                >
                  Start Assessment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =============================================================
  // VIEW 2: TIMED ASSESSMENT WORKSPACE
  // =============================================================
  if (viewMode === 'test') {
    return (
      <AssessmentWorkspace
        activeTestCategory={activeTestCategory}
        questions={testQuestions}
        currentIndex={currentQuestionIndex}
        userAnswers={userAnswers}
        markedForReview={markedForReview}
        timerMode={timerModeConfig}
        timeRemaining={timeRemaining}
        timeSpentSeconds={timeSpentSeconds}
        isTimerPaused={isTimerPaused}
        isSubmitModalOpen={isSubmitModalOpen}
        isSubmitting={isSubmitting}
        onTogglePause={() => setIsTimerPaused((p) => !p)}
        onSelectOption={handleOptionSelect}
        onClearOption={handleClearSelection}
        onToggleReviewMark={handleToggleMarkForReview}
        onPrevQuestion={handlePrevQuestion}
        onNextQuestion={handleNextQuestion}
        onJumpToQuestion={setCurrentQuestionIndex}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
        onCloseSubmitModal={() => setIsSubmitModalOpen(false)}
        onConfirmSubmit={handleSubmitTest}
        onExitTest={() => {
          if (timerRef.current) clearInterval(timerRef.current);
          try {
            sessionStorage.removeItem(ACTIVE_ASSESSMENT_KEY);
          } catch {}
          setActiveAssessmentId(null);
          setViewMode('hub');
        }}
      />
    );
  }

  // =============================================================
  // VIEW 3: ASSESSMENT RESULTS
  // =============================================================
  if (viewMode === 'results' && testResult) {
    return (
      <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
        <Sidebar activeRoute="aptitude" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header defaultCollapsed />
          <BlurDrop as="main" className="p-4 sm:p-6 lg:p-8 w-full md:pr-[124px] lg:pr-[132px]">
            <AssessmentResults
              result={testResult}
              onBackToHub={() => setViewMode('hub')}
              onRetake={() =>
                startQuiz(
                  activeTestCategory,
                  testResult.total_questions || 10,
                  'all',
                  timerModeConfig
                )
              }
              onReviewSolutions={() => {
                setCurrentReviewIndex(0);
                setViewMode('review');
              }}
            />
          </BlurDrop>
        </div>
      </div>
    );
  }

  // =============================================================
  // VIEW 4: SOLUTION REVIEW MODE
  // =============================================================
  if (viewMode === 'review' && testResult) {
    const reviewList = getFilteredReviewQuestions();
    const currentQ =
      reviewList[currentReviewIndex] || testResult.detailed_results?.[0] || {};

    return (
      <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
        <Sidebar activeRoute="aptitude" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header defaultCollapsed />

          <BlurDrop as="main" className="p-4 sm:p-6 lg:p-8 space-y-5 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 md:pr-[124px] lg:pr-[132px] border-b border-[var(--border)] pb-4">
              <div>
                <button
                  type="button"
                  onClick={() => setViewMode('results')}
                  className="text-xs text-[#FFA116] hover:underline font-semibold flex items-center gap-1 mb-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back to Score Summary
                </button>
                <h1 className="text-xl font-bold text-[var(--foreground)]">
                  Solution Review Breakdown
                </h1>
              </div>

              <div className="inline-flex items-center p-1 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg gap-0.5 text-xs overflow-x-auto max-w-full">
                {[
                  { id: 'all', label: `All (${testResult.detailed_results.length})` },
                  { id: 'correct', label: `Correct (${testResult.correct_answers})` },
                  { id: 'incorrect', label: `Incorrect (${testResult.incorrect_answers})` },
                  { id: 'unattempted', label: `Skipped (${testResult.unattempted})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setReviewFilter(tab.id);
                      setCurrentReviewIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold transition whitespace-nowrap cursor-pointer ${
                      reviewFilter === tab.id
                        ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm'
                        : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {reviewList.length === 0 ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-xs text-[var(--foreground-secondary)]">
                No questions found under this filter.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#D97706] dark:text-[#FFA116] bg-[#FFF8EE] dark:bg-[#FFA116]/12 border border-[#FFA116]/30 px-2.5 py-0.5 rounded-md tabular-nums">
                      Review {currentReviewIndex + 1} of {reviewList.length}
                    </span>
                    <span className="text-xs text-[var(--foreground-secondary)] bg-[var(--surface-secondary)] px-2.5 py-0.5 rounded-md">
                      {currentQ.subtopic || 'Aptitude'}
                    </span>
                  </div>

                  {currentQ.is_correct ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </Badge>
                  ) : currentQ.is_unattempted ? (
                    <Badge variant="neutral" size="sm">
                      <AlertCircle className="w-3.5 h-3.5" /> Unattempted
                    </Badge>
                  ) : (
                    <Badge variant="hard" size="sm">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </Badge>
                  )}
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
                  <p className="text-sm sm:text-base font-medium text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                    {currentQ.question_text}
                  </p>
                </div>

                <div className="space-y-2">
                  {currentQ.options &&
                    Object.entries(currentQ.options).map(([optKey, optVal]) => {
                      const isUserChoice = currentQ.selected_option === optKey;
                      const isCorrectAnswer = currentQ.correct_option === optKey;

                      let cardClass =
                        'bg-[var(--surface)] border-[var(--border)] text-[var(--foreground-secondary)]';
                      let badgeLabel = null;

                      if (isCorrectAnswer) {
                        cardClass =
                          'bg-[#F0FDF4] dark:bg-[#3FB950]/14 border-[#16A34A] dark:border-[#3FB950] text-[#16A34A] dark:text-[#3FB950] font-semibold';
                        badgeLabel = 'Correct Answer';
                      } else if (isUserChoice && !isCorrectAnswer) {
                        cardClass =
                          'bg-[#FEF2F2] dark:bg-[#F85149]/14 border-[#DC2626] dark:border-[#F85149] text-[#DC2626] dark:text-[#F85149] font-semibold';
                        badgeLabel = 'Your Selection';
                      }

                      return (
                        <div
                          key={optKey}
                          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition ${cardClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 ${
                                isCorrectAnswer
                                  ? 'bg-[#16A34A] text-white'
                                  : isUserChoice
                                  ? 'bg-[#DC2626] text-white'
                                  : 'bg-[var(--surface-secondary)] text-[var(--foreground-secondary)]'
                              }`}
                            >
                              {optKey}
                            </span>
                            <span>{optVal}</span>
                          </div>

                          {badgeLabel && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {badgeLabel}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFA116] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Detailed Explanation</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line bg-[var(--surface-secondary)] p-4 rounded-lg border border-[var(--border)]">
                    {currentQ.explanation ||
                      'No step-by-step explanation is available for this question.'}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setCurrentReviewIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentReviewIndex === 0}
                    icon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Previous Question
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      setCurrentReviewIndex((prev) =>
                        Math.min(reviewList.length - 1, prev + 1)
                      )
                    }
                    disabled={currentReviewIndex === reviewList.length - 1}
                    iconRight={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Next Question
                  </Button>
                </div>
              </div>
            )}
          </BlurDrop>
        </div>
      </div>
    );
  }

  return null;
}
