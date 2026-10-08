import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { mockDSAProblems, mockCompanies } from '@/lib/mockData';
import { 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  ArrowUpRight, 
  Flame, 
  Target, 
  Shield, 
  Mail, 
  BrainCircuit, 
  ArrowRight,
  Map,
  Video,
  FileText,
  Bot,
  Code2,
  BookOpen,
  Building2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  const displayName = user?.full_name || user?.name || 'Student';

  // Live Data State
  const [dsaMeta, setDsaMeta] = useState({ total_problems: 3392, solved_count: 0 });
  const [recommendedDSA, setRecommendedDSA] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [aptitudeStats, setAptitudeStats] = useState({ total: 1172, solved: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dsaRes, dsaProbRes, compRes, aptRes] = await Promise.allSettled([
        fetch('http://localhost:8000/api/dsa/meta'),
        fetch('http://localhost:8000/api/dsa/problems?limit=4'),
        fetch('http://localhost:8000/api/companies'),
        fetch('http://localhost:8000/api/aptitude/directory?limit=1')
      ]);

      if (dsaRes.status === 'fulfilled' && dsaRes.value.ok) {
        const d = await dsaRes.value.json();
        setDsaMeta(d);
      }
      if (dsaProbRes.status === 'fulfilled' && dsaProbRes.value.ok) {
        const p = await dsaProbRes.value.json();
        setRecommendedDSA(p.problems || []);
      }
      if (compRes.status === 'fulfilled' && compRes.value.ok) {
        const c = await compRes.value.json();
        setCompanies(c.companies || []);
      }
      if (aptRes.status === 'fulfilled' && aptRes.value.ok) {
        const a = await aptRes.value.json();
        setAptitudeStats({ total: a.total || 1172, solved: a.total_solved || 0 });
      }
    } catch (err) {
      console.log('Error fetching dashboard data:', err);
    }
  };

  const readiness = Math.min(
    99, 
    Math.max(72, 72 + Math.round((dsaMeta.solved_count * 1.5) + (aptitudeStats.solved * 0.5)))
  );

  const displayDSA = recommendedDSA.length > 0 ? recommendedDSA : mockDSAProblems.slice(0, 4);
  const displayCompanies = companies.length > 0 ? companies.slice(0, 4) : mockCompanies.slice(0, 4);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="dashboard" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
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
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome back, {displayName} 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  You are <strong className="text-indigo-400 font-bold">{readiness}% Placement Ready</strong> for upcoming campus drives. You have <strong className="text-white font-bold">{user?.credits ?? 250} AI Credits</strong> remaining.
                </p>
                {user?.email && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {user.email}
                  </p>
                )}
              </div>

              {/* Placement Radar Progress */}
              <div className="flex items-center gap-6 bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800 self-start lg:self-auto shadow-inner">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Link to="/dsa" className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-4 hover:border-indigo-500/50 transition group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">{dsaMeta.solved_count} / {dsaMeta.total_problems || 3392}</div>
                <div className="text-xs text-slate-400">DSA Questions Solved</div>
              </div>
            </Link>

            <Link to="/aptitude" className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-4 hover:border-purple-500/50 transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">{aptitudeStats.solved} / {aptitudeStats.total || 1172}</div>
                <div className="text-xs text-slate-400">Aptitude Problems Solved</div>
              </div>
            </Link>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">14 Days</div>
                <div className="text-xs text-slate-400">Daily Coding Streak</div>
              </div>
            </div>

            <Link to="/mock-interview" className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center gap-4 hover:border-emerald-500/50 transition group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">90%</div>
                <div className="text-xs text-slate-400">Mock Interview Score</div>
              </div>
            </Link>
          </div>

          {/* Placement Modules Quick Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Aptitude Launcher Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/40 backdrop-blur-xl transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {aptitudeStats.total}+ Live Questions
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Campus Aptitude Hub</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Practice Quantitative, Logical Reasoning & Verbal Ability with countdown timers and step-by-step explanations.
                </p>
              </div>
              <Link
                to="/aptitude"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
              >
                <span>Launch Practice Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Company Prep Launcher Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/40 backdrop-blur-xl transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    10 Top Companies
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Company Prep Tracks</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Target TCS, Infosys, Wipro, Accenture, Amazon, and Google with exact OA assessment patterns and problem archives.
                </p>
              </div>
              <Link
                to="/company-prep"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-purple-600/20"
              >
                <span>Explore Company Tracks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* DSA Problem Directory Launcher Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-xl transition flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    3,390+ Problems
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">LeetCode DSA Directory</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Search, filter, and track 3,390+ real interview problems asked across 470 tech companies with live frequency indicators.
                </p>
              </div>
              <Link
                to="/dsa"
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-md shadow-cyan-600/20"
              >
                <span>Browse DSA Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Main Content Split: Recommended DSA & Target Companies */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Recommended DSA Problems */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-400" /> Recommended DSA Challenges
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Top-frequency coding interview questions asked in recent rounds.</p>
                  </div>
                  <Link to="/dsa" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    <span>View All (3,390+)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {displayDSA.map((prob) => (
                    <div 
                      key={prob.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 transition gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 ${
                          prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                          prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {prob.difficulty}
                        </span>
                        <div>
                          <a
                            href={prob.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-sm text-slate-200 hover:text-indigo-300 transition flex items-center gap-1"
                          >
                            <span>{prob.title}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </a>
                          <span className="text-xs text-slate-400">
                            {Array.isArray(prob.topics) ? prob.topics.slice(0, 2).join(', ') : prob.category} • {prob.acceptance_rate || prob.acceptanceRate || 50}% acceptance
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {(prob.companies || []).slice(0, 3).map((c, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700 font-semibold">
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
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" /> Target Companies
                  </h3>
                  <Link to="/company-prep" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                    View All →
                  </Link>
                </div>

                <div className="space-y-4">
                  {displayCompanies.map((company) => {
                    const solved = company.solvedQuestions || 0;
                    const total = company.totalQuestions || 100;
                    const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

                    return (
                      <Link 
                        to={`/company-prep?company=${encodeURIComponent(company.name)}`}
                        key={company.id || company.name} 
                        className="block p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 transition group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner group-hover:scale-110 transition-transform">
                              {company.logo}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                                {company.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{company.role}</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-emerald-400">{solved}/{total}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.max(solved > 0 ? 5 : 0, pct)}%` }}
                          ></div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
