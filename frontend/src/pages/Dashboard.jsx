import React from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { mockDSAProblems, mockCompanies } from '@/lib/mockData';
import { Sparkles, Trophy, CheckCircle2, ArrowUpRight, Flame, Target, Shield, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  const displayName = user?.full_name || user?.name || 'Student';
  const readiness = 78; // Baseline placement readiness calculation

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="dashboard" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-slate-800 p-8">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Sparkles className="w-3.5 h-3.5" /> AI Placement Assistant
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Shield className="w-3 h-3" /> {user?.plan || 'Pro'} Active
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-white">
                  Welcome back, {displayName} 👋
                </h1>
                <p className="text-sm text-slate-300 max-w-xl">
                  You are <strong className="text-indigo-400 font-bold">{readiness}% Placement Ready</strong> for upcoming campus drives. You have <strong className="text-white font-bold">{user?.credits ?? 250} AI Credits</strong> remaining.
                </p>
                {user?.email && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {user.email}
                  </p>
                )}
              </div>

              {/* Placement Radar Progress */}
              <div className="flex items-center gap-6 bg-slate-900/80 backdrop-blur-md p-5 rounded-xl border border-slate-800 self-start lg:self-auto">
                <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" className="text-slate-800" fill="transparent" />
                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" className="text-indigo-500" strokeDasharray="213.6" strokeDashoffset={213.6 * (1 - readiness / 100)} strokeLinecap="round" fill="transparent" />
                  </svg>
                  <span className="absolute font-extrabold text-lg text-white">{readiness}%</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Level</h4>
                  <div className="text-sm font-semibold text-white">Top 5% Placement Tier</div>
                  <span className="text-xs text-emerald-400 font-medium inline-flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +4% this week
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">84 / 150</div>
                <div className="text-xs text-slate-400">DSA Questions Solved</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">84 / 100</div>
                <div className="text-xs text-slate-400">ATS Resume Score</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">14 Days</div>
                <div className="text-xs text-slate-400">Daily Coding Streak</div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">90%</div>
                <div className="text-xs text-slate-400">Mock Interview Score</div>
              </div>
            </div>
          </div>

          {/* Aptitude Practice Quick Launcher */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-slate-900 border border-slate-800 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Campus Aptitude & Analytical Practice</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Live Assessment
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Practice Quantitative, Logical Reasoning & Verbal Ability questions with live timers, instant score evaluation, and step-by-step explanations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <Link
                to="/aptitude"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition shrink-0"
              >
                <span>Launch Aptitude Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Main Content Split: Recommended DSA & Target Companies */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Recommended DSA Problems */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" /> Recommended DSA Challenges
                  </h3>
                  <Link to="/dsa" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">View All Directory →</Link>
                </div>

                <div className="space-y-3">
                  {mockDSAProblems.map(prob => (
                    <div key={prob.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-indigo-500/50 transition">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                          prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {prob.difficulty}
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm text-slate-200">{prob.title}</h4>
                          <span className="text-xs text-slate-400">{prob.category} • {prob.acceptanceRate}% acceptance</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {prob.companies.map(c => (
                          <span key={c} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Company Track Progress */}
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-white mb-6">Target Companies</h3>
                <div className="space-y-4">
                  {mockCompanies.map(company => (
                    <div key={company.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{company.logo}</span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-200">{company.name}</h4>
                            <p className="text-[11px] text-slate-400">{company.role}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-indigo-400">{company.solvedQuestions}/{company.totalQuestions}</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(company.solvedQuestions / company.totalQuestions) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
