import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Building2,
  Code2,
  FileSearch,
  FolderGit2,
  Map,
  Video,
} from 'lucide-react';

const REVEAL_EASE = [0.16, 1, 0.3, 1];

export function LandingOverview({ liveData }) {
  const { catalog } = liveData;
  const dsaTotal = catalog?.dsaTotal || 0;
  const aptitudeTotal = catalog?.aptitudeTotal || 0;
  const companyCount = catalog?.companyCount || 0;
  const domainCount = catalog?.domainCount || 0;
  const topicCount = catalog?.topicCount || 0;

  const modules = [
    {
      title: 'DSA Directory',
      to: '/dsa',
      cta: 'Open DSA Directory',
      icon: Code2,
      iconBg: 'bg-[#E6FAF6] dark:bg-[#00B8A3]/15 text-[#00B8A3]',
      badge: dsaTotal >= 3000 ? `${dsaTotal.toLocaleString()} Problems` : dsaTotal > 0 ? `${dsaTotal.toLocaleString()} Qs` : null,
      description:
        dsaTotal >= 3000
          ? '3,000+ coding problems with company tags, difficulty tiers, and topic filters.'
          : 'Curated coding problem bank with company tags, difficulty tiers, and topic filters.',
      chips: ['Easy / Med / Hard', 'Company Tags', 'Topic Filters'],
    },
    {
      title: 'Aptitude Hub',
      to: '/aptitude',
      cta: 'Practice Aptitude',
      icon: BrainCircuit,
      iconBg: 'bg-amber-50 dark:bg-[#FFA116]/15 text-[#D97706] dark:text-[#FFA116]',
      badge: aptitudeTotal > 0 ? `${aptitudeTotal.toLocaleString()} Qs` : null,
      description:
        'Quantitative aptitude, logical reasoning, verbal ability, and timed assessments.',
      chips: ['Quant', 'Logical', 'Verbal', 'Timed Tests'],
    },
    {
      title: 'Company Tracker',
      to: '/company-prep',
      cta: 'Track Companies',
      icon: Building2,
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
      badge: companyCount > 0 ? `${companyCount} Companies` : null,
      description:
        'Company-specific preparation covering hiring patterns, OA rounds, and interview loops.',
      chips: ['Hiring Patterns', 'OA Prep', 'Role Focus'],
    },
    {
      title: 'Learning Roadmaps',
      to: '/roadmaps',
      cta: 'Explore Roadmaps',
      icon: Map,
      iconBg: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
      badge: domainCount > 0 ? `${domainCount} Domains · ${topicCount} Topics` : null,
      description:
        'Structured learning tracks with topic-wise milestones and live completion tracking.',
      chips: ['Core CS', 'DSA Track', 'Milestones'],
    },
    {
      title: 'Resume Analyzer',
      to: '/resume-analyzer',
      cta: 'Analyze Resume',
      icon: FileSearch,
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      badge: 'ATS Scoring',
      description:
        'ATS analysis, role skill-gap identification, and targeted resume bullet improvements.',
      chips: ['ATS Match', 'Skill Gaps', 'Bullet AI'],
    },
    {
      title: 'AI Placement Mentor',
      to: '/ai-assistant',
      cta: 'Ask AI Mentor',
      icon: Bot,
      iconBg: 'bg-[#FFF8EE] dark:bg-[#FFA116]/15 text-[#FF9800]',
      badge: '8 Modes',
      description:
        'Personalized placement guidance, custom study plans, and context-aware DSA help.',
      chips: ['Study Plans', 'DSA Coach', 'Code Review'],
    },
    {
      title: 'Mock Interviews',
      to: '/mock-interview',
      cta: 'Start Interview',
      icon: Video,
      iconBg: 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400',
      badge: 'Adaptive AI',
      description:
        'Technical, HR, Behavioral (STAR), and Mixed rounds with follow-ups and detailed feedback.',
      chips: ['Technical', 'HR & STAR', 'Scorecard'],
    },
    {
      title: 'Projects & Portfolio',
      to: '/projects',
      cta: 'Manage Projects',
      icon: FolderGit2,
      iconBg: 'bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400',
      badge: 'Portfolio',
      description:
        'Showcase builds, track milestones and skills, and prepare project defense answers.',
      chips: ['Milestones', 'GitHub Sync', 'Defense Prep'],
    },
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: REVEAL_EASE }}
          className="max-w-2xl mx-auto text-center mb-12 space-y-3"
        >
          <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/25 text-xs font-bold uppercase tracking-wider text-[#D97706] dark:text-[#FFA116]">
            Platform Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3]">
            Everything You Need to Become Placement Ready
          </h2>
          <p className="text-base sm:text-lg text-[#64748B] dark:text-[#8B949E]">
            One integrated workspace for every stage of your placement preparation.
          </p>
        </motion.div>

        {/* Clean 8-Card Grid with Staggered Entrance & Subtle Hover Lift */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: idx * 0.045, ease: REVEAL_EASE }}
                whileHover={{ y: -4 }}
                className="group p-6 rounded-2xl bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md border border-[#E5E7EB]/90 dark:border-[#30363D] hover:border-[#FF9800]/60 hover:shadow-[0_14px_30px_-14px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_14px_30px_-14px_rgba(0,0,0,0.55)] transition-colors flex flex-col justify-between gap-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${mod.iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    {mod.badge && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] text-[11px] font-semibold text-[#475569] dark:text-[#8B949E] shrink-0">
                        {mod.badge}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-[17px] font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-[#64748B] dark:text-[#8B949E] leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {mod.chips.map((chip) => (
                      <span
                        key={chip}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] text-[11px] font-medium text-[#475569] dark:text-[#8B949E]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={mod.to}
                  className="pt-3.5 border-t border-[#E5E7EB]/80 dark:border-[#21262D] inline-flex items-center justify-between text-[13px] font-bold text-[#FF9800] hover:underline"
                >
                  <span>{mod.cta}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
