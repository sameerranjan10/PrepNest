import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { ArrowRight, CalendarDays, CheckCircle2, Flame, Lock, TrendingUp } from 'lucide-react';

const REVEAL_EASE = [0.16, 1, 0.3, 1];

export function LandingAnalytics({ isAuthenticated, liveData }) {
  const { catalog, userStats } = liveData;

  const dsaTotal = catalog?.dsaTotal || 0;
  const aptTotal = catalog?.aptitudeTotal || 0;
  const topicTotal = catalog?.topicCount || 0;

  const dsaPct = isAuthenticated && userStats?.dsaPct !== null ? userStats.dsaPct : 0;
  const aptPct = isAuthenticated && userStats?.aptPct !== null ? userStats.aptPct : 0;
  const roadmapPct =
    isAuthenticated && userStats?.roadmapPct !== null ? userStats.roadmapPct : 0;
  const interviewScore =
    isAuthenticated && userStats?.interviewScore !== null ? userStats.interviewScore : 0;
  const readiness = isAuthenticated && userStats?.readiness !== null ? userStats.readiness : 0;
  const streak = isAuthenticated && userStats?.streak !== null ? userStats.streak : 0;

  const barData = useMemo(
    () => [
      {
        name: 'DSA',
        value: isAuthenticated ? dsaPct : 0,
        color: '#00B8A3',
      },
      {
        name: 'Aptitude',
        value: isAuthenticated ? aptPct : 0,
        color: '#D97706',
      },
      {
        name: 'Roadmap',
        value: isAuthenticated ? roadmapPct : 0,
        color: '#2563EB',
      },
      {
        name: 'Interview',
        value: isAuthenticated ? interviewScore : 0,
        color: '#FF9800',
      },
    ],
    [isAuthenticated, dsaPct, aptPct, roadmapPct, interviewScore]
  );

  // Build real 14-day consistency grid from authenticated activity timestamps (or empty baseline when signed out)
  const heatmapDays = useMemo(() => {
    const activeDates = new Map();
    if (isAuthenticated && Array.isArray(userStats?.recentActivities)) {
      userStats.recentActivities.forEach((act) => {
        const ts = act?.created_at || act?.submitted_at;
        if (!ts) return;
        const d = new Date(ts);
        if (Number.isNaN(d.getTime())) return;
        const key = d.toISOString().slice(0, 10);
        activeDates.set(key, (activeDates.get(key) || 0) + 1);
      });
    }

    const days = [];
    const today = new Date();
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = activeDates.get(key) || 0;
      days.push({ key, count });
    }
    return days;
  }, [isAuthenticated, userStats]);

  // SVG Ring math
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const displayRingPct = isAuthenticated ? Math.min(100, Math.max(0, readiness)) : 0;
  const strokeDashoffset = circumference - (displayRingPct / 100) * circumference;

  return (
    <section className="py-14 lg:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Narrative & Core Pillars */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: REVEAL_EASE }}
            className="lg:col-span-5 space-y-5"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/25 text-[11px] font-bold uppercase tracking-wider text-[#D97706] dark:text-[#FFA116]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Progress &amp; Analytics</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3]">
              Measure readiness objectively across every placement pillar
            </h2>

            <p className="text-sm sm:text-base text-[#64748B] dark:text-[#8B949E] leading-relaxed">
              PrepNest tracks real database submissions—not self-reported estimates—so you always know where your coding, aptitude, roadmap milestones, and interview responses stand.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                {
                  title: 'DSA Progress',
                  detail:
                    isAuthenticated && userStats?.dsaSolved !== null
                      ? `${userStats.dsaSolved} / ${dsaTotal.toLocaleString()} solved`
                      : dsaTotal > 0
                        ? `${dsaTotal.toLocaleString()} verified problems`
                        : 'Problem solving completion',
                },
                {
                  title: 'Aptitude Performance',
                  detail:
                    isAuthenticated && userStats?.aptSolved !== null
                      ? `${userStats.aptSolved} / ${aptTotal.toLocaleString()} completed`
                      : aptTotal > 0
                        ? `${aptTotal.toLocaleString()} timed & topic Qs`
                        : 'Quant, logical & verbal drills',
                },
                {
                  title: 'Roadmap Completion',
                  detail:
                    isAuthenticated && userStats?.completedTopics !== null
                      ? `${userStats.completedTopics} / ${topicTotal} topics done`
                      : topicTotal > 0
                        ? `${topicTotal} structured milestones`
                        : 'Milestone progress tracking',
                },
                {
                  title: 'Interview Readiness',
                  detail: isAuthenticated
                    ? `Current score: ${interviewScore}%`
                    : 'Criterion-graded AI rounds',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#161B22] border border-[#E5E7EB] dark:border-[#30363D] space-y-1 hover:border-[#FF9800]/50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FF9800] shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#8B949E] pl-5">{item.detail}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Analytics Panel (Ring + Bar Chart + Consistency Heatmap) */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, delay: 0.08, ease: REVEAL_EASE }}
            className="lg:col-span-7"
          >
            <div className="p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md border border-[#E5E7EB]/90 dark:border-[#30363D] shadow-sm space-y-6">
              {/* Top Row: Ring + Status Pill */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB] dark:border-[#21262D]">
                <div className="flex items-center gap-4">
                  {/* Animated Progress Ring */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-[#F1F5F9] dark:text-[#21262D]"
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#FF9800"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        whileInView={{ strokeDashoffset }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.9, ease: REVEAL_EASE }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-lg font-extrabold text-[#1E293B] dark:text-[#E6EDF3] tabular-nums">
                        {isAuthenticated ? `${displayRingPct}%` : '--'}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#8B949E]">
                        Ready
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                      {isAuthenticated
                        ? 'Your Live Preparation Telemetry'
                        : 'Personal Preparation Telemetry'}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#8B949E] max-w-sm">
                      {isAuthenticated
                        ? 'Calculated live from your solved problems, aptitude results, completed milestones, and interview scores.'
                        : 'Sign in to populate this panel with your live DSA progress, aptitude accuracy, roadmap completion, and streak heatmap.'}
                    </p>
                  </div>
                </div>

                {!isAuthenticated ? (
                  <Link
                    to="/login?redirect=/dashboard"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/30 text-xs font-bold text-[#D97706] dark:text-[#FFA116] hover:bg-[#FF9800] hover:text-white transition"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign in to view yours</span>
                  </Link>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/30 text-xs font-bold text-[#D97706] dark:text-[#FFA116]">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{streak}d Active Streak</span>
                  </div>
                )}
              </div>

              {/* Middle: Recharts Pillar Comparison */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                    Pillar Breakdown (%)
                  </span>
                  <span className="text-[#64748B] dark:text-[#8B949E]">
                    {isAuthenticated ? 'Updated from backend stats' : 'Awaiting user session'}
                  </span>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748B' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#64748B' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                        contentStyle={{
                          borderRadius: '10px',
                          fontSize: '12px',
                          border: '1px solid #E5E7EB',
                        }}
                        formatter={(val) => [`${val}%`, 'Progress']}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={44}>
                        {barData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom: 14-Day Learning Consistency Heatmap */}
              <div className="pt-4 border-t border-[#E5E7EB] dark:border-[#21262D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                  <CalendarDays className="w-4 h-4 text-[#FF9800]" />
                  <span>14-Day Learning Consistency</span>
                </div>

                <div className="flex items-center gap-1.5" aria-label="14 day activity heatmap">
                  {heatmapDays.map((day, idx) => {
                    const bgClass =
                      day.count >= 3
                        ? 'bg-[#FF9800]'
                        : day.count >= 1
                          ? 'bg-[#FF9800]/55'
                          : 'bg-[#F1F5F9] dark:bg-[#21262D]';
                    return (
                      <motion.div
                        key={day.key}
                        initial={{ scale: 0.7, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.25, delay: idx * 0.025, ease: REVEAL_EASE }}
                        whileHover={{ scale: 1.2 }}
                        title={`${day.key}: ${day.count} recorded activities`}
                        className={`w-4 h-4 rounded ${bgClass} border border-[#E5E7EB]/60 dark:border-[#30363D] transition-colors`}
                      />
                    );
                  })}
                </div>

                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF9800] hover:underline shrink-0"
                >
                  <span>Full Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
