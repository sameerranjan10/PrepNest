import React, { useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
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
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const CURRENT_USER_ID = 4;

const STORAGE_KEY = "prepnest-leaderboard-v2";

const DEFAULT_USERS = [
  {
    id: 1,
    name: "Alex Johnson",
    username: "alexjohnson",
    avatar: "AJ",
    xp: 8450,
    weeklyXp: 1240,
    monthlyXp: 4380,
    problems: 156,
    streak: 24,
    readiness: 94,
    level: 9,
    rankChange: 1,
    role: "Full Stack Developer",
    badges: ["DSA Master", "7 Day Warrior", "Top 10"],
    dsa: 82,
    aptitude: 91,
    interview: 88,
  },
  {
    id: 2,
    name: "Sam Kumar",
    username: "samkumar",
    avatar: "SK",
    xp: 7920,
    weeklyXp: 1150,
    monthlyXp: 3920,
    problems: 143,
    streak: 19,
    readiness: 91,
    level: 8,
    rankChange: 2,
    role: "Backend Developer",
    badges: ["Problem Solver", "Consistency King"],
    dsa: 88,
    aptitude: 85,
    interview: 84,
  },
  {
    id: 3,
    name: "Ritwika Das",
    username: "ritwika",
    avatar: "RD",
    xp: 7560,
    weeklyXp: 980,
    monthlyXp: 3640,
    problems: 138,
    streak: 17,
    readiness: 89,
    level: 8,
    rankChange: -1,
    role: "Frontend Developer",
    badges: ["React Pro", "Top 10"],
    dsa: 79,
    aptitude: 87,
    interview: 91,
  },
  {
    id: 4,
    name: "Vivek",
    username: "vivek",
    avatar: "V",
    xp: 4850,
    weeklyXp: 720,
    monthlyXp: 2480,
    problems: 91,
    streak: 14,
    readiness: 86,
    level: 5,
    rankChange: 2,
    role: "Software Developer",
    badges: ["Roadmap Starter"],
    dsa: 74,
    aptitude: 81,
    interview: 83,
  },
  {
    id: 5,
    name: "Rahul Sharma",
    username: "rahul",
    avatar: "RS",
    xp: 4510,
    weeklyXp: 650,
    monthlyXp: 2310,
    problems: 86,
    streak: 11,
    readiness: 83,
    level: 5,
    rankChange: -1,
    role: "Java Developer",
    badges: ["Java Warrior"],
    dsa: 77,
    aptitude: 75,
    interview: 80,
  },
  {
    id: 6,
    name: "Priya Singh",
    username: "priya",
    avatar: "PS",
    xp: 4290,
    weeklyXp: 610,
    monthlyXp: 2150,
    problems: 82,
    streak: 9,
    readiness: 81,
    level: 5,
    rankChange: 1,
    role: "Data Analyst",
    badges: ["SQL Pro"],
    dsa: 68,
    aptitude: 90,
    interview: 78,
  },
  {
    id: 7,
    name: "Arjun Patel",
    username: "arjun",
    avatar: "AP",
    xp: 3950,
    weeklyXp: 580,
    monthlyXp: 1980,
    problems: 75,
    streak: 8,
    readiness: 79,
    level: 4,
    rankChange: -2,
    role: "Frontend Developer",
    badges: ["JavaScript Pro"],
    dsa: 71,
    aptitude: 76,
    interview: 75,
  },
  {
    id: 8,
    name: "Neha Mishra",
    username: "neha",
    avatar: "NM",
    xp: 3620,
    weeklyXp: 510,
    monthlyXp: 1840,
    problems: 69,
    streak: 7,
    readiness: 76,
    level: 4,
    rankChange: 1,
    role: "Python Developer",
    badges: ["Python Starter"],
    dsa: 64,
    aptitude: 79,
    interview: 72,
  },
  {
    id: 9,
    name: "Karan Singh",
    username: "karan",
    avatar: "KS",
    xp: 3310,
    weeklyXp: 470,
    monthlyXp: 1670,
    problems: 61,
    streak: 6,
    readiness: 73,
    level: 4,
    rankChange: 0,
    role: "Backend Developer",
    badges: ["API Builder"],
    dsa: 70,
    aptitude: 69,
    interview: 71,
  },
  {
    id: 10,
    name: "Ananya Rao",
    username: "ananya",
    avatar: "AR",
    xp: 2980,
    weeklyXp: 420,
    monthlyXp: 1510,
    problems: 55,
    streak: 5,
    readiness: 70,
    level: 3,
    rankChange: 0,
    role: "Student Developer",
    badges: ["Getting Started"],
    dsa: 61,
    aptitude: 73,
    interview: 68,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function loadUsers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore invalid localStorage data.
  }

  return DEFAULT_USERS;
}

function getScore(user, period) {
  if (period === "weekly") return user.weeklyXp;
  if (period === "monthly") return user.monthlyXp;
  return user.xp;
}

function getLevel(xp) {
  return Math.max(1, Math.floor(xp / 1000) + 1);
}

function getNextLevelXP(xp) {
  const level = getLevel(xp);

  return level * 1000;
}

function getLevelProgress(xp) {
  const currentLevelStart =
    (getLevel(xp) - 1) * 1000;

  const nextLevel =
    getNextLevelXP(xp);

  return Math.min(
    100,
    Math.round(
      ((xp - currentLevelStart) /
        (nextLevel - currentLevelStart)) *
        100
    )
  );
}

function getRankIcon(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function LeaderboardPage() {
  const [users, setUsers] = useState(loadUsers);

  const [period, setPeriod] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("xp");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [showStats, setShowStats] =
    useState(false);

  /* =======================================================
     SAVE
  ======================================================= */

  const updateUsers = (newUsers) => {
    setUsers(newUsers);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(newUsers)
      );
    } catch {
      // Ignore storage errors.
    }
  };

  /* =======================================================
     CURRENT USER
  ======================================================= */

  const currentUser =
    users.find(
      (user) =>
        user.id === CURRENT_USER_ID
    ) || users[0];

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const rankedUsers = useMemo(() => {
    let result = [...users];

    const query =
      search.toLowerCase().trim();

    if (query) {
      result = result.filter(
        (user) =>
          user.name
            .toLowerCase()
            .includes(query) ||
          user.username
            .toLowerCase()
            .includes(query) ||
          user.role
            .toLowerCase()
            .includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "problems") {
        return b.problems - a.problems;
      }

      if (sortBy === "streak") {
        return b.streak - a.streak;
      }

      if (sortBy === "readiness") {
        return b.readiness - a.readiness;
      }

      return (
        getScore(b, period) -
        getScore(a, period)
      );
    });

    return result;
  }, [users, period, search, sortBy]);

  const actualRanking = useMemo(() => {
    return [...users].sort(
      (a, b) =>
        getScore(b, period) -
        getScore(a, period)
    );
  }, [users, period]);

  const currentRank =
    actualRanking.findIndex(
      (user) =>
        user.id === currentUser.id
    ) + 1;

  /* =======================================================
     TOP THREE
  ======================================================= */

  const topThree =
    actualRanking.slice(0, 3);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalXP = users.reduce(
    (sum, user) =>
      sum + getScore(user, period),
    0
  );

  const averageXP = Math.round(
    totalXP / users.length
  );

  const totalProblems = users.reduce(
    (sum, user) =>
      sum + user.problems,
    0
  );

  const highestStreak =
    Math.max(
      ...users.map(
        (user) => user.streak
      )
    );

  const maxXP = Math.max(
    ...users.map((user) =>
      getScore(user, period)
    )
  );

  /* =======================================================
     SIMULATE XP
  ======================================================= */

  const simulateXP = () => {
    const updated = users.map(
      (user) => {
        if (
          user.id !== CURRENT_USER_ID
        ) {
          return user;
        }

        const earned =
          Math.floor(
            Math.random() * 150
          ) + 50;

        return {
          ...user,
          xp: user.xp + earned,
          weeklyXp:
            user.weeklyXp + earned,
          monthlyXp:
            user.monthlyXp + earned,
          problems:
            user.problems +
            (Math.random() > 0.65
              ? 1
              : 0),
        };
      }
    );

    updateUsers(updated);
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetLeaderboard = () => {
    const confirmed =
      window.confirm(
        "Reset leaderboard demo data?"
      );

    if (!confirmed) return;

    updateUsers(DEFAULT_USERS);
  };

  /* =======================================================
     RANK MOVEMENT
  ======================================================= */

  const RankMovement = ({
    change,
  }) => {
    if (change > 0) {
      return (
        <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
          <ChevronUp className="w-3 h-3" />
          {change}
        </span>
      );
    }

    if (change < 0) {
      return (
        <span className="flex items-center gap-1 text-rose-400 text-[10px]">
          <ChevronDown className="w-3 h-3" />
          {Math.abs(change)}
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-slate-600 text-[10px]">
        <Minus className="w-3 h-3" />
      </span>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">

      <Sidebar activeRoute="leaderboard" />

      <div className="flex-1 flex flex-col min-w-0">

        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

            <div>

              <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">

                <Trophy className="w-4 h-4" />

                PrepNest Competition

              </div>

              <h1 className="text-3xl font-black text-white mt-2">
                Leaderboard
              </h1>

              <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                Compete with other learners, earn XP,
                maintain your streak and become one of
                PrepNest's top performers.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={simulateXP}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl text-xs font-bold transition"
              >
                <Plus className="w-4 h-4" />
                Earn Demo XP
              </button>

              <button
                onClick={resetLeaderboard}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>

            </div>

          </section>

          {/* =================================================
              CURRENT USER CARD
          ================================================= */}

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            <div className="xl:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-slate-900/50 border border-indigo-500/20">

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                <div className="flex items-center gap-4">

                  <div className="relative">

                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-black text-white shadow-lg">
                      {currentUser.avatar}
                    </div>

                    <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-900 border border-indigo-500 flex items-center justify-center text-[10px] font-bold text-indigo-300">
                      {currentUser.level}
                    </div>

                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <h2 className="text-lg font-bold text-white">
                        {currentUser.name}
                      </h2>

                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-300 font-bold">
                        YOU
                      </span>

                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      {currentUser.role}
                    </p>

                    <div className="flex items-center gap-3 mt-3">

                      <span className="text-xs font-bold text-indigo-400">
                        Rank #{currentRank}
                      </span>

                      <span className="text-slate-700">
                        •
                      </span>

                      <span className="text-xs font-bold text-yellow-400">
                        Level {getLevel(
                          currentUser.xp
                        )}
                      </span>

                    </div>

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-6">

                  <div>

                    <p className="text-[10px] uppercase text-slate-500">
                      XP
                    </p>

                    <p className="text-xl font-black text-white">
                      {currentUser.xp.toLocaleString()}
                    </p>

                  </div>

                  <div>

                    <p className="text-[10px] uppercase text-slate-500">
                      Solved
                    </p>

                    <p className="text-xl font-black text-white">
                      {currentUser.problems}
                    </p>

                  </div>

                  <div>

                    <p className="text-[10px] uppercase text-slate-500">
                      Readiness
                    </p>

                    <p className="text-xl font-black text-emerald-400">
                      {currentUser.readiness}%
                    </p>

                  </div>

                </div>

              </div>

              {/* LEVEL PROGRESS */}

              <div className="mt-7">

                <div className="flex justify-between mb-2">

                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Level {getLevel(
                      currentUser.xp
                    )} Progress
                  </span>

                  <span className="text-[10px] text-indigo-400 font-bold">
                    {currentUser.xp} /{" "}
                    {getNextLevelXP(
                      currentUser.xp
                    )} XP
                  </span>

                </div>

                <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">

                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                    style={{
                      width: `${getLevelProgress(
                        currentUser.xp
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            {/* STREAK */}

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

              <div className="flex items-start justify-between">

                <div>

                  <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-400" />
                  </div>

                  <p className="text-xs text-slate-500 mt-5">
                    Current Streak
                  </p>

                  <div className="flex items-baseline gap-2">

                    <p className="text-3xl font-black text-white">
                      {currentUser.streak}
                    </p>

                    <span className="text-xs text-orange-400 font-bold">
                      days
                    </span>

                  </div>

                </div>

                <div className="text-right">

                  <p className="text-[10px] uppercase text-slate-600">
                    Best
                  </p>

                  <p className="text-lg font-black text-orange-400">
                    {Math.max(
                      currentUser.streak,
                      30
                    )}
                  </p>

                </div>

              </div>

              <div className="mt-6 flex items-center gap-1">

                {Array.from({
                  length: 7,
                }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full ${
                      i <
                      Math.min(
                        currentUser.streak,
                        7
                      )
                        ? "bg-orange-500"
                        : "bg-slate-800"
                    }`}
                  />
                ))}

              </div>

              <p className="text-[11px] text-slate-500 mt-3">
                Complete today's activity to keep your streak alive.
              </p>

            </div>

          </section>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <StatCard
              icon={Zap}
              title="Total XP"
              value={totalXP.toLocaleString()}
              subtitle="Across all learners"
            />

            <StatCard
              icon={Code2}
              title="Problems Solved"
              value={totalProblems}
              subtitle="Combined solutions"
            />

            <StatCard
              icon={Users}
              title="Learners"
              value={users.length}
              subtitle="Active competitors"
            />

            <StatCard
              icon={Flame}
              title="Best Streak"
              value={`${highestStreak}d`}
              subtitle="Current leaderboard best"
            />

          </section>

          {/* =================================================
              FILTER BAR
          ================================================= */}

          <section className="flex flex-col lg:flex-row gap-4 justify-between">

            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">

              {[
                ["all", "All Time"],
                ["weekly", "This Week"],
                ["monthly", "This Month"],
              ].map(
                ([value, label]) => (

                  <button
                    key={value}
                    onClick={() =>
                      setPeriod(value)
                    }
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                      period === value
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>

                )
              )}

            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <div className="relative">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search learners..."
                  className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />

              </div>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none"
              >

                <option value="xp">
                  Sort: XP
                </option>

                <option value="problems">
                  Sort: Problems
                </option>

                <option value="streak">
                  Sort: Streak
                </option>

                <option value="readiness">
                  Sort: Readiness
                </option>

              </select>

            </div>

          </section>

          {/* =================================================
              PODIUM
          ================================================= */}

          {topThree.length === 3 && (

            <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

              <div className="flex items-center gap-2 mb-8">

                <Crown className="w-5 h-5 text-yellow-400" />

                <div>

                  <h2 className="text-lg font-bold text-white">
                    Top Performers
                  </h2>

                  <p className="text-[11px] text-slate-500">
                    The strongest learners on PrepNest
                  </p>

                </div>

              </div>

              <div className="flex items-end justify-center gap-3 md:gap-10">

                {/* SECOND */}

                <PodiumUser
                  user={topThree[1]}
                  rank={2}
                  height="h-32"
                  onClick={() =>
                    setSelectedUser(
                      topThree[1]
                    )
                  }
                  period={period}
                />

                {/* FIRST */}

                <PodiumUser
                  user={topThree[0]}
                  rank={1}
                  height="h-44"
                  onClick={() =>
                    setSelectedUser(
                      topThree[0]
                    )
                  }
                  period={period}
                />

                {/* THIRD */}

                <PodiumUser
                  user={topThree[2]}
                  rank={3}
                  height="h-28"
                  onClick={() =>
                    setSelectedUser(
                      topThree[2]
                    )
                  }
                  period={period}
                />

              </div>

            </section>

          )}

          {/* =================================================
              PERFORMANCE GRAPH
          ================================================= */}

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

            <div className="flex items-center justify-between mb-7">

              <div>

                <div className="flex items-center gap-2">

                  <BarChart3 className="w-5 h-5 text-indigo-400" />

                  <h2 className="text-lg font-bold text-white">
                    XP Performance
                  </h2>

                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  Compare learner performance for the selected period.
                </p>

              </div>

              <Sparkles className="w-5 h-5 text-purple-400" />

            </div>

            <div className="space-y-5">

              {users
                .slice()
                .sort(
                  (a, b) =>
                    getScore(
                      b,
                      period
                    ) -
                    getScore(
                      a,
                      period
                    )
                )
                .slice(0, 8)
                .map((user) => {

                  const score =
                    getScore(
                      user,
                      period
                    );

                  const width =
                    maxXP > 0
                      ? (score /
                          maxXP) *
                        100
                      : 0;

                  return (
                    <button
                      key={user.id}
                      onClick={() =>
                        setSelectedUser(
                          user
                        )
                      }
                      className="w-full text-left group"
                    >

                      <div className="flex items-center gap-3 mb-2">

                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                          {user.avatar}
                        </div>

                        <span className="w-24 md:w-32 text-xs font-semibold text-slate-300 truncate">
                          {user.name}
                        </span>

                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">

                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              user.id ===
                              CURRENT_USER_ID
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                                : "bg-slate-600 group-hover:bg-indigo-500"
                            }`}
                            style={{
                              width: `${width}%`,
                            }}
                          />

                        </div>

                        <span className="w-20 text-right text-xs font-bold text-indigo-400">
                          {score.toLocaleString()}
                        </span>

                      </div>

                    </button>
                  );
                })}

            </div>

          </section>

          {/* =================================================
              CATEGORY PERFORMANCE
          ================================================= */}

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <PerformanceCard
              icon={Code2}
              title="DSA Performance"
              value={currentUser.dsa}
              description="Coding problem performance"
            />

            <PerformanceCard
              icon={BrainCircuit}
              title="Aptitude"
              value={currentUser.aptitude}
              description="Logical & quantitative skills"
            />

            <PerformanceCard
              icon={Briefcase}
              title="Interview Readiness"
              value={currentUser.interview}
              description="Interview preparation score"
            />

          </section>

          {/* =================================================
              FULL RANKINGS
          ================================================= */}

          <section className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">

            <div className="p-6 border-b border-slate-800">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-bold text-white">
                    Complete Rankings
                  </h2>

                  <p className="text-[11px] text-slate-500 mt-1">
                    {rankedUsers.length} learners displayed
                  </p>

                </div>

                <Trophy className="w-5 h-5 text-yellow-400" />

              </div>

            </div>

            {/* DESKTOP HEADER */}

            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-600">

              <div className="col-span-1">
                Rank
              </div>

              <div className="col-span-4">
                Learner
              </div>

              <div className="col-span-2">
                XP
              </div>

              <div className="col-span-1">
                Level
              </div>

              <div className="col-span-2">
                Problems
              </div>

              <div className="col-span-1">
                Streak
              </div>

              <div className="col-span-1">
                Readiness
              </div>

            </div>

            {rankedUsers.map(
              (user, index) => {

                const score =
                  getScore(
                    user,
                    period
                  );

                const isCurrent =
                  user.id ===
                  CURRENT_USER_ID;

                const level =
                  getLevel(
                    user.xp
                  );

                return (
                  <button
                    key={user.id}
                    onClick={() =>
                      setSelectedUser(
                        user
                      )
                    }
                    className={`w-full text-left border-t border-slate-800/70 px-6 py-5 transition ${
                      isCurrent
                        ? "bg-indigo-500/5 border-l-2 border-l-indigo-500"
                        : "hover:bg-slate-800/30"
                    }`}
                  >

                    {/* DESKTOP */}

                    <div className="hidden lg:grid grid-cols-12 gap-4 items-center">

                      <div className="col-span-1 flex items-center gap-2">

                        <span className="text-sm font-bold text-slate-400">
                          {getRankIcon(
                            index + 1
                          )}
                        </span>

                        <RankMovement
                          change={
                            user.rankChange
                          }
                        />

                      </div>

                      <div className="col-span-4 flex items-center gap-3">

                        <div className="relative">

                          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                            {user.avatar}
                          </div>

                          {index < 3 && (
                            <div className="absolute -top-2 -right-2 text-xs">
                              {index === 0
                                ? "👑"
                                : "⭐"}
                            </div>
                          )}

                        </div>

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <p className="text-sm font-bold text-white truncate">
                              {user.name}
                            </p>

                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[8px] font-black">
                                YOU
                              </span>
                            )}

                          </div>

                          <p className="text-[10px] text-slate-600 truncate">
                            {user.role}
                          </p>

                        </div>

                      </div>

                      <div className="col-span-2">

                        <p className="text-sm font-black text-indigo-400">
                          {score.toLocaleString()}
                        </p>

                        <p className="text-[9px] text-slate-600">
                          XP
                        </p>

                      </div>

                      <div className="col-span-1">

                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-[10px] font-bold">

                          <Star className="w-3 h-3" />

                          {level}

                        </span>

                      </div>

                      <div className="col-span-2">

                        <div className="flex items-center gap-2">

                          <Code2 className="w-4 h-4 text-slate-600" />

                          <span className="text-sm font-semibold text-slate-300">
                            {user.problems}
                          </span>

                        </div>

                      </div>

                      <div className="col-span-1">

                        <div className="flex items-center gap-1">

                          <Flame className="w-4 h-4 text-orange-400" />

                          <span className="text-xs font-bold text-slate-300">
                            {user.streak}
                          </span>

                        </div>

                      </div>

                      <div className="col-span-1">

                        <span
                          className={`text-xs font-bold ${
                            user.readiness >=
                            85
                              ? "text-emerald-400"
                              : user.readiness >=
                                75
                              ? "text-yellow-400"
                              : "text-orange-400"
                          }`}
                        >
                          {user.readiness}%
                        </span>

                      </div>

                    </div>

                    {/* MOBILE */}

                    <div className="lg:hidden flex items-center gap-3">

                      <div className="w-8 text-center">

                        <span className="text-xs font-black text-slate-500">
                          #{index + 1}
                        </span>

                      </div>

                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                        {user.avatar}
                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-2">

                          <p className="text-sm font-bold text-white truncate">
                            {user.name}
                          </p>

                          {isCurrent && (
                            <span className="text-[8px] text-indigo-400">
                              YOU
                            </span>
                          )}

                        </div>

                        <div className="flex items-center gap-3 mt-1">

                          <span className="text-[10px] text-indigo-400 font-bold">
                            {score} XP
                          </span>

                          <span className="text-[10px] text-slate-500">
                            {user.problems} solved
                          </span>

                          <span className="text-[10px] text-orange-400">
                            🔥 {user.streak}
                          </span>

                        </div>

                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-700" />

                    </div>

                  </button>
                );
              }
            )}

            {rankedUsers.length === 0 && (

              <div className="py-20 text-center">

                <Search className="w-8 h-8 mx-auto text-slate-700" />

                <p className="text-sm font-bold text-slate-400 mt-4">
                  No learners found
                </p>

              </div>

            )}

          </section>

          {/* =================================================
              ACHIEVEMENTS
          ================================================= */}

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

            <div className="flex items-center gap-2 mb-6">

              <Award className="w-5 h-5 text-yellow-400" />

              <div>

                <h2 className="text-lg font-bold text-white">
                  Your Achievements
                </h2>

                <p className="text-[11px] text-slate-500">
                  Milestones unlocked through your preparation.
                </p>

              </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <Achievement
                icon={Flame}
                title="14 Day Streak"
                unlocked={
                  currentUser.streak >= 14
                }
                description="Practice for 14 consecutive days."
              />

              <Achievement
                icon={Code2}
                title="50 Problems"
                unlocked={
                  currentUser.problems >= 50
                }
                description="Solve 50 coding problems."
              />

              <Achievement
                icon={Zap}
                title="5K XP"
                unlocked={
                  currentUser.xp >= 5000
                }
                description="Earn 5,000 experience points."
              />

              <Achievement
                icon={Trophy}
                title="Top 5"
                unlocked={
                  currentRank <= 5
                }
                description="Reach the top five learners."
              />

            </div>

          </section>

        </main>

      </div>

      {/* =====================================================
          USER DETAIL MODAL
      ===================================================== */}

      {selectedUser && (

        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-5">

          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">

            <div className="p-6 border-b border-slate-800">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black">
                    {selectedUser.avatar}
                  </div>

                  <div>

                    <h2 className="text-lg font-black text-white">
                      {selectedUser.name}
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      {selectedUser.role}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    setSelectedUser(
                      null
                    )
                  }
                  className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>

            </div>

            <div className="p-6 space-y-6">

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                <MiniStat
                  label="Rank"
                  value={`#${actualRanking.findIndex(
                    (u) =>
                      u.id ===
                      selectedUser.id
                  ) + 1}`}
                />

                <MiniStat
                  label="XP"
                  value={selectedUser.xp.toLocaleString()}
                />

                <MiniStat
                  label="Problems"
                  value={selectedUser.problems}
                />

                <MiniStat
                  label="Streak"
                  value={`${selectedUser.streak}d`}
                />

              </div>

              <div>

                <div className="flex justify-between mb-2">

                  <span className="text-xs font-bold text-slate-400">
                    Interview Readiness
                  </span>

                  <span className="text-xs font-bold text-emerald-400">
                    {selectedUser.readiness}%
                  </span>

                </div>

                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${selectedUser.readiness}%`,
                    }}
                  />

                </div>

              </div>

              <div className="grid grid-cols-3 gap-4">

                <SkillStat
                  label="DSA"
                  value={selectedUser.dsa}
                />

                <SkillStat
                  label="Aptitude"
                  value={
                    selectedUser.aptitude
                  }
                />

                <SkillStat
                  label="Interview"
                  value={
                    selectedUser.interview
                  }
                />

              </div>

              <div>

                <p className="text-xs font-bold text-slate-400 mb-3">
                  Badges
                </p>

                <div className="flex flex-wrap gap-2">

                  {selectedUser.badges.map(
                    (badge) => (
                      <span
                        key={badge}
                        className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300"
                      >
                        🏅 {badge}
                      </span>
                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">

      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">

        <Icon className="w-5 h-5 text-indigo-400" />

      </div>

      <p className="text-[10px] uppercase tracking-wider text-slate-600 mt-4">
        {title}
      </p>

      <p className="text-2xl font-black text-white mt-1">
        {value}
      </p>

      <p className="text-[10px] text-slate-600 mt-1">
        {subtitle}
      </p>

    </div>
  );
}

/* =========================================================
   PODIUM
========================================================= */

function PodiumUser({
  user,
  rank,
  height,
  onClick,
  period,
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center w-28 md:w-44 group"
    >

      <div className="relative">

        <div
          className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-lg border-4 transition group-hover:scale-105 ${
            rank === 1
              ? "bg-yellow-500/20 border-yellow-400 text-yellow-300"
              : rank === 2
              ? "bg-slate-500/20 border-slate-400 text-slate-300"
              : "bg-orange-500/20 border-orange-500 text-orange-300"
          }`}
        >
          {user.avatar}
        </div>

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">

          <span className="text-lg">
            {rank === 1
              ? "🥇"
              : rank === 2
              ? "🥈"
              : "🥉"}
          </span>

        </div>

      </div>

      <p className="text-xs font-bold text-white mt-4 truncate max-w-full">
        {user.name}
      </p>

      <p className="text-[10px] text-indigo-400 font-bold mt-1">
        {getScore(
          user,
          period
        ).toLocaleString()}{" "}
        XP
      </p>

      <div
        className={`w-full ${height} mt-3 rounded-t-2xl bg-gradient-to-t from-indigo-600/30 to-indigo-500/5 border border-indigo-500/20 flex items-start justify-center pt-5`}
      >

        <span className="text-4xl font-black text-white/10">
          #{rank}
        </span>

      </div>

    </button>
  );
}

/* =========================================================
   PERFORMANCE CARD
========================================================= */

function PerformanceCard({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">

      <div className="flex items-center justify-between">

        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">

          <Icon className="w-5 h-5 text-indigo-400" />

        </div>

        <span className="text-lg font-black text-white">
          {value}%
        </span>

      </div>

      <h3 className="text-sm font-bold text-white mt-5">
        {title}
      </h3>

      <p className="text-[10px] text-slate-600 mt-1">
        {description}
      </p>

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-5">

        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   ACHIEVEMENT
========================================================= */

function Achievement({
  icon: Icon,
  title,
  unlocked,
  description,
}) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        unlocked
          ? "bg-indigo-500/5 border-indigo-500/20"
          : "bg-slate-950/40 border-slate-800"
      }`}
    >

      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          unlocked
            ? "bg-yellow-500/10"
            : "bg-slate-800"
        }`}
      >

        {unlocked ? (
          <Icon className="w-5 h-5 text-yellow-400" />
        ) : (
          <Lock className="w-4 h-4 text-slate-600" />
        )}

      </div>

      <p
        className={`text-xs font-bold mt-3 ${
          unlocked
            ? "text-white"
            : "text-slate-600"
        }`}
      >
        {title}
      </p>

      <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
        {description}
      </p>

      {unlocked && (
        <div className="flex items-center gap-1 mt-3 text-[9px] font-bold text-emerald-400">
          <CheckCircle2 className="w-3 h-3" />
          Unlocked
        </div>
      )}

    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  label,
  value,
}) {
  return (
    <div className="p-3 rounded-xl bg-slate-800/50">

      <p className="text-[9px] uppercase text-slate-600">
        {label}
      </p>

      <p className="text-sm font-black text-white mt-1">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   SKILL STAT
========================================================= */

function SkillStat({
  label,
  value,
}) {
  return (
    <div>

      <div className="flex justify-between mb-2">

        <span className="text-[10px] text-slate-500">
          {label}
        </span>

        <span className="text-[10px] font-bold text-indigo-400">
          {value}%
        </span>

      </div>

      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">

        <div
          className="h-full bg-indigo-500 rounded-full"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}