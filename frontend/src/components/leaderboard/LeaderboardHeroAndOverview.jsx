import React from "react";
import {
  Users,
  Activity,
  Zap,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

export function LeaderboardHeroAndOverview({
  authUser,
  currentUser,
  totalCandidates = 0,
  activeParticipants = 0,
  period = "all",
  periodInfo,
}) {
  const rank = currentUser?.rank ?? "—";
  const xp = Number(currentUser?.xp ?? 0);
  const lifetimeXp = Number(currentUser?.total_xp ?? xp);
  const percentile = currentUser?.percentile ?? 0;
  const rankChange = currentUser?.rankChange;
  const displayName = currentUser?.name || authUser?.full_name || "Your Account";
  const avatarSrc = authUser?.avatar_url || currentUser?.avatar_url;

  const xpLabel =
    period === "weekly"
      ? "Weekly XP"
      : period === "monthly"
      ? "Monthly XP"
      : "Your Total XP";

  const cards = [
    {
      title: "Total Candidates",
      value: totalCandidates.toLocaleString(),
      sub: "Registered learners",
      icon: Users,
      accent: "text-[#1E293B] dark:text-[#E6EDF3]",
      iconBg: "bg-[#F8FAFC] dark:bg-[#21262D] text-[#64748B]",
    },
    {
      title: "Active Participants",
      value: activeParticipants.toLocaleString(),
      sub: periodInfo?.label || "With recorded activity",
      icon: Activity,
      accent: "text-[#16A34A]",
      iconBg: "bg-[#F0FDF4] dark:bg-[#16A34A]/15 text-[#16A34A]",
    },
    {
      title: xpLabel,
      value: xp.toLocaleString(),
      sub:
        period !== "all"
          ? `${lifetimeXp.toLocaleString()} lifetime XP`
          : `Level ${currentUser?.level ?? 1} · ${currentUser?.progress_percentage ?? 0}% to next`,
      icon: Zap,
      accent: "text-[#F59E0B]",
      iconBg: "bg-[#FFFBEB] dark:bg-[#F59E0B]/15 text-[#F59E0B]",
    },
    {
      title: "Your Current Percentile",
      value: totalCandidates > 0 && currentUser ? `${percentile}%` : "—",
      sub:
        totalCandidates > 0 && currentUser
          ? `Rank #${rank} of ${totalCandidates}`
          : "No rank data yet",
      icon: Award,
      accent: "text-[#1E293B] dark:text-[#E6EDF3]",
      iconBg: "bg-[#FFFBEB] dark:bg-[#F59E0B]/15 text-[#F59E0B]",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Compact Hero Header + User Ranking Card */}
      <section className="rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-5 sm:p-6 md:pr-[132px] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] dark:bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[11px] font-semibold text-[#D97706] dark:text-[#FBBF24]">
              PrepNest Competitive Standings
            </span>
            {periodInfo?.label && (
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#8B949E]">
                {periodInfo.label}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] dark:text-[#E6EDF3] tracking-tight">
            Placement Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E]">
            Compete, improve your skills and climb the placement preparation rankings.
          </p>
        </div>

        {/* Compact User Ranking Summary Card */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#F59E0B]/40 flex items-center gap-3.5 shrink-0 w-full lg:w-auto">
          <UserAvatar
            src={avatarSrc}
            name={displayName}
            initials={currentUser?.avatar}
            size="lg"
            className="ring-2 ring-[#F59E0B]/60 shadow-xs"
          />

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] truncate max-w-[160px]">
                {displayName}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold">
                #{rank}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs tabular-nums">
              <span className="font-bold text-[#F59E0B]">{xp.toLocaleString()} XP</span>
              <span className="text-[#CBD5E1] dark:text-[#30363D]">•</span>
              <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                {percentile}th percentile
              </span>
              {rankChange !== null && rankChange !== undefined && (
                <>
                  <span className="text-[#CBD5E1] dark:text-[#30363D]">•</span>
                  {rankChange > 0 ? (
                    <span className="inline-flex items-center gap-0.5 font-semibold text-[#16A34A]">
                      <TrendingUp className="w-3.5 h-3.5" />+{rankChange}
                    </span>
                  ) : rankChange < 0 ? (
                    <span className="inline-flex items-center gap-0.5 font-semibold text-[#DC2626]">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {rankChange}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 font-medium text-[#64748B]">
                      <Minus className="w-3 h-3" />0
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Compact Statistical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs flex items-start justify-between gap-3"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#8B949E]">
                  {c.title}
                </p>
                <p className={`text-2xl font-extrabold tabular-nums ${c.accent}`}>
                  {c.value}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#8B949E] truncate">
                  {c.sub}
                </p>
              </div>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

