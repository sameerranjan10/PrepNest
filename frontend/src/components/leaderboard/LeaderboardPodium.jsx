import React from "react";
import { Crown, Flame, Code2, Award } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

export function LeaderboardPodium({
  topThree = [],
  authUser,
  onSelectUser,
}) {
  if (!topThree || topThree.length === 0) {
    return null;
  }

  const first = topThree[0] || null;
  const second = topThree[1] || null;
  const third = topThree[2] || null;

  const getAvatar = (u) =>
    u?.is_current_user ? authUser?.avatar_url || u?.avatar_url : u?.avatar_url;

  const PodiumCard = ({
    candidate,
    place,
    orderClass,
    borderClass,
    bgClass,
    medalBg,
    medalLabel,
    xpColor,
    elevated = false,
  }) => {
    if (!candidate) return null;
    return (
      <button
        type="button"
        onClick={() => onSelectUser(candidate)}
        className={`${orderClass} w-full text-center rounded-2xl border ${borderClass} ${bgClass} p-5 ${
          elevated ? "md:p-6 md:-translate-y-2 shadow-sm" : ""
        } transition hover:border-[#F59E0B] hover:shadow-md cursor-pointer flex flex-col items-center space-y-2.5 relative`}
      >
        {place === 1 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
            <Crown className="w-3 h-3" />
            <span>Leader</span>
          </span>
        )}

        <div className="relative">
          <UserAvatar
            src={getAvatar(candidate)}
            name={candidate.name}
            initials={candidate.avatar}
            size={elevated ? "xl" : "lg"}
            className={`border-2 ${
              place === 1
                ? "border-[#F59E0B]"
                : place === 2
                ? "border-[#94A3B8]"
                : "border-[#B45309]"
            } shadow-xs`}
          />
          <span
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${medalBg} text-white font-bold text-[11px] flex items-center justify-center ring-2 ring-white dark:ring-[#161B22]`}
          >
            {place}
          </span>
        </div>

        <div className="min-w-0 w-full space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="text-sm sm:text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] truncate max-w-[180px]">
              {candidate.name}
            </h3>
            {candidate.is_current_user && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#F59E0B] text-white text-[9px] font-bold">
                YOU
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#8B949E] truncate">
            {candidate.role}
          </p>
        </div>

        <div className={`text-base font-extrabold tabular-nums ${xpColor}`}>
          {Number(candidate.xp || 0).toLocaleString()} XP
        </div>

        <div className="w-full pt-2 border-t border-[#E2E8F0] dark:border-[#30363D] flex items-center justify-center gap-3 text-[11px] text-[#64748B] dark:text-[#8B949E] tabular-nums">
          <span className="inline-flex items-center gap-1 font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
            <Code2 className="w-3.5 h-3.5 text-[#16A34A]" />
            {candidate.problems ?? 0} DSA
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-[#F59E0B]">
            <Flame className="w-3.5 h-3.5 fill-[#F59E0B]" />
            {candidate.streak ?? 0}d
          </span>
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
          {medalLabel}
        </span>
      </button>
    );
  };

  return (
    <section className="rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-5 sm:p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#F59E0B]" />
          <div>
            <h2 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
              Top Performers Podium
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#8B949E]">
              Click any podium card to inspect candidate achievements and recent activity.
            </p>
          </div>
        </div>
      </div>

      {/* SECOND | FIRST | THIRD on desktop; FIRST on top on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-4xl mx-auto md:pt-3">
        <PodiumCard
          candidate={second}
          place={2}
          orderClass="order-2 md:order-1"
          borderClass="border-[#CBD5E1] dark:border-[#475569]"
          bgClass="bg-[#F8FAFC] dark:bg-[#0D1117]/80"
          medalBg="bg-[#94A3B8]"
          medalLabel="2nd Place · Silver"
          xpColor="text-[#1E293B] dark:text-[#E6EDF3]"
        />

        <PodiumCard
          candidate={first}
          place={1}
          orderClass="order-1 md:order-2"
          borderClass="border-2 border-[#F59E0B]"
          bgClass="bg-[#FFFBEB]/75 dark:bg-[#F59E0B]/10"
          medalBg="bg-[#F59E0B]"
          medalLabel="1st Place · Gold"
          xpColor="text-[#D97706] dark:text-[#FBBF24]"
          elevated
        />

        <PodiumCard
          candidate={third}
          place={3}
          orderClass="order-3"
          borderClass="border-[#B45309]/40"
          bgClass="bg-[#F8FAFC] dark:bg-[#0D1117]/80"
          medalBg="bg-[#B45309]"
          medalLabel="3rd Place · Bronze"
          xpColor="text-[#B45309] dark:text-[#FBBF24]"
        />
      </div>
    </section>
  );
}

