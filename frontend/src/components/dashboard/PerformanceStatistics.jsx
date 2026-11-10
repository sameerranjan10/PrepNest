import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BrainCircuit, Code2, Flame, Trophy } from 'lucide-react';

export function PerformanceStatistics({
  dsaMeta = { solved_count: 0, total_problems: 0 },
  aptitudeStats = { solved: 0, total: 0 },
  streak = 0,
  weeklyActiveDays = 0,
  leaderboardUser = null,
}) {
  const dsaTotal = Number(dsaMeta?.total_problems || 0);
  const dsaSolved = Number(dsaMeta?.solved_count || 0);
  const dsaPct = dsaTotal > 0 ? Math.min(100, Math.round((dsaSolved / dsaTotal) * 100)) : 0;

  const aptTotal = Number(aptitudeStats?.total || 0);
  const aptSolved = Number(aptitudeStats?.solved || 0);
  const aptPct = aptTotal > 0 ? Math.min(100, Math.round((aptSolved / aptTotal) * 100)) : 0;

  const rank = leaderboardUser?.rank ?? '—';
  const rankChange = Number(leaderboardUser?.rankChange || 0);
  const xp = Number(leaderboardUser?.xp || 0);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: DSA Progress */}
      <Link
        to="/dsa"
        className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-[#64748B]">DSA Progress</p>
            <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-xl font-bold text-[#262626]">{dsaSolved}</span>
              <span className="text-xs text-[#64748B]">/ {dsaTotal || '—'} solved</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#E6FAF6] text-[#00B8A3] flex items-center justify-center shrink-0">
            <Code2 className="w-[18px] h-[18px]" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] tabular-nums">
            <span className="text-[#64748B]">Completion</span>
            <span className="font-semibold text-[#262626]">{dsaPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#F1F3F5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#16A34A] transition-all duration-300"
              style={{ width: `${Math.max(dsaSolved > 0 ? 3 : 0, dsaPct)}%` }}
            />
          </div>
        </div>
      </Link>

      {/* Card 2: Aptitude Progress */}
      <Link
        to="/aptitude"
        className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all group"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-[#64748B]">Aptitude Progress</p>
            <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-xl font-bold text-[#262626]">{aptSolved}</span>
              <span className="text-xs text-[#64748B]">/ {aptTotal || '—'} solved</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#FFF9E6] text-[#D97706] flex items-center justify-center shrink-0">
            <BrainCircuit className="w-[18px] h-[18px]" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] tabular-nums">
            <span className="text-[#64748B]">Completion</span>
            <span className="font-semibold text-[#262626]">{aptPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#F1F3F5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#D97706] transition-all duration-300"
              style={{ width: `${Math.max(aptSolved > 0 ? 3 : 0, aptPct)}%` }}
            />
          </div>
        </div>
      </Link>

      {/* Card 3: Active Streak */}
      <Link
        to="/leaderboard"
        className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-[#64748B]">Active Streak</p>
            <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-xl font-bold text-[#262626]">{streak}</span>
              <span className="text-xs text-[#64748B]">{streak === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#FFF8EE] text-[#FFA116] flex items-center justify-center shrink-0">
            <Flame className="w-[18px] h-[18px] fill-[#FFA116]" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#F1F3F5]">
          <span className="text-[#64748B]">Weekly activity</span>
          <span className="font-semibold text-[#262626] tabular-nums">
            {weeklyActiveDays} / 7 days active
          </span>
        </div>
      </Link>

      {/* Card 4: Leaderboard */}
      <Link
        to="/leaderboard"
        className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/50 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-[#64748B]">Batch Leaderboard</p>
            <div className="mt-1 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-xl font-bold text-[#262626]">#{rank}</span>
              <span className="text-xs text-[#64748B]">overall rank</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] text-[#FFA116] flex items-center justify-center shrink-0">
            <Trophy className="w-[18px] h-[18px]" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#F1F3F5] tabular-nums">
          <span className="text-[#64748B]">{xp} XP earned</span>
          {rankChange > 0 ? (
            <span className="font-semibold text-[#16A34A] inline-flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />+{rankChange} rank
            </span>
          ) : (
            <span className="font-medium text-[#64748B]">View standings →</span>
          )}
        </div>
      </Link>
    </section>
  );
}
