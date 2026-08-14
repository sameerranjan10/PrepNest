import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, BrainCircuit, Wand2, ShieldCheck, 
  Target, CheckCircle2, Star, Zap, Flame, Trophy, ChevronRight,
  Code2, Users, Play, HelpCircle, ChevronDown, Award
} from 'lucide-react';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Radiant Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[450px] right-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[1100px] left-1/3 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navbar matching Dashboard theme */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Prep<span className="text-indigo-400">Nest</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <a href="#features" className="hover:text-indigo-400 transition-colors">Platform Features</a>
          <a href="#stats" className="hover:text-indigo-400 transition-colors">Success Rates</a>
          <a href="#pricing" className="hover:text-indigo-400 transition-colors">Plans</a>
          <a href="#faq" className="hover:text-indigo-400 transition-colors">FAQ</a>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            to="/login"
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
          >
            Sign In
          </Link>
          <Link 
            to="/signup"
            className="px-5 py-2.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:opacity-95 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
          >
            Start Preparing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wide uppercase shadow-inner">
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" /> #1 AI Platform for SDE & Campus Placements
          </div>

          <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Land Your Dream Tech Offer with{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI Mock Interviews & Custom Prep
            </span>
          </h1>

          <p className="text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            Personalized DSA problem tracks, real-time voice & coding mock interviews, and automated ATS resume scoring engineered for top 5% placement readiness.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link 
              to="/signup"
              className="px-8 py-4 rounded-xl text-base font-extrabold bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-indigo-500/30 flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>

            <Link 
              to="/dashboard"
              className="px-8 py-4 rounded-xl text-base font-bold bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 text-slate-200 backdrop-blur-xl flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg"
            >
              <Play className="w-4 h-4 fill-slate-300" /> View Interactive Dashboard
            </Link>
          </div>

          {/* Live User Activity Banner */}
          <div className="pt-6 flex items-center justify-center gap-6 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              12,400+ Students Active
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.9/5 Student Rating
            </span>
          </div>
        </div>

        {/* Dashboard Preview Glassmorphism Mockup Card */}
        <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-2xl p-4 shadow-2xl shadow-indigo-950/50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs text-slate-400 font-mono ml-2">prepnest.ai/dashboard</span>
            </div>
            <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Placement Radar: 78% Ready
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                <span>Placement Readiness</span>
                <Target className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">78%</div>
              <div className="text-xs text-emerald-400 font-medium">Top 5% Placement Tier</div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                <span>AI Mock Interview Score</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">92/100</div>
              <div className="text-xs text-indigo-400 font-medium">Strong Technical & Communication</div>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase">
                <span>DSA Streak</span>
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">14 Days</div>
              <div className="text-xs text-orange-400 font-medium">84 Solved Problems</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white">
            Everything You Need to Beat Campus Drives
          </h2>
          <p className="text-slate-400 text-base">
            Curated modules tailored specifically for product company recruitment patterns.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 backdrop-blur-xl transition-all hover:-translate-y-1 shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <BrainCircuit className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white">AI Voice & Code Mock Interviews</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Simulate actual Google, Amazon & Microsoft interview rounds with real-time audio conversation and code evaluation.
            </p>
            <div className="pt-2 text-xs font-bold text-indigo-400 flex items-center gap-1">
              Explore AI Interviewer <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-xl transition-all hover:-translate-y-1 shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Code2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Curated DSA Mastery Tracks</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Master Arrays, Graphs, Dynamic Programming and System Design with step-by-step guidance and company frequency tags.
            </p>
            <div className="pt-2 text-xs font-bold text-cyan-400 flex items-center gap-1">
              View Problem Sets <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 backdrop-blur-xl transition-all hover:-translate-y-1 shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Wand2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-white">ATS Resume Score & Optimizer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Scan your resume against job descriptions to extract keyword gaps and boost shortlisting rates up to 3x.
            </p>
            <div className="pt-2 text-xs font-bold text-purple-400 flex items-center gap-1">
              Analyze Resume <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 relative z-10 border-t border-slate-800/60">
        <div className="text-center mb-14 space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Have questions before starting? We have answers.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does the AI Mock Interviewer work?",
              a: "The AI conducts real-time voice interviews tailored to specific roles like SDE 1 or Frontend. It analyzes your spoken answers, code correctness, and time complexity."
            },
            {
              q: "Are the DSA questions updated with actual company tags?",
              a: "Yes! Problems are tagged with frequency data from recent recruitment drives at Amazon, Flipkart, Microsoft, and top tech startups."
            },
            {
              q: "Is there a free trial available?",
              a: "Yes, you can register for free and get full access to practice problems, resume analysis, and starter mock interview rounds."
            }
          ].map((item, idx) => (
            <div 
              key={idx}
              onClick={() => toggleFaq(idx)}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer backdrop-blur-xl transition-all"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-base text-white">{item.q}</h4>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-indigo-400' : ''}`} />
              </div>
              {activeFaq === idx && (
                <p className="mt-4 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-8 text-center text-xs text-slate-500 bg-slate-950">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-300 text-sm">PrepNest</span>
        </div>
        <p>PrepNest © 2026. Engineered for Top Placement Readiness.</p>
      </footer>
    </div>
  );
}
