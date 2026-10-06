import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { 
  Building2, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  Briefcase, 
  ChevronLeft, 
  Play, 
  Clock, 
  BookOpen, 
  Layers, 
  Award, 
  Target,
  Code2
} from 'lucide-react';
import QuestionDirectory from '@/components/QuestionDirectory';
import { mockCompanies } from '@/lib/mockData';

export default function CompanyPrepPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyFromUrl = searchParams.get('company');

  const [companies, setCompanies] = useState(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyTracks();
  }, []);

  const fetchCompanyTracks = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/companies');
      if (res.ok) {
        const data = await res.json();
        if (data.companies && data.companies.length > 0) {
          setCompanies(data.companies);
          // If URL param is set, match it
          if (companyFromUrl) {
            const matched = data.companies.find(
              (c) => c.name.toLowerCase() === companyFromUrl.toLowerCase()
            );
            if (matched) setSelectedCompany(matched);
          }
        }
      }
    } catch (err) {
      console.log('Using offline mock companies fallback');
    } finally {
      setLoading(false);
    }
  };

  // Sync if URL query param changes
  useEffect(() => {
    if (companyFromUrl && companies.length > 0) {
      const matched = companies.find(
        (c) => c.name.toLowerCase() === companyFromUrl.toLowerCase()
      );
      if (matched) setSelectedCompany(matched);
    } else if (!companyFromUrl) {
      setSelectedCompany(null);
    }
  }, [companyFromUrl, companies]);

  const handleSelectCompany = (comp) => {
    setSelectedCompany(comp);
    setSearchParams({ company: comp.name });
  };

  const handleBackToAll = () => {
    setSelectedCompany(null);
    setSearchParams({});
    // Re-fetch to refresh any newly solved counts
    fetchCompanyTracks();
  };

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.role && c.role.toLowerCase().includes(q));
  });

  const totalBankQuestions = companies.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
  const totalSolvedAcrossCompanies = companies.reduce((acc, curr) => acc + (curr.solvedQuestions || 0), 0);

  const handleStartCompanyMock = (companyName) => {
    navigate(`/aptitude?company=${encodeURIComponent(companyName)}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="company-prep" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* VIEW A: SELECTED COMPANY DEEP DIVE (Problem Hub) */}
          {selectedCompany ? (
            <div className="space-y-6">
              {/* Back Button & Breadcrumbs */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackToAll}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-bold transition shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-indigo-400" />
                  <span>Back to All Companies</span>
                </button>

                <div className="flex flex-wrap items-center gap-3">
                  {selectedCompany.dsaTotal > 0 && (
                    <button
                      onClick={() => navigate(`/dsa?company=${encodeURIComponent(selectedCompany.name)}`)}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs font-bold flex items-center gap-2 transition shadow-sm"
                    >
                      <Code2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Practice {selectedCompany.name} DSA ({selectedCompany.dsaTotal})</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleStartCompanyMock(selectedCompany.name)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Timed {selectedCompany.name} Mock OA</span>
                  </button>
                </div>
              </div>

              {/* Company Profile & OA Pattern Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-2xl space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
                      {selectedCompany.logo}
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="text-xl sm:text-2xl font-black text-white">{selectedCompany.name}</span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            selectedCompany.hiringDifficulty === 'Extreme'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : selectedCompany.hiringDifficulty === 'Hard'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {selectedCompany.hiringDifficulty} Difficulty
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 font-medium">
                        Target Role: <strong className="text-white">{selectedCompany.role}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Company Quick Metrics */}
                  <div className="flex items-center gap-3 sm:gap-4 bg-slate-950/70 p-3 sm:p-3.5 rounded-2xl border border-slate-800">
                    <div className="text-center px-2.5 sm:px-3">
                      <div className="text-xl font-black text-emerald-400">{selectedCompany.solvedQuestions || 0}</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Aptitude Solved</div>
                    </div>
                    <div className="w-px h-8 bg-slate-800" />
                    <div className="text-center px-2.5 sm:px-3">
                      <div className="text-xl font-black text-indigo-400">{selectedCompany.totalQuestions || 0}</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Aptitude Bank</div>
                    </div>
                    {selectedCompany.dsaTotal > 0 && (
                      <>
                        <div className="w-px h-8 bg-slate-800" />
                        <div 
                          onClick={() => navigate(`/dsa?company=${encodeURIComponent(selectedCompany.name)}`)}
                          className="text-center px-2.5 sm:px-3 cursor-pointer hover:opacity-80 transition group"
                          title="Click to view LeetCode DSA questions"
                        >
                          <div className="text-xl font-black text-amber-400 group-hover:scale-105 transition-transform">{selectedCompany.dsaTotal}</div>
                          <div className="text-[10px] font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-0.5 justify-center">
                            LeetCode DSA <ArrowRight className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </>
                    )}
                    <div className="w-px h-8 bg-slate-800" />
                    <div className="text-center px-2.5 sm:px-3">
                      <div className="text-xl font-black text-purple-400">{selectedCompany.progressPercent || 0}%</div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completed</div>
                    </div>
                  </div>
                </div>

                {/* Exam Pattern & Syllabus Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Official Online Assessment (OA) Pattern & Structure</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {selectedCompany.testPattern || 'Online Assessment pattern with Quantitative, Logical, and Verbal rounds.'}
                  </p>
                  {selectedCompany.sections && selectedCompany.sections.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Key Sections:</span>
                      {selectedCompany.sections.map((sec, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                          {sec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Company Question Directory */}
              <QuestionDirectory
                availableCompanies={companies.map((c) => c.name)}
                initialCompany={selectedCompany.name}
                lockCompany={true}
                onStartQuiz={(cat, count, diff, mode, comp, sub) =>
                  handleStartCompanyMock(selectedCompany.name)
                }
              />
            </div>
          ) : (
            /* VIEW B: ALL COMPANIES DIRECTORY GRID */
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Campus Recruitment Archives
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {totalBankQuestions}+ Questions Across {companies.length} Companies
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2 tracking-tight">
                    <Building2 className="w-7 h-7 text-indigo-400" /> Target Company Preparation Tracks
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Explore company-specific aptitude problem banks, track your solved problems module-wise, and simulate online assessments.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl w-full md:w-80 focus-within:border-indigo-500 shadow-sm">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search company (TCS, Google, Infosys...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Company Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCompanies.map((company) => {
                  const solved = company.solvedQuestions || 0;
                  const total = company.totalQuestions || 0;
                  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

                  return (
                    <div
                      key={company.id || company.name}
                      className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-xl hover:border-indigo-500/60 transition-all duration-300 flex flex-col justify-between space-y-5 group hover:shadow-2xl hover:shadow-indigo-500/10"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/50 shadow-inner group-hover:scale-110 transition-transform">
                            {company.logo}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              company.hiringDifficulty === 'Extreme'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : company.hiringDifficulty === 'Hard'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {company.hiringDifficulty}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {company.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{company.role}</p>
                        </div>

                        {/* Test Pattern snippet */}
                        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 line-clamp-2">
                          {company.testPattern || 'Full Campus OA Assessment Pattern'}
                        </div>

                        {/* Solved Progress Bar */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-400">
                              Aptitude: <strong className="text-emerald-400">{solved}</strong> / {total}
                            </span>
                            <span className="text-indigo-300 font-bold">{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(solved > 0 ? 5 : 0, pct)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* LeetCode DSA Count Pill */}
                        {company.dsaTotal > 0 && (
                          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800/60">
                            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                              <Code2 className="w-3 h-3" /> LeetCode DSA
                            </span>
                            <span className="text-slate-300 font-mono text-xs">
                              {company.dsaTotal} Problems
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/60">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSelectCompany(company)}
                            className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1 transition shadow-md shadow-indigo-600/20"
                            title="Browse Aptitude Questions"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Aptitude</span>
                          </button>

                          <button
                            onClick={() => navigate(`/dsa?company=${encodeURIComponent(company.name)}`)}
                            className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-slate-700/80 text-xs font-bold flex items-center justify-center gap-1 transition"
                            title="Practice LeetCode DSA Questions"
                          >
                            <Code2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>DSA ({company.dsaTotal || 0})</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleStartCompanyMock(company.name)}
                          className="w-full py-2 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-800"
                        >
                          <Play className="w-3 h-3 text-indigo-400" />
                          <span>Quick OA Mock</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredCompanies.length === 0 && (
                <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
                  <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-base font-bold text-white">No company found matching "{searchQuery}"</h3>
                  <p className="text-xs text-slate-400">Try searching for TCS, Infosys, Amazon, Google, or Accenture.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
