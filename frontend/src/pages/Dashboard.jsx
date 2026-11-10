import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BlurDrop } from '@/components/ui/BlurDrop';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';

import { DashboardWelcome } from '@/components/dashboard/DashboardWelcome';
import { PerformanceStatistics } from '@/components/dashboard/PerformanceStatistics';
import { ContinueLearning } from '@/components/dashboard/ContinueLearning';
import { RecommendedProblems } from '@/components/dashboard/RecommendedProblems';
import { WeeklyActivityHeatmap } from '@/components/dashboard/WeeklyActivityHeatmap';
import { RoadmapProgressSummary } from '@/components/dashboard/RoadmapProgressSummary';
import { PreparationProgress } from '@/components/dashboard/PreparationProgress';
import { TargetCompanies } from '@/components/dashboard/TargetCompanies';
import { AIMentorWidget } from '@/components/dashboard/AIMentorWidget';
import { UpcomingGoals } from '@/components/dashboard/UpcomingGoals';
import { QuickAccess } from '@/components/dashboard/QuickAccess';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const RECENT_TOPIC_KEY = 'prepnest_roadmap_recent';

function readRecentRoadmapAccess() {
  try {
    const raw = localStorage.getItem(RECENT_TOPIC_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const displayName = user?.full_name || user?.name || 'Student';

  const [dsaMeta, setDsaMeta] = useState({ total_problems: 0, solved_count: 0 });
  const [recommendedDSA, setRecommendedDSA] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [aptitudeStats, setAptitudeStats] = useState({ total: 0, solved: 0 });
  const [aptitudeResults, setAptitudeResults] = useState([]);
  const [roadmapDomains, setRoadmapDomains] = useState([]);
  const [roadmapOverall, setRoadmapOverall] = useState({
    total_topics: 0,
    completed_topics: 0,
    progress_percentage: 0,
  });
  const [roadmapRecs, setRoadmapRecs] = useState({
    has_resume_scan: false,
    recommendations: [],
  });
  const [leaderboardUser, setLeaderboardUser] = useState(null);
  const [contextSummary, setContextSummary] = useState(null);
  const [resumeLatest, setResumeLatest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const recentAccess = useMemo(() => readRecentRoadmapAccess(), []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setLoadError(false);

    try {
      const results = await Promise.allSettled([
        apiFetch('/api/dsa/meta'),
        apiFetch('/api/dsa/problems?limit=6'),
        apiFetch('/api/companies'),
        apiFetch('/api/aptitude/directory?limit=1'),
        apiFetch('/api/aptitude/results'),
        apiFetch('/api/roadmap/domains'),
        apiFetch('/api/roadmap/recommendations'),
        apiFetch('/api/leaderboard/me'),
        apiFetch('/api/mentor/context-summary'),
        apiFetch('/api/resume/latest'),
      ]);

      const anySuccess = results.some(
        (r) => r.status === 'fulfilled' && r.value && r.value.ok
      );
      if (!anySuccess) {
        setLoadError(true);
      }

      const [
        dsaMetaRes,
        dsaProbRes,
        compRes,
        aptDirRes,
        aptResultsRes,
        roadmapDomRes,
        roadmapRecRes,
        lbMeRes,
        ctxRes,
        resumeRes,
      ] = results;

      if (dsaMetaRes.status === 'fulfilled' && dsaMetaRes.value.ok) {
        setDsaMeta(await dsaMetaRes.value.json());
      }
      if (dsaProbRes.status === 'fulfilled' && dsaProbRes.value.ok) {
        const p = await dsaProbRes.value.json();
        setRecommendedDSA(p.problems || []);
      }
      if (compRes.status === 'fulfilled' && compRes.value.ok) {
        const c = await compRes.value.json();
        setCompanies(c.companies || []);
      }
      if (aptDirRes.status === 'fulfilled' && aptDirRes.value.ok) {
        const a = await aptDirRes.value.json();
        setAptitudeStats({ total: a.total || 0, solved: a.total_solved || 0 });
      }
      if (aptResultsRes.status === 'fulfilled' && aptResultsRes.value.ok) {
        const ar = await aptResultsRes.value.json();
        setAptitudeResults(ar.results || []);
      }
      if (roadmapDomRes.status === 'fulfilled' && roadmapDomRes.value.ok) {
        const rd = await roadmapDomRes.value.json();
        setRoadmapDomains(rd.domains || []);
        if (rd.overall) setRoadmapOverall(rd.overall);
      }
      if (roadmapRecRes.status === 'fulfilled' && roadmapRecRes.value.ok) {
        const rr = await roadmapRecRes.value.json();
        setRoadmapRecs({
          has_resume_scan: Boolean(rr.has_resume_scan),
          recommendations: rr.recommendations || [],
        });
      }
      if (lbMeRes.status === 'fulfilled' && lbMeRes.value.ok) {
        const lb = await lbMeRes.value.json();
        setLeaderboardUser(lb.user || null);
      }
      if (ctxRes.status === 'fulfilled' && ctxRes.value.ok) {
        setContextSummary(await ctxRes.value.json());
      }
      if (resumeRes.status === 'fulfilled' && resumeRes.value.ok) {
        const rs = await resumeRes.value.json();
        setResumeLatest(rs.analysis || null);
      }
    } catch (err) {
      console.error('Dashboard data load error:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const readiness = Number(leaderboardUser?.readiness ?? 0);
  const displayDSA = recommendedDSA;
  const displayCompanies = companies;

  // Weekly active days count computed from real timestamps in past 7 days
  const weeklyActiveDays = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    cutoff.setHours(0, 0, 0, 0);

    const uniqueDays = new Set();
    const recordDate = (ts) => {
      if (!ts) return;
      const d = new Date(ts);
      if (!Number.isNaN(d.getTime()) && d >= cutoff) {
        uniqueDays.add(d.toISOString().slice(0, 10));
      }
    };

    (leaderboardUser?.recent_activities || []).forEach((a) => recordDate(a?.created_at));
    (aptitudeResults || []).forEach((r) => recordDate(r?.created_at || r?.submitted_at));
    if (resumeLatest?.created_at) recordDate(resumeLatest.created_at);

    return uniqueDays.size;
  }, [leaderboardUser, aptitudeResults, resumeLatest]);

  const dsaPillarScore =
    leaderboardUser?.dsa ??
    (dsaMeta.total_problems > 0
      ? Math.round(((dsaMeta.solved_count || 0) / dsaMeta.total_problems) * 100)
      : 0);

  const aptitudePillarScore =
    leaderboardUser?.aptitude ??
    contextSummary?.aptitude_avg_score ??
    (aptitudeStats.total > 0
      ? Math.round(((aptitudeStats.solved || 0) / aptitudeStats.total) * 100)
      : 0);

  const resumePillarScore =
    resumeLatest?.overall_score ?? contextSummary?.ats_score ?? 0;

  const interviewPillarScore = leaderboardUser?.interview ?? 0;

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
      <Sidebar activeRoute="dashboard" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <BlurDrop
          as="main"
          className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full"
        >
          {loadError && (
            <div className="bg-[#FFEBEF] border border-[#DC2626]/25 text-[#DC2626] rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Some live statistics could not be loaded right now.</span>
              </div>
              <button
                type="button"
                onClick={fetchDashboardData}
                className="inline-flex items-center gap-1 font-semibold underline cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}

          {/* SECTION A: PERSONALIZED WELCOME + PLACEMENT READINESS */}
          <DashboardWelcome
            displayName={displayName}
            plan={user?.plan || 'Pro'}
            targetRole={contextSummary?.target_role || resumeLatest?.target_role}
            targetCompany={contextSummary?.target_company || resumeLatest?.target_company}
            readiness={readiness}
            weeklyDelta={
              leaderboardUser?.rankChange > 0 ? leaderboardUser.rankChange : 0
            }
          />

          {/* SECTION B: PERFORMANCE OVERVIEW (4 STATS) */}
          <PerformanceStatistics
            dsaMeta={dsaMeta}
            aptitudeStats={aptitudeStats}
            streak={leaderboardUser?.streak ?? 0}
            weeklyActiveDays={weeklyActiveDays}
            leaderboardUser={leaderboardUser}
          />

          {/* SECTION C: TWO-COLUMN MAIN DASHBOARD WORKSPACE (~65% LEFT / ~35% RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (~65%) */}
            <div className="lg:col-span-8 space-y-6 min-w-0">
              <ContinueLearning
                domains={roadmapDomains}
                overall={roadmapOverall}
                recommendations={roadmapRecs.recommendations}
                recentAccess={recentAccess}
              />

              <RecommendedProblems
                problems={displayDSA}
                totalProblems={dsaMeta.total_problems}
                loading={loading && recommendedDSA.length === 0}
              />

              <WeeklyActivityHeatmap
                recentActivities={leaderboardUser?.recent_activities || []}
                aptitudeResults={aptitudeResults}
                resumeCreatedAt={resumeLatest?.created_at}
                dsaSolved={dsaMeta.solved_count || 0}
                roadmapPct={roadmapOverall?.progress_percentage || 0}
                xp={leaderboardUser?.xp ?? 0}
                streak={leaderboardUser?.streak ?? 0}
              />

              <RoadmapProgressSummary
                domains={roadmapDomains}
                overall={roadmapOverall}
              />
            </div>

            {/* RIGHT COLUMN (~35%) */}
            <div className="lg:col-span-4 space-y-6 min-w-0">
              <PreparationProgress
                dsaScore={dsaPillarScore}
                aptitudeScore={aptitudePillarScore}
                resumeScore={resumePillarScore}
                interviewScore={interviewPillarScore}
              />

              <TargetCompanies
                companies={displayCompanies}
                targetCompany={
                  contextSummary?.target_company || resumeLatest?.target_company
                }
              />

              <AIMentorWidget contextSummary={contextSummary} />

              <UpcomingGoals
                roadmapRecommendations={roadmapRecs.recommendations}
                missingSkills={contextSummary?.missing_skills || []}
                dsaSolved={dsaMeta.solved_count || 0}
                aptitudeSolved={aptitudeStats.solved || 0}
                hasResumeScan={
                  roadmapRecs.has_resume_scan || Boolean(resumeLatest)
                }
              />
            </div>
          </div>

          {/* SECTION D: QUICK ACCESS */}
          <QuickAccess />
        </BlurDrop>
      </div>
    </div>
  );
}
