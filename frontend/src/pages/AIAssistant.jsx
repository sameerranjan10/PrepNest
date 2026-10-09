import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Code2,
  FileText,
  Briefcase,
  Calendar,
  Compass,
  Users,
  GraduationCap,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
  Zap,
  Target,
  ArrowRight,
  HelpCircle,
  Key,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Mode configurations with icons & descriptions
const MENTOR_MODES = [
  {
    id: 'general',
    name: 'Placement Coach',
    icon: Bot,
    color: 'from-indigo-500 to-purple-600',
    description: 'Holistic placement preparation, strategy, and daily milestones.'
  },
  {
    id: 'career',
    name: 'Company Bar',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-600',
    description: 'Hiring criteria, rounds, and readiness evaluation for your target company.'
  },
  {
    id: 'study_plan',
    name: 'Study Sprint',
    icon: Calendar,
    color: 'from-emerald-500 to-teal-600',
    description: 'Time-boxed daily routines, 7-day sprints, and topic schedules.'
  },
  {
    id: 'roadmap',
    name: 'Curriculum',
    icon: Compass,
    color: 'from-amber-500 to-orange-600',
    description: 'Next roadmap topics, conceptual links, and prerequisite clarity.'
  },
  {
    id: 'resume',
    name: 'Resume & STAR',
    icon: FileText,
    color: 'from-violet-500 to-fuchsia-600',
    description: 'ATS keywords, impact quantification, and XYZ bullet restructuring.'
  },
  {
    id: 'dsa',
    name: 'Guided DSA',
    icon: Code2,
    color: 'from-rose-500 to-pink-600',
    description: 'Progressive hints, constraints, intuition, and optimal complexity.'
  },
  {
    id: 'interview',
    name: 'Mock 1-on-1',
    icon: Users,
    color: 'from-sky-500 to-indigo-600',
    description: 'Interactive single-question technical & behavioral mock interview.'
  },
  {
    id: 'tutor',
    name: 'CS Tutor',
    icon: GraduationCap,
    color: 'from-teal-500 to-emerald-600',
    description: 'Intuitive deep-dives on DBMS, OS, System Design, and Algorithms.'
  }
];

