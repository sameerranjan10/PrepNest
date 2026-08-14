import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  BrainCircuit, 
  Code2, 
  Video, 
  Building2, 
  Map, 
  FolderGit2, 
  Bot, 
  Trophy, 
  Users, 
  FileCode2, 
  Settings, 
  User, 
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeRoute?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeRoute = 'dashboard' }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'resume-analyzer', label: 'Resume Analyzer', icon: FileText, href: '/resume-analyzer' },
    { id: 'aptitude', label: 'Aptitude Hub', icon: BrainCircuit, href: '/aptitude' },
    { id: 'dsa', label: 'DSA Directory', icon: Code2, href: '/dsa' },
    { id: 'mock-interview', label: 'Mock Interview', icon: Video, href: '/mock-interview' },
    { id: 'company-prep', label: 'Company Track', icon: Building2, href: '/company-prep' },
    { id: 'roadmaps', label: 'Roadmaps', icon: Map, href: '/roadmaps' },
    { id: 'projects', label: 'Projects', icon: FolderGit2, href: '/projects' },
    { id: 'ai-assistant', label: 'AI Mentor', icon: Bot, href: '/ai-assistant' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
    { id: 'community', label: 'Community', icon: Users, href: '/community' },
    { id: 'notes', label: 'Notes', icon: FileCode2, href: '/notes' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    { id: 'admin', label: 'Admin Panel', icon: ShieldCheck, href: '/admin' },
  ];

  return (
    <aside className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 text-slate-200 flex flex-col h-screen sticky top-0 z-40">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <Code2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
            Prep<span className="text-indigo-400">Nest</span>
          </h1>
          <span className="text-[10px] font-semibold text-indigo-400/80 tracking-widest uppercase bg-indigo-500/10 px-2 py-0.5 rounded-full">
            AI SaaS Pro
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs">
            AJ
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-200 truncate">Alex Johnson</h4>
            <p className="text-[11px] text-slate-400 truncate">Readiness: 86%</p>
          </div>
          <User className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
        </div>
      </div>
    </aside>
  );
};
