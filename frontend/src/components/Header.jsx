import React from 'react';
import { Bell, Search, Flame, Zap, Sparkles, Coins } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Bar */}
      <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 px-3.5 py-1.5 rounded-full w-80 focus-within:border-indigo-500 transition-all">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search DSA, Companies, Resumes..." 
          className="bg-transparent text-xs text-slate-200 focus:outline-none w-full placeholder:text-slate-500"
        />
      </div>

      {/* Stats & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Credits Pill */}
        <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{user?.credits ?? 250} AI Credits</span>
        </div>

        {/* Plan Pill */}
        <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/25 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-purple-400" />
          <span>{user?.plan || 'Pro'} Plan</span>
        </div>

        {/* Daily Streak Pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Active Streak</span>
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-full border border-slate-700/60 bg-slate-800/40 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