// Helper to render basic markdown & code blocks safely
function MarkdownContent({ content }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) return null;

  // Split content by code fences ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-slate-200 text-sm">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Extract language and code
          const firstLineBreak = part.indexOf('\n');
          const lang = part.slice(3, firstLineBreak).trim() || 'code';
          const code = part.slice(firstLineBreak + 1, -3);

          return (
            <div key={pIdx} className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 font-mono text-xs">
              <div className="bg-slate-900/90 px-4 py-2 flex items-center justify-between border-b border-slate-800 text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">{lang}</span>
                <button
                  onClick={() => handleCopyCode(code, pIdx)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition text-[11px]"
                >
                  {copiedIndex === pIdx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-slate-200 whitespace-pre">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render normal text blocks with simple markdown formatting
        const lines = part.split('\n');
        return (
          <div key={pIdx} className="space-y-2">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1.5" />;

              // Headings
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="text-base font-bold text-indigo-300 mt-3 mb-1">
                    {trimmed.replace(/^###\s+/, '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lIdx} className="text-lg font-extrabold text-white mt-4 mb-2 border-b border-slate-800/80 pb-1">
                    {trimmed.replace(/^##\s+/, '')}
                  </h2>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={lIdx} className="text-xl font-black text-white mt-4 mb-2">
                    {trimmed.replace(/^#\s+/, '')}
                  </h1>
                );
              }

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const bulletText = trimmed.replace(/^[-*]\s+/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-indigo-400 mt-1 text-xs">•</span>
                    <span className="flex-1">{formatInline(bulletText)}</span>
                  </div>
                );
              }

              // Numbered points
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-indigo-400 font-bold text-xs mt-0.5">{numMatch[1]}.</span>
                    <span className="flex-1">{formatInline(numMatch[2])}</span>
                  </div>
                );
              }

              // Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lIdx} className="border-l-2 border-indigo-500 pl-3 py-1 my-2 bg-indigo-500/5 text-slate-300 italic rounded-r">
                    {formatInline(trimmed.replace(/^>\s+/, ''))}
                  </blockquote>
                );
              }

              return <p key={lIdx}>{formatInline(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

// Inline formatting helper (bold, inline code)
function formatInline(str) {
  if (!str) return '';
  // Split inline code `code`
  const codeParts = str.split(/(`[^`]+`)/g);

  return codeParts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-mono text-[12px]">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold formatting **text**
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        return (
          <strong key={bIdx} className="font-semibold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}

export default function AIAssistantPage() {
  const { user, token } = useAuth();

  // Active Mode & State
  const [selectedMode, setSelectedMode] = useState('general');
  const [contextSummary, setContextSummary] = useState(null);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseLength, setResponseLength] = useState('normal');
  const [activeModel, setActiveModel] = useState('Groq AI');
  const [isConversationsOpen, setIsConversationsOpen] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const GLOBAL_QUICK_ACTIONS = [
    { text: "What should I study today?", mode: "study_plan", desc: "2-hour placement routine" },
    { text: "Am I placement ready?", mode: "career", desc: "Hiring bar readiness review" },
    { text: "Review my skill gaps", mode: "career", desc: "Target role skill gap analysis" },
    { text: "Give me a 2-hour plan", mode: "study_plan", desc: "Time-allocated daily routine" },
    { text: "Start DSA practice", mode: "dsa", desc: "Progressive hint coding" },
    { text: "Start mock interview", mode: "interview", desc: "1-by-1 technical questions" },
    { text: "Review my resume", mode: "resume", desc: "ATS score & XYZ bullet polish" },
  ];

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  // Fetch Student Context Summary & Conversations on mount
  useEffect(() => {
    fetchContextSummary();
    fetchConversations();
  }, [token]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const fetchContextSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mentor/context-summary`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setContextSummary(data);
      }
    } catch (err) {
      console.warn('Could not fetch student context summary:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mentor/conversations`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        const convList = data.conversations || [];
        setConversations(convList);
        if (convList.length > 0 && !activeConversationId) {
          // Load latest conversation by default
          loadConversation(convList[0].id);
        }
      }
    } catch (err) {
      console.warn('Could not fetch conversations:', err);
    }
  };

  const loadConversation = async (convId) => {
    if (!convId) return;
    setActiveConversationId(convId);
    try {
      const res = await fetch(`${API_BASE}/api/mentor/conversations/${convId}`, {
        headers: authHeaders
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.mode) {
          setSelectedMode(data.mode);
        }
      }
    } catch (err) {
      console.warn('Could not load conversation:', err);
    }
  };

  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE}/api/mentor/conversations/${convId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== convId));
        if (activeConversationId === convId) {
          handleStartNewChat();
        }
      }
    } catch (err) {
      console.warn('Could not delete conversation:', err);
    }
  };

  const handleSendMessage = async (textToSend = null, lengthOverride = null, modeOverride = null) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const targetMode = modeOverride || selectedMode;
    if (modeOverride && modeOverride !== selectedMode) {
      setSelectedMode(modeOverride);
    }
    const targetLength = lengthOverride || responseLength;

    setInputValue('');

    // Optimistically append user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/mentor/chat`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          message: text,
          mode: targetMode,
          response_length: targetLength,
          conversation_id: activeConversationId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (!activeConversationId && data.conversation_id) {
          setActiveConversationId(data.conversation_id);
          fetchConversations();
        }

        if (data.model) {
          setActiveModel(data.model);
        }

        // Replace or append assistant message
        setMessages(prev => [
          ...prev.filter(m => m.id !== tempUserMsg.id),
          data.user_message || tempUserMsg,
          data.assistant_message
        ]);
      } else {
        const errData = await res.json().catch(() => ({}));
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ ${errData.detail || 'Could not reach PrepNest AI Mentor service. Please try again.'}`,
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Network error: Could not connect to the backend server. Make sure the backend is running.',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainMore = (msgContent) => {
    const cleanSnippet = (msgContent || '')
      .split('\n')[0]
      .replace(/[*#>`]/g, '')
      .trim()
      .slice(0, 100);
    handleSendMessage(`Explain in detail: "${cleanSnippet}"`, 'detailed');
  };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Dynamic quick action prompts tailored to current mode & student context
  const getQuickPrompts = () => {
    const targetComp = contextSummary?.target_company || 'Tech Company';
    const targetRole = contextSummary?.target_role || 'Software Engineer';
    const missing = contextSummary?.missing_skills?.[0] || 'System Design';

    switch (selectedMode) {
      case 'career':
        return [
          `What are the typical interview rounds for ${targetComp} ${targetRole}?`,
          `How close is my profile to the ${targetComp} hiring bar?`,
          `What are the non-negotiable core skills for ${targetComp}?`
        ];
      case 'study_plan':
        return [
          `Create a 2-hour daily placement study routine for me.`,
          `Design a 7-day sprint to master ${missing} and DSA.`,
          `How should I split my time between DSA, Core CS, and Projects?`
        ];
      case 'roadmap':
        return [
          `What roadmap topic should I focus on next?`,
          `Explain how DBMS indexing connects to ${targetRole} interviews.`,
          `Which Web Dev/Backend concepts are most critical for campus placements?`
        ];
      case 'resume':
        return [
          `Help me rewrite my latest project bullet into Google's XYZ formula.`,
          `How do I weave missing keywords like ${missing} into my resume?`,
          `Review my resume summary statement for ATS readability.`
        ];
      case 'dsa':
        return [
          `Give me a progressive hint for finding the Longest Palindromic Substring.`,
          `Explain LRU Cache intuition without giving the full code yet.`,
          `What are the top 5 high-frequency DSA patterns for ${targetComp}?`
        ];
      case 'interview':
        return [
          `Start a mock interview for ${targetComp} ${targetRole}. Ask me question #1.`,
          `Ask me a behavioral question about handling tight deadlines.`,
          `Quiz me on REST API idempotency and HTTP status codes.`
        ];
      case 'tutor':
        return [
          `Explain Database B-Trees vs Hash Indexing with a physical analogy.`,
          `What is the difference between Process and Thread in Operating Systems?`,
          `Explain CAP Theorem simply with an e-commerce example.`
        ];
      case 'general':
      default:
        return [
          `Give me a personalized placement readiness review for ${targetComp}.`,
          `What are my top 3 priorities this week based on my skill gaps?`,
          `How do I balance DSA problem solving with campus coursework?`
        ];
    }
  };

  const activeModeConfig = MENTOR_MODES.find(m => m.id === selectedMode) || MENTOR_MODES[0];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="ai-assistant" />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />

        <div className="flex-1 flex overflow-hidden">
          {/* Collapsible History Drawer */}
          <aside
            className={`
              w-72 bg-slate-900/95 border-r border-slate-800/80 flex flex-col transition-all duration-300
              ${isConversationsOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-64'}
              fixed md:static z-20 h-[calc(100vh-4rem)]
            `}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Conversations
              </span>
              <button
                onClick={handleStartNewChat}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> New Chat
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No previous conversations yet. Start asking questions!
                </div>
              ) : (
                conversations.map(conv => {
                  const isActive = activeConversationId === conv.id;
                  const modeIcon = MENTOR_MODES.find(m => m.id === conv.mode)?.icon || Bot;
                  const ModeIconComp = modeIcon;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      className={`
                        group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition border
                        ${isActive
                          ? 'bg-indigo-950/60 border-indigo-500/40 text-white shadow-sm'
                          : 'bg-slate-800/30 border-transparent hover:bg-slate-800/70 text-slate-300'}
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <ModeIconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span className="truncate font-medium">{conv.title || 'Untitled Conversation'}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        title="Delete chat"
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-slate-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* AI Model Badge in Drawer Footer */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" /> Powered by Groq LLM
                </span>
                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-mono truncate max-w-[120px]" title={activeModel}>
                  {activeModel}
                </span>
              </div>
            </div>
          </aside>

          {/* Main Chat Workspace */}
          <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
            {/* 1. Personalized Placement Context Dashboard Card */}
            <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base font-bold text-white">AI Placement Mentor</h1>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live Profile Synced
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Personalized coaching for <span className="text-indigo-300 font-semibold">{contextSummary?.target_company || 'Tech Company'}</span> — <span className="text-slate-300">{contextSummary?.target_role || 'Software Engineer'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Context stats pills */}
                  <div className="hidden lg:flex items-center gap-2">
                    {/* ATS Score */}
                    {contextSummary?.ats_score ? (
                      <div className="bg-slate-800/60 border border-slate-700/60 px-2.5 py-1 rounded-lg text-xs">
                        <span className="text-slate-400">ATS:</span>{' '}
                        <span className={`font-bold ${contextSummary.ats_score >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {contextSummary.ats_score}/100
                        </span>
                      </div>
                    ) : null}

                    {/* Skill Match */}
                    <div className="bg-slate-800/60 border border-slate-700/60 px-2.5 py-1 rounded-lg text-xs">
                      <span className="text-slate-400">Skill Match:</span>{' '}
                      <span className="font-bold text-indigo-400">{contextSummary?.skill_match_percentage ?? 70}%</span>
                    </div>

                    {/* Roadmap Progress */}
                    <div className="bg-slate-800/60 border border-slate-700/60 px-2.5 py-1 rounded-lg text-xs">
                      <span className="text-slate-400">Roadmap:</span>{' '}
                      <span className="font-bold text-purple-400">{contextSummary?.roadmap_percentage ?? 0}%</span>
                    </div>

                    {/* DSA Solved */}
                    <div className="bg-slate-800/60 border border-slate-700/60 px-2.5 py-1 rounded-lg text-xs">
                      <span className="text-slate-400">DSA Solved:</span>{' '}
                      <span className="font-bold text-cyan-400">{contextSummary?.dsa_solved ?? 0}</span>
                    </div>
                  </div>

                  {/* Toggle Context Detail */}
                  <button
                    onClick={() => setIsContextExpanded(!isContextExpanded)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    <span>{isContextExpanded ? 'Hide Context' : 'View Context'}</span>
                    {isContextExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Mobile Drawer Toggle */}
                  <button
                    onClick={() => setIsConversationsOpen(!isConversationsOpen)}
                    className="md:hidden p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable Context Detail Banner */}
              {isContextExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn">
                  <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-slate-400 block mb-1 font-semibold flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-indigo-400" /> Target Benchmark
                    </span>
                    <div className="text-white font-medium">
                      {contextSummary?.target_company} — {contextSummary?.target_role}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-1">
                      Language: <span className="text-slate-200">{contextSummary?.preferred_language || 'Python'}</span> | Prep Level: <span className="text-slate-200">{contextSummary?.prep_level || 'Intermediate'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-slate-400 block mb-1 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Matched Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(contextSummary?.matched_skills?.length ? contextSummary.matched_skills : ['Data Structures', 'Python', 'SQL']).map((sk, i) => (
                        <span key={i} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl">
                    <span className="text-slate-400 block mb-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Identified Skill Gaps
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(contextSummary?.missing_skills?.length ? contextSummary.missing_skills : ['Docker', 'Microservices', 'System Design']).map((sk, i) => (
                        <span key={i} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[10px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Mode Selector Pills */}
            <div className="bg-slate-900/40 border-b border-slate-800/80 px-6 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                Mode:
              </span>
              {MENTOR_MODES.map((mode) => {
                const isSelected = selectedMode === mode.id;
                const IconComponent = mode.icon;

                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all
                      ${isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/40'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50 hover:text-white'}
                    `}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{mode.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Mode Focus Banner & Response Length Selector */}
            <div className="bg-slate-900/40 border-b border-slate-800/50 px-6 py-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  <strong className="text-slate-200">{activeModeConfig.name}:</strong> {activeModeConfig.description}
                </span>
              </div>

              {/* Response Length Budget Selector (Token Efficiency) */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold hidden sm:inline">Output:</span>
                <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setResponseLength('quick')}
                    className={`px-2 py-0.5 rounded-md font-medium transition ${
                      responseLength === 'quick' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Quick ~100 tokens: 1-2 sentence direct answer"
                  >
                    ⚡ Quick
                  </button>
                  <button
                    onClick={() => setResponseLength('normal')}
                    className={`px-2 py-0.5 rounded-md font-medium transition ${
                      responseLength === 'normal' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Normal ~250 tokens: Concise answer + 2-3 actionable points"
                  >
                    🎯 Normal
                  </button>
                  <button
                    onClick={() => setResponseLength('detailed')}
                    className={`px-2 py-0.5 rounded-md font-medium transition ${
                      responseLength === 'detailed' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Detailed ~500 tokens: Deeper technical explanation"
                  >
                    📚 Detailed
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {messages.length === 0 ? (
                // Empty state with introduction & quick actions
                <div className="max-w-2xl mx-auto py-6 text-center space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/30">
                    <Bot className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl font-extrabold text-white">
                      PrepNest Token-Efficient AI Placement Mentor
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                      Personalized coaching for <span className="text-indigo-300 font-semibold">{contextSummary?.target_company || 'Tech Company'}</span> — <span className="text-slate-300">{contextSummary?.target_role || 'Software Engineer'}</span>.
                      Optimized for fast, short, and high-signal placement answers.
                    </p>
                  </div>

                  {/* Placement Quick Action Chips */}
                  <div className="space-y-2 pt-1 text-left">
                    <span className="text-xs font-semibold text-slate-400 block text-center">
                      Top Placement Actions:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                      {GLOBAL_QUICK_ACTIONS.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(action.text, null, action.mode)}
                          className="text-left text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white p-2.5 rounded-xl border border-slate-800 hover:border-indigo-500/50 flex items-center justify-between group transition"
                        >
                          <div>
                            <span className="font-medium text-white block">{action.text}</span>
                            <span className="text-[10px] text-slate-500">{action.desc}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Chat Bubbles
                messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  const userInitials = (user?.full_name || 'ME')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`space-y-1.5 max-w-3xl ${isUser ? 'items-end' : 'items-start'}`}>
                        {/* Message Metadata Header */}
                        <div className={`flex items-center gap-2 text-[11px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <span>{isUser ? 'You' : 'PrepNest Mentor'}</span>
                          {msg.meta?.mode && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                              {msg.meta.mode}
                            </span>
                          )}
                          {msg.created_at && (
                            <span className="text-[10px]">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {/* Message Bubble Card */}
                        <div
                          className={`
                            rounded-2xl p-4 text-sm leading-relaxed border transition shadow-sm
                            ${isUser
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-500/30 rounded-tr-sm shadow-indigo-500/10'
                              : 'bg-slate-900/90 text-slate-200 border-slate-800 rounded-tl-sm backdrop-blur-sm'}
                          `}
                        >
                          {isUser ? (
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                          ) : (
                            <MarkdownContent content={msg.content} />
                          )}
                        </div>

                        {/* Assistant Message Actions & Token Metrics */}
                        {!isUser && (
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {/* Explain More Button */}
                            <button
                              onClick={() => handleExplainMore(msg.content)}
                              disabled={isLoading}
                              title="Request deeper step-by-step technical breakdown"
                              className="text-[11px] text-indigo-300 hover:text-white flex items-center gap-1 transition bg-indigo-500/10 hover:bg-indigo-600/30 px-2 py-0.5 rounded-lg border border-indigo-500/25"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span>Explain More</span>
                            </button>

                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopyMessage(msg.content, msg.id || idx)}
                              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition bg-slate-800/60 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700/50"
                            >
                              {copiedMessageId === (msg.id || idx) ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            {/* Token and Latency Stats Pill */}
                            {msg.meta?.usage && (msg.meta.usage.total_tokens > 0 || msg.meta.usage.completion_tokens > 0) && (
                              <span className="text-[10px] text-slate-500 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                ⚡ {msg.meta.usage.total_tokens || msg.meta.usage.completion_tokens} tok • {msg.meta.usage.latency_ms || 320}ms
                              </span>
                            )}
                          </div>
                        )}
                      </div>


                      {isUser && (
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
                          {userInitials}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Typing / Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]"></div>
                    <span className="text-xs text-slate-400 ml-2">Mentor is thinking with your student profile...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar above input */}
            {messages.length > 0 && (
              <div className="px-6 py-2 bg-slate-950/90 border-t border-slate-800/60 overflow-x-auto scrollbar-none flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Quick Ask:</span>
                {getQuickPrompts().slice(0, 2).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 hover:border-slate-700 shrink-0 truncate max-w-xs transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* 4. Chat Input Bar */}
            <div className="p-4 bg-slate-900/80 border-t border-slate-800/80 backdrop-blur-xl">
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 focus-within:border-indigo-500/80 rounded-2xl p-2 transition shadow-inner">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${activeModeConfig.name} anything (Enter to send, Shift+Enter for new line)...`}
                  rows={1}
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-200 focus:outline-none placeholder:text-slate-500 resize-none max-h-32"
                />

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition
                    ${inputValue.trim() && !isLoading
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                  `}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-2">
                <span>
                  Mode: <strong className="text-slate-400">{activeModeConfig.name}</strong> • Synced with <strong className="text-slate-400">{contextSummary?.target_company || 'Tech Company'}</strong>
                </span>
                <span>
                  PrepNest Placement AI • Free placement coaching
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
