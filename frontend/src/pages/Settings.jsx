import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  GraduationCap,
  Code2,
  Share2,
  Sliders,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Trophy,
  Flame,
  Award,
  Building2,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  FileText,
  KeyRound,
  Trash2,
  Plus,
  Zap,
  Globe,
  Terminal,
  Cpu
} from 'lucide-react';

const SUGGESTED_SKILLS = [
  'Data Structures & Algorithms',
  'Python',
  'Java',
  'C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'PostgreSQL',
  'MongoDB',
  'System Design',
  'Docker',
  'Kubernetes',
  'AWS',
  'Git & GitHub',
  'SQL',
  'Machine Learning',
  'Tailwind CSS'
];

const SUGGESTED_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'Uber',
  'Atlassian',
  'Goldman Sachs',
  'Netflix',
  'Adobe',
  'Salesforce',
  'Oracle',
  'Flipkart',
  'Swiggy',
  'Zomato',
  'Cisco'
];

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }

  // Form State
  const [formData, setFormData] = useState({
    // Personal
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    target_role: 'Software Development Engineer (SDE-1)',
    target_companies: ['Google', 'Microsoft', 'Amazon'],
    skills: ['Data Structures & Algorithms', 'Python', 'React', 'SQL'],
    
    // Academic
    college: '',
    degree: 'B.Tech / B.E. Computer Science',
    grad_year: 2026,
    current_semester: 'Semester 6',
    cgpa: '',
    tenth_percentage: '',
    twelfth_percentage: '',
    
    // Coding Platforms
    leetcode_username: '',
    hackerrank_username: '',
    codechef_username: '',
    codeforces_username: '',
    gfg_username: '',
    
    // Social / Portfolio
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    resume_url: '',
    
    // Preferences
    preferred_language: 'Python',
    daily_dsa_goal: 2,
    daily_aptitude_goal: 1,
    prep_level: 'Intermediate',
    email_notifications: true
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Custom Tag Inputs
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newCompanyInput, setNewCompanyInput] = useState('');

  // Prepopulate from user context
  useEffect(() => {
    if (user) {
      // Parse JSON or comma-separated lists if needed
      let userSkills = ['Data Structures & Algorithms', 'Python', 'React', 'SQL'];
      if (user.skills) {
        try {
          userSkills = typeof user.skills === 'string' && user.skills.startsWith('[') 
            ? JSON.parse(user.skills) 
            : user.skills.split(',').map(s => s.trim()).filter(Boolean);
        } catch {
          userSkills = [user.skills];
        }
      }

      let userCompanies = ['Google', 'Microsoft', 'Amazon'];
      if (user.target_companies) {
        try {
          userCompanies = typeof user.target_companies === 'string' && user.target_companies.startsWith('[')
            ? JSON.parse(user.target_companies)
            : user.target_companies.split(',').map(s => s.trim()).filter(Boolean);
        } catch {
          userCompanies = [user.target_companies];
        }
      }

      setFormData({
        full_name: user.full_name || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        target_role: user.target_role || 'Software Development Engineer (SDE-1)',
        target_companies: userCompanies,
        skills: userSkills,
        college: user.college || '',
        degree: user.degree || 'B.Tech / B.E. Computer Science',
        grad_year: user.grad_year || 2026,
        current_semester: user.current_semester || 'Semester 6',
        cgpa: user.cgpa || '',
        tenth_percentage: user.tenth_percentage || '',
        twelfth_percentage: user.twelfth_percentage || '',
        leetcode_username: user.leetcode_username || '',
        hackerrank_username: user.hackerrank_username || '',
        codechef_username: user.codechef_username || '',
        codeforces_username: user.codeforces_username || '',
        gfg_username: user.gfg_username || '',
        github_url: user.github_url || '',
        linkedin_url: user.linkedin_url || '',
        portfolio_url: user.portfolio_url || '',
        resume_url: user.resume_url || '',
        preferred_language: user.preferred_language || 'Python',
        daily_dsa_goal: user.daily_dsa_goal ?? 2,
        daily_aptitude_goal: user.daily_aptitude_goal ?? 1,
        prep_level: user.prep_level || 'Intermediate',
        email_notifications: user.email_notifications ?? true
      });
    }
  }, [user]);

  // Calculate Profile Completion
  const calculateCompletion = () => {
    let score = 0;
    const checks = [
      formData.full_name,
      formData.phone,
      formData.bio,
      formData.college,
      formData.degree,
      formData.cgpa,
      formData.tenth_percentage || formData.twelfth_percentage,
      formData.leetcode_username,
      formData.hackerrank_username,
      formData.github_url,
      formData.linkedin_url,
      formData.skills.length > 0,
      formData.target_companies.length > 0
    ];

    const completed = checks.filter(Boolean).length;
    score = Math.round((completed / checks.length) * 100);
    return score;
  };

  const completionScore = calculateCompletion();

  // Handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (skillToAdd) => {
    const val = (skillToAdd || newSkillInput).trim();
    if (val && !formData.skills.includes(val)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, val] }));
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleAddCompany = (compToAdd) => {
    const val = (compToAdd || newCompanyInput).trim();
    if (val && !formData.target_companies.includes(val)) {
      setFormData(prev => ({ ...prev, target_companies: [...prev.target_companies, val] }));
      setNewCompanyInput('');
    }
  };

  const handleRemoveCompany = (compToRemove) => {
    setFormData(prev => ({ ...prev, target_companies: prev.target_companies.filter(c => c !== compToRemove) }));
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const payload = {
        ...formData,
        target_companies: JSON.stringify(formData.target_companies),
        skills: JSON.stringify(formData.skills),
        grad_year: Number(formData.grad_year) || 2026,
        daily_dsa_goal: Number(formData.daily_dsa_goal) || 2,
        daily_aptitude_goal: Number(formData.daily_aptitude_goal) || 1
      };

      const result = await updateProfile(payload);
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: result.warning 
            ? 'Profile saved locally! (Backend server offline)' 
            : 'Profile and Academic settings updated successfully!'
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save changes'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordStatus({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordStatus({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(passwordData.current_password, passwordData.new_password);
      setPasswordStatus({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordStatus({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setIsChangingPass(false);
      setTimeout(() => setPasswordStatus(null), 5000);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User, desc: 'Name, bio & target roles' },
    { id: 'academic', label: 'Academics', icon: GraduationCap, desc: 'College, GPA & batches' },
    { id: 'coding', label: 'Coding Platforms', icon: Code2, desc: 'LeetCode & HackerRank' },
    { id: 'social', label: 'Social & Links', icon: Share2, desc: 'GitHub, LinkedIn & Resume' },
    { id: 'preferences', label: 'Prep Goals & AI', icon: Sliders, desc: 'Daily targets & language' },
    { id: 'security', label: 'Account & Security', icon: ShieldCheck, desc: 'Password & subscription' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="settings" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-6 md:p-8 space-y-8 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {/* Header Banner & Profile Summary */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-slate-800/80 p-6 md:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Profile Card & Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20">
                    <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-extrabold text-2xl text-white">
                      {getInitials(formData.full_name || user?.full_name)}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-950" title="Profile Active" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                      {formData.full_name || 'Student Profile'}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {user?.plan || 'Pro'} Member
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {formData.email || user?.email || 'student@prepnest.ai'}
                    {formData.location && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {formData.location}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-indigo-300 font-medium">
                    Targeting: <span className="text-white font-semibold">{formData.target_role}</span>
                  </p>
                </div>
              </div>

              {/* Placement Readiness / Profile Completion Bar */}
              <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 md:p-5 w-full md:w-80 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" /> Profile Strength
                  </span>
                  <span className="text-sm font-extrabold text-indigo-400">{completionScore}%</span>
                </div>

                {/* Progress track */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {completionScore === 100 
                    ? '🎉 Profile 100% complete! Ready for campus placement drives.'
                    : 'Add your LeetCode, HackerRank & Academic CGPA for optimal AI recommendations.'}
                </p>
              </div>

            </div>
          </div>

          {/* Feedback Alert */}
          {statusMessage && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all animate-fadeIn ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* Settings Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column: Tab List */}
            <div className="lg:col-span-4 space-y-2">
              <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3 space-y-1 shadow-lg sticky top-24">
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Settings Sections
                </div>

                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left flex items-start gap-3.5 p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white font-semibold shadow-lg shadow-indigo-500/20'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{tab.label}</div>
                        <div className={`text-[11px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {tab.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Save All Shortcut */}
                <div className="pt-4 mt-2 border-t border-slate-800/80 px-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving Changes...' : 'Save All Changes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Tab Content Panels */}
            <div className="lg:col-span-8 space-y-6">

              {/* ------------------------------------------------------------- */}
              {/* TAB 1: PERSONAL INFORMATION */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'personal' && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-400" /> Personal Details & Aspirations
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage your profile identification, contact data, target job role, and dream companies.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Full Name</label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Email Address (Read-only)</label>
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Location (City, Country)</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g. Bengaluru, India"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Bio / Professional Summary</label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Passionate computer science student aspiring for SDE roles, skilled in DSA, React, and Python systems..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition resize-none"
                    />
                  </div>

                  {/* Target Role */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Target Role / Career Goal</label>
                    <select
                      value={formData.target_role}
                      onChange={(e) => handleInputChange('target_role', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                    >
                      <option value="Software Development Engineer (SDE-1)">Software Development Engineer (SDE-1)</option>
                      <option value="Frontend Engineer">Frontend Engineer (React / Next.js)</option>
                      <option value="Backend Engineer">Backend Engineer (Python / Java / Go)</option>
                      <option value="Full Stack Developer">Full Stack Developer</option>
                      <option value="Data Scientist & AI/ML Engineer">Data Scientist & AI/ML Engineer</option>
                      <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                      <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                    </select>
                  </div>

                  {/* Target Companies */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-400" /> Target Dream Companies
                    </label>

                    {/* Selected Badges */}
                    <div className="flex flex-wrap gap-2">
                      {formData.target_companies.map((comp) => (
                        <span 
                          key={comp}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300"
                        >
                          {comp}
                          <button
                            type="button"
                            onClick={() => handleRemoveCompany(comp)}
                            className="hover:text-rose-400 transition"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Custom Company */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCompanyInput}
                        onChange={(e) => setNewCompanyInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCompany())}
                        placeholder="Add company (e.g. Nvidia, Stripe)..."
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCompany()}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    {/* Suggestions */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-500 py-0.5">Suggestions:</span>
                      {SUGGESTED_COMPANIES.filter(c => !formData.target_companies.includes(c)).slice(0, 6).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleAddCompany(c)}
                          className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition"
                        >
                          + {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-400" /> Primary Skills & Tech Stack
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span 
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-rose-400 transition"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        placeholder="Add skill (e.g. Redis, GraphQL)..."
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkill()}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    {/* Suggestions */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-500 py-0.5">Quick Add:</span>
                      {SUGGESTED_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 6).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleAddSkill(s)}
                          className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Personal Details'}
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 2: ACADEMICS & EDUCATION */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'academic' && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-400" /> Academic & Educational Credentials
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Add your university, graduation batch, CGPA, and board results for company campus recruitment criteria.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-300">College / University Name</label>
                      <input
                        type="text"
                        value={formData.college}
                        onChange={(e) => handleInputChange('college', e.target.value)}
                        placeholder="e.g. National Institute of Technology / IIT / Anna University"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Degree & Specialization</label>
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={(e) => handleInputChange('degree', e.target.value)}
                        placeholder="e.g. B.Tech Computer Science & Engineering"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Graduation Year / Batch</label>
                      <select
                        value={formData.grad_year}
                        onChange={(e) => handleInputChange('grad_year', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                      >
                        <option value={2024}>2024 Batch</option>
                        <option value={2025}>2025 Batch</option>
                        <option value={2026}>2026 Batch</option>
                        <option value={2027}>2027 Batch</option>
                        <option value={2028}>2028 Batch</option>
                        <option value={2029}>2029 Batch</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Current Semester / Year</label>
                      <select
                        value={formData.current_semester}
                        onChange={(e) => handleInputChange('current_semester', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                      >
                        <option value="Semester 1">Semester 1 (1st Year)</option>
                        <option value="Semester 2">Semester 2 (1st Year)</option>
                        <option value="Semester 3">Semester 3 (2nd Year)</option>
                        <option value="Semester 4">Semester 4 (2nd Year)</option>
                        <option value="Semester 5">Semester 5 (3rd Year)</option>
                        <option value="Semester 6">Semester 6 (3rd Year)</option>
                        <option value="Semester 7">Semester 7 (Final Year)</option>
                        <option value="Semester 8">Semester 8 (Final Year)</option>
                        <option value="Graduated">Graduated / Alumni</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">College CGPA / Grade (out of 10.0)</label>
                      <input
                        type="text"
                        value={formData.cgpa}
                        onChange={(e) => handleInputChange('cgpa', e.target.value)}
                        placeholder="e.g. 8.75 or 85%"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Class 10th (Secondary) Percentage / CGPA</label>
                      <input
                        type="text"
                        value={formData.tenth_percentage}
                        onChange={(e) => handleInputChange('tenth_percentage', e.target.value)}
                        placeholder="e.g. 92.4% or 9.6 CGPA"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Class 12th / Diploma Percentage</label>
                      <input
                        type="text"
                        value={formData.twelfth_percentage}
                        onChange={(e) => handleInputChange('twelfth_percentage', e.target.value)}
                        placeholder="e.g. 89.2%"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Criteria Notice */}
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-300">
                    <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Many tier-1 companies (like Microsoft, Google, Goldman Sachs) require minimum 7.0+ CGPA and 60%+ in 10th/12th for campus shortlist eligibility. Keeping these updated helps PrepNest filter eligible opportunities for you.
                    </span>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Academic Details'}
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 3: CODING PLATFORMS (LeetCode, HackerRank, etc.) */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'coding' && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-amber-400" /> Competitive Programming & Coding Profiles
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Link your LeetCode, HackerRank, CodeChef, and Codeforces handles to track problem stats and placement index.
                    </p>
                  </div>

                  <div className="space-y-5">

                    {/* LEETCODE CARD */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-amber-500/50 transition-all space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
                            ⚡
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">LeetCode Profile</h3>
                            <p className="text-xs text-slate-400">DSA problem count, contest rating & streak</p>
                          </div>
                        </div>

                        {formData.leetcode_username && (
                          <a
                            href={`https://leetcode.com/${formData.leetcode_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20"
                          >
                            View Profile <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">LeetCode Username</label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-2.5 text-xs text-slate-500">leetcode.com/</span>
                            <input
                              type="text"
                              value={formData.leetcode_username}
                              onChange={(e) => handleInputChange('leetcode_username', e.target.value.trim())}
                              placeholder="username"
                              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl pl-28 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* HACKERRANK CARD */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-emerald-500/50 transition-all space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                            🟩
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">HackerRank Profile</h3>
                            <p className="text-xs text-slate-400">Problem solving stars, badges & skill certificates</p>
                          </div>
                        </div>

                        {formData.hackerrank_username && (
                          <a
                            href={`https://hackerrank.com/${formData.hackerrank_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20"
                          >
                            View Profile <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">HackerRank Username</label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-2.5 text-xs text-slate-500">hackerrank.com/</span>
                            <input
                              type="text"
                              value={formData.hackerrank_username}
                              onChange={(e) => handleInputChange('hackerrank_username', e.target.value.trim())}
                              placeholder="username"
                              className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-32 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CODECHEF & CODEFORCES & GFG GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                      {/* Codeforces */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">Codeforces</span>
                          {formData.codeforces_username && (
                            <a 
                              href={`https://codeforces.com/profile/${formData.codeforces_username}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                            >
                              Link <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formData.codeforces_username}
                          onChange={(e) => handleInputChange('codeforces_username', e.target.value.trim())}
                          placeholder="Handle"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                      </div>

                      {/* CodeChef */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">CodeChef</span>
                          {formData.codechef_username && (
                            <a 
                              href={`https://www.codechef.com/users/${formData.codechef_username}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                            >
                              Link <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formData.codechef_username}
                          onChange={(e) => handleInputChange('codechef_username', e.target.value.trim())}
                          placeholder="Handle"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                      </div>

                      {/* GeeksforGeeks */}
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">GeeksforGeeks</span>
                          {formData.gfg_username && (
                            <a 
                              href={`https://auth.geeksforgeeks.org/user/${formData.gfg_username}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-0.5"
                            >
                              Link <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formData.gfg_username}
                          onChange={(e) => handleInputChange('gfg_username', e.target.value.trim())}
                          placeholder="Username"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
                        />
                      </div>

                    </div>

                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Coding Profiles'}
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 4: SOCIAL & PORTFOLIO LINKS */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'social' && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-indigo-400" /> Social, Portfolio & Resume Links
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Showcase your open source code, professional network, personal web projects, and resume PDF.
                    </p>
                  </div>

                  <div className="space-y-4">
                    
                    {/* GitHub */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">GitHub Profile URL</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="url"
                          value={formData.github_url}
                          onChange={(e) => handleInputChange('github_url', e.target.value)}
                          placeholder="https://github.com/username"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">LinkedIn Profile URL</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="url"
                          value={formData.linkedin_url}
                          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Portfolio */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Personal Portfolio / Website</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="url"
                          value={formData.portfolio_url}
                          onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                          placeholder="https://myportfolio.dev"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Resume Link */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Resume Link (Google Drive / PDF / Hosted)</label>
                      <div className="relative">
                        <FileText className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="url"
                          value={formData.resume_url}
                          onChange={(e) => handleInputChange('resume_url', e.target.value)}
                          placeholder="https://drive.google.com/file/d/.../view"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition"
                        />
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Links'}
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 5: PREP GOALS & AI PREFERENCES */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'preferences' && (
                <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-indigo-400" /> Preparation Goals & AI Mentor Settings
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Customize daily problem-solving targets, preferred programming language, and alert notifications.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Language */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Preferred Coding Language</label>
                      <select
                        value={formData.preferred_language}
                        onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                      >
                        <option value="Python">Python 3</option>
                        <option value="C++">C++ (C++20)</option>
                        <option value="Java">Java (JDK 21)</option>
                        <option value="JavaScript">JavaScript (Node.js)</option>
                        <option value="TypeScript">TypeScript</option>
                        <option value="Go">Golang</option>
                      </select>
                    </div>

                    {/* Prep Level */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Preparation Difficulty Tier</label>
                      <select
                        value={formData.prep_level}
                        onChange={(e) => handleInputChange('prep_level', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                      >
                        <option value="Beginner">Beginner (Foundations & Easy)</option>
                        <option value="Intermediate">Intermediate (Standard SDE & Medium)</option>
                        <option value="Advanced">Advanced (Top Tier FAANG & Hard)</option>
                      </select>
                    </div>

                    {/* Daily DSA Goal */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Daily DSA Problems Goal</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={formData.daily_dsa_goal}
                        onChange={(e) => handleInputChange('daily_dsa_goal', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                      />
                    </div>

                    {/* Daily Aptitude Goal */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Daily Aptitude Tests Goal</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.daily_aptitude_goal}
                        onChange={(e) => handleInputChange('daily_aptitude_goal', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Notification Toggle */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Placement Drive Alerts & Daily Reminders</h4>
                      <p className="text-xs text-slate-400">Receive email reminders for streak continuity and upcoming test deadlines.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.email_notifications}
                      onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                      className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* TAB 6: ACCOUNT & SECURITY */}
              {/* ------------------------------------------------------------- */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  
                  {/* Password Change Card */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-indigo-400" /> Change Account Password
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Update your password to keep your PrepNest account secure.
                      </p>
                    </div>

                    {passwordStatus && (
                      <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold ${
                        passwordStatus.type === 'success' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}>
                        {passwordStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                        <span>{passwordStatus.text}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Current Password</label>
                        <input
                          type="password"
                          required
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                          placeholder="••••••••"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">New Password</label>
                          <input
                            type="password"
                            required
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                            placeholder="At least 6 characters"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                          <input
                            type="password"
                            required
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                            placeholder="Confirm password"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isChangingPass}
                          className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition shadow-lg shadow-purple-500/25 flex items-center gap-2 disabled:opacity-50"
                        >
                          <KeyRound className="w-4 h-4" /> {isChangingPass ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Plan & Credits Details */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" /> Membership Plan & AI Credits
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-xs text-slate-400 font-semibold">Active Plan</span>
                        <div className="text-lg font-extrabold text-white flex items-center gap-2">
                          <span>{user?.plan || 'Pro Tier'}</span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Active</span>
                        </div>
                        <p className="text-xs text-slate-500">Unlimited DSA questions, Mock interviews & Roadmap tracks.</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-xs text-slate-400 font-semibold">AI Tokens Remaining</span>
                        <div className="text-lg font-extrabold text-indigo-400">
                          {user?.credits ?? 250} Credits
                        </div>
                        <p className="text-xs text-slate-500">Used for Resume Analyzer and AI Mock Interview evaluations.</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
