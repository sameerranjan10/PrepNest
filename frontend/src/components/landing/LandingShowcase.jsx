import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  Flame,
  LayoutDashboard,
  Map,
  Target,
  Video,
} from 'lucide-react';

const REVEAL_EASE = [0.16, 1, 0.3, 1];

const DSA_PREVIEW_ROWS = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Microsoft'],
  },
  {
    id: 2,
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    topics: ['Memoization', 'Dynamic Programming'],
    companies: ['Amazon', 'Adobe', 'TCS'],
  },
  {
    id: 3,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Medium',
    topics: ['Array', 'Dynamic Programming'],
    companies: ['Microsoft', 'Goldman Sachs', 'Flipkart'],
  },
];

const SHOWCASE_DOMAINS = [
  { name: 'Programming Fundamentals', difficulty: 'Beginner', weeks: '2-3 weeks' },
  { name: 'Data Structures & Algorithms', difficulty: 'Intermediate', weeks: '6-8 weeks' },
  { name: 'Database & DBMS', difficulty: 'Intermediate', weeks: '2-3 weeks' },
  { name: 'Interview Preparation', difficulty: 'Advanced', weeks: '3-4 weeks' },
];

const MENTOR_MODE_SAMPLES = {
  'Study Planner': {
    query: 'Build me a focused 4-week study plan based on my current DSA and DBMS progress.',
    reply:
      'Prioritize Arrays & Hashing this week, finish Relational Algebra & Normalization in your DBMS roadmap, and schedule two timed aptitude drills on Saturday.',
  },
  'DSA Coach': {
    query: 'Why does a sliding window reduce Longest Substring from O(n^2) to O(n)?',
    reply:
      'Instead of restarting from every index, you move the left pointer forward only when a duplicate enters the window—so each character is visited at most twice.',
  },
  'Code Review': {
    query: 'Can my two-pointer solution fail on sorted arrays with negative numbers?',
    reply:
      'Your sum comparisons still hold on negative sorted integers, though watch for integer overflow when multiplying values in follow-up constraints.',
  },
};

const PERSONALITY_PROMPTS = {
  Professional:
    '"Walk me through the time and space trade-off of using a hash map versus sorting first."',
  Friendly:
    '"Good start! Now suppose memory is constrained—how could you solve this without extra space?"',
  Strict:
    '"Your answer skips collision handling. State exact worst-case lookup complexity and why it happens."',
};

