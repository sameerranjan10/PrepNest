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
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiFetch, notifyStatsUpdated } from '@/lib/apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
      const res = await apiFetch(`/api/dsa/problems/${problemId}`);
      if (res.ok) {
        const data = await res.json();
        setProblem(data);
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
      const res = await fetch(`${API_BASE}/api/dsa/run-code`, {
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
      const res = await apiFetch('/api/dsa/submit-code', {
        method: 'POST',
        body: JSON.stringify({
          problem_id: problemId,
          language: selectedLanguage,
          code: editorCode
        })
      });
      if (res.ok) {
        setSubmitSuccess(true);
        notifyStatsUpdated();
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
      const res = await apiFetch('/api/dsa/toggle-solved', {
        method: 'POST',
        body: JSON.stringify({ problem_id: problem.id })
      });
      if (res.ok) {
        const data = await res.json();
        notifyStatsUpdated();
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
      const res = await apiFetch('/api/dsa/toggle-bookmark', {
        method: 'POST',
        body: JSON.stringify({ problem_id: problem.id })
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div 
        className={`bg-white border border-[#E5E7EB] rounded-xl flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none border-none' : 'w-full max-w-7xl h-[92vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="px-5 py-3 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {problem && (
              <>
                <button
                  onClick={handleToggleSolved}
                  className="flex items-center gap-1.5 p-1 rounded hover:bg-[#E5E7EB] transition text-[#94A3B8]"
                  title={problem.is_solved ? 'Mark as Unsolved' : 'Mark as Solved (+25 XP)'}
                >
                  {problem.is_solved ? (
                    <CheckCircle className="w-5 h-5 text-[#16A34A] fill-[#16A34A]/10" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#CBD5E1] hover:text-[#16A34A]" />
                  )}
                </button>

                <button
                  onClick={handleToggleBookmark}
                  className="p-1 rounded hover:bg-[#E5E7EB] transition"
                  title="Bookmark problem"
                >
                  <Star className={`w-4 h-4 ${problem.is_bookmarked ? 'text-[#FFA116] fill-[#FFA116]' : 'text-[#CBD5E1] hover:text-[#FFA116]'}`} />
                </button>

                <div className="min-w-0 flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-bold text-[#262626] truncate max-w-md">
                    {problem.id}. {problem.title}
                  </span>
                  <DifficultyBadge difficulty={problem.difficulty} size="xs" />
                  <span className="text-xs text-[#64748B] font-medium">
                    Acceptance: {problem.acceptance_rate || 52}%
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {problem?.link && (
              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-xs text-[#64748B] hover:text-[#262626] hover:border-[#D1D5DB] transition"
                title="View original problem on LeetCode"
              >
                <span>LeetCode</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-md bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA] transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-md bg-white border border-[#E5E7EB] text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {submitSuccess && (
          <div className="bg-[#F0FDF4] border-b border-[#16A34A]/30 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-[#16A34A] animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFA116]" />
              <span>Accepted! Solution passed all test cases. +25 XP awarded to your PrepNest profile!</span>
            </div>
            <button onClick={() => setSubmitSuccess(false)} className="text-[#16A34A] hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body: Split View (Left: Description/Tutorial, Right: Code Playground) */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#64748B]">
            <div className="w-6 h-6 border-2 border-[#FFA116] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Loading problem details...</span>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E7EB] overflow-hidden">
            {/* LEFT PANEL: PROBLEM STATEMENT, VERIFIED SOLUTIONS, HINTS */}
            <div className="flex flex-col h-full overflow-hidden bg-white">
              {/* Left Sub-Tabs Header */}
              <div className="px-4 py-2 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center gap-2 overflow-x-auto shrink-0">
                <button
                  onClick={() => setActiveLeftTab('description')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeLeftTab === 'description'
                      ? 'bg-white text-[#262626] shadow-sm border border-[#E5E7EB]'
                      : 'text-[#64748B] hover:text-[#262626]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Description</span>
                </button>

                <button
                  onClick={() => setActiveLeftTab('solutions')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeLeftTab === 'solutions'
                      ? 'bg-white text-[#FFA116] shadow-sm border border-[#E5E7EB]'
                      : 'text-[#64748B] hover:text-[#262626]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Verified Solutions</span>
                  <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-[#FFF8EE] text-[#FFA116] font-bold">
                    {Object.keys(problem?.solutions || {}).length || 'Multi'}
                  </span>
                </button>

                {problem?.editorial && (
                  <button
                    onClick={() => setActiveLeftTab('editorial')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeLeftTab === 'editorial'
                        ? 'bg-white text-[#262626] shadow-sm border border-[#E5E7EB]'
                        : 'text-[#64748B] hover:text-[#262626]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FFA116]" />
                    <span>Editorial</span>
                  </button>
                )}

                {(problem?.hints || []).length > 0 && (
                  <button
                    onClick={() => setActiveLeftTab('hints')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeLeftTab === 'hints'
                        ? 'bg-white text-[#262626] shadow-sm border border-[#E5E7EB]'
                        : 'text-[#64748B] hover:text-[#262626]'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Hints ({(problem.hints || []).length})</span>
                  </button>
                )}
              </div>

              {/* Left Tab Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5 text-[#262626]">
                {/* TAB 1: DESCRIPTION */}
                {activeLeftTab === 'description' && (
                  <div className="space-y-5">
                    {/* Companies & Topics */}
                    <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#F1F3F5]">
                      <span className="text-[11px] font-semibold text-[#64748B]">Topics:</span>
                      {(problem.topics || []).map((t, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-[#F1F3F5] text-[#64748B] font-medium">
                          {t}
                        </span>
                      ))}

                      {(problem.companies || []).length > 0 && (
                        <>
                          <div className="w-px h-3 bg-[#E5E7EB] mx-1" />
                          <span className="text-[11px] font-semibold text-[#64748B]">Asked By:</span>
                          {(problem.companies || []).slice(0, 5).map((c, idx) => (
                            <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-[#FFF8EE] text-[#FFA116] border border-[#FFA116]/20 font-medium">
                              {c}
                            </span>
                          ))}
                        </>
                      )}
                    </div>

                    {/* Problem Statement Text */}
                    <div className="text-sm text-[#262626] leading-relaxed whitespace-pre-line font-sans">
                      {problem.description}
                    </div>

                    {/* Examples Section */}
                    {(problem.examples || []).length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Examples</h4>
                        {(problem.examples || []).map((ex, idx) => (
                          <div key={idx} className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] space-y-1.5 font-mono text-xs">
                            <div className="font-bold text-[#64748B] text-[11px]">Example {idx + 1}:</div>
                            {ex.input && (
                              <div>
                                <span className="text-[#262626] font-semibold">Input: </span>
                                <span className="text-[#64748B]">{ex.input}</span>
                              </div>
                            )}
                            {ex.output && (
                              <div>
                                <span className="text-[#16A34A] font-semibold">Output: </span>
                                <span className="text-[#64748B]">{ex.output}</span>
                              </div>
                            )}
                            {ex.explanation && (
                              <div className="text-[#64748B] text-[11px] font-sans pt-1">
                                <span className="font-semibold text-[#262626]">Explanation: </span>
                                {ex.explanation}
                              </div>
                            )}
                            {ex.text && <div className="text-[#262626] whitespace-pre-wrap">{ex.text}</div>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Constraints Section */}
                    {(problem.constraints || []).length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Constraints</h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-[#64748B] font-mono">
                          {(problem.constraints || []).map((c, idx) => (
                            <li key={idx}><span className="text-[#262626]">{c}</span></li>
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
                    <div className="flex items-center justify-between gap-2 bg-[#F7F8FA] p-1.5 rounded-lg border border-[#E5E7EB]">
                      <div className="flex items-center gap-1">
                        {['python', 'cpp', 'java', 'javascript'].map((langKey) => {
                          const hasSol = problem?.solutions && problem.solutions[langKey];
                          const label = langKey === 'python' ? 'Python 3' : langKey === 'cpp' ? 'C++' : langKey === 'java' ? 'Java' : 'JavaScript';
                          return (
                            <button
                              key={langKey}
                              onClick={() => setSelectedSolLang(langKey)}
                              className={`px-3 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
                                selectedSolLang === langKey
                                  ? 'bg-white text-[#FFA116] shadow-sm border border-[#E5E7EB]'
                                  : 'text-[#64748B] hover:text-[#262626]'
                              }`}
                            >
                              <span>{label}</span>
                              {hasSol && <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />}
                            </button>
                          );
                        })}
                      </div>

                      {problem?.solutions && problem.solutions[selectedSolLang] && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleLoadSolutionIntoEditor(problem.solutions[selectedSolLang].code)}
                            className="px-2.5 py-1 rounded-md bg-[#FFF8EE] border border-[#FFA116]/30 text-[#FFA116] text-xs font-semibold flex items-center gap-1 hover:bg-[#FFA116] hover:text-white transition"
                            title="Load solution into editor"
                          >
                            <ArrowRight className="w-3 h-3" />
                            <span>Load in Editor</span>
                          </button>

                          <button
                            onClick={() => handleCopySolution(problem.solutions[selectedSolLang].code)}
                            className="p-1 rounded-md hover:bg-[#E5E7EB] text-[#64748B] transition"
                            title="Copy Code"
                          >
                            {copiedSol ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Complexity Badges */}
                    {problem?.solutions && problem.solutions[selectedSolLang] && (
                      <div className="flex items-center gap-4 bg-[#F7F8FA] p-2.5 rounded-lg border border-[#E5E7EB] text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#FFA116]" />
                          <span className="text-[#64748B]">Time:</span>
                          <strong className="text-[#262626] font-mono">{problem.solutions[selectedSolLang].time || 'O(N)'}</strong>
                        </div>
                        <div className="w-px h-4 bg-[#E5E7EB]" />
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#64748B]" />
                          <span className="text-[#64748B]">Space:</span>
                          <strong className="text-[#262626] font-mono">{problem.solutions[selectedSolLang].space || 'O(1)'}</strong>
                        </div>
                      </div>
                    )}

                    {/* Solution Code Display */}
                    {problem?.solutions && problem.solutions[selectedSolLang] ? (
                      <div className="rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] overflow-hidden">
                        <pre className="p-4 text-xs font-mono text-[#262626] overflow-x-auto leading-relaxed whitespace-pre">
                          <code>{problem.solutions[selectedSolLang].code}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className="p-8 text-center rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] space-y-2">
                        <Code2 className="w-8 h-8 text-[#94A3B8] mx-auto" />
                        <div className="text-xs font-semibold text-[#262626]">
                          Solution in {selectedSolLang.toUpperCase()} will be rendered shortly.
                        </div>
                        <p className="text-[11px] text-[#64748B]">
                          You can inspect the Python 3 or C++ verified optimal solutions above.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: EDITORIAL */}
                {activeLeftTab === 'editorial' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/20 text-xs text-[#FFA116] font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FFA116] shrink-0" />
                      <span>Official Algorithmic Editorial Breakdown</span>
                    </div>

                    <div className="text-xs text-[#262626] whitespace-pre-wrap font-sans leading-relaxed">
                      {problem.editorial}
                    </div>
                  </div>
                )}

                {/* TAB 4: HINTS */}
                {activeLeftTab === 'hints' && (
                  <div className="space-y-3">
                    {(problem.hints || []).map((hint, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] space-y-1">
                        <div className="text-xs font-bold text-[#FFA116] flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Hint {idx + 1}</span>
                        </div>
                        <p className="text-xs text-[#64748B] leading-relaxed font-sans">{hint}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: CODE EDITOR & RUNNER */}
            <div className="flex flex-col h-full overflow-hidden bg-white">
              {/* Editor Header Toolbar */}
              <div className="px-4 py-2 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center justify-between gap-3 shrink-0">
                {/* Language Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#64748B]">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-white border border-[#E5E7EB] text-xs font-semibold text-[#262626] px-2.5 py-1 rounded-md focus:outline-none focus:border-[#FFA116] cursor-pointer"
                  >
                    <option value="python">Python 3 (Runnable)</option>
                    <option value="javascript">JavaScript / Node (Runnable)</option>
                    <option value="cpp">C++ (Modern)</option>
                    <option value="java">Java 21</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => initEditorCode(problem, selectedLanguage)}
                    className="px-2.5 py-1 rounded-md bg-white border border-[#E5E7EB] text-xs font-medium text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA] transition flex items-center gap-1"
                    title="Reset to starter boilerplate"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={handleCopyEditorCode}
                    className="p-1 rounded-md hover:bg-[#E5E7EB] text-[#64748B] hover:text-[#262626] transition"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5 text-[#64748B]" />}
                  </button>
                </div>
              </div>

              {/* Code Textarea Area */}
              <div className="flex-1 relative flex flex-col min-h-0 bg-white">
                <textarea
                  value={editorCode}
                  onChange={(e) => setEditorCode(e.target.value)}
                  onKeyDown={handleKeyDownInEditor}
                  placeholder="Write your solution here..."
                  spellCheck="false"
                  className="w-full flex-1 p-4 bg-white text-[#262626] font-mono text-xs leading-relaxed resize-none focus:outline-none border-none select-text overflow-y-auto"
                />
              </div>

              {/* Console & Test Case Runner Panel (Bottom of Editor) */}
              <div className="border-t border-[#E5E7EB] bg-[#F7F8FA] flex flex-col shrink-0 max-h-52">
                {/* Console Bar Tabs */}
                <div className="px-4 py-1.5 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveConsoleTab('output')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition ${
                        activeConsoleTab === 'output' ? 'bg-white text-[#262626] shadow-sm border border-[#E5E7EB]' : 'text-[#64748B] hover:text-[#262626]'
                      }`}
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Console Output</span>
                    </button>

                    <button
                      onClick={() => setActiveConsoleTab('input')}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                        activeConsoleTab === 'input' ? 'bg-white text-[#262626] shadow-sm border border-[#E5E7EB]' : 'text-[#64748B] hover:text-[#262626]'
                      }`}
                    >
                      <span>Custom Input</span>
                    </button>
                  </div>

                  {runResult && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          runResult.status === 'success'
                            ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/20'
                            : 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20'
                        }`}
                      >
                        {runResult.status === 'success' ? 'Finished' : 'Runtime Error'}
                      </span>
                      {runResult.execution_time_ms !== undefined && (
                        <span className="text-[10px] text-[#64748B] font-mono">
                          {runResult.execution_time_ms} ms
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Console Content */}
                <div className="p-3 bg-white font-mono text-xs overflow-y-auto min-h-20 max-h-36">
                  {activeConsoleTab === 'output' ? (
                    <div>
                      {running ? (
                        <div className="flex items-center gap-2 text-[#64748B] py-1">
                          <div className="w-3 h-3 border-2 border-[#FFA116] border-t-transparent rounded-full animate-spin" />
                          <span>Executing code in test runner...</span>
                        </div>
                      ) : runResult ? (
                        <div className="space-y-1">
                          {runResult.stdout && (
                            <pre className="text-[#16A34A] whitespace-pre-wrap">{runResult.stdout}</pre>
                          )}
                          {runResult.stderr && (
                            <pre className="text-[#DC2626] whitespace-pre-wrap">{runResult.stderr}</pre>
                          )}
                          {!runResult.stdout && !runResult.stderr && (
                            <span className="text-[#64748B]">Program executed successfully with no stdout output.</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[#94A3B8] flex items-center gap-2 py-1">
                          <span>Click "Run Code" to test against sample cases.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Pass custom test inputs here..."
                        className="w-full h-16 bg-transparent text-[#262626] font-mono text-xs focus:outline-none resize-none placeholder:text-[#94A3B8]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="px-4 py-3 bg-white border-t border-[#E5E7EB] flex items-center justify-between gap-3 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveLeftTab('solutions')}
                  icon={<Sparkles className="w-3.5 h-3.5 text-[#FFA116]" />}
                >
                  Peek Solution
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRunCode}
                    disabled={running}
                    icon={<Play className="w-3.5 h-3.5 text-[#262626]" />}
                  >
                    {running ? 'Running...' : 'Run Code'}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitSolution}
                    disabled={submitting}
                    icon={<CheckCircle className="w-3.5 h-3.5 text-white" />}
                  >
                    {submitting ? 'Submitting...' : 'Submit (+25 XP)'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
