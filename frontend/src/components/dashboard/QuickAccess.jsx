import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  FileText,
  Map,
  Video,
} from 'lucide-react';

const SHORTCUTS = [
  {
    title: 'Company Tracker',
    description: 'Explore company hiring patterns, OA archives, and interview rounds.',
    to: '/company-prep',
    icon: Building2,
  },
  {
    title: 'Learning Roadmaps',
    description: 'Follow sequential domain milestones and build capstone mini-projects.',
    to: '/roadmaps',
    icon: Map,
  },
  {
    title: 'Resume Analyzer',
    description: 'Check ATS readiness, keyword gaps, and improve bullet points.',
    to: '/resume-analyzer',
    icon: FileText,
  },
  {
    title: 'Mock Interview',
    description: 'Simulate HR and technical interviews with speech capture and feedback.',
    to: '/mock-interview',
    icon: Video,
  },
  {
    title: 'Aptitude Hub',
    description: 'Practice timed quantitative, logical, and verbal placement tests.',
    to: '/aptitude',
    icon: BrainCircuit,
  },
  {
    title: 'AI Placement Mentor',
    description: 'Get instant study sprints, DSA hints, and personalized prep advice.',
    to: '/ai-assistant',
    icon: Bot,
  },
];

export function QuickAccess() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#262626]">Quick Access</h2>
          <p className="text-xs text-[#64748B]">
            Jump directly into any PrepNest preparation workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHORTCUTS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/60 rounded-xl p-4 flex items-center justify-between gap-3 transition-all group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#F7F8FA] group-hover:bg-[#FFF8EE] border border-[#E5E7EB] group-hover:border-[#FFA116]/30 text-[#64748B] group-hover:text-[#FFA116] flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#262626] group-hover:text-[#FFA116] transition-colors truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#FFA116] group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
