import React from "react";
import {
  Sparkles,
  Building2,
  Briefcase,
  Clock,
  ShieldAlert,
  UserCheck,
  History,
  HelpCircle,
  Play,
  RotateCcw,
  Trash2,
  Eye,
  Info,
  BrainCircuit,
} from "lucide-react";
import { ButtonLoader } from "@/components/ui/PrepNestLoader";
import {
  INTERVIEW_CATEGORIES,
  INTERVIEW_MODES,
  INTERVIEW_PERSONALITIES,
  EXPERIENCE_LEVELS,
  DURATION_OPTIONS,
} from "./interviewConfig";

export function InterviewSetup({
  configLoading,
  configError,
  onRetryConfig,
  companies,
  bankCounts,
  candidateContext,
  projectMock,
  activeRecoverableSession,
  onResumeSession,
  onDiscardRecoverable,
  selectedCategory,
  onSelectCategory,
  selectedCompany,
  onSelectCompany,
  targetRole,
  onChangeTargetRole,
  selectedMode,
  onSelectMode,
  selectedPersonality,
  onSelectPersonality,
  experienceLevel,
  onSelectExperienceLevel,
  durationMinutes,
  onSelectDuration,
  onStartInterview,
  isStarting,
  interviewHistory,
  onViewHistoryReport,
}) {
  const categories = [...INTERVIEW_CATEGORIES];
  if (projectMock?.questions?.length > 0) {
    categories.unshift({
      id: "Project",
      label: "Project Defense",
      subtitle: projectMock.projectTitle || "Focused walkthrough & defense of your built project",
      badge: "Selected Project",
    });
  }

  const selectedCompanyMeta = companies.find(
    (c) => c.name.toLowerCase() === (selectedCompany || "").toLowerCase()
  );

  return (
    <div className="space-y-6 w-full">
      {/* Error Banner */}
      {configError && !configLoading && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] dark:bg-[#F85149]/15 border border-[#DC2626]/25 text-xs text-[#DC2626] dark:text-[#F85149] flex items-center justify-between gap-3">
          <span>{configError}</span>
          <button
            type="button"
            onClick={onRetryConfig}
            className="font-semibold underline cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Active Session Refresh Recovery Banner */}
      {activeRecoverableSession && (
        <div className="p-5 rounded-2xl bg-[#FFFBEB] dark:bg-[#F59E0B]/15 border border-[#F59E0B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#B45309] dark:text-[#FBBF24]">
                In-Progress Interview Session Saved
              </span>
            </div>
            <p className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3]">
              {activeRecoverableSession.company_name
                ? `${activeRecoverableSession.company_name} · `
                : ""}
              {activeRecoverableSession.category} Interview (Turn{" "}
              {activeRecoverableSession.current_turn_number})
            </p>
            <p className="text-xs text-[#64748B] dark:text-[#8B949E]">
              Your conversation state and transcript were preserved in PostgreSQL. Resume right where you left off.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onDiscardRecoverable}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] text-xs font-semibold text-[#64748B] hover:text-[#DC2626] transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>
            <button
              type="button"
              onClick={onResumeSession}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-xs font-semibold text-white shadow-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resume Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Setup Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Track, Company, Mode, Personality */}
        <div className="xl:col-span-8 space-y-6">
          {/* 1. Interview Category */}
          <section className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                  1. Interview Track
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#8B949E]">
                  Select your focus track; the AI interviewer adapts questions and follow-ups dynamically.
                </p>
              </div>
              {configLoading && <ButtonLoader size="sm" tone="brand" label="Loading configuration" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                const count = bankCounts?.[cat.id];
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer space-y-2 ${
                      active
                        ? "border-[#F59E0B] bg-[#FFFBEB] dark:bg-[#F59E0B]/15 ring-1 ring-[#F59E0B]/30"
                        : "border-[#E2E8F0] dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117]/60 hover:border-[#F59E0B]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                        {cat.label}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          active
                            ? "bg-[#F59E0B] text-white border-[#F59E0B]"
                            : "bg-white dark:bg-[#161B22] text-[#64748B] border-[#E2E8F0] dark:border-[#30363D]"
                        }`}
                      >
                        {count ? `${count} Bank Qs` : cat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#8B949E] leading-relaxed">
                      {cat.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Interview Mode & Personality */}
          <section className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                2. Interview Experience &amp; Personality
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#8B949E]">
                Mode controls coaching hints &amp; timing; Personality adjusts interviewer communication style without distorting grading fairness.
              </p>
            </div>

            {/* Modes */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#8B949E]">
                Interview Mode
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {INTERVIEW_MODES.map((m) => {
                  const active = selectedMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onSelectMode(m.id)}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer space-y-1.5 ${
                        active
                          ? "border-[#F59E0B] bg-[#FFFBEB] dark:bg-[#F59E0B]/15"
                          : "border-[#E2E8F0] dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117]/60 hover:border-[#F59E0B]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                          {m.label}
                        </span>
                        <span className="text-[10px] font-semibold text-[#F59E0B]">
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#8B949E] leading-relaxed">
                        {m.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personalities */}
            <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#30363D]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#8B949E]">
                Interviewer Personality
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {INTERVIEW_PERSONALITIES.map((p) => {
                  const active = selectedPersonality === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelectPersonality(p.id)}
                      className={`p-3.5 rounded-xl border text-left transition cursor-pointer space-y-1 ${
                        active
                          ? "border-[#F59E0B] bg-[#FFFBEB] dark:bg-[#F59E0B]/15"
                          : "border-[#E2E8F0] dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#0D1117]/60 hover:border-[#F59E0B]/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                        <UserCheck className={`w-3.5 h-3.5 ${active ? "text-[#F59E0B]" : "text-[#64748B]"}`} />
                        <span>{p.label}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] dark:text-[#8B949E] leading-relaxed">
                        {p.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Right 4 Cols: Company-Specific, Role, Duration, Personalized Context, Start CTA */}
        <div className="xl:col-span-4 space-y-5">
          <section className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#F59E0B]" />
              <span>3. Company &amp; Role Calibration</span>
            </h2>

            {/* Company Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#64748B] dark:text-[#8B949E]">
                Target Company Track
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => onSelectCompany(e.target.value)}
                className="lc-input cursor-pointer text-xs"
              >
                <option value="General">General Role-Aligned Interview</option>
                {companies.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name} ({c.hiring_difficulty} · {c.role})
                  </option>
                ))}
              </select>

              {selectedCompanyMeta && (
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/70 border border-[#E2E8F0] dark:border-[#30363D] space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                    <span>{selectedCompanyMeta.name} Pattern</span>
                    <span className="text-[#F59E0B]">{selectedCompanyMeta.hiring_difficulty}</span>
                  </div>
                  {selectedCompanyMeta.sections?.length > 0 && (
                    <p className="text-[#64748B] dark:text-[#8B949E]">
                      Focus: {selectedCompanyMeta.sections.join(", ")}
                    </p>
                  )}
                  <p className="text-[10px] text-[#94A3B8] flex items-start gap-1 pt-0.5">
                    <Info className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>Tailored using commonly reported patterns and PrepNest topic banks; not confidential questions.</span>
                  </p>
                </div>
              )}
            </div>

            {/* Target Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#64748B] dark:text-[#8B949E] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Target Role</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => onChangeTargetRole(e.target.value)}
                placeholder="e.g. Software Development Engineer"
                className="lc-input text-xs"
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#64748B] dark:text-[#8B949E]">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => onSelectExperienceLevel(e.target.value)}
                className="lc-input cursor-pointer text-xs"
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#64748B] dark:text-[#8B949E] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Interview Duration</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_OPTIONS.map((opt) => {
                  const active = durationMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() => onSelectDuration(opt.minutes)}
                      className={`py-2 px-2 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                        active
                          ? "bg-[#F59E0B] border-[#F59E0B] text-white"
                          : "bg-[#F8FAFC] dark:bg-[#0D1117] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B] hover:text-[#1E293B]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Candidate Profile Context Preview */}
            {candidateContext && (
              <div className="p-3 rounded-xl bg-[#FFF8EE]/70 dark:bg-[#FFA116]/10 border border-[#F59E0B]/25 space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-[#D97706] dark:text-[#FFA116]">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Personalized Profile Context Active</span>
                </div>
                <p className="text-[#64748B] dark:text-[#8B949E]">
                  Skills: {(candidateContext.skills || []).slice(0, 4).join(", ") || candidateContext.preferred_language || "General CS"} · DSA Solved: {candidateContext.dsa_solved_count ?? 0}
                </p>
                {candidateContext.weak_interview_categories?.length > 0 && (
                  <p className="text-[#B45309] dark:text-[#FBBF24]">
                    Prioritizing revision in: {candidateContext.weak_interview_categories.join(", ")}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onStartInterview}
              disabled={isStarting}
              className="w-full flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xs transition cursor-pointer"
            >
              {isStarting ? (
                <>
                  <ButtonLoader size="sm" tone="light" label="Initializing AI Interviewer" />
                  <span>Initializing AI Interviewer...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Live AI Interview</span>
                </>
              )}
            </button>
          </section>

          {/* System Readiness */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs flex items-start gap-3 text-xs text-[#64748B] dark:text-[#8B949E]">
            <HelpCircle className="w-4 h-4 text-[#F59E0B] mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                Webcam &amp; Voice Notes
              </p>
              <p className="leading-relaxed">
                Speech-to-text works best in Chrome or Edge. Transcription artifacts are tolerated automatically, and manual text editing is always available.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interview History */}
      {interviewHistory.length > 0 && (
        <section className="p-5 sm:p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-2">
              <History className="w-4 h-4 text-[#F59E0B]" />
              <span>Recent Interview Sessions</span>
            </h2>
            <span className="text-[11px] text-[#64748B]">
              {interviewHistory.length} completed
            </span>
          </div>
          <div className="divide-y divide-[#E2E8F0] dark:divide-[#21262D]">
            {interviewHistory.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="py-3 flex flex-wrap items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                      {item.category} Interview
                    </span>
                    {item.mode && (
                      <span className="px-2 py-0.5 rounded-full bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] text-[10px] font-medium capitalize text-[#64748B]">
                        {item.mode}
                      </span>
                    )}
                    {item.personality && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FFFBEB] dark:bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[10px] font-medium capitalize text-[#B45309] dark:text-[#FBBF24]">
                        {item.personality}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    {item.attempted_count || 0}/{item.total_questions || 0} answered · Avg {item.average_words || 0} words
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`font-bold text-sm ${
                        item.score >= 70 ? "text-[#16A34A]" : "text-[#F59E0B]"
                      }`}
                    >
                      {item.score}%
                    </span>
                    <p className="text-[10px] text-[#94A3B8]">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : ""}
                    </p>
                  </div>

                  {item.has_report && item.session_id && (
                    <button
                      type="button"
                      onClick={() => onViewHistoryReport(item.session_id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] text-[11px] font-semibold text-[#1E293B] dark:text-[#E6EDF3] hover:border-[#F59E0B] hover:text-[#F59E0B] transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