export function LandingShowcase({ isAuthenticated, liveData }) {
  const [difficultyTab, setDifficultyTab] = useState('All');
  const [mentorMode, setMentorMode] = useState('Study Planner');
  const [selectedPersonality, setSelectedPersonality] = useState('Professional');
  const { catalog, userStats } = liveData;

  const filteredProblems =
    difficultyTab === 'All'
      ? DSA_PREVIEW_ROWS
      : DSA_PREVIEW_ROWS.filter((p) => p.difficulty === difficultyTab);

  const activeMentorSample = MENTOR_MODE_SAMPLES[mentorMode];

  return (
    <section
      id="platform-showcase"
      className="py-14 lg:py-20 bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: REVEAL_EASE }}
          className="max-w-2xl mx-auto text-center space-y-2.5"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/25 text-[11px] font-bold uppercase tracking-wider text-[#D97706] dark:text-[#FFA116]">
            Product Walkthrough
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3]">
            Built Like a Real Engineering Workspace
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] dark:text-[#8B949E]">
            Every module shares context in PostgreSQL so your solved problems, roadmap milestones, resume scans, and interview turns inform each other.
          </p>
        </motion.div>

        {/* 1. DASHBOARD PREVIEW (Visual Left / Copy Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, ease: REVEAL_EASE }}
            className="lg:col-span-7"
          >
            <div className="rounded-2xl border border-[#E5E7EB]/90 dark:border-[#30363D] bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#30363D] pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                  <LayoutDashboard className="w-4 h-4 text-[#FF9800]" />
                  <span>PrepNest Workspace · Dashboard</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#D97706] dark:text-[#FFA116] text-[11px] font-semibold">
                  {isAuthenticated ? 'Live Account Sync' : 'Workspace Overview'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D]">
                  <p className="text-[10px] font-semibold text-[#64748B] dark:text-[#8B949E]">
                    DSA Progress
                  </p>
                  <p className="mt-1 text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] tabular-nums">
                    {isAuthenticated && userStats?.dsaSolved !== null
                      ? `${userStats.dsaSolved}/${catalog?.dsaTotal || 0}`
                      : catalog?.dsaTotal
                        ? `${catalog.dsaTotal.toLocaleString()} Bank`
                        : 'Live Bank'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D]">
                  <p className="text-[10px] font-semibold text-[#64748B] dark:text-[#8B949E]">
                    Aptitude
                  </p>
                  <p className="mt-1 text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] tabular-nums">
                    {isAuthenticated && userStats?.aptSolved !== null
                      ? `${userStats.aptSolved}/${catalog?.aptitudeTotal || 0}`
                      : catalog?.aptitudeTotal
                        ? `${catalog.aptitudeTotal.toLocaleString()} Qs`
                        : 'Quant & LR'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D]">
                  <p className="text-[10px] font-semibold text-[#64748B] dark:text-[#8B949E]">
                    Active Streak
                  </p>
                  <p className="mt-1 text-base font-bold text-[#FF9800] tabular-nums flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>
                      {isAuthenticated && userStats?.streak !== null
                        ? `${userStats.streak}d`
                        : 'Daily Sync'}
                    </span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D]">
                  <p className="text-[10px] font-semibold text-[#64748B] dark:text-[#8B949E]">
                    Readiness
                  </p>
                  <p className="mt-1 text-base font-bold text-[#16A34A] dark:text-[#3FB950] tabular-nums">
                    {isAuthenticated && userStats?.readiness !== null
                      ? `${userStats.readiness}%`
                      : 'Sign in'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden dark:bg-[#FFF9F2] dark:p-1.5 border border-[#E5E7EB] dark:border-[#30363D]">
                <img
                  src="/illustrations/hero-collab.jpg"
                  alt="PrepNest students collaborating across company tracks and coding prep"
                  className="w-full h-auto aspect-[3/2] object-cover block rounded-lg mix-blend-multiply dark:mix-blend-normal"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, delay: 0.06, ease: REVEAL_EASE }}
            className="lg:col-span-5 space-y-4"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF9800]">
              <LayoutDashboard className="w-4 h-4" />
              <span>Unified Dashboard</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#1E293B] dark:text-[#E6EDF3]">
              Your daily command center for placement preparation
            </h3>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-[#8B949E] leading-relaxed">
              See your active streak, DSA and aptitude progress, target company coverage, recommended next problems, and recent milestones the moment you sign in.
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>Real-time statistics synchronized with PostgreSQL</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>Weekly activity heatmap and rank progression</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span>Personalized roadmap recommendations from resume scans</span>
              </li>
            </ul>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF9800] hover:bg-[#E68900] text-white text-xs sm:text-sm font-semibold hover:-translate-y-0.5 transition-all"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* 2. DSA DIRECTORY SHOWCASE (Copy Left / Interactive Preview Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, ease: REVEAL_EASE }}
            className="lg:col-span-5 space-y-4 lg:order-1 order-2"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00B8A3]">
              <Code2 className="w-4 h-4" />
              <span>DSA Directory</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#1E293B] dark:text-[#E6EDF3]">
              Practice curated coding problems filtered by company and topic
            </h3>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-[#8B949E] leading-relaxed">
              Filter by difficulty, topic tags like Arrays, Graphs, and Dynamic Programming, or company tags, then write, test, and submit solutions in the built-in workspace.
            </p>
            <Link
              to="/dsa"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E293B] dark:bg-[#21262D] hover:bg-[#0F172A] dark:hover:bg-[#30363D] text-white text-xs sm:text-sm font-semibold hover:-translate-y-0.5 transition-all"
            >
              <span>Browse DSA Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, delay: 0.06, ease: REVEAL_EASE }}
            className="lg:col-span-7 lg:order-2 order-1"
          >
            <div className="rounded-2xl border border-[#E5E7EB]/90 dark:border-[#30363D] bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5E7EB] dark:border-[#30363D]">
                <span className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                  Problem Set{catalog?.dsaTotal ? ` (${catalog.dsaTotal.toLocaleString()} Total)` : ''}
                </span>
                <div className="flex items-center gap-1">
                  {['All', 'Easy', 'Medium'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setDifficultyTab(tab)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition ${
                        difficultyTab === tab
                          ? 'bg-[#FF9800] text-white'
                          : 'bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] text-[#64748B] dark:text-[#8B949E]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={difficultyTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-2"
                >
                  {filteredProblems.map((prob) => (
                    <div
                      key={prob.id}
                      className="p-3 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                          {prob.id}. {prob.title}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {prob.topics.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-[#161B22] text-[10px] font-medium text-[#64748B] dark:text-[#8B949E]"
                            >
                              {t}
                            </span>
                          ))}
                          {prob.companies.map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[10px] font-semibold text-[#D97706] dark:text-[#FFA116]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          prob.difficulty === 'Easy'
                            ? 'bg-[#E6FAF6] dark:bg-[#3FB950]/15 text-[#00B8A3] dark:text-[#3FB950]'
                            : 'bg-[#FFF9E6] dark:bg-[#D29922]/15 text-[#D97706] dark:text-[#D29922]'
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* 3. LEARNING ROADMAPS SHOWCASE (Visual Left / Copy Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, ease: REVEAL_EASE }}
            className="lg:col-span-7"
          >
            <div className="rounded-2xl border border-[#E5E7EB]/90 dark:border-[#30363D] bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB] dark:border-[#30363D]">
                <span className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-2">
                  <Map className="w-4 h-4 text-[#FF9800]" />
                  <span>Seeded Learning Domains</span>
                </span>
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#8B949E]">
                  {catalog?.domainCount || 7} Tracks · {catalog?.topicCount || 35} Topics
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                {SHOWCASE_DOMAINS.map((domain, idx) => (
                  <motion.div
                    key={domain.name}
                    whileHover={{ y: -2 }}
                    className="p-3 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#FF9800] uppercase">
                        Track 0{idx + 1}
                      </span>
                      <span className="text-[10px] text-[#64748B] dark:text-[#8B949E]">
                        {domain.weeks}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                      {domain.name}
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded bg-[#F8FAFC] dark:bg-[#161B22] text-[10px] font-medium text-[#64748B] dark:text-[#8B949E]">
                      {domain.difficulty}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, delay: 0.06, ease: REVEAL_EASE }}
            className="lg:col-span-5 space-y-4"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Map className="w-4 h-4" />
              <span>Learning Roadmaps</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#1E293B] dark:text-[#E6EDF3]">
              Follow clear milestones instead of guessing what to study next
            </h3>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-[#8B949E] leading-relaxed">
              Progress topic by topic across Programming Fundamentals, Web Development, DSA, DBMS, Backend Engineering, Git, and Interview Preparation—and let resume scans surface priority gaps.
            </p>
            <Link
              to="/roadmaps"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF9800] hover:bg-[#E68900] text-white text-xs sm:text-sm font-semibold hover:-translate-y-0.5 transition-all"
            >
              <span>View Roadmaps</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* 4. AI PLACEMENT MENTOR SHOWCASE (Copy Left / Interactive Preview Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, ease: REVEAL_EASE }}
            className="lg:col-span-5 space-y-4 lg:order-1 order-2"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF9800]">
              <Bot className="w-4 h-4" />
              <span>AI Placement Mentor</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#1E293B] dark:text-[#E6EDF3]">
              Context-aware guidance grounded in your actual prep state
            </h3>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-[#8B949E] leading-relaxed">
              Ask for study plans, DSA approach explanations, code review feedback, or resume improvements inside persistent conversation threads connected to your PrepNest profile.
            </p>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E293B] dark:bg-[#21262D] hover:bg-[#0F172A] dark:hover:bg-[#30363D] text-white text-xs sm:text-sm font-semibold hover:-translate-y-0.5 transition-all"
            >
              <span>Open AI Mentor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, delay: 0.06, ease: REVEAL_EASE }}
            className="lg:col-span-7 lg:order-2 order-1"
          >
            <div className="rounded-2xl border border-[#E5E7EB]/90 dark:border-[#30363D] bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5E7EB] dark:border-[#30363D]">
                <span className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                  Mentor Mode Preview
                </span>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(MENTOR_MODE_SAMPLES).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setMentorMode(mode)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition ${
                        mentorMode === mode
                          ? 'bg-[#FF9800] text-white'
                          : 'bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] text-[#64748B] dark:text-[#8B949E]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mentorMode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-2.5"
                >
                  <div className="p-3 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] text-xs text-[#1E293B] dark:text-[#E6EDF3]">
                    <span className="font-bold text-[#FF9800] block text-[10px] uppercase mb-0.5">
                      Candidate Query
                    </span>
                    &ldquo;{activeMentorSample.query}&rdquo;
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/30 text-xs text-[#1E293B] dark:text-[#E6EDF3] leading-relaxed">
                    <span className="font-bold text-[#D97706] dark:text-[#FFA116] block text-[10px] uppercase mb-0.5">
                      AI Mentor · {mentorMode}
                    </span>
                    {activeMentorSample.reply}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* 5. MOCK INTERVIEW INTERFACE SHOWCASE (Visual Left / Copy Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, ease: REVEAL_EASE }}
            className="lg:col-span-7"
          >
            <div className="rounded-2xl border border-[#E5E7EB]/90 dark:border-[#30363D] bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5E7EB] dark:border-[#30363D]">
                <span className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#FF9800]" />
                  <span>Adaptive Interview Room</span>
                </span>
                <div className="flex items-center gap-1">
                  {Object.keys(PERSONALITY_PROMPTS).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPersonality(p)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition ${
                        selectedPersonality === p
                          ? 'bg-[#FF9800] text-white'
                          : 'bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] text-[#64748B] dark:text-[#8B949E]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPersonality}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] text-xs space-y-1.5"
                >
                  <span className="text-[10px] font-bold uppercase text-[#FF9800]">
                    Adaptive Follow-Up ({selectedPersonality} Style)
                  </span>
                  <p className="text-xs sm:text-sm text-[#1E293B] dark:text-[#E6EDF3] leading-relaxed">
                    {PERSONALITY_PROMPTS[selectedPersonality]}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {['Technical', 'HR', 'Behavioral (STAR)', 'Mixed'].map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] text-[10px] font-semibold text-[#475569] dark:text-[#8B949E]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#8B949E]">
                  Realistic · Practice · Pressure
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, delay: 0.06, ease: REVEAL_EASE }}
            className="lg:col-span-5 space-y-4"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF9800]">
              <Target className="w-4 h-4" />
              <span>Adaptive Mock Interviews</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#1E293B] dark:text-[#E6EDF3]">
              Realistic interview rounds with dynamic follow-up probing
            </h3>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-[#8B949E] leading-relaxed">
              Choose Technical, HR, Behavioral (STAR), or Mixed tracks in Realistic, Practice, or Pressure modes, pick company context, and receive criterion-level evaluation reports.
            </p>
            <Link
              to="/mock-interview"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF9800] hover:bg-[#E68900] text-white text-xs sm:text-sm font-semibold hover:-translate-y-0.5 transition-all"
            >
              <span>Launch Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
