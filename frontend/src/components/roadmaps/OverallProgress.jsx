import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  PieChart as PieChartIcon,
  RefreshCw,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';

export function AnimatedProgressRing({
  percentage = 0,
  size = 132,
  strokeWidth = 10,
  accentColor = '#F59E0B',
  trackColor = '#E2E8F0',
  label,
  sublabel,
  sizeClass = 'w-[132px] h-[132px]',
  labelClass = 'text-2xl font-bold text-[#1E293B] dark:text-[#E6EDF3]',
}) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const clamped = Math.min(100, Math.max(0, Number(percentage) || 0));

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setAnimatedPct(clamped);
    });
    return () => cancelAnimationFrame(raf);
  }, [clamped]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPct / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeClass}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 850ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className={`tabular-nums leading-none ${labelClass}`}>
          {label !== undefined ? label : `${clamped}%`}
        </span>
        {sublabel && (
          <span className="text-[11px] font-medium text-[#64748B] dark:text-[#8B949E] mt-1">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

function TrackBarTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-lg border border-[#E2E8F0] dark:border-[#30363D] bg-[#FFFFFF] dark:bg-[#161B22] px-3 py-2 shadow-md text-xs space-y-1">
      <div className="font-semibold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
        <span>{item.name}</span>
        {item.isTop && (
          <span className="px-1.5 py-0.2 rounded bg-[#FEF3C7] dark:bg-[#F59E0B]/15 text-[#B45309] dark:text-[#FBBF24] text-[10px] font-semibold">
            Top
          </span>
        )}
      </div>
      <div className="text-[#64748B] dark:text-[#8B949E] tabular-nums">
        Completed:{' '}
        <strong className="text-[#1E293B] dark:text-[#E6EDF3]">
          {item.completed} / {item.total}
        </strong>{' '}
        topics
      </div>
      <div className="text-[#64748B] dark:text-[#8B949E] tabular-nums">
        Progress: <strong className="text-[#1E293B] dark:text-[#E6EDF3]">{item.pct}%</strong>
      </div>
      <div className="text-[10px] text-[#F59E0B] font-medium pt-0.5">
        Click bar to open roadmap
      </div>
    </div>
  );
}

function DistributionTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;

  return (
    <div className="rounded-lg border border-[#E2E8F0] dark:border-[#30363D] bg-[#FFFFFF] dark:bg-[#161B22] px-3 py-2 shadow-md text-xs space-y-0.5">
      <div className="font-semibold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: entry.color }}
        />
        <span>{entry.name}</span>
      </div>
      <div className="text-[#64748B] dark:text-[#8B949E] tabular-nums">
        Topics: <strong className="text-[#1E293B] dark:text-[#E6EDF3]">{entry.value}</strong> ({entry.pct}%)
      </div>
    </div>
  );
}

function shortenTrackLabel(name = '') {
  const map = {
    'Programming Fundamentals': 'Fundamentals',
    'Data Structures & Algorithms': 'DSA',
    'Database & DBMS': 'Database & DBMS',
    'Backend Development': 'Backend Dev',
    'Git & Development Tools': 'Git & Tools',
    'Interview Preparation': 'Interview Prep',
    'Web Development': 'Web Dev',
  };
  if (map[name]) return map[name];
  return name.length > 16 ? `${name.slice(0, 15)}…` : name;
}

