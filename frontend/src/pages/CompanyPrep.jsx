import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Building2, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { mockCompanies } from '@/lib/mockData';

export default function CompanyPrepPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="company-prep" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Target Company Preparation Tracks</h1>
              <p className="text-sm text-slate-400">Targeted placement questions, OA pattern sheets & hiring process breakdown.</p>
            </div>
          </div>

          {/* Company Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockCompanies.map((company) => (
              <div key={company.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl hover:border-indigo-500/50 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{company.logo}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {company.hiringDifficulty} Difficulty
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{company.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{company.role}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Questions Solved</span>
                    <span className="text-slate-200 font-bold">{company.solvedQuestions} / {company.totalQuestions}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(company.solvedQuestions / company.totalQuestions) * 100}%` }}></div>
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition">
                  Open {company.name} Track <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
