import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Code2, UserPlus } from 'lucide-react';

const REVEAL_EASE = [0.16, 1, 0.3, 1];

const STEPS = [
  {
    number: '01',
    title: 'Build Your Profile',
    description: 'Set your target role, technical skills, and target companies.',
    icon: UserPlus,
    tags: ['Target Role', 'Tech Stack', 'Company List'],
  },
  {
    number: '02',
    title: 'Prepare Strategically',
    description:
      'Follow roadmaps, solve coding problems, practice aptitude, and use AI guidance.',
    icon: Code2,
    tags: ['DSA & Aptitude', 'Roadmaps', 'AI Mentor'],
  },
  {
    number: '03',
    title: 'Track Your Progress',
    description:
      'Monitor your readiness, identify skill gaps, and improve through mock interviews.',
    icon: BarChart3,
    tags: ['Readiness Score', 'Resume Gaps', 'Mock Interviews'],
  },
];

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-14 lg:py-18 bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: REVEAL_EASE }}
          className="max-w-2xl mx-auto text-center mb-12 space-y-2.5"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/25 text-[11px] font-bold uppercase tracking-wider text-[#D97706] dark:text-[#FFA116]">
            Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3]">
            How PrepNest Works
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] dark:text-[#8B949E]">
            A focused three-step loop engineered to turn fragmented study into measurable interview readiness.
          </p>
        </motion.div>

        {/* Connected Horizontal 3-Step Grid */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Desktop Animated Connector Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75, ease: REVEAL_EASE }}
            className="hidden lg:block origin-left absolute top-11 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-[#FF9800]/30 via-[#FF9800]/70 to-[#FF9800]/30 z-0"
          />

          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.12, ease: REVEAL_EASE }}
                whileHover={{ y: -4 }}
                className="group relative z-10 flex flex-col"
              >
                <div className="h-full p-6 rounded-2xl bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md border border-[#E5E7EB]/90 dark:border-[#30363D] shadow-xs hover:border-[#FF9800]/60 transition-all flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-[#FF9800] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="text-xs font-extrabold tracking-widest uppercase text-[#FF9800]">
                          STEP {step.number}
                        </span>
                      </div>

                      {idx < STEPS.length - 1 && (
                        <ArrowRight className="hidden lg:block w-4 h-4 text-[#FF9800]/70 transition-transform group-hover:translate-x-1" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[#64748B] dark:text-[#8B949E] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F1F3F5] dark:border-[#21262D] flex flex-wrap gap-1.5">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-md bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E5E7EB] dark:border-[#30363D] text-[11px] font-medium text-[#475569] dark:text-[#8B949E]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
