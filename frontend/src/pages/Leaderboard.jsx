import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BlurDrop } from "@/components/ui/BlurDrop";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { apiFetch } from "@/lib/apiClient";
import { UserAvatar } from "@/components/UserAvatar";
import { LeaderboardHeroAndOverview } from "@/components/leaderboard/LeaderboardHeroAndOverview";
import { LeaderboardPodium } from "@/components/leaderboard/LeaderboardPodium";
import { LeaderboardPerformanceAndBadges } from "@/components/leaderboard/LeaderboardPerformanceAndBadges";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ComponentLoader } from "@/components/ui/PrepNestLoader";
import {
  Flame,
  Search,
  X,
  Clock,
  Users,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [users, setUsers] = useState([]);
  const [apiCurrentUser, setApiCurrentUser] = useState(null);
  const [periodInfo, setPeriodInfo] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [activeParticipants, setActiveParticipants] = useState(0);
  const [totalLearners, setTotalLearners] = useState(0);
  const [totals, setTotals] = useState({ dsa_total: 0, aptitude_total: 0, roadmap_total: 0 });
  const [achievements, setAchievements] = useState([]);
  const [rankHistory, setRankHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [period, setPeriod] = useState("all"); // 'all' | 'monthly' | 'weekly'
  const [batchFilter, setBatchFilter] = useState("all");
  const [sortBy, setSortBy] = useState("xp"); // 'xp' | 'problems' | 'streak' | 'readiness'
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchLeaderboard = useCallback(
    async (selectedPeriod = period, selectedBatch = batchFilter) => {
      setLoading(true);
      setLoadError(null);
      const backendPeriod = selectedPeriod === "all" ? "overall" : selectedPeriod;
      const params = new URLSearchParams({ period: backendPeriod });
      if (selectedBatch && selectedBatch !== "all") {
        params.set("batch", selectedBatch);
      }

      try {
        const res = await apiFetch(`/api/leaderboard?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setUsers(data.rankings || []);
        setApiCurrentUser(data.current_user || null);
        setPeriodInfo(data.period_info || null);
        setAvailableBatches(data.available_batches || []);
        setActiveParticipants(Number(data.active_participants || 0));
        setTotalLearners(Number(data.total_learners || 0));
        setTotals(data.totals || { dsa_total: 0, aptitude_total: 0, roadmap_total: 0 });
        setAchievements(data.achievements || []);
        setRankHistory(data.rank_history || []);
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);
        setLoadError("Unable to load leaderboard rankings from PostgreSQL.");
        setUsers([]);
        setApiCurrentUser(null);
      } finally {
        setLoading(false);
      }
    },
    [period, batchFilter]
  );

  useEffect(() => {
    fetchLeaderboard(period, batchFilter);
  }, [period, batchFilter, user?.id, user?.avatar_url, fetchLeaderboard]);

  const rankedUsers = useMemo(() => {
    let list = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.role && u.role.toLowerCase().includes(q)) ||
          (u.institution && u.institution.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === "problems") return (b.problems || 0) - (a.problems || 0);
      if (sortBy === "streak") return (b.streak || 0) - (a.streak || 0);
      if (sortBy === "readiness") return (b.readiness || 0) - (a.readiness || 0);
      return Number(b.xp || 0) - Number(a.xp || 0);
    });

    return list;
  }, [users, search, sortBy]);

  const currentUser = useMemo(() => {
    return users.find((u) => u.is_current_user) || apiCurrentUser || null;
  }, [users, apiCurrentUser]);

  const topThree = useMemo(() => {
    // Podium reflects true XP leaders from backend rankings
    return users.slice(0, 3);
  }, [users]);

  const highestXp = useMemo(() => {
    const maxVal = Math.max(0, ...users.map((u) => Number(u.xp || 0)));
    return maxVal > 0 ? maxVal : 1;
  }, [users]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0D1117] text-[#1E293B] dark:text-[#E6EDF3] font-sans">
      <Sidebar activeRoute="leaderboard" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header defaultCollapsed />

        <BlurDrop as="main" className="p-4 sm:p-6 lg:p-8 space-y-6 w-full max-w-[1440px]">
          {/* Hero + 4 Statistical Overview Cards */}
          <LeaderboardHeroAndOverview
            authUser={user}
            currentUser={currentUser}
            totalCandidates={totalLearners}
            activeParticipants={activeParticipants}
            period={period}
            periodInfo={periodInfo}
          />

          {loadError && !loading && (
            <div className="p-4 rounded-xl bg-[#FEF2F2] dark:bg-[#F85149]/15 border border-[#DC2626]/25 text-xs text-[#DC2626] dark:text-[#F85149] flex items-center justify-between gap-3">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => fetchLeaderboard(period, batchFilter)}
                className="font-semibold underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="p-8 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D]">
              <ComponentLoader message="Syncing your progress..." />
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] text-center space-y-2">
              <Users className="w-7 h-7 text-[#94A3B8] mx-auto" />
              <p className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                No candidates found for this filter
              </p>
              <p className="text-xs text-[#64748B]">
                Try switching back to All Batches or All Time to view platform standings.
              </p>
            </div>
          ) : (
            <>
              {/* Premium Top 3 Podium */}
              <LeaderboardPodium
                topThree={topThree}
                authUser={user}
                onSelectUser={setSelectedUser}
              />

              {/* Filter Toolbar */}
              <section className="rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-4 shadow-xs space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Time Period Tabs */}
                  <div className="inline-flex items-center p-1 bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] rounded-xl gap-1 text-xs w-full lg:w-auto">
                    {[
                      { id: "all", label: "All Time" },
                      { id: "monthly", label: "This Month" },
                      { id: "weekly", label: "This Week" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPeriod(tab.id)}
                        className={`flex-1 lg:flex-initial px-3.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                          period === tab.id
                            ? "bg-[#FFFFFF] dark:bg-[#161B22] text-[#1E293B] dark:text-[#E6EDF3] shadow-xs border border-[#E2E8F0] dark:border-[#30363D]"
                            : "text-[#64748B] hover:text-[#1E293B] dark:hover:text-[#E6EDF3]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search, Sort & Batch Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex items-center gap-2.5 w-full lg:w-auto">
                    <div className="relative sm:col-span-1 lg:w-56">
                      <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search candidate, role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="lc-input text-xs pl-8"
                      />
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="lc-input text-xs cursor-pointer sm:w-auto"
                    >
                      <option value="xp">Sort: XP Earned</option>
                      <option value="problems">Sort: DSA Solved</option>
                      <option value="streak">Sort: Active Streak</option>
                      <option value="readiness">Sort: Readiness</option>
                    </select>

                    <select
                      value={batchFilter}
                      onChange={(e) => setBatchFilter(e.target.value)}
                      disabled={availableBatches.length === 0}
                      className="lc-input text-xs cursor-pointer sm:w-auto disabled:opacity-60"
                      aria-label="Filter by graduation batch"
                    >
                      <option value="all">
                        {availableBatches.length > 0 ? "All Batches" : "Batch: All Users"}
                      </option>
                      {availableBatches.map((b) => (
                        <option key={b} value={b}>
                          Batch {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Period & Timezone Definition */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#30363D] text-[11px] text-[#64748B] dark:text-[#8B949E]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>
                      Window:{" "}
                      <strong className="text-[#1E293B] dark:text-[#E6EDF3]">
                        {periodInfo?.label || "All accumulated activity (UTC)"}
                      </strong>
                    </span>
                  </span>
                  <span>
                    Showing <strong className="text-[#1E293B] dark:text-[#E6EDF3]">{rankedUsers.length}</strong> of{" "}
                    {totalLearners} candidates
                  </span>
                </div>
              </section>

              {/* Main Ranking Table */}
              <section className="rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117]/75 text-[11px] text-[#64748B] dark:text-[#8B949E] uppercase tracking-wider font-semibold">
                        <th className="py-3 px-4 w-20 text-center">Rank</th>
                        <th className="py-3 px-4 min-w-[220px]">Candidate</th>
                        <th className="py-3 px-4 w-36">XP Earned</th>
                        <th className="py-3 px-4 w-28">DSA Solved</th>
                        <th className="py-3 px-4 w-28 hidden md:table-cell">Aptitude</th>
                        <th className="py-3 px-4 w-28 hidden sm:table-cell">Streak</th>
                        <th className="py-3 px-4 w-36">Readiness</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#21262D] text-xs">
                      {rankedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-xs text-[#64748B]">
                            No candidates match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        rankedUsers.map((u, idx) => {
                          const isSelf = Boolean(u.is_current_user);
                          const displayRank = sortBy === "xp" && !search.trim() ? u.rank : idx + 1;
                          const avatarSrc = isSelf ? user?.avatar_url || u.avatar_url : u.avatar_url;
                          const xpWidth = Math.max(
                            u.xp > 0 ? 6 : 0,
                            Math.min(100, Math.round((Number(u.xp || 0) / highestXp) * 100))
                          );

                          return (
                            <tr
                              key={u.id}
                              onClick={() => setSelectedUser(u)}
                              className={`cursor-pointer transition ${
                                isSelf
                                  ? "bg-[#FFFBEB] dark:bg-[#F59E0B]/10 hover:bg-[#FEF3C7]/60 dark:hover:bg-[#F59E0B]/15"
                                  : "hover:bg-[#F8FAFC] dark:hover:bg-[#21262D]/70"
                              }`}
                            >
                              {/* Rank */}
                              <td className="py-3.5 px-4 text-center font-bold tabular-nums">
                                <div className="inline-flex items-center justify-center gap-1">
                                  {displayRank === 1 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F59E0B] text-white text-[11px]">
                                      1
                                    </span>
                                  ) : displayRank === 2 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#94A3B8] text-white text-[11px]">
                                      2
                                    </span>
                                  ) : displayRank === 3 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#B45309] text-white text-[11px]">
                                      3
                                    </span>
                                  ) : (
                                    <span className={isSelf ? "text-[#F59E0B]" : "text-[#64748B]"}>
                                      #{displayRank}
                                    </span>
                                  )}
                                  {u.rankChange !== null && u.rankChange !== undefined && u.rankChange !== 0 && (
                                    <span
                                      className={`text-[10px] inline-flex items-center ${
                                        u.rankChange > 0 ? "text-[#16A34A]" : "text-[#DC2626]"
                                      }`}
                                      title="Rank movement vs previous period"
                                    >
                                      {u.rankChange > 0 ? (
                                        <TrendingUp className="w-3 h-3" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Candidate */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <UserAvatar
                                    src={avatarSrc}
                                    name={u.name}
                                    initials={u.avatar}
                                    size="sm"
                                    className={isSelf ? "ring-2 ring-[#F59E0B]/60" : ""}
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs sm:text-sm text-[#1E293B] dark:text-[#E6EDF3] truncate max-w-[160px] sm:max-w-[220px]">
                                        {u.name}
                                      </span>
                                      {isSelf && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-[#F59E0B] text-white text-[9px] font-bold">
                                          YOU
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-[#64748B] dark:text-[#8B949E] truncate max-w-[240px]">
                                      {u.role}
                                      {u.batch ? ` · Batch ${u.batch}` : ""}
                                      {u.institution ? ` · ${u.institution}` : ""}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* XP Earned */}
                              <td className="py-3.5 px-4 tabular-nums">
                                <div className="space-y-1">
                                  <span className="font-bold text-[#1E293B] dark:text-[#E6EDF3] block">
                                    {Number(u.xp || 0).toLocaleString()} XP
                                  </span>
                                  <div className="h-1 w-24 rounded-full bg-[#E2E8F0] dark:bg-[#21262D] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#F59E0B]"
                                      style={{ width: `${xpWidth}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* DSA Solved */}
                              <td className="py-3.5 px-4 tabular-nums">
                                <span className="font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                                  {u.problems ?? 0}
                                </span>
                                <span className="text-[#64748B] ml-1 text-[11px]">Qs</span>
                              </td>

                              {/* Aptitude Solved */}
                              <td className="py-3.5 px-4 tabular-nums hidden md:table-cell">
                                <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                                  {u.aptitude_solved ?? 0}
                                </span>
                                <span className="text-[#64748B] ml-1 text-[11px]">Qs</span>
                              </td>

                              {/* Active Streak */}
                              <td className="py-3.5 px-4 tabular-nums hidden sm:table-cell">
                                <span className="inline-flex items-center gap-1 font-semibold text-[#F59E0B]">
                                  <Flame className="w-3.5 h-3.5 fill-[#F59E0B]" />
                                  {u.streak ?? 0}d
                                </span>
                              </td>

                              {/* Placement Readiness */}
                              <td className="py-3.5 px-4 tabular-nums">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-bold text-[#16A34A]">
                                    <span>{u.readiness ?? 0}%</span>
                                  </div>
                                  <div className="w-full bg-[#E2E8F0] dark:bg-[#21262D] h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-[#16A34A] h-full rounded-full transition-all"
                                      style={{ width: `${u.readiness ?? 0}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Your Performance Breakdown + Achievements & Badges */}
              <LeaderboardPerformanceAndBadges
                currentUser={currentUser}
                totals={totals}
                achievements={achievements}
                rankHistory={rankHistory}
                isDark={isDark}
              />
            </>
          )}
        </BlurDrop>
      </div>

      {/* Candidate Public Profile Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] dark:border-[#30363D] pb-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar
                  src={
                    selectedUser.is_current_user
                      ? user?.avatar_url || selectedUser.avatar_url
                      : selectedUser.avatar_url
                  }
                  name={selectedUser.name}
                  initials={selectedUser.avatar}
                  size="lg"
                  className="border border-[#E2E8F0] dark:border-[#30363D]"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3] truncate">
                      {selectedUser.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#FFFBEB] border border-[#F59E0B]/30 text-[10px] font-bold text-[#F59E0B]">
                      #{selectedUser.rank}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] truncate">{selectedUser.role}</p>
                  {(selectedUser.institution || selectedUser.batch) && (
                    <p className="text-[11px] text-[#94A3B8] truncate">
                      {[selectedUser.institution, selectedUser.batch ? `Batch ${selectedUser.batch}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#21262D] transition cursor-pointer"
                aria-label="Close profile modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-[#F8FAFC] dark:bg-[#0D1117] rounded-xl border border-[#E2E8F0] dark:border-[#30363D] text-center text-xs">
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">XP</span>
                <strong className="text-sm font-bold">{Number(selectedUser.xp || 0).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">DSA</span>
                <strong className="text-sm font-bold">{selectedUser.problems ?? 0}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">Aptitude</span>
                <strong className="text-sm font-bold">{selectedUser.aptitude_solved ?? 0}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">Streak</span>
                <strong className="text-sm font-bold text-[#F59E0B]">{selectedUser.streak ?? 0}d</strong>
              </div>
            </div>

            {selectedUser.badges && selectedUser.badges.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#64748B]">Earned Badges</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.badges.map((b, i) => (
                    <Badge key={i} variant="accent" size="xs">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {selectedUser.recent_activities && selectedUser.recent_activities.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#64748B]">Recent Verified Activity</span>
                <div className="space-y-1.5">
                  {selectedUser.recent_activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D]"
                    >
                      <span className="flex items-center gap-1.5 text-[#1E293B] dark:text-[#E6EDF3]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                        {act.title}
                      </span>
                      <span className="font-bold text-[#F59E0B]">+{act.amount} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
