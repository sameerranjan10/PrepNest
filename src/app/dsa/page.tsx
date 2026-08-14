'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { mockDSAProblems } from '@/lib/mockData';
import { Code2, Filter, Search, Bookmark, CheckCircle, ExternalLink } from 'lucide-react';

export default function DSAPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="dsa" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white">DSA Problem Directory</h1>
              <p className="text-sm text-slate-400">Curated LeetCode & HackerRank pattern sheets for tier-1 tech companies.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                84 / 150 Solved
              </span>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 px-3.5 py-1.5 rounded-lg w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search title, tag..." className="bg-transparent text-xs text-slate-200 focus:outline-none w-full" />
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                <Filter className="w-3.5 h-3.5" /> Difficulty
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                Category
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300">
                Company Tags
              </button>
            </div>
          </div>

          {/* DSA Directory Table */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-xs text-slate-400 uppercase font-semibold">
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Difficulty</th>
                  <th className="py-4 px-6">Acceptance</th>
                  <th className="py-4 px-6">Target Companies</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {mockDSAProblems.map((prob) => (
                  <tr key={prob.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6">
                      {prob.solved ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-700"></div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {prob.title}
                        {prob.bookmarked && <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">{prob.category}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                        prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                        prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {prob.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">{prob.acceptanceRate}%</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-1.5">
                        {prob.companies.map(c => (
                          <span key={c} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium inline-flex items-center gap-1">
                        Solve <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
