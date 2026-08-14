import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Bot, Send, Sparkles, User, Code, FileText } from 'lucide-react';

export default function AIAssistantPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="ai-assistant" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-8 flex flex-col h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-400" /> PrepNest AI Placement Mentor
            </h1>
            <p className="text-sm text-slate-400">Ask any code optimization, DSA time complexity, system design, or interview advice question.</p>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-xl overflow-y-auto space-y-6">
            {/* AI Assistant Bubble */}
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                AI
              </div>
              <div className="space-y-2 max-w-2xl">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-200 leading-relaxed">
                  Hello Alex! I am your AI placement mentor. I can analyze your resume, optimize your LC code submissions, or generate custom mock interview questions. What would you like to focus on today?
                </div>
                <div className="flex gap-2">
                  <button className="text-xs bg-slate-800 text-indigo-400 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" /> Optimize LRU Cache Code
                  </button>
                  <button className="text-xs bg-slate-800 text-indigo-400 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Review ATS Resume Impact
                  </button>
                </div>
              </div>
            </div>

            {/* User Message Bubble */}
            <div className="flex gap-4 justify-end">
              <div className="p-4 rounded-2xl bg-indigo-600 text-sm text-white max-w-xl shadow-lg shadow-indigo-500/20">
                Can you explain how to optimize Binary Tree Zigzag Level Order Traversal from O(N^2) to O(N) using a Double-Ended Queue (Deque)?
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0">
                AJ
              </div>
            </div>
          </div>

          {/* Prompt Bar Input */}
          <div className="mt-4 flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <input 
              type="text" 
              placeholder="Ask AI mentor anything (e.g. Explain LRU Cache time complexity)..." 
              className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-200 focus:outline-none placeholder:text-slate-500"
            />
            <button className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
