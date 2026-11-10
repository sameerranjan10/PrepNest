import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { BlurDrop } from '@/components/ui/BlurDrop';
import { BrandLogo } from '@/components/BrandLogo';
import { 
  ArrowRight, BrainCircuit, Wand2, ShieldCheck, 
  Target, CheckCircle2, Star, Zap, Flame, Trophy, ChevronRight,
  Code2, Play, ChevronDown, LayoutDashboard, Sun, Moon
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#262626] font-sans selection:bg-[#FFA116] selection:text-white relative">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-[#E5E7EB]/80 px-6 lg:px-12 py-3.5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo size="lg" className="hover:opacity-90 transition-opacity" />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
          <a href="#features" className="hover:text-[#262626] transition-colors">Platform Features</a>
          <a href="#stats" className="hover:text-[#262626] transition-colors">Success Rates</a>
          <a href="#faq" className="hover:text-[#262626] transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className="w-9 h-9 rounded-lg border border-[#E5E7EB] bg-white/70 hover:bg-white flex items-center justify-center text-[#64748B] hover:text-[#FFA116] transition cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FFA116]" /> : <Moon className="w-4 h-4" />}
          </button>
          {isAuthenticated ? (
            <Link 
              to="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#FFA116] hover:bg-[#e69113] text-white shadow-sm transition-all flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
            </Link>
          ) : (
            <>
              <Link 
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA] transition-all"
              >
                Sign In
              </Link>
              <Link 
                to="/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#FFA116] hover:bg-[#e69113] text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                Start Preparing <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#FFFFFF] to-[#F7F8FA] border-b border-[#E5E7EB] px-6 pt-16 pb-20">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <BlurDrop className="space-y-6" duration={0.48}>
            {/* Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8EE] border border-[#FFA116]/30 text-[#D97706] text-xs font-semibold tracking-wide uppercase">
              <Flame className="w-3.5 h-3.5 text-[#FFA116]" /> #1 Placement Preparation Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#262626] leading-tight">
              Land Your Dream Tech Offer with{' '}
              <span className="text-[#FFA116]">
                Targeted Prep & Practice
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
              Personalized DSA problem tracks, real-time voice & coding mock interviews, and automated ATS resume scoring engineered for top 5% placement readiness.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link 
                to={isAuthenticated ? "/dashboard" : "/signup?redirect=/dashboard"}
                className="px-7 py-3 rounded-xl text-sm font-semibold bg-[#FFA116] hover:bg-[#e69113] text-white shadow-sm flex items-center gap-2 transition-all"
              >
                {isAuthenticated ? "Open Dashboard" : "Get Started Free"} <ArrowRight className="w-4 h-4" />
              </Link>

              <Link 
                to={isAuthenticated ? "/dashboard" : "/login?redirect=/dashboard"}
                className="px-7 py-3 rounded-xl text-sm font-medium bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#F7F8FA] text-[#262626] shadow-sm flex items-center gap-2 transition-all"
              >
                <Play className="w-3.5 h-3.5 text-[#64748B]" /> View Interactive Dashboard
              </Link>
            </div>

            {/* Live User Activity Banner */}
            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[#64748B] font-medium">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                12,400+ Students Active
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#262626]">
                <Star className="w-3.5 h-3.5 text-[#FFA116] fill-[#FFA116]" /> 4.9/5 Rating
              </span>
            </div>
          </BlurDrop>

          {/* Dashboard Preview Mockup Card */}
          <BlurDrop delay={0.14} duration={0.5} className="mt-12 relative mx-auto max-w-4xl rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-sm overflow-hidden text-left">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#DC2626]/70" />
                <div className="w-3 h-3 rounded-full bg-[#D97706]/70" />
                <div className="w-3 h-3 rounded-full bg-[#16A34A]/70" />
                <span className="text-xs text-[#64748B] font-mono ml-2">prepnest.ai/dashboard</span>
              </div>
              <div className="text-xs font-semibold text-[#FFA116] flex items-center gap-1">
                Placement Radar: 78% Ready
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-1.5">
                <div className="flex justify-between items-center text-xs text-[#64748B] font-semibold uppercase">
                  <span>Placement Readiness</span>
                  <Target className="w-4 h-4 text-[#FFA116]" />
                </div>
                <div className="text-2xl font-bold text-[#262626]">78%</div>
                <div className="text-xs text-[#16A34A] font-medium">Top 5% Placement Tier</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-1.5">
                <div className="flex justify-between items-center text-xs text-[#64748B] font-semibold uppercase">
                  <span>AI Mock Interview Score</span>
                  <Trophy className="w-4 h-4 text-[#FFA116]" />
                </div>
                <div className="text-2xl font-bold text-[#262626]">92/100</div>
                <div className="text-xs text-[#64748B] font-medium">Strong Technical & Communication</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-1.5">
                <div className="flex justify-between items-center text-xs text-[#64748B] font-semibold uppercase">
                  <span>DSA Streak</span>
                  <Flame className="w-4 h-4 text-[#FFA116]" />
                </div>
                <div className="text-2xl font-bold text-[#262626]">14 Days</div>
                <div className="text-xs text-[#FFA116] font-medium">84 Solved Problems</div>
              </div>
            </div>
          </BlurDrop>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#262626]">
            Everything You Need to Ace Placement Drives
          </h2>
          <p className="text-[#64748B] text-sm sm:text-base">
            Curated modules tailored specifically for product company recruitment patterns.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116] transition-all shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8EE] text-[#FFA116] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#262626]">AI Mock Interviews</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Simulate actual company interview rounds with real-time audio conversation, speech analysis, and answer feedback.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#FFA116] flex items-center gap-1">
              Explore AI Interviewer <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116] transition-all shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8EE] text-[#FFA116] flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#262626]">Curated DSA Mastery Tracks</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Master Arrays, Graphs, Dynamic Programming and System Design with step-by-step guidance and company frequency tags.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#FFA116] flex items-center gap-1">
              View Problem Sets <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116] transition-all shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF8EE] text-[#FFA116] flex items-center justify-center">
              <Wand2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#262626]">ATS Resume Score & Optimizer</h3>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Scan your resume against job descriptions to extract keyword gaps, optimize bullet points, and boost shortlisting.
            </p>
            <div className="pt-2 text-xs font-semibold text-[#FFA116] flex items-center gap-1">
              Analyze Resume <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="bg-[#F7F8FA] border-t border-[#E5E7EB] px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#262626]">Frequently Asked Questions</h2>
            <p className="text-[#64748B] text-sm">Have questions before starting? We have answers.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does the AI Mock Interviewer work?",
                a: "The AI conducts structured voice and text interviews tailored to specific roles like SDE 1 or Frontend. It analyzes your spoken answers, key term coverage, and technical articulation."
              },
              {
                q: "Are the DSA questions updated with actual company tags?",
                a: "Yes. Problems are tagged with frequency data from recent recruitment drives at Amazon, Flipkart, Microsoft, Google, and top startups."
              },
              {
                q: "Is there a free trial available?",
                a: "Yes! You can register for free and get full access to practice problems, resume analysis, and starter mock interview rounds."
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                onClick={() => toggleFaq(idx)}
                className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] hover:border-[#FFA116]/60 cursor-pointer shadow-sm transition-all"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm sm:text-base text-[#262626]">{item.q}</h4>
                  <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform ${activeFaq === idx ? 'rotate-180 text-[#FFA116]' : ''}`} />
                </div>
                {activeFaq === idx && (
                  <p className="mt-3 text-sm text-[#64748B] leading-relaxed border-t border-[#E5E7EB] pt-3">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] py-8 px-6 text-center text-xs text-[#64748B] bg-[#FFFFFF]">
        <div className="flex flex-col items-center justify-center gap-1.5 mb-2">
          <img
            src="/logo.png"
            alt="PrepNest - Prepare • Practice • Place"
            className="h-10 w-auto object-contain"
          />
        </div>
        <p>PrepNest © 2026. Engineered for Top Placement Readiness.</p>
      </footer>
    </div>
  );
}
