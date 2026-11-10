import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Target,
  Award,
  Lock,
  CheckCircle2,
  Flame,
  TrendingUp,
} from "lucide-react";

export function LeaderboardPerformanceAndBadges({
  currentUser,
  totals = {},
  achievements = [],
  rankHistory = [],
  isDark = false,
}) {
  const dsaTotal = Math.max(1, Number(totals.dsa_total || 1));
  const aptTotal = Math.max(1, Number(totals.aptitude_total || 1));
  const rmTotal = Math.max(1, Number(totals.roadmap_total || 1));

  const dsaSolved = Number(currentUser?.problems || 0);
  const aptSolved = Number(currentUser?.aptitude_solved || 0);
  const rmDone = Number(currentUser?.roadmap_completed || 0);
  const readiness = Number(currentUser?.readiness || 0);

  const dsaPct = Math.min(100, Math.round((dsaSolved / dsaTotal) * 100));
  const aptPct = Math.min(100, Math.round((aptSolved / aptTotal) * 100));
  const rmPct = Math.min(100, Math.round((rmDone / rmTotal) * 100));

  const activityBreakdownData = [
    { name: "DSA", pct: dsaPct, label: `${dsaSolved}/${dsaTotal}`, fill: "#F59E0B" },
    { name: "Aptitude", pct: aptPct, label: `${aptSolved}/${aptTotal}`, fill: "#2563EB" },
    { name: "Roadmap", pct: rmPct, label: `${rmDone}/${rmTotal}`, fill: "#16A34A" },
    { name: "Readiness", pct: readiness, label: `${readiness}%`, fill: "#D97706" },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* YOUR PERFORMANCE SECTION */}
      <section className="xl:col-span-7 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#30363D]">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#F59E0B]" />
            <div>
              <h2 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                Your Competitive Performance
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#8B949E]">
                Live completion metrics and rank trajectory from your PostgreSQL activity.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFBEB] dark:bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-xs font-bold text-[#D97706] dark:text-[#FBBF24]">
            Rank #{currentUser?.rank ?? "—"} · {Number(currentUser?.total_xp ?? currentUser?.xp ?? 0).toLocaleString()} XP
          </span>
        </div>

        {/* Summary Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D]">
            <span className="text-[10px] font-semibold uppercase text-[#64748B]">DSA Solved</span>
            <p className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] mt-0.5 tabular-nums">
              {dsaSolved} / {dsaTotal}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D]">
            <span className="text-[10px] font-semibold uppercase text-[#64748B]">Aptitude</span>
            <p className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] mt-0.5 tabular-nums">
              {aptSolved} / {aptTotal}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D]">
            <span className="text-[10px] font-semibold uppercase text-[#64748B]">Roadmap</span>
            <p className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] mt-0.5 tabular-nums">
              {rmDone} / {rmTotal}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D]">
            <span className="text-[10px] font-semibold uppercase text-[#64748B]">Active Streak</span>
            <p className="text-sm font-bold text-[#F59E0B] mt-0.5 flex items-center gap-1 tabular-nums">
              <Flame className="w-3.5 h-3.5 fill-[#F59E0B]" />
              {currentUser?.streak ?? 0}d
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D]">
            <span className="text-[10px] font-semibold uppercase text-[#64748B]">Readiness</span>
            <p className="text-sm font-bold text-[#16A34A] mt-0.5 tabular-nums">
              {readiness}%
            </p>
          </div>
        </div>

        {/* Charts Row: Activity Breakdown Bar + Rank History Line */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-2">
            <h3 className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
              Preparation Completion Breakdown (%)
            </h3>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityBreakdownData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#21262D" : "#E2E8F0"} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: isDark ? "#8B949E" : "#64748B" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: isDark ? "#8B949E" : "#64748B" }}
                  />
                  <Tooltip
                    formatter={(val, _n, props) => [`${val}% (${props?.payload?.label || ""})`, "Completion"]}
                    contentStyle={{
                      backgroundColor: isDark ? "#161B22" : "#FFFFFF",
                      borderColor: isDark ? "#30363D" : "#E2E8F0",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {activityBreakdownData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Rank Progression Over Time</span>
              </h3>
              {rankHistory.length >= 2 && (
                <span className="text-[10px] text-[#64748B]">{rankHistory.length} active days</span>
              )}
            </div>

            {rankHistory.length >= 2 ? (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rankHistory} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#21262D" : "#E2E8F0"} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: isDark ? "#8B949E" : "#64748B" }}
                    />
                    <YAxis
                      reversed
                      allowDecimals={false}
                      domain={[1, "dataMax + 1"]}
                      tick={{ fontSize: 10, fill: isDark ? "#8B949E" : "#64748B" }}
                    />
                    <Tooltip
                      formatter={(val, _name, item) => [
                        `#${val} (${item?.payload?.cumulative_xp || 0} XP)`,
                        "Rank",
                      ]}
                      contentStyle={{
                        backgroundColor: isDark ? "#161B22" : "#FFFFFF",
                        borderColor: isDark ? "#30363D" : "#E2E8F0",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rank"
                      stroke="#F59E0B"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: "#F59E0B" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center px-4 text-xs text-[#64748B] dark:text-[#8B949E]">
                <TrendingUp className="w-5 h-5 text-[#94A3B8] mb-1.5" />
                <p className="font-medium text-[#1E293B] dark:text-[#E6EDF3]">
                  Historical rank progression will appear here
                </p>
                <p className="text-[11px] mt-1">
                  Record XP across at least 2 separate days to chart actual rank changes over time.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ACHIEVEMENTS & BADGES SECTION */}
      <section className="xl:col-span-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0] dark:border-[#30363D]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#F59E0B]" />
            <div>
              <h2 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                Achievements &amp; Badges
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#8B949E]">
                Unlocked automatically when milestone criteria are met.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#F0FDF4] dark:bg-[#16A34A]/15 border border-[#16A34A]/30 text-xs font-bold text-[#16A34A] dark:text-[#3FB950] tabular-nums">
            {unlockedCount} / {achievements.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {achievements.map((ach) => {
            const pct = ach.target > 0 ? Math.min(100, Math.round((ach.progress / ach.target) * 100)) : 0;
            return (
              <div
                key={ach.key}
                className={`p-3 rounded-xl border transition flex items-start gap-3 ${
                  ach.unlocked
                    ? "bg-[#F0FDF4]/60 dark:bg-[#16A34A]/10 border-[#16A34A]/30"
                    : "bg-[#F8FAFC] dark:bg-[#0D1117]/70 border-[#E2E8F0] dark:border-[#30363D] opacity-85"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    ach.unlocked
                      ? "bg-[#16A34A] text-white"
                      : "bg-[#E2E8F0] dark:bg-[#21262D] text-[#64748B]"
                  }`}
                >
                  {ach.unlocked ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3] truncate">
                      {ach.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold uppercase shrink-0 ${
                        ach.unlocked ? "text-[#16A34A]" : "text-[#64748B]"
                      }`}
                    >
                      {ach.unlocked ? "Unlocked" : `${ach.progress}/${ach.target}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#8B949E] leading-snug">
                    {ach.description}
                  </p>
                  {!ach.unlocked && (
                    <div className="h-1 w-full rounded-full bg-[#E2E8F0] dark:bg-[#21262D] overflow-hidden pt-0">
                      <div
                        className="h-full rounded-full bg-[#F59E0B] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

