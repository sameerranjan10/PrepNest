import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import {
  Map,
  CheckCircle2,
  Lock,
  ChevronRight,
  Code2,
  Database,
  BrainCircuit,
  Globe,
  Server,
  GitBranch,
  Briefcase,
  RotateCcw,
  Trophy,
  Target,
  Clock,
  BookOpen,
  PlayCircle,
  Check,
  X,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  Layers,
  HelpCircle,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Icon mapping for roadmap domains
const ICON_MAP = {
  Code2: Code2,
  Globe: Globe,
  BrainCircuit: BrainCircuit,
  Database: Database,
  Server: Server,
  GitBranch: GitBranch,
  Briefcase: Briefcase,
};

export default function RoadmapsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Domains & Overall Stats
  const [domains, setDomains] = useState([]);
  const [overallStats, setOverallStats] = useState({
    total_topics: 35,
    completed_topics: 0,
    progress_percentage: 0,
  });
  const [selectedDomainIndex, setSelectedDomainIndex] = useState(0);

  // Selected Domain Topics
  const [topics, setTopics] = useState([]);
  const [domainProject, setDomainProject] = useState(null);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Topic Modal State
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicDetail, setTopicDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("learn"); // 'learn' | 'practice' | 'project'

  // Quiz & Practice interactive state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [expandedHints, setExpandedHints] = useState({});
  const [completedTaskIds, setCompletedTaskIds] = useState({});

  // Skill Gap Recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [resumeScanMeta, setResumeScanMeta] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Loading & Alert state
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Auth token helper
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("prepnest_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  /* =========================================================
     1. FETCH DOMAINS & PROGRESS
  ========================================================= */
  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/roadmap/domains`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load roadmap domains");
      const data = await res.json();
      setDomains(data.domains || []);
      setOverallStats(
        data.overall || {
          total_topics: 35,
          completed_topics: 0,
          progress_percentage: 0,
        }
      );
    } catch (err) {
      console.error("Error fetching roadmap domains:", err);
    }
  }, [getAuthHeaders]);

  /* =========================================================
     2. FETCH RECOMMENDATIONS (From Resume Analyzer Gap)
  ========================================================= */
  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/roadmap/recommendations`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setResumeScanMeta({
        hasScan: data.has_resume_scan,
        targetRole: data.target_role,
        targetCompany: data.target_company,
      });
    } catch (err) {
      console.warn("Could not load recommendations:", err);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchDomains();
    fetchRecommendations();
  }, [fetchDomains, fetchRecommendations]);

  /* =========================================================
     3. SYNC WITH URL QUERY (e.g. ?track=dsa)
  ========================================================= */
  useEffect(() => {
    if (domains.length === 0) return;
    const track = searchParams.get("track");
    if (track) {
      const idx = domains.findIndex(
        (d) => d.id.toLowerCase() === track.toLowerCase()
      );
      if (idx !== -1) {
        setSelectedDomainIndex(idx);
      }
    }
  }, [searchParams, domains]);

  /* =========================================================
     4. FETCH TOPICS FOR CURRENT SELECTED DOMAIN
  ========================================================= */
  const currentDomain = domains[selectedDomainIndex] || null;

  const fetchDomainTopics = useCallback(
    async (domainId) => {
      if (!domainId) return;
      setLoadingTopics(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/roadmap/domains/${domainId}/topics`,
          {
            headers: getAuthHeaders(),
          }
        );
        if (!res.ok) throw new Error("Failed to load topics");
        const data = await res.json();
        setTopics(data.topics || []);
        setDomainProject(data.project || null);
      } catch (err) {
        console.error("Error loading domain topics:", err);
      } finally {
        setLoadingTopics(false);
      }
    },
    [getAuthHeaders]
  );

  useEffect(() => {
    if (currentDomain) {
      fetchDomainTopics(currentDomain.id);
    }
  }, [currentDomain, fetchDomainTopics]);

  /* =========================================================
     5. FETCH FULL TOPIC DETAIL (MODAL)
  ========================================================= */
  const openTopicModal = async (topicId) => {
    setLoadingDetail(true);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setActiveTab("learn");
    try {
      const res = await fetch(`${API_BASE}/api/roadmap/topics/${topicId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load topic details");
      const data = await res.json();
      setSelectedTopic(data.topic);
      setTopicDetail(data);
    } catch (err) {
      console.error("Error loading topic detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  /* =========================================================
     6. TOGGLE TOPIC COMPLETION
  ========================================================= */
  const handleToggleComplete = async (topicId, currentStatus) => {
    if (!topicId || isUpdatingProgress) return;
    setIsUpdatingProgress(true);
    const newStatus = currentStatus ? "not_started" : "completed";
    try {
      const res = await fetch(`${API_BASE}/api/roadmap/progress`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          topic_id: topicId,
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      const data = await res.json();

      // Update topics list state
      setTopics((prev) => {
        let prevComp = true;
        return prev.map((t, idx) => {
          if (t.id === topicId) {
            const isComp = newStatus === "completed";
            prevComp = isComp;
            return { ...t, completed: isComp };
          }
          const isUnlocked = prevComp || idx === 0;
          prevComp = t.completed;
          return { ...t, unlocked: isUnlocked };
        });
      });

      // Update current open topic state if modal is open
      if (selectedTopic && selectedTopic.id === topicId) {
        setSelectedTopic((prev) => ({
          ...prev,
          is_completed: newStatus === "completed",
        }));
      }

      // Update domain card progress
      setDomains((prev) =>
        prev.map((d) =>
          d.id === data.domain_id
            ? {
                ...d,
                completed_topics: data.domain_completed,
                total_topics: data.domain_total,
                progress_percentage: data.domain_progress_percentage,
              }
            : d
        )
      );

      // Update overall stats
      setOverallStats((prev) => ({
        ...prev,
        completed_topics: data.overall_completed,
        total_topics: data.overall_total,
        progress_percentage: data.overall_progress_percentage,
      }));
    } catch (err) {
      console.error("Error updating progress:", err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  /* =========================================================
     7. GO TO NEXT TOPIC
  ========================================================= */
  const goToNextTopic = () => {
    if (!selectedTopic || topics.length === 0) return;
    const currentIndex = topics.findIndex((t) => t.id === selectedTopic.id);
    if (currentIndex !== -1 && currentIndex + 1 < topics.length) {
      const nextTopic = topics[currentIndex + 1];
      openTopicModal(nextTopic.id);
    } else {
      setSelectedTopic(null);
    }
  };

  /* =========================================================
     8. RESET ALL PROGRESS
  ========================================================= */
  const handleResetProgress = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset your entire roadmap progress? This will reset all completed topics."
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/api/roadmap/progress/reset`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to reset progress");
      setSelectedTopic(null);
      await fetchDomains();
      if (currentDomain) {
        await fetchDomainTopics(currentDomain.id);
      }
    } catch (err) {
      console.error("Error resetting progress:", err);
    }
  };

  /* =========================================================
     9. SEARCH & DIFFICULTY FILTERED TOPICS
  ========================================================= */
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description &&
          t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty =
        difficultyFilter === "all" ||
        t.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
      return matchesSearch && matchesDifficulty;
    });
  }, [topics, searchQuery, difficultyFilter]);

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="roadmaps" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">
          {/* =================================================
              TOP HEADER
          ================================================= */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Map className="w-4 h-4" />
                Career Roadmap & Learning Tracks
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-2">
                Your Developer Roadmap
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Master industry-aligned technical skills step-by-step, complete real practice tasks,
                and track verified progress persisted to your profile.
              </p>
            </div>

            <button
              onClick={handleResetProgress}
              className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Progress
            </button>
          </div>

          {/* =================================================
              SKILL GAP RECOMMENDATION BANNER (If Resume Scanned)
          ================================================= */}
          {recommendations.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 shadow-lg relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 mt-0.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                        Personalized Recommendations
                      </span>
                      {resumeScanMeta?.targetRole && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                          Target: {resumeScanMeta.targetRole}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {resumeScanMeta?.hasScan
                        ? "Based on your latest Resume ATS analysis, we detected skill gaps. Master these topics first to boost your match score:"
                        : "Recommended foundational topics to fast-track your technical interview preparation:"}
                    </p>
                  </div>
                </div>

                <Link
                  to="/resume"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 shrink-0 self-start md:self-center transition"
                >
                  View Resume Analysis <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Recommendation Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {recommendations.map((rec) => (
                  <button
                    key={rec.topic_id}
                    onClick={() => {
                      const dIdx = domains.findIndex(
                        (d) => d.id === rec.domain_id
                      );
                      if (dIdx !== -1) setSelectedDomainIndex(dIdx);
                      openTopicModal(rec.topic_id);
                    }}
                    className="flex flex-col text-left p-3 rounded-xl bg-slate-900/80 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-500/40 transition group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-indigo-400">
                        {rec.domain_name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        {rec.difficulty}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white mt-1 group-hover:text-indigo-300 transition line-clamp-1">
                      {rec.title}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {rec.reason}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =================================================
              OVERALL PROGRESS & STATS
          ================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Target className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Overall Progress</p>
                    <p className="text-lg font-bold text-white">
                      {overallStats.progress_percentage}% Complete
                    </p>
                  </div>
                </div>

                <span className="text-sm font-bold text-indigo-400">
                  {overallStats.completed_topics}/{overallStats.total_topics} Topics
                </span>
              </div>

              <div className="mt-5 h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${overallStats.progress_percentage}%`,
                  }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-3">
                Complete topics and pass topic quizzes to unlock sequential stages.
              </p>
            </div>

            {/* ACHIEVEMENT BADGE CARD */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <Trophy className="w-6 h-6 text-indigo-400" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Tier Status
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-4">Current Achievement</p>
                <p className="text-lg font-bold text-white mt-1">
                  {overallStats.progress_percentage >= 80
                    ? "Roadmap Master 🏆"
                    : overallStats.progress_percentage >= 50
                    ? "Halfway Hero ⚡"
                    : overallStats.progress_percentage >= 25
                    ? "Getting Started 🚀"
                    : "Beginner Explorer 🧭"}
                </p>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {overallStats.progress_percentage >= 100
                  ? "All modules verified and mastered!"
                  : `${overallStats.total_topics - overallStats.completed_topics} more topics remaining to reach 100%.`}
              </p>
            </div>
          </div>

          {/* =================================================
              LEARNING PATH STAGES (DOMAINS)
          ================================================= */}
          <div>
            <h2 className="text-lg font-bold text-white">Learning Tracks</h2>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Select a track below to explore its structured topics, practice tasks, and domain project.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {domains.map((domain, index) => {
                const Icon = ICON_MAP[domain.icon_name] || Code2;
                const selected = selectedDomainIndex === index;
                const progress = domain.progress_percentage || 0;

                return (
                  <button
                    key={domain.id}
                    onClick={() => {
                      setSelectedDomainIndex(index);
                      setSearchParams({ track: domain.id });
                    }}
                    className={`text-left p-5 rounded-2xl border transition-all ${
                      selected
                        ? "bg-indigo-500/10 border-indigo-500/60 shadow-lg shadow-indigo-500/10"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700/50">
                        <Icon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                        {domain.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-4">
                      {domain.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 min-h-[36px] line-clamp-2">
                      {domain.description}
                    </p>

                    <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {domain.estimated_weeks}
                      </span>
                      <span>{domain.total_topics} topics</span>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] mb-2">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-indigo-400 font-bold">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================
              SELECTED TRACK TOPICS SECTION
          ================================================= */}
          {currentDomain && (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-indigo-400">
                      Track {selectedDomainIndex + 1} of {domains.length}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                      {currentDomain.difficulty}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    {currentDomain.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentDomain.description}
                  </p>
                </div>

                {domainProject && (
                  <button
                    onClick={() => {
                      if (topics.length > 0) openTopicModal(topics[0].id);
                      setActiveTab("project");
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold self-start md:self-center transition"
                  >
                    <FolderGit2 className="w-4 h-4 text-indigo-400" />
                    <span>Domain Mini-Project</span>
                  </button>
                )}
              </div>

              {/* SEARCH & FILTERS */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search topics in this track..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* TOPIC LIST */}
              {loadingTopics ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mb-2" />
                  <span className="text-xs">Loading roadmap topics from Neon DB...</span>
                </div>
              ) : filteredTopics.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No topics match your current search or filter criteria.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTopics.map((topic, index) => {
                    const completed = topic.completed;
                    const unlocked = topic.unlocked;

                    return (
                      <div
                        key={topic.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          completed
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : unlocked
                            ? "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                            : "bg-slate-950/30 border-slate-900 opacity-60"
                        }`}
                      >
                        {/* STATUS ICON / NUMBER */}
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            completed
                              ? "bg-emerald-500/20 text-emerald-400"
                              : unlocked
                              ? "bg-indigo-500/10 text-indigo-400"
                              : "bg-slate-800 text-slate-600"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : unlocked ? (
                            <span className="font-bold text-sm">
                              {topic.display_order || index + 1}
                            </span>
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>

                        {/* TOPIC INFO */}
                        <div
                          onClick={() => unlocked && openTopicModal(topic.id)}
                          className={`flex-1 cursor-pointer ${
                            !unlocked ? "pointer-events-none" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                completed ? "text-emerald-400" : "text-white"
                              }`}
                            >
                              {topic.title}
                            </p>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              {topic.difficulty}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ~{topic.estimated_hours}h
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                            {topic.description ||
                              (completed
                                ? "Completed — click to review content and practice tasks"
                                : unlocked
                                ? "Click to learn concepts, practice tasks, and quiz"
                                : "Complete the previous topic to unlock")}
                          </p>
                        </div>

                        {/* ACTION BUTTONS */}
                        {unlocked && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleToggleComplete(topic.id, completed)
                              }
                              title={
                                completed
                                  ? "Mark as uncompleted"
                                  : "Mark as completed"
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                                completed
                                  ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                {completed ? "Completed" : "Mark Done"}
                              </span>
                            </button>

                            <button
                              onClick={() => openTopicModal(topic.id)}
                              className="w-8 h-8 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 flex items-center justify-center transition"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* =====================================================
          DETAILED TOPIC MODAL
      ===================================================== */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col">
            {/* STICKY MODAL HEADER */}
            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-6 pb-4">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs uppercase tracking-wider font-bold text-indigo-400">
                      {currentDomain?.name || "Topic Detail"}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {selectedTopic.difficulty}
                    </span>
                    {selectedTopic.is_completed && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-1">
                    {selectedTopic.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedTopic(null)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* TABS */}
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setActiveTab("learn")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "learn"
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Learn & Docs
                </button>

                <button
                  onClick={() => {
                    setActiveTab("practice");
                    setSelectedAnswer(null);
                    setQuizSubmitted(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "practice"
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <PlayCircle className="w-4 h-4" />
                  Practice Tasks & Quiz
                </button>

                {topicDetail?.mini_project && (
                  <button
                    onClick={() => setActiveTab("project")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                      activeTab === "project"
                        ? "bg-indigo-600 text-white shadow"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <FolderGit2 className="w-4 h-4" />
                    Mini-Project
                  </button>
                )}
              </div>
            </div>

            {/* MODAL BODY */}
            {loadingDetail ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
                <p className="text-xs">Fetching comprehensive topic material...</p>
              </div>
            ) : (
              <div className="p-6 space-y-6 flex-1">
                {/* =================================================
                    TAB 1: LEARN
                ================================================= */}
                {activeTab === "learn" && (
                  <div className="space-y-6">
                    {/* EXPLANATION */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-bold text-white">
                          What is this?
                        </h3>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-4 rounded-xl border border-slate-800/60">
                        {selectedTopic.explanation}
                      </p>
                    </div>

                    {/* KEY POINTS */}
                    {selectedTopic.key_points &&
                      selectedTopic.key_points.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-white mb-3">
                            Key Concepts & Takeaways
                          </h3>
                          <div className="space-y-2">
                            {selectedTopic.key_points.map((point, index) => (
                              <div
                                key={index}
                                className="flex gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800/60"
                              >
                                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-300">{point}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* CODE EXAMPLE */}
                    {selectedTopic.code_example && (
                      <div>
                        <h3 className="text-sm font-bold text-white mb-3">
                          Code / Syntax Example
                        </h3>
                        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap font-mono">
                          {selectedTopic.code_example}
                        </pre>
                      </div>
                    )}

                    {/* VERIFIED LEARNING RESOURCES */}
                    {topicDetail?.resources &&
                      topicDetail.resources.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <span>Curated Verified Resources</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              (Docs, Free Courses & Videos)
                            </span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {topicDetail.resources.map((res) => (
                              <a
                                key={res.id}
                                href={res.url}
                                target={res.url.startsWith("http") ? "_blank" : "_self"}
                                rel="noreferrer"
                                className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:bg-indigo-500/20">
                                  {res.resource_type === "video" ? (
                                    <PlayCircle className="w-4 h-4 text-rose-400" />
                                  ) : (
                                    <BookOpen className="w-4 h-4 text-indigo-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition line-clamp-1">
                                    {res.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                    <span>{res.provider}</span>
                                    <span>•</span>
                                    <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                                      {res.resource_type}
                                    </span>
                                  </div>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 mt-1" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* GO TO PRACTICE CTA */}
                    <button
                      onClick={() => {
                        setActiveTab("practice");
                        setSelectedAnswer(null);
                        setQuizSubmitted(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition shadow"
                    >
                      <span>Practice This Topic</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* =================================================
                    TAB 2: PRACTICE TASKS & QUIZ
                ================================================= */}
                {activeTab === "practice" && (
                  <div className="space-y-6">
                    {/* SECTION A: REAL PRACTICE TASKS (>=3) */}
                    {topicDetail?.practice_tasks &&
                      topicDetail.practice_tasks.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <CheckSquare className="w-4 h-4 text-indigo-400" />
                              <span>Hands-on Practice Tasks</span>
                            </h3>
                            <span className="text-[11px] text-slate-400">
                              {
                                Object.keys(completedTaskIds).filter(
                                  (id) => completedTaskIds[id]
                                ).length
                              }
                              /{topicDetail.practice_tasks.length} solved
                            </span>
                          </div>

                          <div className="space-y-3">
                            {topicDetail.practice_tasks.map((task, idx) => {
                              const isTaskDone = completedTaskIds[task.id];
                              const isHintOpen = expandedHints[task.id];

                              return (
                                <div
                                  key={task.id}
                                  className={`p-4 rounded-xl border transition ${
                                    isTaskDone
                                      ? "bg-emerald-500/5 border-emerald-500/20"
                                      : "bg-slate-800/40 border-slate-800"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      <button
                                        onClick={() =>
                                          setCompletedTaskIds((prev) => ({
                                            ...prev,
                                            [task.id]: !prev[task.id],
                                          }))
                                        }
                                        className="mt-0.5 text-slate-400 hover:text-emerald-400 transition"
                                      >
                                        {isTaskDone ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                          <Square className="w-4 h-4" />
                                        )}
                                      </button>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-white">
                                            Task {idx + 1}: {task.title}
                                          </span>
                                          <span
                                            className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                              task.difficulty === "Easy"
                                                ? "bg-emerald-500/20 text-emerald-300"
                                                : task.difficulty === "Medium"
                                                ? "bg-amber-500/20 text-amber-300"
                                                : "bg-rose-500/20 text-rose-300"
                                            }`}
                                          >
                                            {task.difficulty}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                          {task.description}
                                        </p>
                                      </div>
                                    </div>

                                    {task.hint && (
                                      <button
                                        onClick={() =>
                                          setExpandedHints((prev) => ({
                                            ...prev,
                                            [task.id]: !prev[task.id],
                                          }))
                                        }
                                        className="text-[11px] text-indigo-400 hover:text-indigo-300 shrink-0 flex items-center gap-1 font-medium transition"
                                      >
                                        {isHintOpen ? "Hide Hint" : "Hint"}
                                        {isHintOpen ? (
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    )}
                                  </div>

                                  {/* HINT ACCORDION */}
                                  {isHintOpen && task.hint && (
                                    <div className="mt-3 p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">
                                      <strong className="text-indigo-300 font-semibold">
                                        💡 Hint:
                                      </strong>{" "}
                                      {task.hint}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* SECTION B: RELEVANT DSA PROBLEMS (If Available) */}
                    {topicDetail?.dsa_problems &&
                      topicDetail.dsa_problems.length > 0 && (
                        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4" />
                            <span>Linked DSA Problems on PrepNest</span>
                          </h4>
                          <p className="text-xs text-slate-400 mb-3">
                            Strengthen this data structure with curated practice problems in our DSA module:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {topicDetail.dsa_problems.map((prob) => (
                              <Link
                                key={prob.id}
                                to={`/dsa?search=${encodeURIComponent(prob.title)}`}
                                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs text-white hover:text-indigo-300 transition group"
                              >
                                <span className="font-medium line-clamp-1">
                                  {prob.title}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ml-2 ${
                                    prob.difficulty === "Easy"
                                      ? "text-emerald-400 bg-emerald-500/10"
                                      : prob.difficulty === "Medium"
                                      ? "text-amber-400 bg-amber-500/10"
                                      : "text-rose-400 bg-rose-500/10"
                                  }`}
                                >
                                  {prob.difficulty}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* SECTION C: TOPIC QUIZ */}
                    {selectedTopic.quiz && selectedTopic.quiz.question && (
                      <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-sm font-bold text-white">
                              Topic Knowledge Check
                            </h3>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Single Choice
                          </span>
                        </div>

                        <p className="text-xs text-slate-200 font-medium">
                          {selectedTopic.quiz.question}
                        </p>

                        <div className="space-y-2">
                          {selectedTopic.quiz.options?.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrect =
                              quizSubmitted &&
                              index === selectedTopic.quiz.answer;
                            const isWrong =
                              quizSubmitted &&
                              isSelected &&
                              index !== selectedTopic.quiz.answer;

                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  if (!quizSubmitted) setSelectedAnswer(index);
                                }}
                                disabled={quizSubmitted}
                                className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition ${
                                  isCorrect
                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold"
                                    : isWrong
                                    ? "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold"
                                    : isSelected
                                    ? "bg-indigo-500/20 border-indigo-500 text-white"
                                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                                }`}
                              >
                                <span className="font-mono text-slate-500 mr-2">
                                  {String.fromCharCode(65 + index)}.
                                </span>
                                {option}
                              </button>
                            );
                          })}
                        </div>

                        {/* SUBMIT BUTTON */}
                        {!quizSubmitted ? (
                          <button
                            onClick={() => {
                              if (selectedAnswer !== null) {
                                setQuizSubmitted(true);
                              }
                            }}
                            disabled={selectedAnswer === null}
                            className={`w-full py-2.5 rounded-xl text-xs font-semibold transition ${
                              selectedAnswer !== null
                                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            Submit Answer
                          </button>
                        ) : (
                          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                            <div className="flex items-center gap-2">
                              {selectedAnswer === selectedTopic.quiz.answer ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <X className="w-4 h-4 text-rose-400" />
                              )}
                              <span className="text-xs font-bold text-white">
                                {selectedAnswer === selectedTopic.quiz.answer
                                  ? "Correct! Excellent grasp of this concept."
                                  : "Incorrect answer."}
                              </span>
                            </div>
                            {selectedTopic.quiz.explanation && (
                              <p className="text-[11px] text-slate-400 mt-1 pl-6">
                                {selectedTopic.quiz.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* =================================================
                    TAB 3: DOMAIN MINI-PROJECT
                ================================================= */}
                {activeTab === "project" && topicDetail?.mini_project && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                          Domain Capstone Project
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
                          ~{topicDetail.mini_project.estimated_hours} Hours
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white mt-1">
                        {topicDetail.mini_project.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {topicDetail.mini_project.description}
                      </p>

                      {/* TECH STACK */}
                      {topicDetail.mini_project.tech_stack && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {topicDetail.mini_project.tech_stack.map((tech, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-medium border border-slate-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* REQUIREMENTS */}
                    {topicDetail.mini_project.requirements && (
                      <div>
                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                          <span>Implementation Requirements</span>
                        </h4>
                        <div className="space-y-2">
                          {topicDetail.mini_project.requirements.map(
                            (req, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-800"
                              >
                                <span className="text-indigo-400 font-bold text-xs shrink-0">
                                  {idx + 1}.
                                </span>
                                <p className="text-xs text-slate-300">{req}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STICKY MODAL FOOTER */}
            <div className="sticky bottom-0 z-10 bg-slate-900 border-t border-slate-800 p-5 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() =>
                  handleToggleComplete(
                    selectedTopic.id,
                    selectedTopic.is_completed
                  )
                }
                disabled={isUpdatingProgress}
                className={`w-full sm:flex-1 flex items-center justify-center gap-2 font-semibold text-xs py-3 rounded-xl transition shadow ${
                  selectedTopic.is_completed
                    ? "bg-slate-800 hover:bg-slate-700 text-emerald-400"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                {isUpdatingProgress ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {selectedTopic.is_completed
                    ? "Completed (Click to Re-open)"
                    : "Mark Topic Complete"}
                </span>
              </button>

              <button
                onClick={goToNextTopic}
                className="w-full sm:w-auto px-5 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-3 rounded-xl transition"
              >
                <span>Next Topic</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}