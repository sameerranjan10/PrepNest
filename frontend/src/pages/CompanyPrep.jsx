import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Building2, Search, ArrowRight, CheckCircle2, Sparkles, Filter, Briefcase } from 'lucide-react';
import { mockCompanies } from '@/lib/mockData';

export default function CompanyPrepPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState(mockCompanies);
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
        }
      }
    } catch (err) {
      console.log('Using offline mock companies fallback');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.role && c.role.toLowerCase().includes(q));
  });

  const totalBankQuestions = companies.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);

  const handleStartCompanyTrack = (companyName) => {
    navigate(`/aptitude?company=${encodeURIComponent(companyName)}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="company-prep" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Campus Recruitment Archives
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {totalBankQuestions}+ Questions Active
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-6 h-6 text-indigo-400" /> Target Company Preparation Tracks
              </h1>
              <p className="text-sm text-slate-400">
                Company-tagged questions, online assessment patterns, and interview syllabus archives.
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl w-full md:w-72 focus-within:border-indigo-500">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search company (TCS, Google...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Company Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id || company.name}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 shadow-inner">
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
                      {company.hiringDifficulty} Difficulty
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {company.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{company.role}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400">Question Pool</span>
                      <span className="text-indigo-300 font-bold">{company.totalQuestions} Questions</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(15, Math.min(100, ((company.totalQuestions || 50) / 150) * 100))}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartCompanyTrack(company.name)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md hover:shadow-indigo-500/20"
                >
                  Practice {company.name} OA <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No company found matching "{searchQuery}"</h3>
              <p className="text-xs text-slate-400">Try searching for TCS, Infosys, Amazon, Google, or Accenture.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
