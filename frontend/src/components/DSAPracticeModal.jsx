import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  CheckCircle,
  Circle,
  Star,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
  Code2,
  Terminal,
  ExternalLink,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function DSAPracticeModal({ problemId, onClose, onProblemUpdated }) {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState('description'); // 'description' | 'solutions' | 'editorial' | 'hints'
  const [selectedLanguage, setSelectedLanguage] = useState('python'); // 'python' | 'javascript' | 'cpp' | 'java'
  const [editorCode, setEditorCode] = useState('');
  const [selectedSolLang, setSelectedSolLang] = useState('python');
  const [customInput, setCustomInput] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState('output'); // 'output' | 'input'

  // Execution state
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedSol, setCopiedSol] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (problemId) {
      fetchProblemDetails();
    }
  }, [problemId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const fetchProblemDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/dsa/problems/${problemId}`);
      if (res.ok) {
        const data = await res.json();
        setProblem(data);

        // Initialize editor code based on default language
        initEditorCode(data, 'python');
      }
    } catch (err) {
      console.log('Error fetching problem details:', err);
    } finally {
      setLoading(false);
    }
  };

  const initEditorCode = (prob, lang) => {
    if (!prob) return;
    const snippets = prob.code_snippets || {};
    const solutions = prob.solutions || {};

    let initialCode = '';
    if (lang === 'python') {
      initialCode = snippets['python3'] || snippets['python'] || (solutions['python'] ? solutions['python'].code : '');
    } else if (lang === 'javascript') {
      initialCode = snippets['javascript'] || snippets['typescript'] || (solutions['javascript'] ? solutions['javascript'].code : '');
    } else if (lang === 'cpp') {
      initialCode = snippets['cpp'] || (solutions['cpp'] ? solutions['cpp'].code : '');
    } else if (lang === 'java') {
      initialCode = snippets['java'] || (solutions['java'] ? solutions['java'].code : '');
    }

    if (!initialCode) {
      initialCode = `# Write your ${lang} solution for ${prob.title}\n\ndef solve():\n    pass\n`;
    }

    setEditorCode(initialCode);
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    initEditorCode(problem, newLang);
  };

  const handleRunCode = async () => {
    setRunning(true);
    setRunResult(null);
    setActiveConsoleTab('output');
    try {
      const res = await fetch('http://localhost:8000/api/dsa/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_id: problemId,
          language: selectedLanguage,
          code: editorCode,
          custom_input: customInput
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRunResult(data);
      } else {
        setRunResult({
          status: 'error',
          stdout: '',
          stderr: 'Failed to run code. Server error.',
          execution_time_ms: 0
        });
      }
    } catch (err) {
      setRunResult({
        status: 'error',
        stdout: '',
        stderr: String(err),
        execution_time_ms: 0
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/dsa/submit-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          problem_id: problemId,
          language: selectedLanguage,
          code: editorCode
        })
      });
      if (res.ok) {
        setSubmitSuccess(true);
        if (problem) {
          setProblem({ ...problem, is_solved: true });
        }
        if (onProblemUpdated) {
          onProblemUpdated(problemId, { is_solved: true });
        }
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (err) {
      console.log('Error submitting solution:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSolved = async () => {
    if (!problem) return;
    try {
      const res = await fetch('http://localhost:8000/api/dsa/toggle-solved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_id: problem.id, user_id: 1 })
      });
      if (res.ok) {
        const data = await res.json();
        setProblem({ ...problem, is_solved: data.is_solved });
        if (onProblemUpdated) {
          onProblemUpdated(problem.id, { is_solved: data.is_solved });
        }
      }
    } catch (err) {
      console.log('Error toggling solved:', err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!problem) return;
    try {
      const res = await fetch('http://localhost:8000/api/dsa/toggle-bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem_id: problem.id, user_id: 1 })
      });
      if (res.ok) {
        const data = await res.json();
        setProblem({ ...problem, is_bookmarked: data.is_bookmarked });
        if (onProblemUpdated) {
          onProblemUpdated(problem.id, { is_bookmarked: data.is_bookmarked });
        }
      }
    } catch (err) {
      console.log('Error toggling bookmark:', err);
    }
  };

  const handleCopySolution = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedSol(true);
    setTimeout(() => setCopiedSol(false), 2000);
  };

  const handleCopyEditorCode = () => {
    navigator.clipboard.writeText(editorCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLoadSolutionIntoEditor = (solCode) => {
    setEditorCode(solCode);
    setSelectedLanguage(selectedSolLang);
  };

  // Handle Tab key in editor
  const handleKeyDownInEditor = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = editorCode.substring(0, start) + '    ' + editorCode.substring(end);
      setEditorCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  if (!problemId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`bg-slate-950 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen ? 'w-full h-full rounded-none border-none' : 'w-full max-w-[96vw] h-[92vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {problem && (
              <>
                <button
                  onClick={handleToggleSolved}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-800 transition"
                  title={problem.is_solved ? 'Mark as Unsolved' : 'Mark as Solved (+25 XP)'}
                >
                  {problem.is_solved ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                  )}
                </button>

                <button
                  onClick={handleToggleBookmark}
                  className="p-1 rounded-lg hover:bg-slate-800 transition"
                  title="Bookmark problem"
                >
                  <Star className={`w-4 h-4 ${problem.is_bookmarked ? 'text-amber-400 fill-amber-400' : 'text-slate-500 hover:text-slate-300'}`} />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-extrabold text-white truncate max-w-md">
                      {problem.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        problem.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : problem.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Acceptance: {problem.acceptance_rate}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {problem && (
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition"
                title="View original problem on LeetCode"
              >
                <span>LC</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-800 text-slate-400 transition"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {submitSuccess && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-white shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>Accepted! All test cases passed successfully! +25 XP awarded to your profile!</span>
            </div>
            <button onClick={() => setSubmitSuccess(false)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body: Split View (Left: Description/Tutorial, Right: Code Playground) */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading in-platform problem data and solutions...</span>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
            {/* =========================================================
                LEFT PANEL: PROBLEM STATEMENT, VERIFIED SOLUTIONS, HINTS
            ========================================================= */}
            <div className="flex flex-col h-full overflow-hidden bg-slate-950">
              {/* Left Sub-Tabs Header */}
              <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto flex-shrink-0">
                <button
                  onClick={() => setActiveLeftTab('description')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    activeLeftTab === 'description'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Description</span>
                </button>

                <button
                  onClick={() => setActiveLeftTab('solutions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    activeLeftTab === 'solutions'
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Verified Solutions</span>
                  <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-black/40 text-amber-200">
                    {Object.keys(problem?.solutions || {}).length || 'Multi'}
                  </span>
                </button>

                {problem?.editorial && (
                  <button
                    onClick={() => setActiveLeftTab('editorial')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      activeLeftTab === 'editorial'
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Editorial</span>
                  </button>
                )}

                {(problem?.hints || []).length > 0 && (
                  <button
                    onClick={() => setActiveLeftTab('hints')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                      activeLeftTab === 'hints'
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Hints ({(problem.hints || []).length})</span>
                  </button>
                )}
              </div>

              {/* Left Tab Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5 text-slate-200">
                {/* TAB 1: DESCRIPTION */}
                {activeLeftTab === 'description' && (
                  <div className="space-y-6">
                    {/* Companies & Topics Pills */}
                    <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-900">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Topics:</span>
                      {(problem.topics || []).map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                          {t}
                        </span>
                      ))}

                      {(problem.companies || []).length > 0 && (
                        <>
                          <div className="w-px h-3 bg-slate-800 mx-1" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Asked By:</span>
                          {(problem.companies || []).slice(0, 5).map((c, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 font-medium">
                              {c}
                            </span>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Problem Statement Text */}
                    <div className="prose prose-invert prose-xs max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                      {problem.description}
                    </div>

                    {/* Examples Section */}
                    {(problem.examples || []).length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Examples</h4>
                        {(problem.examples || []).map((ex, idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 font-mono text-xs">
                            <div className="font-bold text-slate-400 text-[11px]">Example {idx + 1}:</div>
                            {ex.input && (
                              <div>
                                <span className="text-indigo-400 font-semibold">Input: </span>
                                <span className="text-slate-300">{ex.input}</span>
                              </div>
                            )}
                            {ex.output && (
                              <div>
                                <span className="text-emerald-400 font-semibold">Output: </span>
                                <span className="text-slate-300">{ex.output}</span>
                              </div>
                            )}
                            {ex.explanation && (
                              <div className="text-slate-400 text-[11px] font-sans pt-1">
                                <span className="text-slate-500 font-semibold">Explanation: </span>
                                {ex.explanation}
                              </div>
                            )}
                            {ex.text && <div className="text-slate-300 whitespace-pre-wrap">{ex.text}</div>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Constraints Section */}
                    {(problem.constraints || []).length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Constraints</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono">
                          {(problem.constraints || []).map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: VERIFIED SOLUTIONS & APPROACHES */}
                {activeLeftTab === 'solutions' && (
                  <div className="space-y-4">
                    {/* Language Switcher for Solutions */}
                    <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-1">
                        {['python', 'cpp', 'java', 'javascript'].map((langKey) => {
                          const hasSol = problem?.solutions && problem.solutions[langKey];
                          const label = langKey === 'python' ? 'Python 3' : langKey === 'cpp' ? 'C++' : langKey === 'java' ? 'Java' : 'JavaScript';
                          return (
                            <button
                              key={langKey}
                              onClick={() => setSelectedSolLang(langKey)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                selectedSolLang === langKey
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <span>{label}</span>
                              {hasSol && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>

                      {problem?.solutions && problem.solutions[selectedSolLang] && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadSolutionIntoEditor(problem.solutions[selectedSolLang].code)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition"
                            title="Load solution into editor to run and test"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>Load in Editor</span>
                          </button>

                          <button
                            onClick={() => handleCopySolution(problem.solutions[selectedSolLang].code)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="Copy Code"
                          >
                            {copiedSol ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Complexity Badges */}
                    {problem?.solutions && problem.solutions[selectedSolLang] && (
                      <div className="flex items-center gap-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-slate-400">Time Complexity:</span>
                          <strong className="text-emerald-400 font-mono">{problem.solutions[selectedSolLang].time || 'O(N)'}</strong>
                        </div>
                        <div className="w-px h-4 bg-slate-800" />
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-slate-400">Space Complexity:</span>
                          <strong className="text-indigo-400 font-mono">{problem.solutions[selectedSolLang].space || 'O(1)'}</strong>
                        </div>
                      </div>
                    )}

                    {/* Solution Code Display */}
                    {problem?.solutions && problem.solutions[selectedSolLang] ? (
                      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                        <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre">
                          <code>{problem.solutions[selectedSolLang].code}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                        <Code2 className="w-8 h-8 text-slate-600 mx-auto" />
                        <div className="text-xs font-semibold text-slate-300">
                          Solution in {selectedSolLang.toUpperCase()} will be rendered shortly.
                        </div>
                        <p className="text-[11px] text-slate-500">
                          You can inspect the Python 3 or C++ verified optimal solutions above.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: EDITORIAL */}
                {activeLeftTab === 'editorial' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span>Official Editorial & Algorithmic Breakdown</span>
                    </div>

                    <div className="prose prose-invert prose-xs max-w-none text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {problem.editorial}
                    </div>
                  </div>
                )}

                {/* TAB 4: HINTS */}
                {activeLeftTab === 'hints' && (
                  <div className="space-y-3">
                    {(problem.hints || []).map((hint, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                        <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Hint {idx + 1}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{hint}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* =========================================================
                RIGHT PANEL: CODE EDITOR & INTERACTIVE RUNNER
            ========================================================= */}
            <div className="flex flex-col h-full overflow-hidden bg-slate-950">
              {/* Editor Header Toolbar */}
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
                {/* Language Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="python">Python 3 (Runnable)</option>
                    <option value="javascript">JavaScript / Node (Runnable)</option>
                    <option value="cpp">C++ (Modern)</option>
                    <option value="java">Java 21</option>
                  </select>
                </div>

                {/* Editor Utility Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => initEditorCode(problem, selectedLanguage)}
                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
                    title="Reset to starter boilerplate"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={handleCopyEditorCode}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    title="Copy editor code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code Area */}
              <div className="flex-1 relative flex flex-col min-h-0 bg-slate-950">
                <textarea
                  value={editorCode}
                  onChange={(e) => setEditorCode(e.target.value)}
                  onKeyDown={handleKeyDownInEditor}
                  placeholder="Write your solution here..."
                  spellCheck="false"
                  className="w-full flex-1 p-4 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 border-none select-text overflow-y-auto"
                />
              </div>

              {/* Console & Test Case Runner Panel (Bottom of Editor) */}
              <div className="border-t border-slate-800 bg-slate-900/90 flex flex-col flex-shrink-0 max-h-52">
                {/* Console Bar Tabs */}
                <div className="px-4 py-1.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveConsoleTab('output')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                        activeConsoleTab === 'output' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Console Output</span>
                    </button>

                    <button
                      onClick={() => setActiveConsoleTab('input')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                        activeConsoleTab === 'input' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Custom Input</span>
                    </button>
                  </div>

                  {runResult && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          runResult.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {runResult.status === 'success' ? 'Execution Finished' : 'Runtime Error'}
                      </span>
                      {runResult.execution_time_ms !== undefined && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {runResult.execution_time_ms} ms
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Console Content */}
                <div className="p-3 bg-slate-950 font-mono text-xs overflow-y-auto min-h-20 max-h-36">
                  {activeConsoleTab === 'output' ? (
                    <div>
                      {running ? (
                        <div className="flex items-center gap-2 text-slate-400 py-1">
                          <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          <span>Executing code in sandboxed runner...</span>
                        </div>
                      ) : runResult ? (
                        <div className="space-y-1">
                          {runResult.stdout && (
                            <pre className="text-emerald-400 whitespace-pre-wrap">{runResult.stdout}</pre>
                          )}
                          {runResult.stderr && (
                            <pre className="text-rose-400 whitespace-pre-wrap">{runResult.stderr}</pre>
                          )}
                          {!runResult.stdout && !runResult.stderr && (
                            <span className="text-slate-500">Program executed successfully with no stdout output.</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-500 flex items-center gap-2 py-1">
                          <span>Click "Run Code" to execute code against standard test cases.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Pass custom stdin or test inputs here..."
                        className="w-full h-16 bg-transparent text-slate-200 font-mono text-xs focus:outline-none resize-none placeholder:text-slate-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
                <button
                  onClick={() => setActiveLeftTab('solutions')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition border border-slate-700/60"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Peek Solution</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={running}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{running ? 'Running...' : 'Run Code'}</span>
                  </button>

                  <button
                    onClick={handleSubmitSolution}
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit (+25 XP)'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
