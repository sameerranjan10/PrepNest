import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { 
  APTITUDE_CATEGORIES, 
  FALLBACK_APTITUDE_QUESTIONS, 
  formatDuration, 
  calculateTestGrade 
} from '@/lib/aptitudeData';
import { mockUser } from '@/lib/mockData';
import { 
  BrainCircuit, 
  Calculator, 
  BookOpen, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Award, 
  Flame, 
  Bookmark, 
  Zap, 
  Trophy, 
  ArrowRight, 
  Play, 
  Pause, 
  Check, 
  Eye, 
  BarChart3, 
  HelpCircle,
  ShieldCheck,
  Filter,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function AptitudePage() {
  // Navigation & View Mode: 'hub' | 'test' | 'results' | 'review'
  const [viewMode, setViewMode] = useState('hub');

  // Categories & Question Bank State
  const [categories, setCategories] = useState(APTITUDE_CATEGORIES);
  const [overallStats, setOverallStats] = useState({
    total_tests_completed: 4,
    overall_accuracy: 82.5,
    placement_readiness_boost: 88
  });
  const [recentTests, setRecentTests] = useState([
    {
      id: 101,
      category: 'quantitative',
      category_name: 'Quantitative Aptitude',
      total_questions: 10,
      correct_answers: 8,
      incorrect_answers: 2,
      unattempted: 0,
      score_percentage: 80.0,
      time_taken_seconds: 420,
      completed_at: '2026-08-30'
    },
    {
      id: 102,
      category: 'logical',
      category_name: 'Logical Reasoning',
      total_questions: 10,
      correct_answers: 9,
      incorrect_answers: 1,
      unattempted: 0,
      score_percentage: 90.0,
      time_taken_seconds: 350,
      completed_at: '2026-08-31'
    }
  ]);

  // Quiz Configuration Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedCategoryConfig, setSelectedCategoryConfig] = useState('all');
  const [questionCountConfig, setQuestionCountConfig] = useState(10);
  const [difficultyConfig, setDifficultyConfig] = useState('all');
  const [timerModeConfig, setTimerModeConfig] = useState('standard'); // 'standard' (60s/q), 'blitz' (30s/q), 'untimed'

  // Active Test State
  const [activeTestCategory, setActiveTestCategory] = useState('all');
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: 'A' | 'B' | 'C' | 'D' }
  const [markedForReview, setMarkedForReview] = useState({}); // { [questionId]: boolean }
  
  // Timer State
  const [timeRemaining, setTimeRemaining] = useState(600); // seconds
  const [totalTimeAllocated, setTotalTimeAllocated] = useState(600);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  
  // Submission & Confirmation Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test Results State
  const [testResult, setTestResult] = useState(null);

  // Review Mode State
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'correct' | 'incorrect' | 'unattempted'
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // Timer Ref
  const timerRef = useRef(null);

  // Fetch Categories & Stats from Backend on Mount
  useEffect(() => {
    fetchCategoriesAndStats();
    fetchRecentResults();
  }, []);

  const fetchCategoriesAndStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/aptitude/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.categories && data.categories.length > 0) {
          // Merge with UI styling tokens
          const merged = APTITUDE_CATEGORIES.map(localCat => {
            const apiCat = data.categories.find(c => c.id === localCat.id);
            return apiCat ? { ...localCat, ...apiCat } : localCat;
          });
          setCategories(merged);
        }
        if (data.overall_stats) {
          setOverallStats(data.overall_stats);
        }
      }
    } catch (err) {
      console.log('Backend not reachable yet, using offline defaults:', err.message);
    }
  };

  const fetchRecentResults = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/aptitude/results?limit=5');
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setRecentTests(data.results.map(r => ({
            ...r,
            category_name: r.category === 'quantitative' ? 'Quantitative Aptitude' : 
                           r.category === 'logical' ? 'Logical Reasoning' : 
                           r.category === 'verbal' ? 'Verbal Ability' : 'Full Placement Mock'
          })));
        }
      }
    } catch (err) {
      console.log('Using offline mock test history');
    }
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (viewMode === 'test' && !isTimerPaused && timerModeConfig !== 'untimed') {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmitOnTimeout();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpentSeconds(prev => prev + 1);
      }, 1000);
    } else if (viewMode === 'test' && timerModeConfig === 'untimed') {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewMode, isTimerPaused, timerModeConfig]);

  // Keyboard Shortcuts (1-4 / A-D for options, Arrow keys for navigation)
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
  }, [viewMode, currentQuestionIndex, testQuestions, userAnswers, isSubmitModalOpen]);

  // Launch Quiz from Preset or Config Modal
  const startQuiz = async (categoryId = 'all', count = 10, difficulty = 'all', timerMode = 'standard') => {
    setActiveTestCategory(categoryId);
    setIsConfigModalOpen(false);
    setUserAnswers({});
    setMarkedForReview({});
    setCurrentQuestionIndex(0);
    setTimeSpentSeconds(0);

    // Calculate Timer
    const timePerQ = timerMode === 'blitz' ? 30 : timerMode === 'untimed' ? 999999 : 60;
    const totalAllocated = count * timePerQ;
    setTimeRemaining(totalAllocated);
    setTotalTimeAllocated(totalAllocated);
    setIsTimerPaused(false);

    // Fetch questions from backend or use local fallback
    let questions = [];
    try {
      const url = `http://localhost:8000/api/aptitude/questions?category=${categoryId}&limit=${count}&difficulty=${difficulty}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          questions = data.questions;
        }
      }
    } catch (e) {
      console.log('Using offline questions fallback');
    }

    if (!questions || questions.length === 0) {
      // Offline fallback
      let filtered = [...FALLBACK_APTITUDE_QUESTIONS];
      if (categoryId !== 'all') {
        filtered = filtered.filter(q => q.category === categoryId);
      }
      if (difficulty !== 'all') {
        filtered = filtered.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
      }
      // Shuffle & Slice
      filtered.sort(() => 0.5 - Math.random());
      questions = filtered.slice(0, count);
    }

    setTestQuestions(questions);
    setViewMode('test');
  };

  const handleOptionSelect = (questionId, optionKey) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleClearSelection = (questionId) => {
    setUserAnswers(prev => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleToggleMarkForReview = (questionId) => {
    setMarkedForReview(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsSubmitModalOpen(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAutoSubmitOnTimeout = () => {
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    setIsSubmitModalOpen(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const answersPayload = testQuestions.map(q => ({
      question_id: q.id,
      selected_option: userAnswers[q.id] || null
    }));

    let resultData = null;

    // Try submitting to backend API
    try {
      const res = await fetch('http://localhost:8000/api/aptitude/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          category: activeTestCategory,
          time_taken_seconds: timeSpentSeconds,
          answers: answersPayload
        })
      });

      if (res.ok) {
        resultData = await res.json();
      }
    } catch (err) {
      console.log('Backend submit fallback offline calculation');
    }

    // Offline score calculation if API is offline
    if (!resultData) {
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;
      const detailed = testQuestions.map(q => {
        const selected = userAnswers[q.id] || null;
        const isCorrect = selected === q.correct_option;
        const isUnattempted = !selected;
        if (isUnattempted) unattempted++;
        else if (isCorrect) correct++;
        else incorrect++;

        return {
          id: q.id,
          category: q.category,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          question_text: q.question_text,
          options: q.options,
          selected_option: selected,
          correct_option: q.correct_option,
          is_correct: isCorrect,
          is_unattempted: isUnattempted,
          explanation: q.explanation
        };
      });

      const totalQ = testQuestions.length;
      const scorePct = Math.round((correct / totalQ) * 1000) / 10;
      const attempted = totalQ - unattempted;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 1000) / 10 : 0;
      const xp = (correct * 25) + (scorePct >= 80 ? 20 : 0);

      resultData = {
        result_id: Date.now(),
        category: activeTestCategory,
        total_questions: totalQ,
        correct_answers: correct,
        incorrect_answers: incorrect,
        unattempted: unattempted,
        score_percentage: scorePct,
        accuracy: accuracy,
        time_taken_seconds: timeSpentSeconds,
        xp_earned: xp,
        detailed_results: detailed
      };
    }

    setTestResult(resultData);
    setIsSubmitting(false);
    setViewMode('results');

    // Update test history
    fetchRecentResults();
    fetchCategoriesAndStats();
  };

  const getFilteredReviewQuestions = () => {
    if (!testResult || !testResult.detailed_results) return [];
    if (reviewFilter === 'correct') {
      return testResult.detailed_results.filter(q => q.is_correct);
    }
    if (reviewFilter === 'incorrect') {
      return testResult.detailed_results.filter(q => !q.is_correct && !q.is_unattempted);
    }
    if (reviewFilter === 'unattempted') {
      return testResult.detailed_results.filter(q => q.is_unattempted);
    }
    return testResult.detailed_results;
  };

  // -------------------------------------------------------------
  // RENDER: APTITUDE HUB VIEW
  // -------------------------------------------------------------
  if (viewMode === 'hub') {
    return (
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Sidebar activeRoute="aptitude" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="p-6 lg:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-slate-800 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Campus Recruitment Assessment Engine</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Aptitude & Analytical Mastery Hub
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Practice curated campus placement questions with real-time timers, question palettes, step-by-step mathematical explanations, and predictive aptitude grading.
                  </p>

                  {/* Badges / Metrics Row */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-400">Streak:</span>
                      <strong className="text-white">{mockUser.streakDays} Days</strong>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span className="text-slate-400">Total Solved:</span>
                      <strong className="text-white">120+ Practice Questions</strong>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-400">Overall Accuracy:</span>
                      <strong className="text-emerald-400">{overallStats.overall_accuracy}%</strong>
                    </div>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => startQuiz('all', 10, 'all', 'standard')}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/30 transition-all transform hover:scale-[1.02]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Quick 10-Q Placement Mock</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedCategoryConfig('all');
                      setIsConfigModalOpen(true);
                    }}
                    className="px-6 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Custom Practice Assessment</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Category Cards Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <span>Aptitude Domains & Categories</span>
                  </h2>
                  <p className="text-xs text-slate-400">Select a specific area or train across all core assessment pillars.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const IconComponent = cat.id === 'quantitative' ? Calculator : 
                                        cat.id === 'logical' ? BrainCircuit : BookOpen;
                  const borderGlow = cat.id === 'quantitative' ? 'hover:border-indigo-500/50' : 
                                     cat.id === 'logical' ? 'hover:border-purple-500/50' : 'hover:border-pink-500/50';

                  return (
                    <div 
                      key={cat.id}
                      className={`p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl ${borderGlow} transition-all duration-300 flex flex-col justify-between space-y-6 group hover:shadow-2xl hover:shadow-indigo-500/10`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-lg`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                            {cat.badge}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {cat.description || cat.tagline}
                          </p>
                        </div>

                        {/* Subtopics Chips */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Key Subtopics:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(cat.subtopics || []).slice(0, 4).map((topic, i) => (
                              <span key={i} className="text-[10px] bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50">
                                {topic}
                              </span>
                            ))}
                            {(cat.subtopics || []).length > 4 && (
                              <span className="text-[10px] text-slate-400 px-1 py-0.5">
                                +{(cat.subtopics.length - 4)} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer & Action */}
                      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
                        <div className="text-xs">
                          <div className="font-bold text-slate-200">{cat.total_questions || 10} Questions</div>
                          <div className="text-[11px] text-slate-400">Avg Score: {cat.avg_score ? `${cat.avg_score}%` : '85%'}</div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedCategoryConfig(cat.id);
                            setIsConfigModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                        >
                          <span>Practice</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Analytics & Recent Test History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Recent Test History */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    <span>Recent Test Attempts & Accuracy</span>
                  </h2>
                  <span className="text-xs text-slate-400">Synced to SQLite Database</span>
                </div>

                <div className="rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl overflow-hidden">
                  {recentTests.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No tests attempted yet. Start your first practice quiz above!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800/60">
                      {recentTests.map((test) => {
                        const grade = calculateTestGrade(test.score_percentage);
                        return (
                          <div key={test.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition">
                            <div className="flex items-center gap-4">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                                test.score_percentage >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                test.score_percentage >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {test.score_percentage}%
                              </div>

                              <div>
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                  {test.category_name || test.category.toUpperCase()}
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${grade.bg} ${grade.color}`}>
                                    {grade.label}
                                  </span>
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                  <span className="text-emerald-400 font-semibold">{test.correct_answers} Correct</span>
                                  <span>•</span>
                                  <span className="text-rose-400">{test.incorrect_answers} Incorrect</span>
                                  <span>•</span>
                                  <span>{formatDuration(test.time_taken_seconds || 0)}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => startQuiz(test.category, test.total_questions || 10, 'all', 'standard')}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Retake</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Placement Readiness Impact Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/80 to-indigo-950/30 border border-slate-800 backdrop-blur-xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Diagnostic Insight</span>
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>

                  <h3 className="text-base font-bold text-white">
                    Aptitude Impact on Placement Probability
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tier-1 firms (Google, Amazon, TCS Digital, Infosys Power Programmer) filter over 65% of applicants in the initial Online Aptitude (OA) round.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Quantitative Readiness</span>
                      <span className="text-indigo-400">84%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '84%' }}></div>
                    </div>

                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Logical Reasoning</span>
                      <span className="text-purple-400">92%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: '92%' }}></div>
                    </div>

                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">Verbal Ability</span>
                      <span className="text-pink-400">78%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Practice daily to unlock the <strong>Top 1% Candidate Badge</strong>.</span>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Custom Practice Config Modal */}
        {isConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Configure Practice Test</h3>
                    <p className="text-xs text-slate-400">Tailor question count, category, and timer pacing</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsConfigModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Domain</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedCategoryConfig('all')}
                    className={`p-3 rounded-2xl text-xs font-bold border transition text-left ${
                      selectedCategoryConfig === 'all'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    ⚡ All Domains (Mixed Mock)
                  </button>
                  <button
                    onClick={() => setSelectedCategoryConfig('quantitative')}
                    className={`p-3 rounded-2xl text-xs font-bold border transition text-left ${
                      selectedCategoryConfig === 'quantitative'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    🔢 Quantitative Aptitude
                  </button>
                  <button
                    onClick={() => setSelectedCategoryConfig('logical')}
                    className={`p-3 rounded-2xl text-xs font-bold border transition text-left ${
                      selectedCategoryConfig === 'logical'
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                        : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    🧠 Logical Reasoning
                  </button>
                  <button
                    onClick={() => setSelectedCategoryConfig('verbal')}
                    className={`p-3 rounded-2xl text-xs font-bold border transition text-left ${
                      selectedCategoryConfig === 'verbal'
                        ? 'bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/30'
                        : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    📖 Verbal Ability
                  </button>
                </div>
              </div>

              {/* Number of Questions */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Number of Questions</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => setQuestionCountConfig(cnt)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        questionCountConfig === cnt
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Difficulty Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'Mixed' },
                    { id: 'Easy', label: 'Easy' },
                    { id: 'Medium', label: 'Medium' },
                    { id: 'Hard', label: 'Hard' }
                  ].map(diff => (
                    <button
                      key={diff.id}
                      onClick={() => setDifficultyConfig(diff.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        difficultyConfig === diff.id
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                          : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Pacing Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Timer Pacing</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTimerModeConfig('standard')}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                      timerModeConfig === 'standard'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    ⏱️ Standard (60s/Q)
                  </button>
                  <button
                    onClick={() => setTimerModeConfig('blitz')}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                      timerModeConfig === 'blitz'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    ⚡ Blitz (30s/Q)
                  </button>
                  <button
                    onClick={() => setTimerModeConfig('untimed')}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition ${
                      timerModeConfig === 'untimed'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    🧘 Relaxed
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => startQuiz(selectedCategoryConfig, questionCountConfig, difficultyConfig, timerModeConfig)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition"
                >
                  Start Assessment Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: ACTIVE TEST RUNNER INTERFACE
  // -------------------------------------------------------------
  if (viewMode === 'test') {
    const currentQ = testQuestions[currentQuestionIndex] || {};
    const answeredCount = Object.keys(userAnswers).length;
    const isAnswered = Boolean(userAnswers[currentQ.id]);
    const isFlagged = Boolean(markedForReview[currentQ.id]);

    const isTimerLow = timeRemaining < 120 && timerModeConfig !== 'untimed';

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
        {/* Top Sticky Test Navigation Bar */}
        <header className="h-18 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>PrepNest Aptitude Test</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {activeTestCategory === 'all' ? 'Comprehensive Mock' : activeTestCategory.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Answered: <strong className="text-emerald-400">{answeredCount}</strong> of {testQuestions.length}
              </p>
            </div>
          </div>

          {/* Center/Right: Timer & Submit Action */}
          <div className="flex items-center gap-4">
            {/* Live Countdown Timer */}
            {timerModeConfig !== 'untimed' ? (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${
                isTimerLow 
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse' 
                  : 'bg-slate-800/80 border-slate-700 text-slate-200'
              }`}>
                <Clock className={`w-4 h-4 ${isTimerLow ? 'text-rose-400' : 'text-indigo-400'}`} />
                <span className="font-mono font-bold text-sm tracking-wider">
                  {formatDuration(timeRemaining)}
                </span>
                <button
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  title={isTimerPaused ? "Resume Timer" : "Pause Timer"}
                  className="p-1 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition ml-1"
                >
                  {isTimerPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Elapsed: {formatDuration(timeSpentSeconds)}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <Check className="w-4 h-4" />
              <span>Submit Assessment</span>
            </button>
          </div>
        </header>

        {/* Test Body Container */}
        <div className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Question Panel (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Question Header Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
                    Question {currentQuestionIndex + 1} of {testQuestions.length}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-800/60 px-3 py-1 rounded-xl border border-slate-800">
                    {currentQ.subtopic || 'General Aptitude'}
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    currentQ.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    currentQ.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {currentQ.difficulty || 'Medium'}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleMarkForReview(currentQ.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition ${
                    isFlagged 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{isFlagged ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Question Progress Bar */}
              <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / testQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Card Box */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed whitespace-pre-line">
                  {currentQ.question_text}
                </h3>
              </div>

              {/* 4 Interactive Option Cards */}
              <div className="space-y-3">
                {currentQ.options && Object.entries(currentQ.options).map(([optKey, optValue]) => {
                  const isSelected = userAnswers[currentQ.id] === optKey;
                  return (
                    <button
                      key={optKey}
                      onClick={() => handleOptionSelect(currentQ.id, optKey)}
                      className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                        }`}>
                          {optKey}
                        </div>
                        <span className="text-sm font-medium leading-normal">{optValue}</span>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-500 text-white' 
                          : 'border-slate-700 group-hover:border-slate-500'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {isAnswered && (
                  <button
                    onClick={() => handleClearSelection(currentQ.id)}
                    className="text-xs text-slate-400 hover:text-rose-400 transition underline underline-offset-4"
                  >
                    Clear Response
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-xs font-bold flex items-center gap-2 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                >
                  <span>{currentQuestionIndex === testQuestions.length - 1 ? 'Review & Submit' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Question Palette Sidebar (1 Column) */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-6">
              
              {/* Question Status Legend */}
              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-3">
                  Question Palette
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-emerald-500/80"></span>
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-500/80"></span>
                    <span>Flagged ({Object.keys(markedForReview).filter(k => markedForReview[k]).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-700"></span>
                    <span>Unanswered ({testQuestions.length - answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded ring-2 ring-indigo-500 bg-slate-800"></span>
                    <span>Current</span>
                  </div>
                </div>
              </div>

              {/* Numbered Question Palette Grid */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  Jump to Question:
                </span>
                <div className="grid grid-cols-5 gap-2.5">
                  {testQuestions.map((q, idx) => {
                    const isQAnswered = Boolean(userAnswers[q.id]);
                    const isQFlagged = Boolean(markedForReview[q.id]);
                    const isQCurrent = idx === currentQuestionIndex;

                    let btnClass = 'bg-slate-800 text-slate-400 border-slate-700/60 hover:bg-slate-700';

                    if (isQCurrent) {
                      btnClass = 'ring-2 ring-indigo-500 bg-indigo-600/30 text-white font-extrabold border-indigo-400';
                    } else if (isQAnswered && isQFlagged) {
                      btnClass = 'bg-purple-600/40 text-purple-200 border-purple-500 font-bold';
                    } else if (isQAnswered) {
                      btnClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold';
                    } else if (isQFlagged) {
                      btnClass = 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${btnClass}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instructions / Tip Box */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-xs text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pro Tip</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Use keys <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">B</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">C</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">D</kbd> to pick answers and <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">→</kbd> to advance.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Ready to Submit?</h3>
                <p className="text-xs text-slate-400">Review your attempt summary before finalizing</p>
              </div>

              {/* Summary Stats in Modal */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{testQuestions.length}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Total</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-400">{answeredCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Answered</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-rose-400">{testQuestions.length - answeredCount}</div>
                  <div className="text-[10px] text-slate-400 uppercase">Unanswered</div>
                </div>
              </div>

              {testQuestions.length - answeredCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>You have {testQuestions.length - answeredCount} unattempted questions remaining.</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Keep Solving
                </button>
                <button
                  onClick={handleSubmitTest}
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Evaluating...' : 'Confirm Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: RESULTS & SCORE CALCULATION VIEW
  // -------------------------------------------------------------
  if (viewMode === 'results' && testResult) {
    const grade = calculateTestGrade(testResult.score_percentage);

    return (
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Sidebar activeRoute="aptitude" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="p-6 lg:p-8 space-y-8 overflow-y-auto max-w-5xl mx-auto w-full">
            {/* Celebration & Score Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-slate-900 border border-slate-800 p-8 shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                
                {/* Score Gauge Circle */}
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" className="text-slate-800" fill="transparent" />
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="54" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        className={testResult.score_percentage >= 75 ? 'text-emerald-500' : testResult.score_percentage >= 50 ? 'text-amber-500' : 'text-rose-500'}
                        strokeDasharray="339.29" 
                        strokeDashoffset={339.29 * (1 - testResult.score_percentage / 100)} 
                        strokeLinecap="round" 
                        fill="transparent" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="font-black text-3xl text-white">{testResult.score_percentage}%</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Accuracy</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${grade.bg} ${grade.color}`}>
                      <Award className="w-3.5 h-3.5" />
                      <span>{grade.label}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white">Assessment Completed!</h2>
                    <p className="text-xs text-slate-300 max-w-md">
                      Great effort! Your score and answers have been recorded in the platform database.
                    </p>
                  </div>
                </div>

                {/* XP Earned Pill */}
                <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-1">
                  <div className="text-2xl font-black text-indigo-400">+{testResult.xp_earned} XP</div>
                  <div className="text-[11px] font-semibold text-slate-400">Placement XP Gained</div>
                </div>
              </div>
            </div>

            {/* Performance Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{testResult.correct_answers} / {testResult.total_questions}</div>
                  <div className="text-xs text-slate-400">Correct Answers</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{testResult.incorrect_answers}</div>
                  <div className="text-xs text-slate-400">Incorrect</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{testResult.unattempted}</div>
                  <div className="text-xs text-slate-400">Unattempted</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{formatDuration(testResult.time_taken_seconds)}</div>
                  <div className="text-xs text-slate-400">Total Time Taken</div>
                </div>
              </div>
            </div>

            {/* Diagnostic Feedback Card */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Performance Diagnostic</span>
              </h3>
              <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                <p>
                  • <strong>Accuracy Rating:</strong> You scored {testResult.score_percentage}%. {testResult.score_percentage >= 80 ? 'Exceptional problem solving consistency! You are well prepared for Tier-1 screening.' : 'Focus on time management and eliminating distractor choices in multi-step problems.'}
                </p>
                <p>
                  • <strong>Time Pacing:</strong> Average of {Math.round((testResult.time_taken_seconds / (testResult.total_questions || 1)))} seconds per question. Ideal campus OA standard is &lt;50 seconds per problem.
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <button
                onClick={() => setViewMode('hub')}
                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Back to Aptitude Hub</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => startQuiz(activeTestCategory, testResult.total_questions || 10, 'all', 'standard')}
                  className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Test</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentReviewIndex(0);
                    setViewMode('review');
                  }}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                >
                  <Eye className="w-4 h-4" />
                  <span>Review Step-by-Step Solutions</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: STEP-BY-STEP ANSWER REVIEW MODE
  // -------------------------------------------------------------
  if (viewMode === 'review' && testResult) {
    const reviewList = getFilteredReviewQuestions();
    const currentQ = reviewList[currentReviewIndex] || testResult.detailed_results[0] || {};

    return (
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Sidebar activeRoute="aptitude" />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="p-6 lg:p-8 space-y-6 overflow-y-auto max-w-5xl mx-auto w-full">
            {/* Review Header Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('results')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to Score
                  </button>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">Answer Review Mode</span>
                </div>
                <h1 className="text-2xl font-black text-white mt-1">
                  Question-by-Question Solution Breakdown
                </h1>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                <button
                  onClick={() => { setReviewFilter('all'); setCurrentReviewIndex(0); }}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                    reviewFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({testResult.detailed_results.length})
                </button>
                <button
                  onClick={() => { setReviewFilter('correct'); setCurrentReviewIndex(0); }}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                    reviewFilter === 'correct' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Correct ({testResult.correct_answers})
                </button>
                <button
                  onClick={() => { setReviewFilter('incorrect'); setCurrentReviewIndex(0); }}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                    reviewFilter === 'incorrect' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Incorrect ({testResult.incorrect_answers})
                </button>
                <button
                  onClick={() => { setReviewFilter('unattempted'); setCurrentReviewIndex(0); }}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                    reviewFilter === 'unattempted' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Skipped ({testResult.unattempted})
                </button>
              </div>
            </div>

            {reviewList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-900/60 rounded-3xl border border-slate-800">
                No questions found under the "{reviewFilter}" filter.
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Question Status Pill & Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
                      Review {currentReviewIndex + 1} of {reviewList.length}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-xl border border-slate-800">
                      {currentQ.subtopic || 'Aptitude'}
                    </span>
                  </div>

                  <div>
                    {currentQ.is_correct ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+25 XP)
                      </span>
                    ) : currentQ.is_unattempted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        <AlertCircle className="w-3.5 h-3.5" /> Unattempted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" /> Incorrect (0 XP)
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text Box */}
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed whitespace-pre-line">
                    {currentQ.question_text}
                  </h3>
                </div>

                {/* Option Breakdown with Correct vs Chosen Comparison */}
                <div className="space-y-3">
                  {currentQ.options && Object.entries(currentQ.options).map(([optKey, optVal]) => {
                    const isUserChoice = currentQ.selected_option === optKey;
                    const isCorrectAnswer = currentQ.correct_option === optKey;

                    let cardClass = 'bg-slate-900/40 border-slate-800 text-slate-400';
                    let badgeLabel = null;

                    if (isCorrectAnswer) {
                      cardClass = 'bg-emerald-500/10 border-emerald-500/60 text-emerald-100 shadow-md shadow-emerald-500/10';
                      badgeLabel = 'Correct Answer';
                    } else if (isUserChoice && !isCorrectAnswer) {
                      cardClass = 'bg-rose-500/10 border-rose-500/60 text-rose-100 shadow-md shadow-rose-500/10';
                      badgeLabel = 'Your Selection';
                    }

                    return (
                      <div
                        key={optKey}
                        className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between transition-all ${cardClass}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isCorrectAnswer ? 'bg-emerald-500 text-white' :
                            isUserChoice ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {optKey}
                          </div>
                          <span className="text-sm font-medium">{optVal}</span>
                        </div>

                        {badgeLabel && (
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                            isCorrectAnswer ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {badgeLabel}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Step-by-Step Explanation Box */}
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-indigo-500/30 backdrop-blur-xl shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Detailed Step-by-Step Explanation</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/60 p-5 rounded-2xl border border-slate-800 font-sans">
                    {currentQ.explanation || 'No detailed explanation provided for this question.'}
                  </p>
                </div>

                {/* Review Navigation Buttons */}
                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentReviewIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentReviewIndex === 0}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Question</span>
                  </button>

                  <button
                    onClick={() => setCurrentReviewIndex(prev => Math.min(reviewList.length - 1, prev + 1))}
                    disabled={currentReviewIndex === reviewList.length - 1}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  return null;
}
