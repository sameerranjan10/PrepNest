import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { mockResumeAnalysis } from '@/lib/mockData';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Download } from 'lucide-react';

export default function ResumeAnalyzerPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="resume-analyzer" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white">AI Resume Analyzer & ATS Optimizer</h1>
              <p className="text-sm text-slate-400">Upload your software engineer resume to evaluate ATS compatibility & job keyword match.</p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20">
              <Download className="w-4 h-4" /> Download Detailed Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Drag & Drop Uploader */}
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 transition-all rounded-2xl bg-slate-900/60 p-8 text-center flex flex-col items-center justify-center gap-4 backdrop-blur-xl cursor-pointer">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Drop your Resume PDF / DOCX here</h3>
                  <p className="text-xs text-slate-400 mt-1">Supports PDF, DOCX up to 10MB</p>
                </div>
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                  Select File
                </span>
              </div>

              {/* Active Document Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Alex_Johnson_Resume_2026.pdf</h4>
                    <p className="text-[10px] text-slate-400">Scanned 2 hours ago</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">Scanned</span>
              </div>
            </div>

            {/* Right 2 Columns: ATS Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              {/* ATS Scores */}
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall ATS Score</h4>
                    <div className="text-4xl font-extrabold text-white mt-2">{mockResumeAnalysis.atsScore} / 100</div>
                    <span className="text-xs text-emerald-400 mt-1 inline-block">High Interview Callback Rate</span>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold text-white">
                    {mockResumeAnalysis.atsScore}%
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keyword Match Rate</h4>
                    <div className="text-4xl font-extrabold text-white mt-2">{mockResumeAnalysis.keywordMatchPercentage}%</div>
                    <span className="text-xs text-indigo-400 mt-1 inline-block">Target: SDE-1 / Fullstack</span>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500 flex items-center justify-center font-bold text-white">
                    {mockResumeAnalysis.keywordMatchPercentage}%
                  </div>
                </div>
              </div>

              {/* Strengths & Missing Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4" /> Detected Strengths
                  </h3>
                  <ul className="space-y-3 text-xs text-slate-300">
                    {mockResumeAnalysis.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span> {str}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
                  <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4" /> Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {mockResumeAnalysis.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
