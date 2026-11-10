import React, { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { apiFetch } from '@/lib/apiClient';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingOverview } from '@/components/landing/LandingOverview';
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks';
import { LandingShowcase } from '@/components/landing/LandingShowcase';
import { LandingAnalytics } from '@/components/landing/LandingAnalytics';
import { LandingFaqAndFooter } from '@/components/landing/LandingFaqAndFooter';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [liveData, setLiveData] = useState({
    loading: true,
    catalog: {
      dsaTotal: 0,
      aptitudeTotal: 0,
      companyCount: 0,
      domainCount: 0,
      topicCount: 0,
      difficultyCounts: {},
    },
    userStats: {
      dsaSolved: null,
      dsaPct: null,
      aptSolved: null,
      aptPct: null,
      completedTopics: null,
      roadmapPct: null,
      interviewScore: null,
      readiness: null,
      streak: null,
      recentActivities: [],
    },
  });

  useEffect(() => {
    let active = true;

    async function loadLandingData() {
      try {
        const requests = [
          apiFetch('/api/dsa/meta'),
          apiFetch('/api/aptitude/directory?limit=1'),
          apiFetch('/api/roadmap/domains'),
          apiFetch('/api/companies'),
        ];

        if (isAuthenticated) {
          requests.push(apiFetch('/api/user/header-stats'));
          requests.push(apiFetch('/api/leaderboard/me'));
        }

        const results = await Promise.allSettled(requests);
        if (!active) return;

        const [dsaRes, aptRes, roadRes, compRes, headerRes, lbRes] = results;

        let dsaTotal = 0;
        let dsaSolved = null;
        let difficultyCounts = {};
        if (dsaRes?.status === 'fulfilled' && dsaRes.value.ok) {
          const dsa = await dsaRes.value.json();
          dsaTotal = Number(dsa?.total_problems || 0);
          difficultyCounts = dsa?.difficulty_counts || {};
          if (isAuthenticated) {
            dsaSolved = Number(dsa?.solved_count || 0);
          }
        }

        let aptitudeTotal = 0;
        let aptSolved = null;
        if (aptRes?.status === 'fulfilled' && aptRes.value.ok) {
          const apt = await aptRes.value.json();
          aptitudeTotal = Number(apt?.total || 0);
          if (isAuthenticated) {
            aptSolved = Number(apt?.total_solved || 0);
          }
        }

        let domainCount = 0;
        let topicCount = 0;
        let completedTopics = null;
        let roadmapPct = null;
        if (roadRes?.status === 'fulfilled' && roadRes.value.ok) {
          const road = await roadRes.value.json();
          domainCount = Array.isArray(road?.domains) ? road.domains.length : 0;
          topicCount = Number(road?.overall?.total_topics || 0);
          if (isAuthenticated) {
            completedTopics = Number(road?.overall?.completed_topics || 0);
            roadmapPct = Number(road?.overall?.progress_percentage || 0);
          }
        }

        let companyCount = 0;
        if (compRes?.status === 'fulfilled' && compRes.value.ok) {
          const comp = await compRes.value.json();
          companyCount = Array.isArray(comp?.companies) ? comp.companies.length : 0;
        }

        let streak = null;
        if (isAuthenticated && headerRes?.status === 'fulfilled' && headerRes.value.ok) {
          const h = await headerRes.value.json();
          streak = Number(h?.streak ?? 0);
        }

        let readiness = null;
        let interviewScore = null;
        let recentActivities = [];
        if (isAuthenticated && lbRes?.status === 'fulfilled' && lbRes.value.ok) {
          const lb = await lbRes.value.json();
          const u = lb?.user;
          if (u) {
            readiness = Number(u.readiness ?? 0);
            interviewScore = Number(u.interview ?? 0);
            recentActivities = Array.isArray(u.recent_activities) ? u.recent_activities : [];
            if (streak === null && u.streak !== undefined) {
              streak = Number(u.streak);
            }
          }
        }

        const dsaPct =
          isAuthenticated && dsaSolved !== null && dsaTotal > 0
            ? Math.min(100, Math.round((dsaSolved / dsaTotal) * 100))
            : isAuthenticated
              ? 0
              : null;

        const aptPct =
          isAuthenticated && aptSolved !== null && aptitudeTotal > 0
            ? Math.min(100, Math.round((aptSolved / aptitudeTotal) * 100))
            : isAuthenticated
              ? 0
              : null;

        if (!active) return;
        setLiveData({
          loading: false,
          catalog: {
            dsaTotal,
            aptitudeTotal,
            companyCount,
            domainCount,
            topicCount,
            difficultyCounts,
          },
          userStats: {
            dsaSolved,
            dsaPct,
            aptSolved,
            aptPct,
            completedTopics,
            roadmapPct,
            interviewScore,
            readiness,
            streak,
            recentActivities,
          },
        });
      } catch {
        if (!active) return;
        setLiveData((prev) => ({ ...prev, loading: false }));
      }
    }

    loadLandingData();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative overflow-x-clip min-h-screen bg-transparent text-[#1E293B] dark:text-[#E6EDF3] font-sans selection:bg-[#FF9800] selection:text-white">
        <LandingNavbar
          isAuthenticated={isAuthenticated}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        <main className="relative z-10">
          <LandingHero isAuthenticated={isAuthenticated} liveData={liveData} />
          <LandingOverview liveData={liveData} />
          <LandingHowItWorks />
          <LandingShowcase isAuthenticated={isAuthenticated} liveData={liveData} />
          <LandingAnalytics isAuthenticated={isAuthenticated} liveData={liveData} />
        </main>

        <div className="relative z-10">
          <LandingFaqAndFooter isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </MotionConfig>
  );
}
