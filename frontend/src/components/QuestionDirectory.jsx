import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  Layers, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  XCircle,
  HelpCircle,
  BookOpen,
  Zap,
  Flame,
  Award
} from 'lucide-react';

export default function QuestionDirectory({ 
  availableCompanies = [], 
  categories = [], 
  initialCompany = 'all',
  lockCompany = false,
  companyMeta = null,
  onStartQuiz 
}) {
  // Directory Filters
  const [category, setCategory] = useState('all');
  const [subtopic, setSubtopic] = useState('all');
  const [company, setCompany] = useState(initialCompany);
  const [difficulty, setDifficulty] = useState('all');
  const [status, setStatus] = useState('all'); // 'all' | 'solved' | 'unsolved'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Data State
  const [questions, setQuestions] = useState([]);
  const [totalMatching, setTotalMatching] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [companyTotal, setCompanyTotal] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modules/Subtopics State
  const [modules, setModules] = useState({});
  const [subtopicOptions, setSubtopicOptions] = useState([]);

  // Single Question Solve Modal
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [solveResult, setSolveResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync initialCompany if changed from outside
  useEffect(() => {
    if (initialCompany) {
      setCompany(initialCompany);
      setPage(1);
    }
  }, [initialCompany]);

  // Fetch modules summary whenever company filter changes
  useEffect(() => {
    fetchModules(company);
  }, [company]);

  // Fetch questions whenever filters change
  useEffect(() => {
    fetchDirectory(page);
  }, [category, subtopic, company, difficulty, status, page]);

  // Update subtopic options when category changes
  useEffect(() => {
    if (category === 'all') {
      const allSubtopics = [];
      Object.values(modules).forEach((subList) => {
        subList.forEach((s) => allSubtopics.push(s.subtopic));
      });
      setSubtopicOptions([...new Set(allSubtopics)]);
    } else if (modules[category]) {
      setSubtopicOptions(modules[category].map((s) => s.subtopic));
    } else {
      setSubtopicOptions([]);
    }
    setSubtopic('all');
    setPage(1);
  }, [category, modules]);

  const fetchModules = async (comp = company) => {
    try {
      let url = 'http://localhost:8000/api/aptitude/modules';
      if (comp && comp !== 'all') {
        url += `?company=${encodeURIComponent(comp)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || {});
      }
    } catch (err) {
      console.log('Error fetching modules:', err);
    }
  };

  const fetchDirectory = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      let url = `http://localhost:8000/api/aptitude/directory?page=${pageToFetch}&limit=15`;
      if (category !== 'all') url += `&category=${category}`;
      if (subtopic !== 'all') url += `&subtopic=${encodeURIComponent(subtopic)}`;
      if (company !== 'all') url += `&company=${encodeURIComponent(company)}`;
      if (difficulty !== 'all') url += `&difficulty=${difficulty}`;
      if (status !== 'all') url += `&status=${status}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        setTotalMatching(data.total || 0);
        setTotalSolved(data.total_solved || 0);
        setCompanyTotal(data.company_total || null);
        setTotalPages(data.total_pages || 1);
        setPage(data.page || 1);
      }
    } catch (err) {
      console.log('Error fetching questions directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDirectory(1);
  };

  const handleOpenSolveModal = (q) => {
    setActiveQuestion(q);
    setSelectedOption(q.user_selected || null);
    setSolveResult(
      q.is_solved
        ? {
            is_correct: true,
            correct_option: q.correct_option,
            explanation: q.explanation,
            status: 'solved'
          }
        : null
    );
  };

  const handleCheckAnswer = async () => {
    if (!activeQuestion || !selectedOption) return;
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/aptitude/solve-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: activeQuestion.id,
          selected_option: selectedOption
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSolveResult(data);
        // Update live in list
        setQuestions((prev) =>
          prev.map((q) => {
            if (q.id === activeQuestion.id) {
              return {
                ...q,
                is_solved: data.is_correct || q.is_solved,
                user_status: data.status,
                user_selected: selectedOption
              };
            }
            return q;
          })
        );
        if (data.is_correct && !activeQuestion.is_solved) {
          setTotalSolved((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.log('Error submitting single answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextInModal = () => {
    const currentIndex = questions.findIndex((q) => q.id === activeQuestion.id);
    if (currentIndex >= 0 && currentIndex < questions.length - 1) {
      handleOpenSolveModal(questions[currentIndex + 1]);
    }
  };

  const quantTotal = (modules['quantitative'] || []).reduce((acc, m) => acc + m.total, 0);
  const logicalTotal = (modules['logical'] || []).reduce((acc, m) => acc + m.total, 0);
  const verbalTotal = (modules['verbal'] || []).reduce((acc, m) => acc + m.total, 0);
  const sumDomains = quantTotal + logicalTotal + verbalTotal;
  const displayBankCount = sumDomains > 0 ? sumDomains : (companyTotal || (category === 'all' && company === 'all' ? 1172 : totalMatching));
  const progressPercent = displayBankCount > 0 ? Math.min(100, Math.round((totalSolved / displayBankCount) * 100)) : 0;

  return (
    <div className="space-y-8">
      {/* Overview Progress Stats Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {company !== 'all' ? `${company} Recruitment Archive` : 'Interactive Question Bank'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {displayBankCount} Total Available
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {company !== 'all' ? `${company} Problem Tracker & Syllabus` : 'Your Placement Problem Tracker'}
          </h2>
          <p className="text-xs text-slate-400">
            {company !== 'all'
              ? `Browse, filter, and solve questions tagged for ${company}. Track your solved progress module-wise.`
              : 'Browse, filter, and solve questions on the spot. Your progress updates and saves automatically.'}
          </p>
        </div>

        {/* Progress Bar & Badges */}
        <div className="flex items-center gap-6 w-full md:w-auto bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="text-center px-2">
            <div className="text-2xl font-black text-emerald-400">{totalSolved}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Solved</div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-2xl font-black text-amber-400">{Math.max(0, displayBankCount - totalSolved)}</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Remaining</div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-center px-2">
            <div className="text-2xl font-black text-indigo-400">{progressPercent}%</div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completion</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
        {/* Row 1: Domain Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => { setCategory('all'); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                category === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Domains ({displayBankCount})
            </button>
            <button
              onClick={() => { setCategory('quantitative'); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                category === 'quantitative'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🔢 Quantitative ({quantTotal || (company === 'all' ? 467 : 0)})
            </button>
            <button
              onClick={() => { setCategory('logical'); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                category === 'logical'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🧠 Logical Reasoning ({logicalTotal || (company === 'all' ? 398 : 0)})
            </button>
            <button
              onClick={() => { setCategory('verbal'); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                category === 'verbal'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              📖 Verbal Ability ({verbalTotal || (company === 'all' ? 307 : 0)})
            </button>
          </div>

          {/* Solved Status Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => { setStatus('all'); setPage(1); }}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                status === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setStatus('unsolved'); setPage(1); }}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                status === 'unsolved' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Circle className="w-3 h-3" /> Unsolved
            </button>
            <button
              onClick={() => { setStatus('solved'); setPage(1); }}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                status === 'solved' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" /> Solved
            </button>
          </div>
        </div>

        {/* Row 2: Search + Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl focus-within:border-indigo-500">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search problem title, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
            />
          </form>

          {/* Subtopic Filter */}
          <select
            value={subtopic}
            onChange={(e) => { setSubtopic(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">📂 All Subtopics ({subtopicOptions.length})</option>
            {subtopicOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Company Filter or Locked Indicator */}
          {lockCompany ? (
            <div className="flex items-center justify-between bg-slate-950 border border-indigo-500/40 px-3 py-2 rounded-xl text-xs text-indigo-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                {company} OA Track
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">Active</span>
            </div>
          ) : (
            <select
              value={company}
              onChange={(e) => { setCompany(e.target.value); setPage(1); }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">🏢 All Companies ({availableCompanies.length})</option>
              {availableCompanies.map((c) => (
                <option key={c} value={c}>
                  {c} Track
                </option>
              ))}
            </select>
          )}

          {/* Difficulty Filter */}
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">⚡ All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Directory Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{questions.length}</strong> of{' '}
            <strong className="text-white">{totalMatching}</strong> matching questions
          </div>
          {subtopic !== 'all' && (
            <button
              onClick={() => onStartQuiz && onStartQuiz(category, 10, difficulty, 'standard', company, subtopic)}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" /> Practice This Module (10 Qs)
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading questions from PostgreSQL database...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-200">No questions found matching your filter</h4>
            <p className="text-xs text-slate-500">Try changing your search, company, or subtopic filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Solved Status Indicator */}
                  <div className="mt-1 shrink-0">
                    {q.is_solved ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" title="Solved" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400" title="Unsolved" />
                    )}
                  </div>

                  {/* Question Content */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">#{q.id}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {q.subtopic}
                      </span>
                      {q.company_tag && q.company_tag !== 'General' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                          🏢 {q.company_tag}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          q.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : q.difficulty === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-200 leading-snug group-hover:text-white transition">
                      {q.question_text}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenSolveModal(q)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      q.is_solved
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {q.is_solved ? 'Review Solution' : 'Solve on Spot'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 font-semibold flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Single Question Solver Modal */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
                  Problem #{activeQuestion.id}
                </span>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-xl">
                  {activeQuestion.subtopic}
                </span>
                {activeQuestion.company_tag && activeQuestion.company_tag !== 'General' && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                    🏢 {activeQuestion.company_tag} Track
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    activeQuestion.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : activeQuestion.difficulty === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {activeQuestion.difficulty}
                </span>
              </div>
              <button
                onClick={() => setActiveQuestion(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-slate-100 leading-relaxed">
              {activeQuestion.question_text}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Select Option:</label>
              {activeQuestion.options &&
                Object.entries(activeQuestion.options).map(([optKey, optVal]) => {
                  const isSelected = selectedOption === optKey;
                  const isCorrect = solveResult && solveResult.correct_option === optKey;
                  const isWrong = solveResult && !solveResult.is_correct && isSelected;

                  return (
                    <button
                      key={optKey}
                      disabled={Boolean(solveResult)}
                      onClick={() => setSelectedOption(optKey)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                          : isWrong
                          ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                          : isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-white'
                          : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-500 text-slate-950'
                              : isWrong
                              ? 'bg-rose-500 text-white'
                              : isSelected
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {optKey}
                        </span>
                        <span>{optVal}</span>
                      </div>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isWrong && <XCircle className="w-4 h-4 text-rose-400" />}
                    </button>
                  );
                })}
            </div>

            {/* Result & Explanation Card */}
            {solveResult && (
              <div
                className={`p-5 rounded-2xl border space-y-3 animate-in fade-in ${
                  solveResult.is_correct
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : 'bg-rose-950/30 border-rose-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {solveResult.is_correct ? (
                      <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Correct Answer! (+25 XP)
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold text-sm flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Incorrect Answer!
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    Correct Option: <strong className="text-emerald-400 font-extrabold">{solveResult.correct_option}</strong>
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  <div className="font-bold text-slate-400 mb-1">Step-by-step Solution:</div>
                  <p>{solveResult.explanation || 'No step-by-step solution provided.'}</p>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveQuestion(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {!solveResult ? (
                  <button
                    disabled={!selectedOption || submitting}
                    onClick={handleCheckAnswer}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition"
                  >
                    {submitting ? 'Checking...' : 'Check Answer & View Solution'}
                  </button>
                ) : (
                  <button
                    onClick={handleNextInModal}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition flex items-center gap-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
