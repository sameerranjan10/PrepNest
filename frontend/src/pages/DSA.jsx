import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import DSAPracticeModal from '@/components/DSAPracticeModal';
import { 
  Code2, 
  Filter, 
  Search, 
  Bookmark, 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Sparkles, 
  Building2, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Flame, 
  Zap,
  TrendingUp,
  X
} from 'lucide-react';

export default function DSAPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCompany = searchParams.get('company');
  const urlTopic = searchParams.get('topic');
  const urlDifficulty = searchParams.get('difficulty');

  // In-platform solver modal state
  const [activePracticeProblemId, setActivePracticeProblemId] = useState(null);

  // Data State
  const [problems, setProblems] = useState([]);
  const [meta, setMeta] = useState({
    total_problems: 0,
    solved_count: 0,
    bookmarked_count: 0,
    difficulty_counts: {},
    top_companies: [],
    top_topics: []
  });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState(urlDifficulty || 'all');
  const [company, setCompany] = useState(urlCompany || 'all');
  const [topic, setTopic] = useState(urlTopic || 'all');
  const [status, setStatus] = useState('all'); // 'all' | 'solved' | 'unsolved' | 'bookmarked'
  const [sortBy, setSortBy] = useState('id'); // 'id' | 'difficulty' | 'acceptance' | 'title'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatching, setTotalMatching] = useState(0);

  // Sync if URL query param changes
  useEffect(() => {
    const compParam = searchParams.get('company');
    if (compParam && compParam !== company) {
      setCompany(compParam);
      setPage(1);
    }
  }, [searchParams]);

  // Fetch metadata on mount
  useEffect(() => {
    fetchMeta();
  }, []);

  // Fetch problems on filter/page changes
  useEffect(() => {
    fetchProblems(page);
  }, [difficulty, company, topic, status, sortBy, page]);

  const fetchMeta = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/dsa/meta');
      if (res.ok) {
        const data = await res.json();
        setMeta(data);
      }
    } catch (err) {
      console.log('Error fetching DSA metadata:', err);
    }
  };

  const fetchProblems = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      let url = `http://localhost:8000/api/dsa/problems?page=${pageToFetch}&limit=25`;
      if (difficulty !== 'all') url += `&difficulty=${difficulty}`;
      if (company !== 'all') url += `&company=${encodeURIComponent(company)}`;
      if (topic !== 'all') url += `&topic=${encodeURIComponent(topic)}`;
      if (status !== 'all') url += `&status=${status}`;
      if (sortBy !== 'id') url += `&sort_by=${sortBy}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems || []);
        setTotalMatching(data.total || 0);
        setTotalPages(data.total_pages || 1);
        setPage(data.page || 1);
      }
    } catch (err) {
      console.log('Error fetching DSA problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProblems(1);
  };

  const handleToggleSolved = async (problemId) => {
    try {
      const res = await fetch('http://localhost:8000/api/dsa/toggle-solved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, problem_id: problemId })
      });
      if (res.ok) {
        const data = await res.json();
        // Update live problem status
        setProblems((prev) =>
          prev.map((p) => (p.id === problemId ? { ...p, is_solved: data.is_solved } : p))
        );
        // Update meta counter
        setMeta((prev) => ({
          ...prev,
          solved_count: prev.solved_count + (data.is_solved ? 1 : -1)
        }));
      }
    } catch (err) {
      console.log('Error toggling solved:', err);
    }
  };

  const handleToggleBookmark = async (problemId) => {
    try {
      const res = await fetch('http://localhost:8000/api/dsa/toggle-bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 1, problem_id: problemId })
      });
      if (res.ok) {
        const data = await res.json();
        setProblems((prev) =>
          prev.map((p) => (p.id === problemId ? { ...p, is_bookmarked: data.is_bookmarked } : p))
        );
        setMeta((prev) => ({
          ...prev,
          bookmarked_count: prev.bookmarked_count + (data.is_bookmarked ? 1 : -1)
        }));
      }
    } catch (err) {
      console.log('Error toggling bookmark:', err);
    }
  };

  const progressPercent = meta.total_problems > 0 
    ? Math.min(100, Math.round((meta.solved_count / meta.total_problems) * 100)) 
    : 0;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="dsa" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Header & Stats Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Code2 className="w-3.5 h-3.5 inline mr-1" />
                  3,390+ Company LeetCode Archive
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  470 Tech Companies
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                DSA Problem Directory & Interview Sheets
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Browse official company-tagged coding problems with real interview frequency scores, topic tags, and acceptance rates. Track your solved questions live.
              </p>

              {/* Difficulty Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  🟢 Easy: {meta.difficulty_counts['Easy'] || 815}
                </span>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  🟡 Medium: {meta.difficulty_counts['Medium'] || 1803}
                </span>
                <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                  🔴 Hard: {meta.difficulty_counts['Hard'] || 774}
                </span>
              </div>
            </div>

            {/* Progress Card */}
            <div className="flex items-center gap-5 bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800 shrink-0 w-full sm:w-auto justify-around">
              <div className="text-center px-2">
                <div className="text-2xl font-black text-emerald-400">{meta.solved_count}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Solved</div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="text-center px-2">
                <div className="text-2xl font-black text-amber-400">{meta.bookmarked_count}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Saved</div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div className="text-center px-2">
                <div className="text-2xl font-black text-indigo-400">{progressPercent}%</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completed</div>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
            {/* Row 1: Status & Difficulty Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              {/* Status Pills */}
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => { setStatus('all'); setPage(1); }}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    status === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({meta.total_problems || 3392})
                </button>
                <button
                  onClick={() => { setStatus('unsolved'); setPage(1); }}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                    status === 'unsolved' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Circle className="w-3 h-3" /> Unsolved
                </button>
                <button
                  onClick={() => { setStatus('solved'); setPage(1); }}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                    status === 'solved' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-3 h-3 text-emerald-400" /> Solved ({meta.solved_count})
                </button>
                <button
                  onClick={() => { setStatus('bookmarked'); setPage(1); }}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                    status === 'bookmarked' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Starred ({meta.bookmarked_count})
                </button>
              </div>

              {/* Difficulty Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => { setDifficulty(diff); setPage(1); }}
                    className={`px-3 py-1 rounded-lg font-semibold capitalize transition ${
                      difficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : diff === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : diff === 'Hard'
                          ? 'bg-rose-500/20 text-rose-300 font-bold'
                          : 'bg-slate-800 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff === 'all' ? 'All Difficulties' : diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Search, Company, Topic & Sort By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl focus-within:border-indigo-500">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search problem title or slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
                />
                {search && (
                  <button type="button" onClick={() => { setSearch(''); fetchProblems(1); }}>
                    <X className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
                  </button>
                )}
              </form>

              {/* Company Filter Dropdown */}
              <select
                value={company}
                onChange={(e) => {
                  const val = e.target.value;
                  setCompany(val);
                  setPage(1);
                  if (val === 'all') {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('company');
                    setSearchParams(newParams);
                  } else {
                    setSearchParams({ ...Object.fromEntries(searchParams), company: val });
                  }
                }}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">🏢 All Companies ({meta.top_companies.length || 470}+)</option>
                {company !== 'all' && !meta.top_companies.some((c) => c.company.toLowerCase() === company.toLowerCase()) && (
                  <option value={company}>
                    {company} (Selected Track)
                  </option>
                )}
                {meta.top_companies.map((c) => (
                  <option key={c.company} value={c.company}>
                    {c.company} ({c.count} Qs)
                  </option>
                ))}
              </select>

              {/* Topic / Category Filter Dropdown */}
              <select
                value={topic}
                onChange={(e) => { setTopic(e.target.value); setPage(1); }}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">📂 All Topics ({meta.top_topics.length || 50}+)</option>
                {meta.top_topics.map((t) => (
                  <option key={t.topic} value={t.topic}>
                    {t.topic} ({t.count} Qs)
                  </option>
                ))}
              </select>

              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="id">⚡ Default Order</option>
                <option value="difficulty">Difficulty (Easy ➔ Hard)</option>
                <option value="acceptance">Acceptance Rate (High ➔ Low)</option>
                <option value="title">Title (A ➔ Z)</option>
              </select>
            </div>
          </div>

          {/* DSA Problems Table */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Showing <strong>{problems.length}</strong> of <strong>{totalMatching}</strong> matching problems</span>
                {company !== 'all' && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                    {company} Track
                  </span>
                )}
                {topic !== 'all' && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                    {topic}
                  </span>
                )}
              </div>
              <span>Page {page} of {totalPages}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4 text-center w-12">Solved</th>
                    <th className="py-3.5 px-3 text-center w-10">Star</th>
                    <th className="py-3.5 px-4">Problem Title</th>
                    <th className="py-3.5 px-4">Topics</th>
                    <th className="py-3.5 px-4 w-28">Difficulty</th>
                    <th className="py-3.5 px-4 w-28">Acceptance</th>
                    <th className="py-3.5 px-4">Top Companies</th>
                    <th className="py-3.5 px-4 text-right w-28">Solve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading DSA problem directory...</span>
                        </div>
                      </td>
                    </tr>
                  ) : problems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-16 text-center text-slate-400 space-y-2">
                        <Code2 className="w-8 h-8 mx-auto text-slate-600" />
                        <div className="font-bold text-white text-sm">No problems found</div>
                        <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
                      </td>
                    </tr>
                  ) : (
                    problems.map((prob) => (
                      <tr 
                        key={prob.id} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          prob.is_solved ? 'bg-emerald-950/10' : ''
                        }`}
                      >
                        {/* Solved Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleSolved(prob.id)}
                            className="p-1 rounded-lg hover:bg-slate-800 transition"
                            title={prob.is_solved ? 'Mark as Unsolved' : 'Mark as Solved (+25 XP)'}
                          >
                            {prob.is_solved ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                            )}
                          </button>
                        </td>

                        {/* Star / Bookmark */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => handleToggleBookmark(prob.id)}
                            className="p-1 rounded-lg hover:bg-slate-800 transition"
                            title={prob.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 transition ${
                                prob.is_bookmarked
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600 hover:text-slate-400'
                              }`}
                            />
                          </button>
                        </td>

                        {/* Problem Title */}
                        <td className="py-3.5 px-4 font-bold text-slate-200">
                          <button
                            onClick={() => setActivePracticeProblemId(prob.id)}
                            className="hover:text-indigo-400 transition flex items-center gap-1.5 text-left group cursor-pointer"
                          >
                            <span className="group-hover:underline">{prob.title}</span>
                          </button>
                        </td>

                        {/* Topic Badges */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(prob.topics || []).slice(0, 3).map((t, idx) => (
                              <span
                                key={idx}
                                onClick={() => { setTopic(t); setPage(1); }}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-indigo-300 cursor-pointer transition"
                              >
                                {t}
                              </span>
                            ))}
                            {(prob.topics || []).length > 3 && (
                              <span className="text-[9px] text-slate-500 self-center">
                                +{(prob.topics.length - 3)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Difficulty */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              prob.difficulty === 'Easy'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : prob.difficulty === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </td>

                        {/* Acceptance Rate */}
                        <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                          {prob.acceptance_rate}%
                        </td>

                        {/* Companies */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(prob.companies || []).slice(0, 3).map((c, idx) => (
                              <span
                                key={idx}
                                onClick={() => { setCompany(c); setPage(1); }}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 hover:text-white cursor-pointer transition font-medium"
                              >
                                {c}
                              </span>
                            ))}
                            {(prob.companies || []).length > 3 && (
                              <span className="text-[9px] text-slate-500 self-center">
                                +{(prob.companies.length - 3)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action Solve Button */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setActivePracticeProblemId(prob.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>Solve</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>

              <div className="flex items-center gap-2">
                <span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
              </div>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* In-Platform DSA Practice Workspace Modal */}
      {activePracticeProblemId && (
        <DSAPracticeModal
          problemId={activePracticeProblemId}
          onClose={() => setActivePracticeProblemId(null)}
          onProblemUpdated={(probId, updates) => {
            setProblems((prev) =>
              prev.map((p) => (p.id === probId ? { ...p, ...updates } : p))
            );
            if (updates.is_solved !== undefined) {
              setMeta((prev) => ({
                ...prev,
                solved_count: updates.is_solved
                  ? prev.solved_count + 1
                  : Math.max(0, prev.solved_count - 1)
              }));
            }
          }}
        />
      )}
    </div>
  );
}
