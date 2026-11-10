import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  User,
  Briefcase,
  Building2,
  Target,
  Code2,
  Compass,
  Award,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export function ContextDrawer({
  isOpen,
  onClose,
  contextSummary,
  user,
  onRefreshContext,
  isRefreshing
}) {
  if (!isOpen) return null;

  const studentName = contextSummary?.student_name || user?.full_name || user?.name || 'Student';
  const targetRole = contextSummary?.target_role || user?.target_role || null;
  const targetCompany = contextSummary?.target_company || user?.target_companies || user?.target_company || null;
  const prepLevel = contextSummary?.prep_level || user?.prep_level || null;
  const preferredLang = contextSummary?.preferred_language || user?.preferred_language || null;
  const readinessLevel = contextSummary?.readiness_level || null;
  const atsScore = contextSummary?.ats_score;

  const dsaSolved = contextSummary?.dsa_solved ?? 0;
  const dsaTotal = contextSummary?.dsa_total ?? 0;
  const dsaPct = dsaTotal > 0 ? Math.round((dsaSolved / dsaTotal) * 100) : 0;
  const dsaBreakdown = contextSummary?.dsa_breakdown || { Easy: 0, Medium: 0, Hard: 0 };

  const roadmapPct = contextSummary?.roadmap_percentage ?? 0;
  const roadmapCompleted = contextSummary?.roadmap_completed ?? 0;
  const roadmapTotal = contextSummary?.roadmap_total ?? 0;

  const matchedSkills = contextSummary?.matched_skills || [];
  const missingSkills = contextSummary?.missing_skills || [];

  return (
    <>
      {/* Subtle Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 transition-opacity"
      />

      {/* Right-Side Collapsible Drawer */}
      <aside
        aria-label="Student Context Drawer"
        className="fixed top-0 right-0 bottom-0 w-full max-w-[340px] bg-[#FFFFFF] border-l border-[#E5E7EB] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#262626]">Student Context</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#16A34A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                Profile Synced
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onRefreshContext && (
              <button
                onClick={onRefreshContext}
                disabled={isRefreshing}
                title="Refresh profile context"
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA] transition"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#FFA116]' : ''}`} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close context drawer"
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          {/* Student Profile Identity */}
          <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#FFA116]/15 border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116] font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#262626] truncate">{studentName}</p>
                <p className="text-[11px] text-[#64748B] truncate">
                  {user?.email || 'Active Candidate'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-2 border-t border-[#E5E7EB]">
              {/* Target Roles */}
              <div className="flex items-start gap-2">
                <Briefcase className="w-3.5 h-3.5 text-[#64748B] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Target Roles</p>
                  <p className="text-xs font-semibold text-[#262626] mt-0.5">
                    {targetRole || <span className="text-[#94A3B8] font-normal italic">Not set in profile</span>}
                  </p>
                </div>
              </div>

              {/* Target Companies */}
              <div className="flex items-start gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#64748B] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Target Companies</p>
                  <p className="text-xs font-semibold text-[#262626] mt-0.5">
                    {targetCompany || <span className="text-[#94A3B8] font-normal italic">Not set in profile</span>}
                  </p>
                </div>
              </div>

              {/* Current Preparation Focus */}
              <div className="flex items-start gap-2">
                <Award className="w-3.5 h-3.5 text-[#64748B] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Current Focus</p>
                  <p className="text-xs font-semibold text-[#262626] mt-0.5">
                    {prepLevel || preferredLang
                      ? `${prepLevel || 'Standard'}${preferredLang ? ` · ${preferredLang}` : ''}`
                      : <span className="text-[#94A3B8] font-normal italic">General Placement Prep</span>}
                  </p>
                </div>
              </div>

              {/* Placement Goal / Readiness */}
              <div className="flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-[#FFA116] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">Placement Goal</p>
                  <p className="text-xs font-semibold text-[#262626] mt-0.5">
                    {readinessLevel
                      ? `${readinessLevel} Readiness${atsScore ? ` (ATS: ${atsScore}/100)` : ''}`
                      : <span className="text-[#94A3B8] font-normal italic">Complete resume audit to benchmark</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Tracking: DSA & Roadmap */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Preparation Progress
            </h3>

            {/* DSA Progress */}
            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#262626] flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  DSA Progress
                </span>
                <span className="font-bold text-[#262626]">
                  {dsaSolved}{dsaTotal > 0 ? ` / ${dsaTotal}` : ' solved'}
                </span>
              </div>

              <div className="w-full h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#16A34A] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, dsaPct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1">
                <span>Easy: <strong className="text-[#16A34A]">{dsaBreakdown.Easy ?? 0}</strong></span>
                <span>Medium: <strong className="text-[#D97706]">{dsaBreakdown.Medium ?? 0}</strong></span>
                <span>Hard: <strong className="text-[#DC2626]">{dsaBreakdown.Hard ?? 0}</strong></span>
              </div>
            </div>

            {/* Roadmap Progress */}
            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#262626] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#FFA116]" />
                  Roadmap Progress
                </span>
                <span className="font-bold text-[#FFA116]">{roadmapPct}%</span>
              </div>

              <div className="w-full h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFA116] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, roadmapPct)}%` }}
                />
              </div>

              <p className="text-[10px] text-[#64748B]">
                {roadmapTotal > 0
                  ? `${roadmapCompleted} of ${roadmapTotal} core milestones completed`
                  : 'Track topics in Learning Roadmaps'}
              </p>
            </div>
          </div>

          {/* Skills & Gaps */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Skill Benchmark
            </h3>

            {matchedSkills.length === 0 && missingSkills.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] text-center space-y-1.5">
                <p className="text-xs font-medium text-[#64748B]">No resume skill benchmark yet</p>
                <Link
                  to="/resume-analyzer"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FFA116] hover:underline"
                >
                  Run Resume Analyzer <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {matchedSkills.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB]">
                    <p className="text-[10px] font-bold uppercase text-[#16A34A] flex items-center gap-1 mb-2">
                      <CheckCircle2 className="w-3 h-3" /> Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#E6FAF6] text-[#16A34A] border border-[#16A34A]/20 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {missingSkills.length > 0 && (
                  <div className="p-3 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB]">
                    <p className="text-[10px] font-bold uppercase text-[#DC2626] flex items-center gap-1 mb-2">
                      <AlertCircle className="w-3 h-3" /> Priority Gaps
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {missingSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#FFEBEF] text-[#DC2626] border border-[#DC2626]/20 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F7F8FA]">
          <Link
            to="/settings"
            onClick={onClose}
            className="w-full py-2 px-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F1F3F5] border border-[#E5E7EB] text-xs font-semibold text-[#262626] flex items-center justify-center gap-1.5 transition"
          >
            <span>Update Profile & Targets</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#64748B]" />
          </Link>
        </div>
      </aside>
    </>
  );
}

