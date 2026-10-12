import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Layers,
  Briefcase,
  Code2,
  Building2,
  Target,
  ShieldAlert,
  ArrowRight,
  Trash2,
  Sparkles,
  TrendingUp,
  Compass,
  BookOpen,
  FileCheck,
  X,
  ChevronRight,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function ResumeAnalyzerPage() {
  // Available Companies & Roles from backend
  const [availableCompanies, setAvailableCompanies] = useState([
    'TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant',
    'Amazon', 'Google', 'Microsoft', 'Deloitte', 'Capgemini',
    'Tech Mahindra', 'HCL', 'IBM', 'Oracle', 'Cisco',
    'Intel', 'AMD', 'Meta', 'Apple', 'Netflix'
  ]);
  const [availableRoles, setAvailableRoles] = useState([
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Data Analyst', 'Data Engineer',
    'QA/SDET Engineer', 'Cloud/DevOps Engineer'
  ]);

  // Selected Target Target
  const [targetCompany, setTargetCompany] = useState('Amazon');
  const [targetRole, setTargetRole] = useState('Software Engineer');

  // File Upload State
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('');
  const [uploadError, setUploadError] = useState(null);

  // Resume Analysis Result State
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'structure' | 'gap' | 'bullets' | 'jd' | 'issues'

  // Job Description Matcher State
  const [jdText, setJdText] = useState('');
  const [jdAnalyzing, setJdAnalyzing] = useState(false);
  const [jdResult, setJdResult] = useState(null);

  // Custom Bullet Point Improver State
  const [customBullet, setCustomBullet] = useState(() => {
    try {
      const saved = sessionStorage.getItem('prepnest_custom_bullet');
      if (saved) {
        sessionStorage.removeItem('prepnest_custom_bullet');
        return saved;
      }
    } catch (e) {}
    return '';
  });
  const [bulletDomainFilter, setBulletDomainFilter] = useState('all');
  const [bulletImproving, setBulletImproving] = useState(false);
  const [customBulletResult, setCustomBulletResult] = useState(null);
  const [selectedVariationMap, setSelectedVariationMap] = useState({});
  const [customMetricText, setCustomMetricText] = useState('');
  const [showVerbsGuide, setShowVerbsGuide] = useState(false);

  // Copied Feedback helper
  const [copiedMap, setCopiedMap] = useState({});

  const fileInputRef = useRef(null);

  // On mount: Fetch available companies & roles and try to load latest analysis
  useEffect(() => {
    fetchCompaniesAndRoles();
    fetchLatestAnalysis();
  }, []);

  const fetchCompaniesAndRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/resume/companies-roles`);
      if (res.ok) {
        const data = await res.json();
        if (data.companies?.length) setAvailableCompanies(data.companies);
        if (data.roles?.length) setAvailableRoles(data.roles);
      }
    } catch (err) {
      console.warn('Could not fetch companies/roles list:', err);
    }
  };

  const fetchLatestAnalysis = async () => {
    const token = localStorage.getItem('prepnest_token');
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/resume/latest`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
          if (data.analysis.target_company) setTargetCompany(data.analysis.target_company);
          if (data.analysis.target_role) setTargetRole(data.analysis.target_role);
          if (data.analysis.job_match?.matched_keywords?.length) {
            setJdResult(data.analysis.job_match);
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch latest analysis:', err);
    }
  };

  // File Validation
  const validateFile = (selectedFile) => {
    if (!selectedFile) return 'Please select a file to upload.';

    const validExtensions = ['.pdf', '.docx'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      return 'Invalid file type. Please upload a PDF (.pdf) or Word document (.docx).';
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      return 'File size exceeds 10MB limit. Please upload a smaller file.';
    }

    return null;
  };

  // Upload & Analyze Trigger
  const handleFileUpload = async (uploadedFile, customCompany, customRole) => {
    const error = validateFile(uploadedFile);
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError(null);
    setFile(uploadedFile);
    setAnalyzing(true);
    setUploadProgress(15);
    setAnalyzingStep('Extracting document text & fonts...');

    const token = localStorage.getItem('prepnest_token');
    const compToUse = customCompany || targetCompany;
    const roleToUse = customRole || targetRole;

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('target_company', compToUse);
    formData.append('company', compToUse);
    formData.append('target_role', roleToUse);
    formData.append('role', roleToUse);
    if (jdText.trim()) {
      formData.append('job_description', jdText.trim());
    }

    try {
      // Simulate incremental upload steps for smooth feedback
      const timer1 = setTimeout(() => {
        setUploadProgress(45);
        setAnalyzingStep('Detecting resume sections & contact info...');
      }, 500);

      const timer2 = setTimeout(() => {
        setUploadProgress(75);
        setAnalyzingStep('Extracting technical skills & analyzing ATS benchmarks...');
      }, 1000);

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/resume/analyze`, {
        method: 'POST',
        headers,
        body: formData,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Resume analysis failed. Please verify file integrity.');
      }

      setUploadProgress(100);
      setAnalyzingStep('Audit complete!');

      const data = await res.json();
      setAnalysis(data);
      if (data.target_company) setTargetCompany(data.target_company);
      if (data.target_role) setTargetRole(data.target_role);
      if (data.job_match?.matched_keywords?.length) {
        setJdResult(data.job_match);
      }
    } catch (err) {
      setUploadError(err.message || 'An error occurred during resume analysis.');
    } finally {
      setAnalyzing(false);
      setUploadProgress(0);
      setAnalyzingStep('');
    }
  };

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Re-run Target Analysis immediately when Company / Role changes
  const handleReanalyzeTarget = async (company, role) => {
    setTargetCompany(company);
    setTargetRole(role);

    if (analysis) {
      const skillsFlat = analysis.skills_categorized
        ? Object.values(analysis.skills_categorized).flat()
        : [];

      try {
        const res = await fetch(`${API_BASE}/api/resume/target-match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysis_id: analysis.id || null,
            skills: skillsFlat,
            target_company: company,
            target_role: role,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setAnalysis((prev) => ({
            ...prev,
            target_company: company,
            target_role: role,
            company_match: data.company_match,
            roadmap_recommendations: data.roadmap_recommendations,
            dsa_recommendations: data.dsa_recommendations,
          }));
        }
      } catch (err) {
        console.warn('Error updating target match:', err);
      }
    } else if (file) {
      handleFileUpload(file, company, role);
    }
  };

  // Job Description Matcher handler
  const handleAnalyzeJD = async () => {
    if (!jdText.trim()) return;
    setJdAnalyzing(true);
    try {
      const skillsFlat = analysis?.skills_categorized
        ? Object.values(analysis.skills_categorized).flat()
        : [];

      const res = await fetch(`${API_BASE}/api/resume/job-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: analysis?.raw_text || '',
          skills: skillsFlat,
          job_description: jdText.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setJdResult(data);
      }
    } catch (err) {
      console.error('Job match error:', err);
    } finally {
      setJdAnalyzing(false);
    }
  };

  // Custom Bullet Improver handler
  const handleImproveCustomBullet = async () => {
    if (!customBullet.trim()) return;
    setBulletImproving(true);
    try {
      const res = await fetch(`${API_BASE}/api/resume/improve-bullet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullet_text: customBullet.trim(),
          domain_filter: bulletDomainFilter !== 'all' ? bulletDomainFilter : null,
          target_role: targetRole,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const result = data.enhanced || (data.suggestions && data.suggestions[0]) || null;
        setCustomBulletResult(result);
      }
    } catch (err) {
      console.error('Bullet improve error:', err);
    } finally {
      setBulletImproving(false);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Download Detailed Report
  const handleDownloadReport = () => {
    if (!analysis) return;

    const reportContent = `=====================================================
PREPNEST AI RESUME AUDIT & ATS ANALYSIS REPORT
Generated by PrepNest ATS Engine
=====================================================
File Name:        ${analysis.file_name || 'Resume'}
Target Alignment: ${analysis.target_company || targetCompany} - ${analysis.target_role || targetRole}
Date:             ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

-----------------------------------------------------
1. OVERALL ATS PERFORMANCE
-----------------------------------------------------
Overall ATS Score: ${analysis.overall_score || 0} / 100
Readiness Status:  ${analysis.readiness_level || 'Good ATS Readiness'}

SCORE BREAKDOWN:
- ATS Compatibility:        ${analysis.scores?.ats_compatibility ?? 85}%
- Keyword Optimization:     ${analysis.scores?.keyword_optimization ?? 80}%
- Content Quality:          ${analysis.scores?.content_quality ?? 80}%
- Skills Relevance:         ${analysis.scores?.skills_relevance ?? 85}%
- Project Quality:          ${analysis.scores?.project_quality ?? 80}%
- Formatting & Parsing:     ${analysis.scores?.formatting ?? 90}%
- Section Completeness:     ${analysis.scores?.section_completeness ?? 85}%

-----------------------------------------------------
2. TARGET COMPANY SKILL GAP (${analysis.target_company || targetCompany})
-----------------------------------------------------
Company Match Score: ${analysis.company_match?.match_percentage || 75}%
Matched Required Skills:
${(analysis.company_match?.matched_skills || []).map((s) => `  [✓] ${s}`).join('\n') || '  (None identified)'}

Missing Required Skills:
${(analysis.company_match?.missing_skills || []).map((s) => `  [!] ${s}`).join('\n') || '  (None identified)'}

Recommended DSA Topics:
${(analysis.company_match?.dsa_topics || []).map((t) => `  - ${t}`).join('\n') || '  - Arrays\n  - Trees\n  - Dynamic Programming'}

-----------------------------------------------------
3. RESUME STRUCTURE AUDIT
-----------------------------------------------------
${(analysis.structure || [])
  .map((s) => `${s.detected ? '[✓ DETECTED]' : '[⚠ MISSING ]'} ${s.name}`)
  .join('\n')}

-----------------------------------------------------
4. EXTRACTED TECHNICAL SKILLS
-----------------------------------------------------
Programming Languages: ${(analysis.skills_categorized?.languages || []).join(', ') || 'None'}
Frontend Development:  ${(analysis.skills_categorized?.frontend || []).join(', ') || 'None'}
Backend Development:   ${(analysis.skills_categorized?.backend || []).join(', ') || 'None'}
Databases & Storage:   ${(analysis.skills_categorized?.databases || []).join(', ') || 'None'}
Cloud & DevOps:        ${(analysis.skills_categorized?.cloud_devops || []).join(', ') || 'None'}
Frameworks/Libraries:  ${(analysis.skills_categorized?.frameworks_libraries || []).join(', ') || 'None'}
Developer Tools & CS:  ${(analysis.skills_categorized?.tools_core_cs || []).join(', ') || 'None'}

-----------------------------------------------------
5. DETECTED STRENGTHS
-----------------------------------------------------
${(analysis.strengths || []).map((str) => `• ${str}`).join('\n') || '• Standard structure detected.'}

-----------------------------------------------------
6. PRIORITIZED ISSUES & HOW TO FIX
-----------------------------------------------------
${(analysis.issues || [])
  .map(
    (iss, i) =>
      `[#${i + 1} - ${iss.priority.toUpperCase()} PRIORITY] ${iss.title}\n  Issue: ${iss.explanation}\n  Action: ${iss.fix}`
  )
  .join('\n\n') || 'No critical issues detected.'}

-----------------------------------------------------
7. ACTIONABLE RECOMMENDATIONS
-----------------------------------------------------
${(analysis.recommendations || []).map((rec) => `• ${rec}`).join('\n') || '• Continue refining project impact metrics.'}

=====================================================
PrepNest Career Intelligence Platform • https://prepnest.ai
=====================================================`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(analysis.file_name || 'Resume').replace(/\.[^/.]+$/, '')}_ATS_Audit_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper color for readiness badge
  const getReadinessColor = (level = '') => {
    const l = level.toLowerCase();
    if (l.includes('strong') || l.includes('excellent')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (l.includes('good')) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    if (l.includes('needs')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  // Helper score color
  const getScoreColor = (score = 0) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 65) return 'text-indigo-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  // Helper stroke color for circular SVG meter
  const getStrokeColor = (score = 0) => {
    if (score >= 80) return '#10b981'; // emerald-500
    if (score >= 65) return '#6366f1'; // indigo-500
    if (score >= 50) return '#f59e0b'; // amber-500
    return '#f43f5e'; // rose-500
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar activeRoute="resume-analyzer" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-6 md:p-8 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  AI Resume Analyzer & ATS Optimizer
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  Live Engine
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Upload your software engineer resume to evaluate ATS compatibility, detect section gaps, match target companies, and optimize bullet points.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {analysis && (
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download Detailed Report
                </button>
              )}
            </div>
          </div>

          {/* Target Company & Role Selection Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-white">Target Career Benchmarking:</span>
              <span className="text-slate-400 hidden sm:inline">Evaluate keywords and DSA against specific hiring criteria</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Company:</label>
                <select
                  value={targetCompany}
                  onChange={(e) => handleReanalyzeTarget(e.target.value, targetRole)}
                  className="bg-slate-800/90 text-xs text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {availableCompanies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Role:</label>
                <select
                  value={targetRole}
                  onChange={(e) => handleReanalyzeTarget(targetCompany, e.target.value)}
                  className="bg-slate-800/90 text-xs text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Upload Section + Quick Score Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Drag & Drop Uploader */}
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed transition-all rounded-2xl bg-slate-900/60 p-8 text-center flex flex-col items-center justify-center gap-4 backdrop-blur-xl cursor-pointer ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                    : 'border-slate-700/80 hover:border-indigo-500/80'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-inner">
                  {analyzing ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                  ) : (
                    <UploadCloud className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white">
                    {analyzing ? 'Analyzing Document...' : 'Drop your Resume PDF / DOCX here'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PDF, DOCX up to 10MB
                  </p>
                </div>

                {analyzing ? (
                  <div className="w-full max-w-xs space-y-2 mt-2">
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-indigo-300 animate-pulse">{analyzingStep}</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition"
                  >
                    Select File
                  </button>
                )}
              </div>

              {/* Upload Error Banner */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{uploadError}</p>
                  </div>
                  <button
                    onClick={() => setUploadError(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Active Document Card */}
              {analysis && (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate" title={analysis.file_name}>
                        {analysis.file_name}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {analysis.file_size
                          ? `${(analysis.file_size / 1024).toFixed(1)} KB • `
                          : ''}
                        Audited for {analysis.target_company || targetCompany}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                      Audited
                    </span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title="Replace Resume"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {!analysis && !analyzing && (
                <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 text-xs text-slate-400 space-y-2">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold">
                    <FileCheck className="w-4 h-4 text-indigo-400" /> Real In-Memory ATS Audit
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Upload your resume to receive an instantaneous breakdown of section structures, technical keywords, and match scoring with 20 top tier software engineering companies.
                  </p>
                </div>
              )}
            </div>

            {/* Right 2 Columns: ATS Breakdown & Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* ATS Scores Top Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Overall ATS Score */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Overall ATS Score
                    </h4>
                    <div className="text-4xl font-extrabold text-white mt-2 flex items-baseline gap-1">
                      <span>{analysis ? analysis.overall_score : 82}</span>
                      <span className="text-sm font-medium text-slate-500">/ 100</span>
                    </div>
                    <span
                      className={`text-xs mt-2 inline-block px-2.5 py-0.5 rounded-full border font-semibold ${getReadinessColor(
                        analysis?.readiness_level || 'Strong ATS Readiness'
                      )}`}
                    >
                      {analysis?.readiness_level || 'Strong ATS Readiness'}
                    </span>
                  </div>

                  {/* Circular Score Gauge */}
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        strokeWidth="3.5"
                        strokeDasharray={`${analysis ? analysis.overall_score : 82}, 100`}
                        stroke={getStrokeColor(analysis ? analysis.overall_score : 82)}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-bold text-sm text-white">
                      {analysis ? analysis.overall_score : 82}%
                    </span>
                  </div>
                </div>

                {/* Company & Role Match Rate */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Company Match Rate
                    </h4>
                    <div className="text-4xl font-extrabold text-white mt-2 flex items-baseline gap-1">
                      <span>
                        {analysis?.company_match?.match_percentage ?? 78}
                      </span>
                      <span className="text-sm font-medium text-slate-500">%</span>
                    </div>
                    <span className="text-xs text-indigo-400 mt-2 inline-flex items-center gap-1 font-medium">
                      Target: {targetCompany} • {targetRole}
                    </span>
                  </div>

                  {/* Circular Match Gauge */}
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        strokeWidth="3.5"
                        strokeDasharray={`${analysis?.company_match?.match_percentage ?? 78}, 100`}
                        stroke="#a855f7"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute font-bold text-sm text-white">
                      {analysis?.company_match?.match_percentage ?? 78}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Breakdown Bars (7 dimensions) */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" /> Resume Score Breakdown
                  </h3>
                  <span className="text-xs text-slate-400">7 Dimension ATS Evaluation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 pt-2">
                  {[
                    { label: 'ATS Compatibility', score: analysis?.scores?.ats_compatibility ?? 86 },
                    { label: 'Keyword Optimization', score: analysis?.scores?.keyword_optimization ?? 78 },
                    { label: 'Content Quality', score: analysis?.scores?.content_quality ?? 82 },
                    { label: 'Skills Relevance', score: analysis?.scores?.skills_relevance ?? 88 },
                    { label: 'Project Quality', score: analysis?.scores?.project_quality ?? 84 },
                    { label: 'Formatting & Readability', score: analysis?.scores?.formatting ?? 91 },
                    { label: 'Section Completeness', score: analysis?.scores?.section_completeness ?? 85 },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{item.label}</span>
                        <span className={`font-bold ${getScoreColor(item.score)}`}>
                          {item.score}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Filter Tabs for Deep Analysis */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Sections' },
              { id: 'structure', label: 'Resume Structure & Skills' },
              { id: 'gap', label: `Company Gap: ${targetCompany}` },
              { id: 'jd', label: 'Job Description Matcher' },
              { id: 'bullets', label: 'Bullet Point Enhancer' },
              { id: 'issues', label: 'Prioritized Issues & Fixes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-semibold px-4 py-2 rounded-xl whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ========================================================
              SECTION 1: RESUME STRUCTURE DETECTION & TECHNICAL SKILLS
              ======================================================== */}
          {(activeTab === 'all' || activeTab === 'structure') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Resume Structure Detection Card */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" /> Resume Structure
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {analysis?.structure
                      ? `${analysis.structure.filter((s) => s.detected).length}/${analysis.structure.length} Detected`
                      : '11/13 Detected'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  ATS parsers expect industry standard headings to categorize candidate experience correctly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-1">
                  {(
                    analysis?.structure || [
                      { id: 'contact_info', name: 'Contact Information', detected: true },
                      { id: 'education', name: 'Education', detected: true },
                      { id: 'skills', name: 'Technical Skills', detected: true },
                      { id: 'projects', name: 'Projects', detected: true },
                      { id: 'experience', name: 'Work Experience', detected: false },
                      { id: 'internships', name: 'Internships', detected: true },
                      { id: 'certifications', name: 'Certifications', detected: true },
                      { id: 'achievements', name: 'Achievements', detected: false },
                      { id: 'github', name: 'GitHub Link', detected: true },
                      { id: 'linkedin', name: 'LinkedIn Link', detected: true },
                    ]
                  ).map((sec, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                        sec.detected
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                          : 'bg-amber-500/5 border-amber-500/20 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {sec.detected ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        )}
                        <span className={sec.detected ? 'font-medium' : 'text-slate-400'}>
                          {sec.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          sec.detected
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {sec.detected ? '✓ Detected' : '⚠ Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Technical Skills Categorized Card */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-400" /> Extracted Technical Skills
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Categorized technologies automatically recognized by the ATS extractor
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {analysis?.all_skills_count || 18} Identified
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      category: 'Programming Languages',
                      skills: analysis?.skills_categorized?.languages || ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++'],
                      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    },
                    {
                      category: 'Frontend Development',
                      skills: analysis?.skills_categorized?.frontend || ['React', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS'],
                      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                    },
                    {
                      category: 'Backend Development',
                      skills: analysis?.skills_categorized?.backend || ['FastAPI', 'Node.js', 'Express', 'Spring Boot', 'REST API'],
                      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    },
                    {
                      category: 'Databases & Storage',
                      skills: analysis?.skills_categorized?.databases || ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
                      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    },
                    {
                      category: 'Cloud & DevOps',
                      skills: analysis?.skills_categorized?.cloud_devops || ['AWS', 'Docker', 'Git', 'GitHub', 'CI/CD'],
                      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    },
                    {
                      category: 'Frameworks & Developer Tools',
                      skills: analysis?.skills_categorized?.frameworks_libraries || ['PyTorch', 'Redux', 'Pandas', 'NumPy'],
                      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                    },
                  ].map((group, idx) => (
                    <div key={idx} className="border-b border-slate-800/80 pb-3 last:border-0 last:pb-0">
                      <span className="text-xs font-bold text-slate-300 block mb-2">
                        {group.category}
                      </span>
                      {group.skills && group.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {group.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${group.badgeColor}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">None detected in this category</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 2: COMPANY TARGET & SKILL GAP ANALYSIS
              ======================================================== */}
          {(activeTab === 'all' || activeTab === 'gap') && (
            <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold text-xs uppercase">
                      Hiring Benchmark
                    </span>
                    <h3 className="text-base font-extrabold text-white">
                      Target Company Alignment: {targetCompany} — {targetRole}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Comparing your resume against real recruitment requirements from {targetCompany}.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Skill Compatibility
                    </span>
                    <span className="text-2xl font-black text-indigo-400">
                      {analysis?.company_match?.match_percentage ?? 78}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Matched vs Missing Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Matched Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(analysis?.company_match?.matched_skills || ['Java', 'Python', 'SQL', 'Git', 'Data Structures', 'Algorithms']).map(
                      (skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5"
                        >
                          <Check className="w-3 h-3" /> {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-2 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" /> Missing Key Requirements
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(analysis?.company_match?.missing_skills || ['Docker', 'AWS', 'REST API', 'Unit Testing', 'Redis']).map(
                      (skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        >
                          + {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Recommended DSA Topics & PrepNest Links */}
              <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    Target Company Coding Focus ({targetCompany}):
                  </h4>
                  <p className="text-xs text-slate-300">
                    Priority DSA topics asked in technical rounds:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(analysis?.company_match?.dsa_topics || ['Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming']).map(
                      (topic, i) => (
                        <Link
                          key={i}
                          to={`/dsa?company=${encodeURIComponent(targetCompany)}&topic=${encodeURIComponent(topic)}`}
                          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-500/30 flex items-center gap-1 transition"
                        >
                          {topic} <ExternalLink className="w-3 h-3 opacity-70" />
                        </Link>
                      )
                    )}
                  </div>
                </div>

                <Link
                  to={`/dsa?company=${encodeURIComponent(targetCompany)}`}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shrink-0 self-start md:self-auto shadow-md shadow-indigo-500/20"
                >
                  Practice {targetCompany} Problems <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 3: JOB DESCRIPTION MATCHER
              ======================================================== */}
          {(activeTab === 'all' || activeTab === 'jd') && (
            <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-purple-400" /> Tailor Resume to Any Job Description
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Paste a job description to extract required keywords, match against your resume, and get custom recommendations.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the Job Description here (e.g., 'We are looking for a Software Engineer proficient in React, Node.js, AWS, Docker and Microservices...')..."
                  rows={4}
                  className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 placeholder:text-slate-500 font-mono transition"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleAnalyzeJD}
                    disabled={jdAnalyzing || !jdText.trim()}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-purple-500/20 cursor-pointer"
                  >
                    {jdAnalyzing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {jdAnalyzing ? 'Analyzing JD...' : 'Analyze Job Match'}
                  </button>
                </div>
              </div>

              {/* JD Match Results */}
              {jdResult && (
                <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                        JD Keyword Match Score
                      </h4>
                      <div className="text-3xl font-extrabold text-white mt-1">
                        {jdResult.match_percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-bold text-emerald-400 mb-2">
                        Matched Keywords from JD
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {jdResult.matched_keywords?.length ? (
                          jdResult.matched_keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                            >
                              ✓ {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">None detected</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-rose-400 mb-2">
                        Missing Keywords from JD
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {jdResult.missing_keywords?.length ? (
                          jdResult.missing_keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="text-xs px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold"
                            >
                              + {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-400">All target keywords present!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {jdResult.recommendations?.length > 0 && (
                    <div className="border-t border-purple-500/20 pt-3">
                      <h5 className="text-xs font-bold text-purple-200 mb-1.5">
                        Tailoring Advice for this JD:
                      </h5>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {jdResult.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-400">•</span> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SECTION 4: PROJECT & BULLET POINT IMPROVEMENTS
              ======================================================== */}
          {(activeTab === 'all' || activeTab === 'bullets') && (
            <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm md:text-base font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> ATS Bullet Point Enhancer & XYZ Formula Optimizer
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Transform passive duties into quantified engineering accomplishments using Google's XYZ formula:
                    <span className="text-indigo-300 font-medium ml-1">"Accomplished [X] as measured by [Y], by doing [Z]"</span>.
                  </p>
                </div>

                <button
                  onClick={() => setShowVerbsGuide(!showVerbsGuide)}
                  className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition self-start sm:self-auto"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  {showVerbsGuide ? 'Hide Action Verbs' : 'Power Verbs Cheatsheet'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showVerbsGuide ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Action Verbs Cheatsheet Drawer */}
              {showVerbsGuide && (
                <div className="p-5 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> High-Impact Action Verbs by Domain (Click to Use):
                    </h4>
                    <span className="text-[11px] text-slate-400">Click any verb to paste into custom optimizer</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                      <span className="font-bold text-indigo-400 block">🏗️ Architecture & Systems</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Engineered', 'Architected', 'Designed', 'Spearheaded', 'Formulated', 'Constructed'].map((v) => (
                          <button
                            key={v}
                            onClick={() => setCustomBullet((prev) => `${v} ${prev}`.trim())}
                            className="px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 text-[11px] font-medium transition"
                          >
                            + {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                      <span className="font-bold text-emerald-400 block">⚡ Performance & Speed</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Optimized', 'Accelerated', 'Streamlined', 'Scaled', 'Reduced', 'Benchmarked'].map((v) => (
                          <button
                            key={v}
                            onClick={() => setCustomBullet((prev) => `${v} ${prev}`.trim())}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-medium transition"
                          >
                            + {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                      <span className="font-bold text-purple-400 block">☁️ Cloud, DevOps & Testing</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Automated', 'Orchestrated', 'Containerized', 'Deployed', 'Standardized', 'Validated'].map((v) => (
                          <button
                            key={v}
                            onClick={() => setCustomBullet((prev) => `${v} ${prev}`.trim())}
                            className="px-2 py-0.5 rounded bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 text-[11px] font-medium transition"
                          >
                            + {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detected Bullets from Resume */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Detected Resume Bullets with Suggested Upgrades
                  </h4>
                  <span className="text-xs text-slate-400">
                    {analysis?.bullet_improvements ? `${analysis.bullet_improvements.length} Bullets Analyzed` : '3 Benchmark Samples'}
                  </span>
                </div>

                <div className="space-y-4">
                  {(
                    analysis?.bullet_improvements || [
                      {
                        original: 'Worked on web application frontend using React and JavaScript.',
                        weak_verb: 'worked on',
                        focus: 'Frontend & UI Engineering',
                        score_before: 32,
                        score_after: 94,
                        improved:
                          'Engineered responsive web client for web application using React and JavaScript, optimizing rendering speed and cutting bundle load latency by 35%.',
                        options: [
                          {
                            category: 'Performance & Efficiency',
                            text: 'Engineered responsive web client for web application using React and JavaScript, optimizing rendering speed and cutting bundle load latency by 35%.',
                            badge: '⚡ Latency & Speed',
                          },
                          {
                            category: 'Scale & Architecture',
                            text: 'Architected modular component architecture for web application using React and JavaScript, delivering reusable UI systems adopted across 10+ views for 2,000+ active users.',
                            badge: '📈 Scale & Concurrency',
                          },
                          {
                            category: 'Reliability & Business Impact',
                            text: 'Redesigned front-end interface for web application using React and JavaScript, increasing user session engagement by 28% and ensuring 100% responsive cross-device compatibility.',
                            badge: '🛡️ Reliability & Impact',
                          },
                        ],
                      },
                      {
                        original: 'Responsible for backend API endpoints and database queries.',
                        weak_verb: 'responsible for',
                        focus: 'Backend & Microservices',
                        score_before: 30,
                        score_after: 94,
                        improved:
                          'Architected RESTful microservice endpoints for backend API endpoints and database queries, slashing average response times by 45% (to sub-60ms) under peak traffic.',
                        options: [
                          {
                            category: 'Performance & Efficiency',
                            text: 'Architected RESTful microservice endpoints for backend API endpoints and database queries, slashing average response times by 45% (to sub-60ms) under peak traffic.',
                            badge: '⚡ Latency & Speed',
                          },
                          {
                            category: 'Scale & Architecture',
                            text: 'Engineered high-throughput backend services for backend API endpoints and database queries, sustaining 1,200+ concurrent requests with 99.9% uptime.',
                            badge: '📈 Scale & Concurrency',
                          },
                          {
                            category: 'Reliability & Business Impact',
                            text: 'Standardized resilient backend services for backend API endpoints and database queries with automated validation and error-handling, eliminating data corruption bottlenecks.',
                            badge: '🛡️ Reliability & Impact',
                          },
                        ],
                      },
                      {
                        original: 'Helped in setting up Docker containers and cloud deployment.',
                        weak_verb: 'helped with',
                        focus: 'DevOps & Cloud Automation',
                        score_before: 35,
                        score_after: 94,
                        improved:
                          'Automated multi-stage container builds and CI/CD pipelines for setting up Docker containers and cloud deployment, slashing deployment turnaround times from 40 min to under 8 min.',
                        options: [
                          {
                            category: 'Performance & Efficiency',
                            text: 'Automated multi-stage container builds and CI/CD pipelines for setting up Docker containers and cloud deployment, slashing deployment turnaround times from 40 min to under 8 min.',
                            badge: '⚡ Latency & Speed',
                          },
                          {
                            category: 'Scale & Architecture',
                            text: 'Orchestrated scalable cloud infrastructure for setting up Docker containers and cloud deployment, enabling elastic auto-scaling capable of absorbing 4x traffic spikes.',
                            badge: '📈 Scale & Concurrency',
                          },
                          {
                            category: 'Reliability & Business Impact',
                            text: 'Standardized isolated container environments and release pipelines for setting up Docker containers and cloud deployment, eliminating production drift and ensuring 99.95% availability.',
                            badge: '🛡️ Reliability & Impact',
                          },
                        ],
                      },
                    ]
                  ).map((item, idx) => {
                    const selectedOptIdx = selectedVariationMap[idx] || 0;
                    const optionsList = item.options || [
                      { category: 'Recommended Upgrade', text: item.improved || item.suggested, badge: '⚡ Optimized' },
                    ];
                    const activeText = optionsList[selectedOptIdx]?.text || item.improved || item.suggested;

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3.5 transition hover:border-slate-700"
                      >
                        {/* Header metadata */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Weak Verb: "{item.weak_verb || 'Passive phrasing'}"
                            </span>
                            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                              {item.focus || 'Software Engineering'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 font-medium">ATS Impact:</span>
                            <span className="font-bold text-rose-400">{item.score_before || 35}</span>
                            <span className="text-slate-500">➔</span>
                            <span className="font-bold text-emerald-400">{item.score_after || 94}/100</span>
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              +{(item.score_after || 94) - (item.score_before || 35)} pts
                            </span>
                          </div>
                        </div>

                        {/* Original before */}
                        <div className="p-3 rounded-xl bg-slate-900/40 border border-rose-500/20 text-xs space-y-1">
                          <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Before (Detected in Resume):</span>
                          <p className="text-slate-400 line-through decoration-rose-500/60">
                            {item.original}
                          </p>
                        </div>

                        {/* Variation Buttons */}
                        {optionsList.length > 1 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-semibold text-slate-300 block">
                              Select Enhancement Angle:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {optionsList.map((opt, optI) => (
                                <button
                                  key={optI}
                                  onClick={() =>
                                    setSelectedVariationMap((prev) => ({ ...prev, [idx]: optI }))
                                  }
                                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                                    selectedOptIdx === optI
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                                  }`}
                                >
                                  <span>{opt.badge}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* After improved text */}
                        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" /> After (Suggested ATS-Optimized):
                            </span>
                            <span className="text-[11px] text-emerald-400/80 font-medium">
                              {optionsList[selectedOptIdx]?.category || 'High Impact Formula'}
                            </span>
                          </div>

                          <p className="text-emerald-200 font-medium text-xs leading-relaxed">
                            {activeText}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20">
                            <span className="text-[10px] text-slate-400 italic">
                              💡 Action: Replace placeholder metric with your verifiable numbers.
                            </span>

                            <button
                              onClick={() => handleCopy(activeText, `detected-bullet-${idx}`)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-850 hover:bg-slate-700 px-3.5 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                            >
                              {copiedMap[`detected-bullet-${idx}`] ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied to Clipboard!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-indigo-400" /> Copy Suggestion
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dedicated Interactive Custom Bullet Improver Tool */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" /> Interactive Bullet Optimizer (Test Any Custom Line)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Paste any bullet from your resume or pick a sample below to see instant Google XYZ formula rewrites with multi-perspective options.
                  </p>
                </div>

                {/* Quick Test Samples Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">Try sample:</span>
                  {[
                    'Worked on responsive ecommerce frontend using React and Redux',
                    'Responsible for backend API endpoints and PostgreSQL queries',
                    'Helped in setting up Docker containers and AWS deployment',
                    'Assisted the team in writing unit tests for authentication module',
                  ].map((sample, sI) => (
                    <button
                      key={sI}
                      onClick={() => setCustomBullet(sample)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition truncate max-w-xs"
                      title={sample}
                    >
                      "{sample.slice(0, 32)}..."
                    </button>
                  ))}
                </div>

                {/* Domain Selector Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Domain Focus:</span>
                  {[
                    { id: 'all', label: 'Auto Detect' },
                    { id: 'frontend', label: 'Frontend' },
                    { id: 'backend', label: 'Backend' },
                    { id: 'database', label: 'Database' },
                    { id: 'devops', label: 'Cloud / DevOps' },
                    { id: 'qa', label: 'QA / Testing' },
                    { id: 'ai_data', label: 'Data / AI' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setBulletDomainFilter(d.id)}
                      className={`text-xs px-2.5 py-1 rounded-md transition font-medium ${
                        bulletDomainFilter === d.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={customBullet}
                    onChange={(e) => setCustomBullet(e.target.value)}
                    placeholder="Paste any bullet point (e.g., 'Worked on online chat application with WebSockets and Node.js')..."
                    className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono transition"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleImproveCustomBullet();
                    }}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleImproveCustomBullet}
                      disabled={bulletImproving || !customBullet.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-indigo-500/20 cursor-pointer active:scale-95"
                    >
                      {bulletImproving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {bulletImproving ? 'Optimizing...' : 'Enhance Bullet'}
                    </button>

                    {customBullet && (
                      <button
                        onClick={() => {
                          setCustomBullet('');
                          setCustomBulletResult(null);
                        }}
                        className="px-3 py-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Bullet Results Section */}
                {customBulletResult && (
                  <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-4 animate-in fade-in duration-200">
                    {/* Analysis Overview */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Analysis:</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Weak Verb: "{customBulletResult.weak_verb || 'Passive Verb'}"
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          Domain: {customBulletResult.focus || 'Engineering'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">Score Boost:</span>
                        <span className="font-bold text-rose-400">{customBulletResult.score_before || 38}/100</span>
                        <span className="text-slate-500">➔</span>
                        <span className="font-bold text-emerald-400">{customBulletResult.score_after || 94}/100</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          +{(customBulletResult.score_after || 94) - (customBulletResult.score_before || 38)} pts
                        </span>
                      </div>
                    </div>

                    {/* 3 High-Impact XYZ Variations */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-indigo-200">
                        3 High-Impact XYZ Formula Variations (Select & Copy):
                      </h5>

                      <div className="grid grid-cols-1 gap-3">
                        {(
                          customBulletResult.options || [
                            {
                              category: 'Performance & Speed',
                              text: customBulletResult.improved || customBulletResult.suggested,
                              badge: '⚡ Latency & Speed',
                            },
                          ]
                        ).map((opt, oI) => (
                          <div
                            key={oI}
                            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-emerald-500/40 transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" /> {opt.badge || opt.category}
                              </span>
                              <button
                                onClick={() => handleCopy(opt.text, `custom-variation-${oI}`)}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                              >
                                {copiedMap[`custom-variation-${oI}`] ? (
                                  <>
                                    <Check className="w-3 h-3 text-white" /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy
                                  </>
                                )}
                              </button>
                            </div>

                            <p className="text-xs text-slate-100 font-medium leading-relaxed">
                              {opt.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 5: DETECTED STRENGTHS & PRIORITIZED ISSUES
              ======================================================== */}
          {(activeTab === 'all' || activeTab === 'issues') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Detected Strengths */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Detected Strengths
                </h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  {(
                    analysis?.strengths || [
                      'Clear and well-identified Education section with technical accreditation.',
                      'Dedicated Projects section highlighting practical software engineering implementations.',
                      'Live portfolio and verified GitHub links included for recruiter code inspection.',
                      'Clean single-page density without unreadable multi-column formatting obstacles.',
                    ]
                  ).map((str, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-emerald-400 shrink-0">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prioritized Issues with Fixes */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-4">
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Prioritized Issues & Fixes
                </h3>
                <div className="space-y-3">
                  {(
                    analysis?.issues || [
                      {
                        priority: 'High',
                        title: 'Missing Measurable Achievements',
                        explanation:
                          'Bullets outline duties rather than quantifiable outcomes (latency, user volume, percentage boost).',
                        fix: 'Incorporate metrics into at least 3 bullet points (e.g. "Reduced bundle size by 28%").',
                      },
                      {
                        priority: 'Medium',
                        title: 'Missing Cloud & Containerization Keywords',
                        explanation:
                          'Modern SDE job descriptions consistently scan for Docker, AWS, or CI/CD familiarity.',
                        fix: 'Add Docker containerization or cloud deployment tools under your Technical Skills section.',
                      },
                      {
                        priority: 'Low',
                        title: 'Add a Concise Professional Summary',
                        explanation:
                          'A 2-sentence summary right below your header anchors your target domain for recruiter scanning.',
                        fix: 'Include a 2-line summary stating your core stack and engineering focus.',
                      },
                    ]
                  ).map((iss, i) => {
                    const badgeColor =
                      iss.priority.toLowerCase() === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : iss.priority.toLowerCase() === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

                    return (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-200">{iss.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                            {iss.priority} Priority
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{iss.explanation}</p>
                        <div className="text-[11px] text-emerald-300 font-medium pt-1 flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">Fix:</span> {iss.fix}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 6: PREPNEST ROADMAPS & LEARNING BRIDGE
              ======================================================== */}
          <div className="p-6 md:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" /> Bridge Resume Gaps with PrepNest Roadmaps
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Targeted learning tracks designed to help you master missing technical skills before your interview rounds.
                </p>
              </div>

              <Link
                to="/roadmaps"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 self-start md:self-auto"
              >
                Explore All Tracks <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                analysis?.roadmap_recommendations || [
                  {
                    id: 'backend',
                    title: 'Backend Development',
                    description: 'Build production REST APIs, FastAPI, authentication, and database integration.',
                    route: '/roadmaps?track=backend',
                  },
                  {
                    id: 'dsa',
                    title: 'Data Structures & Algorithms',
                    description: 'Master binary trees, dynamic programming, and core interview patterns.',
                    route: '/roadmaps?track=dsa',
                  },
                  {
                    id: 'tools',
                    title: 'Git & Development Tools',
                    description: 'Learn modern version control, pull requests, and CI/CD pipelines.',
                    route: '/roadmaps?track=tools',
                  },
                ]
              ).map((rm, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-4 transition hover:border-indigo-500/50"
                >
                  <div className="space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold text-white">{rm.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {rm.description}
                    </p>
                  </div>

                  <Link
                    to={rm.route || `/roadmaps?track=${rm.id}`}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-2 border-t border-slate-850"
                  >
                    Start Roadmap <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
