import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BlurDrop } from "@/components/ui/BlurDrop";
import { useAuth } from "@/context/AuthContext";
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Target,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  Star,
  Award,
  Code2,
  BrainCircuit,
  Briefcase,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Users,
  CalendarDays,
  BarChart3,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Plus,
  Lock,
  X,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiFetch } from "@/lib/apiClient";
import { UserAvatar } from "@/components/UserAvatar";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [apiCurrentUser, setApiCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [period, setPeriod] = useState("all"); // 'all' | 'weekly' | 'monthly'
  const [sortBy, setSortBy] = useState("xp"); // 'xp' | 'problems' | 'streak' | 'readiness'
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchLeaderboard = useCallback(async (selectedPeriod = period) => {
    setLoading(true);
    setLoadError(null);
    const backendPeriod = selectedPeriod === "all" ? "overall" : selectedPeriod;
    try {
      const res = await apiFetch(`/api/leaderboard?period=${encodeURIComponent(backendPeriod)}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setUsers(data.rankings || []);
      setApiCurrentUser(data.current_user || null);
    } catch (err) {
      console.error("Leaderboard fetch failed:", err);
      setLoadError("Unable to load leaderboard rankings from the server.");
      setUsers([]);
      setApiCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period, user?.id, fetchLeaderboard]);

  const getScore = useCallback((u) => Number(u?.xp || 0), []);

  // Ranked users list
  const rankedUsers = useMemo(() => {
    let list = [...users];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.role && u.role.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === "problems") return (b.problems || 0) - (a.problems || 0);
      if (sortBy === "streak") return (b.streak || 0) - (a.streak || 0);
      if (sortBy === "readiness") return (b.readiness || 0) - (a.readiness || 0);
      return getScore(b) - getScore(a);
    });

    return list;
  }, [users, search, sortBy, getScore]);

  const currentUser = useMemo(() => {
    return (
      rankedUsers.find((u) => u.is_current_user) ||
      apiCurrentUser ||
      null
    );
  }, [rankedUsers, apiCurrentUser]);

  const currentRank = useMemo(() => {
    if (currentUser?.rank) return currentUser.rank;
    const idx = rankedUsers.findIndex((u) => u.is_current_user);
    return idx >= 0 ? idx + 1 : "—";
  }, [rankedUsers, currentUser]);

  const topThree = useMemo(() => {
    return rankedUsers.slice(0, 3);
  }, [rankedUsers]);

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
      <Sidebar activeRoute="leaderboard" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header defaultCollapsed />

        <BlurDrop as="main" className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
          {/* Header Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 md:pr-[136px] lg:pr-[148px] shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="accent" size="sm">
                  Global Rankings
                </Badge>
                <Badge variant="neutral" size="sm">
                  Placement Batch 2026
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#262626] tracking-tight">
                Batch Leaderboard & Readiness Rankings
              </h1>
              <p className="text-sm text-[#64748B]">
                Compete with fellow developers across LeetCode DSA problem solves, aptitude drills, and placement milestones.
              </p>
            </div>

            {/* Current User Quick Summary */}
            <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center gap-4 shrink-0 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-[#FFA116] text-white flex items-center justify-center font-bold text-base">
                #{currentRank}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#64748B] uppercase">Your Position</span>
                <div className="text-sm font-bold text-[#262626]">{currentUser?.name || user?.full_name || "Account"}</div>
                <span className="text-xs text-[#FFA116] font-semibold">{(currentUser?.xp ?? 0).toLocaleString()} Total XP</span>
              </div>
            </div>
          </div>

          {loadError && !loading && (
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/25 text-xs text-[#DC2626] flex items-center justify-between gap-3">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => fetchLeaderboard(period)}
                className="font-semibold underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <Card className="p-10 flex flex-col items-center justify-center gap-2 text-xs text-[#64748B]">
              <Loader2 className="w-6 h-6 animate-spin text-[#FFA116]" />
              <span>Loading real-time standings from database...</span>
            </Card>
          ) : (
            <>

          {/* Top 3 Podium */}
          {topThree.length === 3 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-5 h-5 text-[#FFA116]" />
                <h3 className="text-base font-bold text-[#262626]">Top Performers</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-3xl mx-auto pt-4">
                {/* 2nd Place */}
                <div className="order-2 md:order-1 p-5 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] text-center space-y-2 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#94A3B8] text-white font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <UserAvatar
                    src={topThree[1].is_current_user ? (user?.avatar_url || topThree[1].avatar_url) : topThree[1].avatar_url}
                    name={topThree[1].name}
                    initials={topThree[1].avatar}
                    size="lg"
                    className="border border-[#E5E7EB] shadow-subtle"
                    fallbackClassName="bg-white text-[#262626]"
                  />
                  <h4 className="text-sm font-bold text-[#262626] truncate max-w-[160px]">{topThree[1].name}</h4>
                  <p className="text-xs text-[#64748B] truncate">{topThree[1].role}</p>
                  <div className="text-xs font-bold text-[#262626]">{getScore(topThree[1], period).toLocaleString()} XP</div>
                  <Badge variant="neutral" size="xs">
                    {topThree[1].problems} Solved
                  </Badge>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2 p-6 rounded-xl border-2 border-[#FFA116] bg-[#FFF8EE] text-center space-y-2 flex flex-col items-center shadow-subtle relative -translate-y-2">
                  <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-[#FFA116] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Winner
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#FFA116] text-white font-bold text-sm flex items-center justify-center">
                    1
                  </div>
                  <UserAvatar
                    src={topThree[0].is_current_user ? (user?.avatar_url || topThree[0].avatar_url) : topThree[0].avatar_url}
                    name={topThree[0].name}
                    initials={topThree[0].avatar}
                    size="xl"
                    className="border-2 border-[#FFA116] shadow-sm"
                    fallbackClassName="bg-white text-[#FFA116]"
                  />
                  <h4 className="text-base font-bold text-[#262626] truncate max-w-[180px]">{topThree[0].name}</h4>
                  <p className="text-xs text-[#64748B] truncate">{topThree[0].role}</p>
                  <div className="text-sm font-extrabold text-[#FFA116]">{getScore(topThree[0], period).toLocaleString()} XP</div>
                  <Badge variant="accent" size="xs">
                    {topThree[0].problems} Solved • {topThree[0].streak}d Streak
                  </Badge>
                </div>

                {/* 3rd Place */}
                <div className="order-3 p-5 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] text-center space-y-2 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#B45309] text-white font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <UserAvatar
                    src={topThree[2].is_current_user ? (user?.avatar_url || topThree[2].avatar_url) : topThree[2].avatar_url}
                    name={topThree[2].name}
                    initials={topThree[2].avatar}
                    size="lg"
                    className="border border-[#E5E7EB] shadow-subtle"
                    fallbackClassName="bg-white text-[#262626]"
                  />
                  <h4 className="text-sm font-bold text-[#262626] truncate max-w-[160px]">{topThree[2].name}</h4>
                  <p className="text-xs text-[#64748B] truncate">{topThree[2].role}</p>
                  <div className="text-xs font-bold text-[#262626]">{getScore(topThree[2], period).toLocaleString()} XP</div>
                  <Badge variant="neutral" size="xs">
                    {topThree[2].problems} Solved
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Filter Toolbar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="inline-flex items-center p-1 bg-[#F1F3F5] rounded-lg gap-1 text-xs w-full sm:w-auto">
              {[
                { id: "all", label: "All Time" },
                { id: "weekly", label: "This Week" },
                { id: "monthly", label: "This Month" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPeriod(tab.id)}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md font-semibold transition ${
                    period === tab.id
                      ? "bg-white text-[#262626] shadow-sm"
                      : "text-[#64748B] hover:text-[#262626]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search candidate..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#E5E7EB] text-xs text-[#262626] placeholder-[#94A3B8] pl-9 pr-3 py-2 rounded-lg outline-none focus:bg-white focus:border-[#FFA116] transition"
                />
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F7F8FA] border border-[#E5E7EB] text-xs text-[#262626] px-3 py-2 rounded-lg outline-none focus:bg-white focus:border-[#FFA116] cursor-pointer"
              >
                <option value="xp">Sort: XP</option>
                <option value="problems">Sort: Problems</option>
                <option value="streak">Sort: Streak</option>
                <option value="readiness">Sort: Readiness</option>
              </select>
            </div>
          </Card>

          {/* Full Rankings Table */}
          <Card className="overflow-hidden">
            <div className="p-4 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center justify-between text-xs text-[#64748B]">
              <span>Showing <strong>{rankedUsers.length}</strong> candidates</span>
              <span>Your Rank: <strong className="text-[#FFA116]">#{currentRank}</strong></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-white text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 text-center w-14">Rank</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4 w-28">Score (XP)</th>
                    <th className="py-3 px-4 w-28">Problems</th>
                    <th className="py-3 px-4 w-28">Streak</th>
                    <th className="py-3 px-4 w-32">Readiness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F5] text-xs">
                  {rankedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-[#64748B]">
                        No candidates match your search filter.
                      </td>
                    </tr>
                  ) : rankedUsers.map((u, idx) => {
                    const isSelf = Boolean(u.is_current_user);
                    const rankNum = idx + 1;

                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`hover:bg-[#F7F8FA] cursor-pointer transition ${
                          isSelf ? "bg-[#FFF8EE]/60 font-medium" : ""
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3 px-4 text-center font-bold">
                          {rankNum === 1 ? (
                            <span className="text-[#FFA116]">🥇 1</span>
                          ) : rankNum === 2 ? (
                            <span className="text-[#94A3B8]">🥈 2</span>
                          ) : rankNum === 3 ? (
                            <span className="text-[#B45309]">🥉 3</span>
                          ) : (
                            <span className={isSelf ? "text-[#FFA116]" : "text-[#64748B]"}>
                              #{rankNum}
                            </span>
                          )}
                        </td>

                        {/* Candidate */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={isSelf ? (user?.avatar_url || u.avatar_url) : u.avatar_url}
                              name={u.name}
                              initials={u.avatar}
                              size="sm"
                              fallbackClassName={isSelf ? "bg-[#FFA116] text-white" : "bg-[#F1F3F5] text-[#262626]"}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-[#262626] truncate">
                                  {u.name}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] bg-[#FFA116] text-white font-bold px-1.5 py-0.2 rounded-full">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#64748B] truncate">{u.role}</p>
                            </div>
                          </div>
                        </td>

                        {/* Score XP */}
                        <td className="py-3 px-4 font-bold text-[#262626]">
                          {getScore(u, period).toLocaleString()} XP
                        </td>

                        {/* Problems Solved */}
                        <td className="py-3 px-4 text-[#64748B]">
                          <span className="font-semibold text-[#262626]">{u.problems}</span> Qs
                        </td>

                        {/* Streak */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FFA116]">
                            <Flame className="w-3.5 h-3.5 fill-[#FFA116]" /> {u.streak}d
                          </span>
                        </td>

                        {/* Placement Readiness */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold text-[#16A34A]">
                              <span>{u.readiness}%</span>
                            </div>
                            <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#16A34A] h-full rounded-full"
                                style={{ width: `${u.readiness}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          </>
          )}
        </BlurDrop>
      </div>

      {/* User Inspect Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-[#E5E7EB] p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#F1F3F5] pb-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={selectedUser.is_current_user ? (user?.avatar_url || selectedUser.avatar_url) : selectedUser.avatar_url}
                  name={selectedUser.name}
                  initials={selectedUser.avatar}
                  size="lg"
                  className="border border-[#E5E7EB]"
                  fallbackClassName="bg-[#F7F8FA] text-[#262626]"
                />
                <div>
                  <h3 className="text-base font-bold text-[#262626]">{selectedUser.name}</h3>
                  <p className="text-xs text-[#64748B]">{selectedUser.role}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-md text-[#64748B] hover:text-[#262626] hover:bg-[#F1F3F5] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-[#F7F8FA] rounded-lg border border-[#E5E7EB] text-center text-xs">
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">Total XP</span>
                <strong className="text-sm font-bold text-[#262626]">{selectedUser.xp.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">Problems</span>
                <strong className="text-sm font-bold text-[#262626]">{selectedUser.problems}</strong>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase">Streak</span>
                <strong className="text-sm font-bold text-[#FFA116]">{selectedUser.streak} Days</strong>
              </div>
            </div>

            {/* Badges */}
            {selectedUser.badges && selectedUser.badges.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#64748B]">Earned Badges:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.badges.map((b, i) => (
                    <Badge key={i} variant="accent" size="xs">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