export function OverallProgress({
  domains = [],
  overall = {},
  loading = false,
  error = null,
  onRetry,
  onSelectTrack,
}) {
  const { isDark } = useTheme();
  const trackBgColor = isDark ? '#30363D' : '#E2E8F0';

  const analytics = useMemo(() => {
    const normalizedTracks = domains.map((d) => {
      const total = Number(d.total_topics || 0);
      const completed = Math.min(total, Math.max(0, Number(d.completed_topics || 0)));
      const remaining = Math.max(0, total - completed);
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const isComplete = total > 0 && completed >= total;
      const status = isComplete ? 'Completed' : completed > 0 ? 'In Progress' : 'Not Started';

      return {
        ...d,
        total,
        completed,
        remaining,
        pct,
        isComplete,
        status,
        shortName: shortenTrackLabel(d.name),
      };
    });

    const totalTopics = normalizedTracks.reduce((sum, t) => sum + t.total, 0) || Number(overall.total_topics || 0);
    const totalCompleted =
      normalizedTracks.length > 0
        ? normalizedTracks.reduce((sum, t) => sum + t.completed, 0)
        : Number(overall.completed_topics || 0);
    const remainingTopics = Math.max(0, totalTopics - totalCompleted);
    const overallPct = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;
    const completedTracksCount = normalizedTracks.filter((t) => t.isComplete).length;

    const maxPct = normalizedTracks.reduce((m, t) => Math.max(m, t.pct), 0);
    const topTrackRaw = maxPct > 0 ? normalizedTracks.find((t) => t.pct === maxPct) || null : null;

    const tracksWithTop = normalizedTracks.map((t) => ({
      ...t,
      isTop: Boolean(topTrackRaw && topTrackRaw.id === t.id),
    }));
    const topTrack = tracksWithTop.find((t) => t.isTop) || null;

    const remainingPct = totalTopics > 0 ? Math.max(0, 100 - overallPct) : 0;
    const distributionData =
      totalTopics > 0
        ? [
            {
              name: 'Completed Topics',
              value: totalCompleted,
              pct: overallPct,
              color: '#16A34A',
            },
            {
              name: 'Remaining Topics',
              value: remainingTopics,
              pct: remainingPct,
              color: trackBgColor,
            },
          ]
        : [];

    return {
      tracks: tracksWithTop,
      chartTracks: tracksWithTop,
      totalTopics,
      totalCompleted,
      remainingTopics,
      overallPct,
      completedTracksCount,
      topTrack,
      distributionData,
    };
  }, [domains, overall, trackBgColor]);

  if (loading) {
    return (
      <section
        aria-label="Learning Progress Overview Loading"
        className="bg-[#FFFFFF] border border-[#E5E7EB] dark:border-[#30363D] rounded-xl p-5 sm:p-6 space-y-5 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#30363D] pb-4">
          <div className="space-y-2">
            <div className="h-5 w-52 rounded bg-[#E2E8F0] dark:bg-[#21262D] animate-pulse" />
            <div className="h-3.5 w-72 rounded bg-[#F1F5F9] dark:bg-[#21262D] animate-pulse" />
          </div>
          <div className="h-6 w-24 rounded-full bg-[#F1F5F9] dark:bg-[#21262D] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 h-56 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/70 border border-[#E2E8F0] dark:border-[#30363D] animate-pulse" />
          <div className="lg:col-span-4 h-56 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/70 border border-[#E2E8F0] dark:border-[#30363D] animate-pulse" />
          <div className="lg:col-span-3 h-56 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/70 border border-[#E2E8F0] dark:border-[#30363D] animate-pulse" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        aria-label="Learning Progress Overview Error"
        className="bg-[#FFFFFF] border border-[#FECACA] dark:border-[#F85149]/35 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
              Unable to load Learning Analytics
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#8B949E] mt-0.5">{error}</p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-semibold transition cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
      </section>
    );
  }

  if (!analytics.tracks.length) {
    return (
      <section
        aria-label="Learning Progress Overview Empty"
        className="bg-[#FFFFFF] border border-[#E5E7EB] dark:border-[#30363D] rounded-xl p-8 text-center space-y-2 shadow-xs"
      >
        <BookOpen className="w-8 h-8 text-[#94A3B8] mx-auto" />
        <h2 className="text-sm font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
          No learning tracks available
        </h2>
        <p className="text-xs text-[#64748B] dark:text-[#8B949E]">
          Roadmap tracks will appear here once curriculum records are loaded from the database.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Learning Progress Overview"
      className="bg-[#FFFFFF] border border-[#E5E7EB] dark:border-[#30363D] rounded-xl p-5 sm:p-6 space-y-6 shadow-xs"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0] dark:border-[#30363D]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-[#E6EDF3] tracking-tight">
              Learning Progress Overview
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] dark:bg-[#F59E0B]/15 text-[#B45309] dark:text-[#FBBF24] border border-[#F59E0B]/30 tabular-nums">
              {analytics.overallPct}% Complete
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#8B949E] mt-0.5">
            Real-time milestone analytics across all {analytics.tracks.length} structured placement roadmaps
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#8B949E] tabular-nums">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0D1117]/80 border border-[#E2E8F0] dark:border-[#30363D]">
            <Layers className="w-3.5 h-3.5 text-[#F59E0B]" />
            <strong className="text-[#1E293B] dark:text-[#E6EDF3]">{analytics.totalCompleted}</strong>
            <span>/ {analytics.totalTopics} topics completed</span>
          </span>
        </div>
      </div>

      {/* Top Row: Overall Progress Hero + Graphical Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* 1. Overall Progress Hero Panel */}
        <div className="lg:col-span-5 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/75 border border-[#E2E8F0] dark:border-[#30363D] p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#8B949E]">
              Overall Mastery
            </span>
            {analytics.topTrack && (
              <button
                type="button"
                onClick={() => onSelectTrack?.(analytics.topTrack.id)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B45309] dark:text-[#FBBF24] bg-[#FEF3C7]/80 dark:bg-[#F59E0B]/15 hover:bg-[#FEF3C7] dark:hover:bg-[#F59E0B]/25 border border-transparent dark:border-[#F59E0B]/25 px-2 py-0.5 rounded-md transition cursor-pointer"
                title={`Open ${analytics.topTrack.name}`}
              >
                <Award className="w-3 h-3 text-[#F59E0B]" />
                <span className="truncate max-w-[140px]">
                  Leading: {analytics.topTrack.shortName}
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <AnimatedProgressRing
              percentage={analytics.overallPct}
              size={132}
              strokeWidth={11}
              accentColor={analytics.overallPct === 100 ? '#16A34A' : '#F59E0B'}
              trackColor={trackBgColor}
              sublabel="Overall"
            />

            <div className="grid grid-cols-2 gap-2.5 w-full flex-1">
              <div className="rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] dark:text-[#8B949E] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Completed</span>
                </div>
                <p className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] mt-1 tabular-nums">
                  {analytics.totalCompleted}
                  <span className="text-xs font-normal text-[#64748B] dark:text-[#8B949E]">
                    {' '}
                    / {analytics.totalTopics}
                  </span>
                </p>
              </div>

              <div className="rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] dark:text-[#8B949E] font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Remaining</span>
                </div>
                <p className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] mt-1 tabular-nums">
                  {analytics.remainingTopics}
                  <span className="text-xs font-normal text-[#64748B] dark:text-[#8B949E]"> topics</span>
                </p>
              </div>

              <div className="rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] dark:text-[#8B949E] font-medium">
                  <Award className="w-3.5 h-3.5 text-[#16A34A]" />
                  <span>Done Tracks</span>
                </div>
                <p className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] mt-1 tabular-nums">
                  {analytics.completedTracksCount}
                  <span className="text-xs font-normal text-[#64748B] dark:text-[#8B949E]">
                    {' '}
                    / {analytics.tracks.length}
                  </span>
                </p>
              </div>

              <div className="rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-3">
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] dark:text-[#8B949E] font-medium">
                  <BarChart3 className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Completion</span>
                </div>
                <p className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] mt-1 tabular-nums">
                  {analytics.overallPct}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Track Comparison Horizontal Bar Chart */}
        <div className="lg:col-span-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/75 border border-[#E2E8F0] dark:border-[#30363D] p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Track Comparison</span>
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#8B949E]">
                Click any bar to open roadmap
              </p>
            </div>
            {analytics.topTrack && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] dark:bg-[#16A34A]/15 text-[#15803D] dark:text-[#3FB950] border border-[#16A34A]/20">
                Top Highlighted
              </span>
            )}
          </div>

          <div className="w-full h-[210px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.chartTracks}
                layout="vertical"
                margin={{ top: 4, right: 34, left: 0, bottom: 2 }}
                barCategoryGap="22%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke={trackBgColor}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  hide
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={110}
                  axisLine={false}
                  tickLine={false}
                  tick={(tickProps) => {
                    const { x, y, payload } = tickProps;
                    const matched = analytics.chartTracks.find(
                      (t) => t.shortName === payload?.value
                    );
                    const tickColor = matched?.isTop
                      ? isDark
                        ? '#FBBF24'
                        : '#B45309'
                      : isDark
                      ? '#94A3B8'
                      : '#475569';

                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={-6}
                          y={0}
                          dy={4}
                          textAnchor="end"
                          fill={tickColor}
                          fontSize={11}
                          fontWeight={matched?.isTop ? 700 : 500}
                          role="button"
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                          onClick={() => matched && onSelectTrack?.(matched.id)}
                          onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && matched) {
                              e.preventDefault();
                              onSelectTrack?.(matched.id);
                            }
                          }}
                        >
                          {payload?.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }}
                  content={<TrackBarTooltip />}
                />
                <Bar
                  dataKey="pct"
                  radius={[0, 6, 6, 0]}
                  barSize={14}
                  isAnimationActive
                  animationDuration={700}
                  onClick={(barData) => {
                    const id = barData?.id || barData?.payload?.id;
                    if (id) onSelectTrack?.(id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {analytics.chartTracks.map((entry) => (
                    <Cell
                      key={entry.id}
                      fill={
                        entry.isComplete
                          ? '#16A34A'
                          : entry.isTop
                          ? '#F59E0B'
                          : entry.pct > 0
                          ? '#FBBF24'
                          : isDark
                          ? '#30363D'
                          : '#CBD5E1'
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="pct"
                    position="right"
                    formatter={(val) => `${val}%`}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      fill: isDark ? '#E6EDF3' : '#1E293B',
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Completion Distribution Donut Chart */}
        <div className="lg:col-span-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/75 border border-[#E2E8F0] dark:border-[#30363D] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
              <PieChartIcon className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Completion Split</span>
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#8B949E]">
              Completed vs remaining topics
            </p>
          </div>

          <div className="relative w-full h-[148px] min-w-0 my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.distributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={60}
                  paddingAngle={analytics.totalCompleted > 0 && analytics.remainingTopics > 0 ? 3 : 0}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  isAnimationActive
                  animationDuration={750}
                >
                  {analytics.distributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<DistributionTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] tabular-nums leading-none">
                {analytics.totalCompleted}/{analytics.totalTopics}
              </span>
              <span className="text-[10px] font-medium text-[#64748B] dark:text-[#8B949E] mt-1">
                Topics
              </span>
            </div>
          </div>

          {/* Clear Legend with Actual Counts */}
          <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0] dark:border-[#30363D] text-xs">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[#475569] dark:text-[#94A3B8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] shrink-0" />
                <span>Completed</span>
              </span>
              <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3] tabular-nums">
                {analytics.totalCompleted} ({analytics.overallPct}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[#475569] dark:text-[#94A3B8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0] dark:bg-[#30363D] shrink-0" />
                <span>Remaining</span>
              </span>
              <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3] tabular-nums">
                {analytics.remainingTopics} ({Math.max(0, 100 - analytics.overallPct)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
