import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Flame, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BlurDrop } from '@/components/ui/BlurDrop';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Invalid email or password');
      }

      login(data.user, data.access_token);
      navigate(redirectParam, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#262626] font-sans flex items-center justify-center p-4 md:p-6 selection:bg-[#FFA116] selection:text-white">
      {/* Main Container Card */}
      <BlurDrop className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-sm overflow-hidden">
        
        {/* Left Side: Brand Promo Panel (Clean Light Surface) */}
        <div className="p-8 lg:p-10 bg-[#F7F8FA] border-b lg:border-b-0 lg:border-r border-[#E5E7EB] flex flex-col justify-between space-y-8">
          <div>
            {/* Logo */}
            <div className="mb-8">
              <Link to="/">
                <img
                  src="/logo.png"
                  alt="PrepNest - Prepare • Practice • Place"
                  className="h-11 w-auto object-contain hover:opacity-90 transition-opacity"
                />
              </Link>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#262626] leading-tight mb-3">
              Welcome back to your Placement Dashboard
            </h2>

            <p className="text-sm text-[#64748B] leading-relaxed mb-6">
              Track your DSA problem solving, target company tracks, and follow data-driven roadmaps synchronized in real time.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#262626]">
                <div className="w-5 h-5 rounded-full bg-[#E6FAF6] flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                </div>
                <span>Neon Authentication (PostgreSQL Native Security)</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#262626]">
                <div className="w-5 h-5 rounded-full bg-[#E6FAF6] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                </div>
                <span>Synchronized LeetCode, DSA & Roadmap Tracks</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-[#262626]">
                <div className="w-5 h-5 rounded-full bg-[#E6FAF6] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                </div>
                <span>AI Resume Analyzer & Skill Gap Recommendations</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-xs text-[#64748B] flex items-center gap-3">
            <Flame className="w-4 h-4 text-[#FFA116] flex-shrink-0" />
            <span>Join <strong className="text-[#262626]">12,400+</strong> students actively preparing for top tech drives.</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-10 flex flex-col justify-center bg-[#FFFFFF]">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold text-[#262626]">Sign In</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#E6FAF6] text-[#16A34A] border border-[#16A34A]/20">
                Neon Auth
              </span>
            </div>
            <p className="text-xs text-[#64748B]">Enter your registered credentials to access your dashboard</p>
          </div>

          {searchParams.has('redirect') && (
            <div className="mb-5 p-3 rounded-xl bg-[#FFF8EE] border border-[#FFA116]/30 text-[#D97706] text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-[#FFA116]" />
              <span>Please sign in to access your interactive dashboard and saved progress.</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#FFEBEF] border border-[#DC2626]/20 text-[#DC2626] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#262626] mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#262626] placeholder-[#64748B]/60 focus:outline-none focus:border-[#FFA116] focus:ring-1 focus:ring-[#FFA116] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-[#262626] uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[#262626] placeholder-[#64748B]/60 focus:outline-none focus:border-[#FFA116] focus:ring-1 focus:ring-[#FFA116] transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-[#FFA116] hover:bg-[#e69113] active:bg-[#cc8010] text-white shadow-sm transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating with Neon...' : 'Sign In to Workspace'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Don't have an account?{' '}
            <Link 
              to={`/signup?redirect=${encodeURIComponent(redirectParam)}`} 
              className="text-[#FFA116] font-semibold hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>

      </BlurDrop>
    </div>
  );
}
