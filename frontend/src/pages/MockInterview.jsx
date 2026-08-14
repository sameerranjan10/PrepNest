import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Video, Mic, Sparkles, User, Play, Square, Award } from 'lucide-react';
import { mockInterviews } from '@/lib/mockData';

export default function MockInterviewPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="mock-interview" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-white">AI Interactive Mock Interview Room</h1>
              <p className="text-sm text-slate-400">Practice real-time technical and HR behavioral interviews with instant confidence & answer analysis.</p>
            </div>
            <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20">
              <Play className="w-4 h-4 fill-white" /> Launch Live Practice Room
            </button>
          </div>

          {/* Interactive Room Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Video Feed & Questions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Camera Preview Placeholder */}
              <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-indigo-400">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="text-sm font-semibold text-slate-300">Camera & Microphone Preview</div>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> WebCam Active
                  </span>
                </div>

                {/* AI Interviewer Inset Card */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl flex items-center gap-3 w-64 shadow-lg">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">AI Senior Interviewer</h4>
                    <p className="text-[10px] text-indigo-400">Listening to your response...</p>
                  </div>
                </div>
              </div>

              {/* Current Question Panel */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Question 2 of 5</span>
                  <span className="text-xs font-mono text-slate-400">Timer: 02:45</span>
                </div>
                <h3 className="text-lg font-bold text-white">
                  "Explain the difference between optimistic concurrency control and pessimistic locking in database architecture."
                </h3>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition">
                    <Mic className="w-3.5 h-3.5" /> Start Answering
                  </button>
                  <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition">
                    <Square className="w-3.5 h-3.5" /> End Session
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: AI Analytics & Confidence Meter */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Real-time Confidence Analytics
                </h3>

                {/* Meter */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-400">Confidence Score</span>
                    <span className="text-indigo-400">88%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-slate-400">Pacing & Speech Clarity</span>
                    <span className="text-emerald-400">92%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                {/* Feedback Log */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Past Session Reports</h4>
                  {mockInterviews.map((sess) => (
                    <div key={sess.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span>{sess.company}</span>
                        <span className="text-emerald-400">{sess.score}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{sess.feedback}</p>
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
