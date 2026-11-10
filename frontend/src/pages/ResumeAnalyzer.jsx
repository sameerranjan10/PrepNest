import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BlurDrop } from '@/components/ui/BlurDrop';
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
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiFetch } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';

export default function ResumeAnalyzerPage() {
  const { user } = useAuth();
  // Available Companies & Roles loaded from backend
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);

  // Selected Target
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');

  // File Upload State
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('');
  const [uploadError, setUploadError] = useState(null);

  // Resume Analysis Result State
  const [analysis, setAnalysis] = useState(null);
  const [loadingLatest, setLoadingLatest] = useState(true);
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

  useEffect(() => {
    fetchCompaniesAndRoles();
  }, []);

  useEffect(() => {
    fetchLatestAnalysis();
  }, [user?.id]);

  const fetchCompaniesAndRoles = async () => {
    try {
      const res = await apiFetch('/api/resume/companies-roles');
      if (res.ok) {
        const data = await res.json();
        if (data.companies?.length) {
          setAvailableCompanies(data.companies);
          setTargetCompany((prev) => prev || data.companies[0]);
        }
        if (data.roles?.length) {
          setAvailableRoles(data.roles);
          setTargetRole((prev) => prev || data.roles[0]);
        }
      }
    } catch (err) {
      console.warn('Could not fetch companies/roles list:', err);
    }
  };

  const fetchLatestAnalysis = async () => {
    setLoadingLatest(true);
    const token = localStorage.getItem('prepnest_token');
    if (!token) {
      setAnalysis(null);
      setJdResult(null);
      setLoadingLatest(false);
      return;
    }

    try {
      const res = await apiFetch('/api/resume/latest');
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
          if (data.analysis.target_company) setTargetCompany(data.analysis.target_company);
          if (data.analysis.target_role) setTargetRole(data.analysis.target_role);
          if (data.analysis.job_match?.matched_keywords?.length) {
            setJdResult(data.analysis.job_match);
          }
        } else {
          setAnalysis(null);
          setJdResult(null);
        }
      }
    } catch (err) {
      console.warn('Could not fetch latest analysis:', err);
    } finally {
      setLoadingLatest(false);
    }
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return 'Please select a file to upload.';
    const validExtensions = ['.pdf', '.docx'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      return 'Invalid file type. Please upload a PDF (.pdf) or Word document (.docx).';
    }
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      return 'File size exceeds 10MB limit.';
    }
    return null;
  };

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
      const timer1 = setTimeout(() => {
        setUploadProgress(45);
        setAnalyzingStep('Detecting resume sections...');
      }, 500);

      const timer2 = setTimeout(() => {
        setUploadProgress(75);
        setAnalyzingStep('Extracting technical skills & analyzing ATS benchmarks...');
      }, 1000);

      const res = await apiFetch('/api/resume/analyze', {
        method: 'POST',
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

  const handleReanalyzeTarget = async (company, role) => {
    setTargetCompany(company);
    setTargetRole(role);

    if (analysis) {
      const skillsFlat = analysis.skills_categorized
        ? Object.values(analysis.skills_categorized).flat()
        : [];

      try {
        const res = await apiFetch('/api/resume/target-match', {
          method: 'POST',
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

  const handleAnalyzeJD = async () => {
    if (!jdText.trim() || !analysis) return;
    setJdAnalyzing(true);
    try {
      const skillsFlat = analysis?.skills_categorized
        ? Object.values(analysis.skills_categorized).flat()
        : [];

      const res = await apiFetch('/api/resume/job-match', {
        method: 'POST',
        body: JSON.stringify({
          resume_text: analysis.extracted_text || skillsFlat.join(' '),
          job_description: jdText.trim(),
          skills: skillsFlat,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setJdResult(data);
      }
    } catch (err) {
      console.warn('JD Analysis failed:', err);
    } finally {
      setJdAnalyzing(false);
    }
  };

  const handleImproveCustomBullet = async () => {
    if (!customBullet.trim()) return;
    setBulletImproving(true);
    try {
      const res = await apiFetch('/api/resume/improve-bullet', {
        method: 'POST',
        body: JSON.stringify({
          bullet_text: customBulletResult ? customBullet.trim() : customBullet.trim(),
          target_role: targetRole || null,
          domain_filter: bulletDomainFilter === 'all' ? null : bulletDomainFilter,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const suggestions = Array.isArray(data.suggestions)
          ? data.suggestions
          : data.enhanced
          ? [data.enhanced]
          : [];
        const formatted = suggestions.flatMap((s) =>
          Array.isArray(s?.variations) ? s.variations : typeof s === 'string' ? [s] : s?.improved ? [s.improved] : []
        );
        setCustomBulletResult({ variations: formatted.length ? formatted : suggestions });
      }
    } catch (err) {
      console.warn('Error improving bullet point:', err);
    } finally {
      setBulletImproving(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const reportJson = JSON.stringify(analysis, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrepNest_Resume_Audit_${targetCompany}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score = 0) => {
    if (score >= 80) return 'text-[#16A34A]';
    if (score >= 65) return 'text-[#FFA116]';
    return 'text-[#DC2626]';
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
      <Sidebar activeRoute="resume-analyzer" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header defaultCollapsed />

        <BlurDrop as="main" className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:pr-[124px] lg:pr-[132px]">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="accent" size="sm">
                  ATS Audit Engine
                </Badge>
                <Badge variant="neutral" size="sm">
                  Software Engineering
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#262626] tracking-tight mt-1">
                Resume Analyzer & ATS Optimizer
              </h1>
              <p className="text-sm text-[#64748B]">
                Evaluate ATS compatibility, identify keyword gaps against hiring benchmarks, and optimize bullet points with quantified impact.
              </p>
            </div>

            {analysis && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownloadReport}
                icon={<Download className="w-4 h-4" />}
              >
                Download Audit Report
              </Button>
            )}
          </div>

          {/* Target Benchmarking Toolbar */}
          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#262626]">
              <Building2 className="w-4 h-4 text-[#FFA116]" />
              <span className="font-semibold">Target Company & Role Benchmarking:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-[#64748B]">Company:</label>
                <select
                  value={targetCompany}
                  onChange={(e) => handleReanalyzeTarget(e.target.value, targetRole)}
                  className="bg-[#F7F8FA] text-xs text-[#262626] border border-[#E5E7EB] rounded-md px-2.5 py-1.5 focus:bg-white focus:border-[#FFA116] outline-none cursor-pointer"
                >
                  {availableCompanies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs text-[#64748B]">Role:</label>
                <select
                  value={targetRole}
                  onChange={(e) => handleReanalyzeTarget(targetCompany, e.target.value)}
                  className="bg-[#F7F8FA] text-xs text-[#262626] border border-[#E5E7EB] rounded-md px-2.5 py-1.5 focus:bg-white focus:border-[#FFA116] outline-none cursor-pointer"
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Upload Dropzone + Scores Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Drag & Drop Uploader */}
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
                className={`border-2 border-dashed rounded-xl bg-white p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
                  isDragging
                    ? 'border-[#FFA116] bg-[#FFF8EE]'
                    : 'border-[#E5E7EB] hover:border-[#FFA116]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFF8EE] text-[#FFA116] flex items-center justify-center">
                  {analyzing ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-[#FFA116]" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#262626]">
                    {analyzing ? 'Analyzing Document...' : 'Upload Resume PDF or DOCX'}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Drag & drop or click to browse (Max 10MB)
                  </p>
                </div>

                {analyzing ? (
                  <div className="w-full max-w-xs space-y-1.5 mt-2">
                    <div className="w-full bg-[#F1F3F5] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#FFA116] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#FFA116] font-medium">{analyzingStep}</p>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Select File
                  </Button>
                )}
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/30 flex items-start gap-2 text-xs text-[#DC2626]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="flex-1 font-medium">{uploadError}</span>
                  <button onClick={() => setUploadError(null)} className="text-[#DC2626]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {analysis && (
                <Card className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[#FFA116]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#262626] truncate">
                        {analysis.file_name || 'Resume.pdf'}
                      </h4>
                      <p className="text-[10px] text-[#64748B]">
                        Audited for {analysis.target_company || targetCompany}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload New"
                    className="p-1 rounded text-[#64748B] hover:text-[#262626] hover:bg-[#F1F3F5] transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </Card>
              )}
            </div>

            {/* Right: Scores Overview & Dimension Breakdown */}
            <div className="lg:col-span-2 space-y-4">
              {loadingLatest ? (
                <Card className="p-8 flex items-center justify-center gap-2 text-xs text-[#64748B]">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FFA116]" />
                  <span>Checking your saved resume audit...</span>
                </Card>
              ) : !analysis ? (
                <Card className="p-8 flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[260px]">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8EE] text-[#FFA116] flex items-center justify-center">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-sm font-bold text-[#262626]">
                      No Resume Uploaded Yet
                    </h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Upload your PDF or DOCX resume to run a real ATS audit and view your overall score, dimension breakdown, extracted technical skills, and target company match.
                    </p>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Overall ATS Score */}
                    <Card className="p-5 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Overall ATS Score
                        </h4>
                        <div className="text-3xl font-extrabold text-[#262626] mt-1 flex items-baseline gap-1">
                          <span>{analysis.overall_score ?? 0}</span>
                          <span className="text-xs font-normal text-[#94A3B8]">/ 100</span>
                        </div>
                        <div className="mt-1.5">
                          <Badge variant={analysis.overall_score >= 70 ? 'success' : 'medium'} size="xs">
                            {analysis.readiness_level || 'Audited'}
                          </Badge>
                        </div>
                      </div>

                      {/* Circular Gauge */}
                      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="26" stroke="#E5E7EB" strokeWidth="4" fill="transparent" />
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="#FFA116"
                            strokeWidth="4"
                            strokeDasharray="163.36"
                            strokeDashoffset={163.36 * (1 - (analysis.overall_score || 0) / 100)}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <span className="absolute font-bold text-xs text-[#262626]">
                          {analysis.overall_score ?? 0}%
                        </span>
                      </div>
                    </Card>

                    {/* Company Match Rate */}
                    <Card className="p-5 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                          Target Match Rate
                        </h4>
                        <div className="text-3xl font-extrabold text-[#262626] mt-1 flex items-baseline gap-1">
                          <span>{analysis.company_match?.match_percentage ?? 0}%</span>
                        </div>
                        <span className="text-xs text-[#FFA116] font-medium mt-1 block">
                          {targetCompany || analysis.target_company} • {targetRole || analysis.target_role}
                        </span>
                      </div>

                      <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="26" stroke="#E5E7EB" strokeWidth="4" fill="transparent" />
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="#16A34A"
                            strokeWidth="4"
                            strokeDasharray="163.36"
                            strokeDashoffset={163.36 * (1 - (analysis.company_match?.match_percentage ?? 0) / 100)}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <span className="absolute font-bold text-xs text-[#262626]">
                          {analysis.company_match?.match_percentage ?? 0}%
                        </span>
                      </div>
                    </Card>
                  </div>

                  {/* Dimension Bars */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#FFA116]" />
                        <span>Evaluation Dimensions</span>
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                      {[
                        { label: 'ATS Compatibility', score: analysis.scores?.ats_compatibility ?? 0 },
                        { label: 'Keyword Density', score: analysis.scores?.keyword_optimization ?? 0 },
                        { label: 'Content & Impact', score: analysis.scores?.content_quality ?? 0 },
                        { label: 'Skills Alignment', score: analysis.scores?.skills_relevance ?? 0 },
                        { label: 'Project Technical Depth', score: analysis.scores?.project_quality ?? 0 },
                        { label: 'Formatting & Layout', score: analysis.scores?.formatting ?? 0 },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#64748B] font-medium">{item.label}</span>
                            <span className={`font-bold ${getScoreColor(item.score)}`}>
                              {item.score}%
                            </span>
                          </div>
                          <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FFA116] rounded-full transition-all"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>

          {analysis && (
            <>
              {/* Navigation Filter Tabs for Deep Analysis */}
              <div className="inline-flex items-center p-1 bg-[#F1F3F5] rounded-lg gap-1 text-xs overflow-x-auto max-w-full">
                {[
                  { id: 'all', label: 'All Sections' },
                  { id: 'structure', label: 'Structure & Skills' },
                  { id: 'gap', label: `Skill Gap: ${targetCompany}` },
                  { id: 'jd', label: 'Job Description Matcher' },
                  { id: 'bullets', label: 'Bullet Point Enhancer' },
                  { id: 'issues', label: 'Prioritized Fixes' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-md font-semibold transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-white text-[#262626] shadow-sm'
                        : 'text-[#64748B] hover:text-[#262626]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: STRUCTURE & TECHNICAL SKILLS */}
              {(activeTab === 'all' || activeTab === 'structure') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Structure Check */}
                  <Card className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#FFA116]" />
                        <span>Resume Sections</span>
                      </h3>
                      <span className="text-xs text-[#64748B]">
                        {`${(analysis.structure || []).filter((s) => s.detected).length}/${(analysis.structure || []).length} Found`}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {(analysis.structure || []).map((sec, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {sec.detected ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                            )}
                            <span className="font-medium text-[#262626]">{sec.name}</span>
                          </div>
                          <Badge variant={sec.detected ? 'success' : 'medium'} size="xs">
                            {sec.detected ? 'Detected' : 'Missing'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Extracted Skills */}
                  <Card className="lg:col-span-2 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-[#FFA116]" />
                        <span>Extracted Technical Skills</span>
                      </h3>
                      <span className="text-xs font-semibold text-[#FFA116]">
                        {Object.values(analysis.skills_categorized || {}).flat().length} Skills Extracted
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { category: 'Programming Languages', skills: analysis.skills_categorized?.languages || [] },
                        { category: 'Frontend & UI', skills: analysis.skills_categorized?.frontend || [] },
                        { category: 'Backend & APIs', skills: analysis.skills_categorized?.backend || [] },
                        { category: 'Databases & Storage', skills: analysis.skills_categorized?.databases || [] },
                        { category: 'DevOps & Tools', skills: analysis.skills_categorized?.cloud_devops || [] },
                      ].map((grp, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-[11px] font-semibold text-[#64748B]">{grp.category}:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {grp.skills.length > 0 ? (
                              grp.skills.map((s, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2.5 py-0.5 rounded-md bg-[#F7F8FA] border border-[#E5E7EB] text-[#262626] font-medium"
                                >
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-[#94A3B8]">None detected</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {/* TAB 2: COMPANY GAP ANALYSIS */}
              {(activeTab === 'all' || activeTab === 'gap') && (
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#FFA116]" />
                        <span>Company Skills Alignment: {targetCompany}</span>
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Compare your verified skills against typical {targetCompany} OA and screening criteria.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matched Skills */}
                    <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#16A34A]/25 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matched Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysis.company_match?.matched_skills || []).length > 0 ? (
                          analysis.company_match.matched_skills.map((s, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded bg-white border border-[#16A34A]/30 text-[#16A34A] font-semibold">
                              ✓ {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#64748B]">No matching keywords detected yet.</span>
                        )}
                      </div>
                    </div>

                    {/* Missing / High-Impact Keywords */}
                    <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/25 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#DC2626]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Missing Target Keywords</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysis.company_match?.missing_skills || []).length > 0 ? (
                          analysis.company_match.missing_skills.map((s, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded bg-white border border-[#DC2626]/30 text-[#DC2626] font-semibold">
                              + {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#16A34A]">No missing target keywords found.</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommended Roadmap Link */}
                  <div className="p-3.5 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-between text-xs">
                    <span className="text-[#262626]">
                      Close missing keyword gaps by following our tailored <strong>Learning Roadmaps</strong>.
                    </span>
                    <Link to="/roadmaps" className="font-bold text-[#FFA116] hover:underline flex items-center gap-1">
                      <span>Open Roadmaps</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Card>
              )}

              {/* TAB 3: JOB DESCRIPTION MATCHER */}
              {(activeTab === 'all' || activeTab === 'jd') && (
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-[#FFA116]" />
                        <span>Job Description Keyword Matcher</span>
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Paste a specific job posting to extract keywords and compare against your resume.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      placeholder="Paste job description requirements and responsibilities here..."
                      className="w-full h-28 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-3 text-xs text-[#262626] placeholder-[#94A3B8] focus:bg-white focus:border-[#FFA116] outline-none transition"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!jdText.trim() || jdAnalyzing}
                      onClick={handleAnalyzeJD}
                      icon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      {jdAnalyzing ? 'Analyzing JD...' : 'Analyze JD Match'}
                    </Button>
                  </div>

                  {jdResult && (
                    <div className="p-4 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#262626]">JD Match Score</span>
                        <Badge variant={jdResult.match_percentage >= 70 ? 'success' : 'medium'} size="sm">
                          {jdResult.match_percentage}% Keyword Match
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-[#16A34A] block mb-1">Matched Keywords:</span>
                          <div className="flex flex-wrap gap-1">
                            {(jdResult.matched_keywords || []).map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-white border border-[#E5E7EB] text-[#16A34A] font-medium">
                                ✓ {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold text-[#DC2626] block mb-1">Missing from Resume:</span>
                          <div className="flex flex-wrap gap-1">
                            {(jdResult.missing_keywords || []).map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-white border border-[#E5E7EB] text-[#DC2626] font-medium">
                                + {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}

          {/* TAB 4: BULLET POINT ENHANCER */}
          {(!analysis || activeTab === 'all' || activeTab === 'bullets') && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFA116]" />
                    <span>Bullet Point Enhancer</span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Transform weak resume bullets into strong, quantified achievements using the Google XYZ formula.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <textarea
                  value={customBullet}
                  onChange={(e) => setCustomBullet(e.target.value)}
                  placeholder="e.g. Worked on the backend APIs and helped with database queries..."
                  className="w-full h-20 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-3 text-xs text-[#262626] placeholder-[#94A3B8] focus:bg-white focus:border-[#FFA116] outline-none transition"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={customMetricText}
                    onChange={(e) => setCustomMetricText(e.target.value)}
                    placeholder="Optional Metric: e.g. reduced latency by 35%"
                    className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs text-[#262626] placeholder-[#94A3B8] focus:bg-white focus:border-[#FFA116] outline-none flex-1 min-w-[200px]"
                  />

                  <select
                    value={bulletDomainFilter}
                    onChange={(e) => setBulletDomainFilter(e.target.value)}
                    className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-2.5 py-1.5 text-xs text-[#262626] focus:bg-white focus:border-[#FFA116] outline-none cursor-pointer"
                  >
                    <option value="all">General Engineering</option>
                    <option value="backend">Backend & APIs</option>
                    <option value="frontend">Frontend & Web</option>
                    <option value="devops">DevOps & Cloud</option>
                  </select>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!customBullet.trim() || bulletImproving}
                    onClick={handleImproveCustomBullet}
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    {bulletImproving ? 'Generating...' : 'Enhance Bullet'}
                  </Button>
                </div>

                {customBulletResult && customBulletResult.variations && (
                  <div className="p-4 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] space-y-2.5 mt-3">
                    <span className="text-xs font-bold text-[#262626] block">
                      Optimized Google XYZ Bullet Variations:
                    </span>
                    <div className="space-y-2">
                      {customBulletResult.variations.map((v, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-lg bg-white border border-[#E5E7EB] flex items-start justify-between gap-3 text-xs"
                        >
                          <p className="font-medium text-[#262626] leading-relaxed">
                            • {v.text || v}
                          </p>
                          <button
                            onClick={() => handleCopy(v.text || v, `bullet-${i}`)}
                            className="p-1 rounded text-[#64748B] hover:text-[#262626] hover:bg-[#F1F3F5] shrink-0"
                            title="Copy to clipboard"
                          >
                            {copiedMap[`bullet-${i}`] ? (
                              <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* TAB 5: PRIORITIZED ISSUES & FIXES */}
          {analysis && (activeTab === 'all' || activeTab === 'issues') && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#262626] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Prioritized Recommendations</span>
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                {(analysis.recommendations || []).length === 0 ? (
                  <p className="text-xs text-[#64748B]">No prioritized issues reported for this resume.</p>
                ) : (
                  analysis.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] flex items-start gap-3"
                    >
                      <Badge
                        variant={rec.priority === 'High' ? 'hard' : rec.priority === 'Medium' ? 'medium' : 'neutral'}
                        size="xs"
                      >
                        {rec.priority || 'Tip'}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-semibold text-[#262626]">{rec.title}</p>
                        <p className="text-[#64748B] text-[11px] mt-0.5">{rec.desc || rec.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </BlurDrop>
      </div>
    </div>
  );
}
