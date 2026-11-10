import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  Award,
  MessageSquare,
  RotateCcw,
  Target,
  Code2,
  Map,
  Sparkles,
  BookOpen,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { PROVENANCE_LABELS, STRATEGY_LABELS } from "./interviewConfig";

function SkillBar({ label, value }) {
  const pct = Math.max(0, Math.min(100, Number(value || 0)));
  const barColor =
    pct >= 75 ? "bg-[#16A34A]" : pct >= 55 ? "bg-[#F59E0B]" : "bg-[#DC2626]";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs tabular-nums">
        <span className="font-medium text-[#64748B] dark:text-[#8B949E]">{label}</span>
        <span className="font-bold text-[#1E293B] dark:text-[#E6EDF3]">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[#E2E8F0] dark:bg-[#21262D] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function InterviewReport({
  report,
  xpData,
  sessionMeta,
  onRestart,
}) {
  if (!report) return null;

  const overall = report.overall || {};
  const skills = report.skill_evaluation || {};
  const recs = report.personalized_recommendations || {};
  const qAnalysis = report.question_analysis || [];
  const score = Number(overall.score || 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#F59E0B]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] dark:bg-[#16A34A]/15 border border-[#16A34A]/30 text-[#16A34A] dark:text-[#3FB950] text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Interview Evaluation Report
              </span>
              {sessionMeta?.company_name && (
                <span className="px-2.5 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] text-xs font-semibold text-[#1E293B] dark:text-[#E6EDF3]">
                  {sessionMeta.company_name}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-[#FFFBEB] dark:bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-xs font-semibold text-[#B45309] dark:text-[#FBBF24] capitalize">
                {sessionMeta?.category} · {sessionMeta?.mode} · {sessionMeta?.personality}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] dark:text-[#E6EDF3]">
              {overall.classification || "Performance Summary"}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#8B949E]">
              Target Role: {sessionMeta?.target_role || "Software Engineer"} ·{" "}
              {report.company_pattern_note || "Structured AI evaluation rubric."}
            </p>

            {xpData && Number(xpData.xp_earned || 0) > 0 && (
              <div className="inline-flex items-center gap-2 bg-[#FFF8EE] dark:bg-[#FFA116]/15 border border-[#FFA116]/30 text-[#D97706] dark:text-[#FFA116] text-xs font-semibold px-3.5 py-1.5 rounded-full">
                <Award className="w-4 h-4" />
                <span>
                  +{xpData.xp_earned} XP Earned! Daily Streak: {xpData.streak || 1} day(s)
                </span>
              </div>
            )}
          </div>

          <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] min-w-[160px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              Overall Score
            </span>
            <span
              className={`text-5xl font-extrabold tabular-nums mt-1 ${
                score >= 70
                  ? "text-[#16A34A]"
                  : score >= 50
                  ? "text-[#F59E0B]"
                  : "text-[#DC2626]"
              }`}
            >
              {score}%
            </span>
          </div>
        </div>
      </div>

      {/* Overall Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Attempted"
          value={`${overall.questions_attempted ?? 0} / ${overall.total_questions ?? 0}`}
        />
        <MetricCard
          title="Answered Well"
          value={`${overall.questions_correct ?? 0}`}
        />
        <MetricCard
          title="Completion"
          value={`${overall.completion_percentage ?? 0}%`}
        />
        <MetricCard
          title="Average Depth"
          value={`${overall.average_words ?? 0} words`}
        />
        <MetricCard
          title="Key Concepts Hit"
          value={`${overall.keyword_matches ?? 0}`}
        />
      </div>

      {/* Skill Evaluation + Strengths/Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skill Evaluation Breakdown */}
        <section className="lg:col-span-5 p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#F59E0B]" />
            <span>Skill Evaluation</span>
          </h2>

          <div className="space-y-3.5">
            <SkillBar label="Technical Knowledge" value={skills.technical_knowledge} />
            <SkillBar label="Problem Solving" value={skills.problem_solving} />
            <SkillBar label="Communication Clarity" value={skills.communication} />
            <SkillBar label="Conceptual Understanding" value={skills.conceptual_understanding} />
            <SkillBar label="Answer Relevance" value={skills.answer_relevance} />
          </div>

          {skills.confidence_note && (
            <p className="text-[11px] text-[#64748B] dark:text-[#8B949E] pt-2 border-t border-[#E2E8F0] dark:border-[#30363D] leading-relaxed">
              {skills.confidence_note}
            </p>
          )}
        </section>

        {/* Strengths & Improvements */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <section className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#16A34A] dark:text-[#3FB950] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Key Strengths</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#1E293B] dark:text-[#E6EDF3]">
              {(report.strengths || []).map((s, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#16A34A] font-bold">✓</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#D97706] dark:text-[#FBBF24] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Areas to Improve</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#1E293B] dark:text-[#E6EDF3]">
              {(report.improvements || []).map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#F59E0B] font-bold">!</span>
                  <span className="leading-relaxed">{imp}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Question-Wise Analysis */}
      <section className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
            <span>Question-Wise Analysis</span>
          </h2>
          <span className="text-xs text-[#64748B]">{qAnalysis.length} turns evaluated</span>
        </div>

        <div className="space-y-4">
          {qAnalysis.map((item, idx) => {
            const prov =
              PROVENANCE_LABELS[item.question_source] || PROVENANCE_LABELS.topic_directory;
            const stratLabel = item.followup_strategy
              ? STRATEGY_LABELS[item.followup_strategy] || item.followup_strategy
              : null;

            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117]/75 border border-[#E2E8F0] dark:border-[#30363D] space-y-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#F59E0B]">
                        Turn {item.turn_number} · {item.topic}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${prov.className}`}
                      >
                        {prov.label}
                      </span>
                      {stratLabel && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] text-[#64748B]">
                          {stratLabel}
                        </span>
                      )}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] text-[#64748B]">
                        {item.difficulty}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                      {item.question}
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${
                      item.score >= 70
                        ? "text-[#16A34A] bg-[#F0FDF4] border-[#16A34A]/30"
                        : item.score >= 45
                        ? "text-[#D97706] bg-[#FFFBEB] border-[#F59E0B]/30"
                        : "text-[#DC2626] bg-[#FEF2F2] border-[#DC2626]/30"
                    }`}
                  >
                    {item.score}% · {item.verdict}
                  </span>
                </div>

                {/* Candidate Response */}
                <div className="p-3.5 rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1">
                    Your Response
                  </p>
                  <p className="text-xs text-[#1E293B] dark:text-[#E6EDF3] whitespace-pre-wrap leading-relaxed">
                    {item.candidate_response || (
                      <span className="italic text-[#94A3B8]">No response submitted.</span>
                    )}
                  </p>
                </div>

                {/* Detailed Rubric Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#F0FDF4]/60 dark:bg-[#16A34A]/10 border border-[#16A34A]/20">
                    <span className="font-bold text-[#16A34A] dark:text-[#3FB950] block mb-0.5">
                      What Was Correct
                    </span>
                    <p className="text-[#1E293B] dark:text-[#E6EDF3] leading-relaxed">
                      {item.what_was_correct}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#FFFBEB]/80 dark:bg-[#F59E0B]/10 border border-[#F59E0B]/25">
                    <span className="font-bold text-[#D97706] dark:text-[#FBBF24] block mb-0.5">
                      What Was Missing
                    </span>
                    <p className="text-[#1E293B] dark:text-[#E6EDF3] leading-relaxed">
                      {item.what_was_missing}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-[#1E293B] dark:text-[#E6EDF3]">
                      Suggested Improvement:{" "}
                    </span>
                    <span className="text-[#64748B] dark:text-[#8B949E]">
                      {item.suggested_improvement}
                    </span>
                  </div>
                  {item.expected_answer && (
                    <div>
                      <span className="font-bold text-[#16A34A] dark:text-[#3FB950]">
                        Expected Key Explanation:{" "}
                      </span>
                      <span className="text-[#64748B] dark:text-[#8B949E]">
                        {item.expected_answer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Personalized Recommendations (Real PostgreSQL Records) */}
      <section className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-2">
            <Target className="w-4 h-4 text-[#F59E0B]" />
            <span>Personalized Next Steps &amp; Study Recommendations</span>
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#FFFBEB] dark:bg-[#F59E0B]/15 border border-[#F59E0B]/30 font-semibold text-[#B45309] dark:text-[#FBBF24]">
              Next Difficulty: {recs.recommended_next_difficulty || "Medium"}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#F8FAFC] dark:bg-[#21262D] border border-[#E2E8F0] dark:border-[#30363D] font-semibold text-[#64748B] capitalize">
              Suggested Mode: {recs.recommended_next_mode || "realistic"}
            </span>
          </div>
        </div>

        {/* Weak & Revision Topics */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
            Revision Focus:
          </span>
          {(recs.weak_topics || []).map((t, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] text-xs font-medium text-[#1E293B] dark:text-[#E6EDF3]"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Recommended DSA Problems */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Recommended DSA Problems</span>
            </h3>
            <div className="space-y-2">
              {(recs.recommended_dsa_problems || []).map((p) => (
                <Link
                  key={p.id}
                  to={`/dsa?search=${encodeURIComponent(p.title)}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] hover:border-[#F59E0B] transition text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1E293B] dark:text-[#E6EDF3] truncate">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {p.difficulty} · {(p.topics || []).join(", ")}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended Roadmap Topics */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0D1117] border border-[#E2E8F0] dark:border-[#30363D] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] dark:text-[#E6EDF3] flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Recommended Learning Roadmaps</span>
            </h3>
            <div className="space-y-2">
              {(recs.recommended_roadmap_topics || []).map((t) => (
                <Link
                  key={t.id}
                  to={`/roadmaps?track=${encodeURIComponent(t.domain_id)}&topic=${encodeURIComponent(t.id)}`}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] hover:border-[#16A34A] transition text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1E293B] dark:text-[#E6EDF3] truncate">
                      {t.title}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate">
                      {t.domain_name} · {t.difficulty}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="w-full flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold px-5 py-3.5 rounded-xl transition shadow-xs cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Start New Mock Interview</span>
      </button>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="p-4 rounded-xl bg-[#FFFFFF] dark:bg-[#161B22] border border-[#E2E8F0] dark:border-[#30363D] shadow-xs">
      <p className="text-[11px] uppercase font-semibold text-[#64748B] dark:text-[#8B949E]">
        {title}
      </p>
      <p className="text-xl sm:text-2xl font-extrabold text-[#1E293B] dark:text-[#E6EDF3] mt-1 tabular-nums">
        {value}
      </p>
    </div>
  );
}

