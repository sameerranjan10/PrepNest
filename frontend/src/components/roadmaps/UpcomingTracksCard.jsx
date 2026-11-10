import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Boxes,
  Cloud,
  Code2,
  Cpu,
  Layers,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';

const UPCOMING_TRACKS = [
  { label: 'System Design (LLD & HLD)', icon: Layers },
  { label: 'Cloud & DevOps', icon: Cloud },
  { label: 'Operating Systems', icon: Cpu },
  { label: 'Computer Networks', icon: Workflow },
  { label: 'TypeScript & Next.js', icon: Boxes },
  { label: 'Security & Auth Patterns', icon: ShieldCheck },
];

export function UpcomingTracksCard({ itemCount = 0 }) {
  const navigate = useNavigate();

  // Fill remaining grid slots cleanly across 2-col (md) and 3-col (lg) breakpoints
  const mdRemainder = itemCount % 2;
  const lgRemainder = itemCount % 3;

  const mdSpanClass = mdRemainder === 1 ? 'md:col-span-1' : 'md:col-span-2';
  const lgSpanClass =
    lgRemainder === 1
      ? 'lg:col-span-2'
      : lgRemainder === 2
      ? 'lg:col-span-1'
      : 'lg:col-span-3';

  const isWideOnDesktop = lgRemainder !== 2;

  return (
    <div
      className={`bg-[#FFFFFF] dark:bg-[#161B22] border border-dashed border-[#CBD5E1] dark:border-[#30363D] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5 h-full shadow-xs ${mdSpanClass} ${lgSpanClass}`}
    >
      <div
        className={`flex flex-col ${
          isWideOnDesktop ? 'lg:flex-row lg:items-start justify-between gap-6' : 'gap-4'
        }`}
      >
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFBEB] dark:bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#D97706] dark:text-[#FBBF24] text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>Stay Tuned</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#1E293B] dark:text-[#E6EDF3] tracking-tight">
            More Specialized Tracks Coming Soon
          </h3>

          <p className="text-xs text-[#64748B] dark:text-[#8B949E] leading-relaxed">
            We are curating new interactive roadmaps covering CS core subjects, system design, and modern deployment workflows. Meanwhile, reinforce problem solving in DSA Directory or generate a custom study plan with AI Mentor.
          </p>
        </div>

        {/* Upcoming Track Chips */}
        <div className={`space-y-2 ${isWideOnDesktop ? 'lg:w-80 shrink-0' : ''}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
            In Curriculum Pipeline
          </p>
          <div className="flex flex-wrap gap-2">
            {UPCOMING_TRACKS.slice(0, lgRemainder === 2 ? 4 : 6).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] text-[11px] font-medium text-[#1E293B] dark:text-[#E6EDF3]"
                >
                  <Icon className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Helpful Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#30363D]">
        <span className="text-[11px] text-[#64748B] dark:text-[#8B949E]">
          New learning milestones and capstone projects are added regularly.
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/dsa')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] dark:bg-[#21262D] dark:hover:bg-[#30363D] border border-[#E2E8F0] dark:border-[#30363D] text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3] transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Practice DSA</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/ai-assistant')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFBEB] dark:bg-[#F59E0B]/15 hover:bg-[#F59E0B] border border-[#F59E0B]/30 hover:border-[#F59E0B] text-xs font-semibold text-[#D97706] dark:text-[#FBBF24] hover:text-white transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Custom Study Plan</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

