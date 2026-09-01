import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), email: email.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      login(data.user, data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container Split View for Desktop */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Brand Perks Panel */}
        <div className="p-8 lg:p-10 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-black text-white">
                Prep<span className="text-indigo-400">Nest</span>
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-4">
              Unlock Your SDE Placement Track
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Create a free account to benchmark your placement readiness score and start practicing with AI mock interviewers.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 text-xs font-semibold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold">Real-time Voice Mock Interviews</div>
                  <div className="text-slate-400 font-normal">Practice technical & HR rounds</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs font-semibold text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold">Curated Company DSA Sets</div>
                  <div className="text-slate-400 font-normal">Amazon, Microsoft & Google tags</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <span>FastAPI Backend Security with NeonDB Cloud PostgreSQL.</span>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-1">Create Account</h3>
            <p className="text-xs text-slate-400">Start your placement preparation for free</p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Get Started Free'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
