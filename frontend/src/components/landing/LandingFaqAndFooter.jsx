import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

const FAQ_ITEMS = [
  {
    q: 'What is PrepNest?',
    a: 'PrepNest is an AI-powered placement preparation platform that brings DSA problem practice, quantitative and logical aptitude drills, company-specific preparation tracks, structured learning roadmaps, ATS resume analysis, AI mentorship, and adaptive mock interviews into one connected workspace.',
  },
  {
    q: 'How does the AI Placement Mentor work?',
    a: 'The AI Placement Mentor reads your live PrepNest preparation context—including solved DSA counts, aptitude scores, active roadmap domain, target company, and latest resume analysis—so its study plans, debugging tips, and technical explanations adapt to where you actually stand.',
  },
  {
    q: 'Are the DSA problems company-specific?',
    a: 'Yes. Problems in the DSA Directory carry company frequency tags (such as Google, Amazon, Microsoft, TCS, Infosys, Accenture, and Flipkart) along with difficulty and topic filters, paired with a Company Tracker summarizing common hiring patterns and rounds.',
  },
  {
    q: 'How do learning roadmaps work?',
    a: 'Learning Roadmaps organize core placement domains—such as Programming Fundamentals, Data Structures & Algorithms, DBMS, Backend Development, Git, and Interview Preparation—into topic-level milestones where you can track completion, save notes, and align gaps found in your resume scan.',
  },
  {
    q: 'Can I practice mock interviews?',
    a: 'Yes. The Mock Interview module conducts turn-by-turn adaptive interviews across Technical, HR, Behavioral (STAR), and Mixed tracks using Realistic, Practice, and Pressure modes with Professional, Friendly, or Strict interviewer styles and a structured evaluation report at the end.',
  },
  {
    q: 'Is PrepNest free to use?',
    a: 'You can create a free account and access the DSA Directory, Aptitude Hub, Learning Roadmaps, Company Tracker, Resume Analyzer, AI Mentor, and Mock Interviews directly from your PrepNest workspace.',
  },
];

export function LandingFaqAndFooter({ isAuthenticated }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      {/* 8. FAQ SECTION */}
      <section id="faq" className="py-14 lg:py-18 bg-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/25 text-[11px] font-bold uppercase tracking-wider text-[#D97706] dark:text-[#FFA116]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#64748B] dark:text-[#8B949E]">
              Everything you need to know before starting your placement prep on PrepNest.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.q}
                  className={`rounded-2xl border transition-colors ${
                    isOpen
                      ? 'bg-[#FFFDF9] dark:bg-[#161B22] border-[#FF9800]/50'
                      : 'bg-[#F8FAFC] dark:bg-[#161B22]/70 border-[#E5E7EB] dark:border-[#30363D] hover:border-[#FF9800]/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 text-[#FF9800]'
                          : 'text-[#64748B] dark:text-[#8B949E]'
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E] leading-relaxed border-t border-[#E5E7EB]/60 dark:border-[#21262D]">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA SECTION */}
      <section className="py-12 lg:py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-[#E5E7EB]/90 dark:border-[#30363D] bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FF9800]/25 text-[11px] font-bold uppercase tracking-wider text-[#D97706] dark:text-[#FFA116]">
                  Prepare. Practice. Place.
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#1E293B] dark:text-[#E6EDF3] leading-tight">
                  Your Dream Tech Career Starts Here.
                </h2>
                <p className="text-sm sm:text-base text-[#64748B] dark:text-[#8B949E] leading-relaxed">
                  Build your skills, practice consistently, and take control of your placement journey with PrepNest.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <motion.div whileHover={{ y: -2, scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                    <Link
                      to={isAuthenticated ? '/dashboard' : '/signup?redirect=/dashboard'}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#FF9800] hover:bg-[#E68900] text-white shadow-sm transition-all"
                    >
                      <span>Start Your Preparation</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      className="inline-flex items-center px-5 py-3 rounded-xl text-sm font-semibold border border-[#E5E7EB] dark:border-[#30363D] text-[#1E293B] dark:text-[#E6EDF3] hover:border-[#FF9800]/60 transition-all"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>

              <div className="lg:col-span-6">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="rounded-2xl overflow-hidden dark:bg-[#FFF9F2] dark:p-2 dark:ring-1 dark:ring-white/15"
                >
                  <img
                    src="/illustrations/ai-mentor.jpg"
                    alt="Student planning their placement preparation with AI Mentor guidance, checklists, and analytics on PrepNest"
                    className="w-full h-auto aspect-[3/2] object-cover block rounded-xl mix-blend-multiply dark:mix-blend-normal [mask-image:radial-gradient(ellipse_96%_94%_at_50%_50%,#000_78%,transparent_100%)] dark:[mask-image:none]"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-[#E5E7EB] dark:border-[#21262D]">
            <div className="lg:col-span-5 space-y-3">
              <Link to="/" className="inline-flex items-center">
                <BrandLogo size="lg" />
              </Link>
              <p className="text-xs font-bold uppercase tracking-wider text-[#FF9800]">
                Prepare. Practice. Place.
              </p>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E] max-w-sm leading-relaxed">
                AI-powered placement preparation combining curated DSA coding problems, aptitude assessments, roadmaps, company tracking, and realistic mock interviews.
              </p>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3]">
                Platform
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E]">
                <li>
                  <Link to="/dashboard" className="hover:text-[#FF9800] transition">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/dsa" className="hover:text-[#FF9800] transition">
                    DSA Directory
                  </Link>
                </li>
                <li>
                  <Link to="/aptitude" className="hover:text-[#FF9800] transition">
                    Aptitude Hub
                  </Link>
                </li>
                <li>
                  <Link to="/roadmaps" className="hover:text-[#FF9800] transition">
                    Learning Roadmaps
                  </Link>
                </li>
                <li>
                  <Link to="/leaderboard" className="hover:text-[#FF9800] transition">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3]">
                Features
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E]">
                <li>
                  <Link to="/company-prep" className="hover:text-[#FF9800] transition">
                    Company Tracker
                  </Link>
                </li>
                <li>
                  <Link to="/resume-analyzer" className="hover:text-[#FF9800] transition">
                    Resume Analyzer
                  </Link>
                </li>
                <li>
                  <Link to="/ai-assistant" className="hover:text-[#FF9800] transition">
                    AI Placement Mentor
                  </Link>
                </li>
                <li>
                  <Link to="/mock-interview" className="hover:text-[#FF9800] transition">
                    Mock Interviews
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="hover:text-[#FF9800] transition">
                    Projects &amp; Portfolio
                  </Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3]">
                Get Started
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E]">
                <li>
                  <a href="#features" className="hover:text-[#FF9800] transition">
                    Platform Overview
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#FF9800] transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-[#FF9800] transition">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#FF9800] transition">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-[#FF9800] transition">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#64748B] dark:text-[#8B949E]">
            <p>&copy; {new Date().getFullYear()} PrepNest. All rights reserved.</p>
            <p>Prepare. Practice. Place.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
