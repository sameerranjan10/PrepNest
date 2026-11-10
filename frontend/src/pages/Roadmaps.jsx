import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BlurDrop } from '@/components/ui/BlurDrop';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { LearningHeader } from '@/components/roadmaps/LearningHeader';
import { OverallProgress } from '@/components/roadmaps/OverallProgress';
import { RecommendedTopics } from '@/components/roadmaps/RecommendedTopics';
import { LearningTrackGrid } from '@/components/roadmaps/LearningTrackGrid';
import { TrackHeader } from '@/components/roadmaps/TrackHeader';
import { LearningSidebar } from '@/components/roadmaps/LearningSidebar';
import { LearningTimeline } from '@/components/roadmaps/LearningTimeline';
import {
  computeTopicsHoursSummary,
  filterTracks,
  pickContinueTarget,
} from '@/components/roadmaps/roadmapHelpers';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const RECENT_TOPIC_KEY = 'prepnest_roadmap_recent';

function readRecentAccess() {
  try {
    const raw = localStorage.getItem(RECENT_TOPIC_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeRecentAccess(domainId, topicId) {
  try {
    localStorage.setItem(
      RECENT_TOPIC_KEY,
      JSON.stringify({ domainId: String(domainId), topicId: Number(topicId) })
    );
  } catch {
    // Ignore storage errors
  }
}

export default function RoadmapsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [domains, setDomains] = useState([]);
  const [overall, setOverall] = useState({
    total_topics: 0,
    completed_topics: 0,
    progress_percentage: 0,
  });
  const [recommendationsData, setRecommendationsData] = useState({
    has_resume_scan: false,
    target_role: null,
    target_company: null,
    recommendations: [],
  });

  // Per-domain cached topics & projects
  const [topicsByDomain, setTopicsByDomain] = useState({});
  const [projectsByDomain, setProjectsByDomain] = useState({});

  // Cached detailed topic payloads keyed by topicId
  const [topicDetailsCache, setTopicDetailsCache] = useState({});
  const [loadingTopicId, setLoadingTopicId] = useState(null);
  const [topicDetailError, setTopicDetailError] = useState(null);

  // Navigation & View State
  const [selectedDomainId, setSelectedDomainId] = useState(() => {
    const t = searchParams.get('track');
    return t ? String(t) : null;
  });
  const [expandedTopicId, setExpandedTopicId] = useState(() => {
    const tp = searchParams.get('topic');
    return tp ? Number(tp) : null;
  });
  const [recentAccess, setRecentAccess] = useState(() => readRecentAccess());

  // Overview Filters
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Tracks');

  // Track Sidebar State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global Loading / Mutation States
  const [initialLoading, setInitialLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [updatingTopicId, setUpdatingTopicId] = useState(null);
  const [resettingProgress, setResettingProgress] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('prepnest_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchDomainTopics = useCallback(
    async (domainId) => {
      if (!domainId) return null;
      try {
        const res = await fetch(`${API_BASE}/api/roadmap/domains/${domainId}/topics`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) return null;
        const data = await res.json();
        setTopicsByDomain((prev) => ({
          ...prev,
          [domainId]: data.topics || [],
        }));
        setProjectsByDomain((prev) => ({
          ...prev,
          [domainId]: data.project || data.domain_project || null,
        }));
        return data;
      } catch (err) {
        console.error(`Failed to load topics for domain ${domainId}:`, err);
        return null;
      }
    },
    [getAuthHeaders]
  );

  const fetchOverviewData = useCallback(async () => {
    setOverviewError(null);
    try {
      const [domRes, recRes] = await Promise.all([
        fetch(`${API_BASE}/api/roadmap/domains`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/roadmap/recommendations`, { headers: getAuthHeaders() }),
      ]);

      if (!domRes.ok) {
        throw new Error(`HTTP ${domRes.status}`);
      }

      const domJson = await domRes.json();
      const loadedDomains = domJson.domains || [];
      setDomains(loadedDomains);
      if (domJson.overall) setOverall(domJson.overall);

      if (loadedDomains.length > 0) {
        Promise.all(loadedDomains.map((d) => fetchDomainTopics(d.id)));
      }

      if (recRes.ok) {
        const recJson = await recRes.json();
        setRecommendationsData({
          has_resume_scan: Boolean(recJson.has_resume_scan),
          target_role: recJson.target_role || null,
          target_company: recJson.target_company || null,
          recommendations: recJson.recommendations || [],
        });
      }
    } catch (err) {
      console.error('Error fetching roadmaps overview:', err);
      setOverviewError('Failed to fetch roadmap progress from the server.');
    } finally {
      setInitialLoading(false);
    }
  }, [getAuthHeaders, fetchDomainTopics]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  // Sync from URL ?track= / ?topic= changes (e.g. browser back/forward)
  useEffect(() => {
    const trackParam = searchParams.get('track');
    const topicParam = searchParams.get('topic');
    const nextDomainId = trackParam ? String(trackParam) : null;
    const nextTopicId = topicParam ? Number(topicParam) : null;

    setSelectedDomainId((prev) => (prev !== nextDomainId ? nextDomainId : prev));
    if (nextTopicId) {
      setExpandedTopicId(nextTopicId);
    }
  }, [searchParams]);

  const fetchTopicDetail = useCallback(
    async (topicId, forceRefresh = false) => {
      if (!topicId) return;
      if (!forceRefresh && topicDetailsCache[topicId]) return;

      setLoadingTopicId(topicId);
      setTopicDetailError(null);
      try {
        const res = await fetch(`${API_BASE}/api/roadmap/topics/${topicId}`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) {
          throw new Error('Could not load topic details');
        }
        const data = await res.json();
        setTopicDetailsCache((prev) => ({
          ...prev,
          [topicId]: data,
        }));
      } catch (err) {
        console.error('Error loading topic details:', err);
        setTopicDetailError('Unable to load topic study content right now.');
      } finally {
        setLoadingTopicId((prev) => (Number(prev) === Number(topicId) ? null : prev));
      }
    },
    [getAuthHeaders, topicDetailsCache]
  );

  // Ensure topics & expanded topic details load when entering a track
  useEffect(() => {
    if (!selectedDomainId) return;

    const loadActiveTrack = async () => {
      let currentTopics = topicsByDomain[selectedDomainId];
      if (!currentTopics) {
        setTrackLoading(true);
        const data = await fetchDomainTopics(selectedDomainId);
        currentTopics = data?.topics || [];
        setTrackLoading(false);
      }

      if (currentTopics.length > 0) {
        const targetTopic =
          (expandedTopicId &&
            currentTopics.find(
              (t) => Number(t.id) === Number(expandedTopicId) && t.unlocked
            )) ||
          currentTopics.find((t) => !t.completed && t.unlocked) ||
          currentTopics[0];

        if (targetTopic && targetTopic.unlocked) {
          setExpandedTopicId(targetTopic.id);
          fetchTopicDetail(targetTopic.id);
          writeRecentAccess(selectedDomainId, targetTopic.id);
          setRecentAccess({ domainId: String(selectedDomainId), topicId: Number(targetTopic.id) });
        }
      }
    };

    loadActiveTrack();
    // Intentionally scoped to track change or initial topics hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDomainId]);

  // Trigger detail fetch whenever expandedTopicId updates on an unlocked topic
  useEffect(() => {
    if (!selectedDomainId || !expandedTopicId) return;
    const list = topicsByDomain[selectedDomainId] || [];
    const target = list.find((t) => Number(t.id) === Number(expandedTopicId));
    if (target?.unlocked) {
      fetchTopicDetail(target.id);
      writeRecentAccess(selectedDomainId, target.id);
      setRecentAccess({ domainId: String(selectedDomainId), topicId: Number(target.id) });
    }
  }, [expandedTopicId, selectedDomainId, topicsByDomain, fetchTopicDetail]);

  const handleOpenTrack = (domainId, topicId = null) => {
    setSelectedDomainId(String(domainId));
    setExpandedTopicId(topicId ? Number(topicId) : null);
    const nextParams = { track: String(domainId) };
    if (topicId) nextParams.topic = String(topicId);
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToTracks = () => {
    setSelectedDomainId(null);
    setExpandedTopicId(null);
    setMobileSidebarOpen(false);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOrExpandTopic = (topicId, scrollToElement = false) => {
    setExpandedTopicId((prev) => {
      const next = Number(prev) === Number(topicId) && !scrollToElement ? null : Number(topicId);
      if (next && selectedDomainId) {
        setSearchParams({ track: String(selectedDomainId), topic: String(next) });
      }
      return next;
    });

    if (scrollToElement) {
      setTimeout(() => {
        const el = document.getElementById(`roadmap-topic-${topicId}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const handleToggleComplete = async (topicId, currentlyCompleted) => {
    setUpdatingTopicId(topicId);
    const nextStatus = currentlyCompleted ? 'incomplete' : 'completed';

    try {
      const res = await fetch(`${API_BASE}/api/roadmap/progress`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          topic_id: Number(topicId),
          status: nextStatus,
        }),
      });

      if (!res.ok) throw new Error('Failed to update progress');
      const result = await res.json();

      // Immediately refresh domains & active track topics so backend sequential unlocks update cleanly
      await Promise.all([
        fetchDomainTopics(result.domain_id || selectedDomainId),
        fetch(`${API_BASE}/api/roadmap/domains`, { headers: getAuthHeaders() })
          .then((r) => (r.ok ? r.json() : null))
          .then((domJson) => {
            if (domJson) {
              setDomains(domJson.domains || []);
              if (domJson.overall) setOverall(domJson.overall);
            }
          }),
      ]);

      // Update cached detail completion status
      setTopicDetailsCache((prev) => {
        if (!prev[topicId]) return prev;
        return {
          ...prev,
          [topicId]: {
            ...prev[topicId],
            topic: {
              ...prev[topicId].topic,
              is_completed: nextStatus === 'completed',
            },
          },
        };
      });
    } catch (err) {
      console.error('Error toggling topic progress:', err);
    } finally {
      setUpdatingTopicId(null);
    }
  };

  const handleResetAllProgress = async () => {
    const confirmed = window.confirm(
      'Reset all roadmap completion progress across all tracks? Practice task checkboxes stored locally will remain intact.'
    );
    if (!confirmed) return;

    setResettingProgress(true);
    try {
      const res = await fetch(`${API_BASE}/api/roadmap/progress/reset`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setTopicDetailsCache({});
        localStorage.removeItem(RECENT_TOPIC_KEY);
        setRecentAccess(null);
        await fetchOverviewData();
        if (selectedDomainId) {
          await fetchDomainTopics(selectedDomainId);
        }
      }
    } catch (err) {
      console.error('Failed to reset roadmap progress:', err);
    } finally {
      setResettingProgress(false);
    }
  };

  // Derived Statistics (100% from real DB records)
  const completedTracksCount = useMemo(
    () =>
      domains.filter(
        (d) => Number(d.total_topics) > 0 && Number(d.completed_topics) >= Number(d.total_topics)
      ).length,
    [domains]
  );

  const totalWeeks = useMemo(
    () => domains.reduce((sum, d) => sum + Number(d.estimated_weeks || 0), 0),
    [domains]
  );

  const overallHoursSummary = useMemo(() => {
    const allTopicLists = Object.values(topicsByDomain);
    if (!allTopicLists.length) {
      return { totalHours: 0, completedHours: 0, hasData: false };
    }
    const flatTopics = allTopicLists.flat();
    const summary = computeTopicsHoursSummary(flatTopics);
    return { ...summary, hasData: summary.totalHours > 0 };
  }, [topicsByDomain]);

  const continueTarget = useMemo(
    () => pickContinueTarget(domains, topicsByDomain, recentAccess),
    [domains, topicsByDomain, recentAccess]
  );

  const filteredDomains = useMemo(
    () => filterTracks(domains, { search, filter: activeFilter }),
    [domains, search, activeFilter]
  );

  const activeDomain = useMemo(
    () => domains.find((d) => String(d.id) === String(selectedDomainId)) || null,
    [domains, selectedDomainId]
  );

  const activeTopics = useMemo(
    () => (selectedDomainId ? topicsByDomain[selectedDomainId] || [] : []),
    [selectedDomainId, topicsByDomain]
  );

  const activeTrackHours = useMemo(
    () => computeTopicsHoursSummary(activeTopics),
    [activeTopics]
  );

  const activeProject = selectedDomainId ? projectsByDomain[selectedDomainId] || null : null;

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
      <Sidebar activeRoute="roadmaps" />

      <div className="flex-1 flex flex-col min-w-0">
        <Header defaultCollapsed />

        {initialLoading ? (
          <main className="flex-1 p-6 w-full flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" message="Loading your learning tracks..." />
          </main>
        ) : !selectedDomainId ? (
          <BlurDrop
            key="roadmap-overview"
            as="main"
            className="p-4 sm:p-6 lg:p-8 space-y-6 w-full"
          >
            <LearningHeader
              overall={overall}
              totalTracks={domains.length}
              completedTracks={completedTracksCount}
              hoursSummary={overallHoursSummary}
              totalWeeks={totalWeeks}
              continueTarget={continueTarget}
              onContinueLearning={() =>
                continueTarget &&
                handleOpenTrack(continueTarget.domainId, continueTarget.topicId)
              }
              onResetProgress={handleResetAllProgress}
              resetting={resettingProgress}
            />

            <OverallProgress
              domains={domains}
              overall={overall}
              loading={initialLoading}
              error={overviewError}
              onRetry={fetchOverviewData}
              onSelectTrack={(domainId) => handleOpenTrack(domainId)}
            />

            <RecommendedTopics
              recommendations={recommendationsData.recommendations}
              hasResumeScan={recommendationsData.has_resume_scan}
              targetRole={recommendationsData.target_role}
              targetCompany={recommendationsData.target_company}
              topicsByDomain={topicsByDomain}
              onStartTopic={(domainId, topicId) => handleOpenTrack(domainId, topicId)}
            />

            <LearningTrackGrid
              domains={domains}
              filteredDomains={filteredDomains}
              topicsByDomain={topicsByDomain}
              search={search}
              onSearchChange={setSearch}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onOpenTrack={(domainId) => handleOpenTrack(domainId)}
            />
          </BlurDrop>
        ) : (
          <BlurDrop
            key={`roadmap-track-${selectedDomainId}`}
            as="main"
            className="p-4 sm:p-6 lg:p-8 space-y-6 w-full"
          >
            <TrackHeader
              domain={activeDomain}
              topics={activeTopics}
              totalHours={activeTrackHours.totalHours}
              completedHours={activeTrackHours.completedHours}
              domainProject={activeProject}
              sidebarCollapsed={sidebarCollapsed}
              onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
              onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
              onBackToTracks={handleBackToTracks}
              onContinueTopic={(topicId) => handleSelectOrExpandTopic(topicId, true)}
              onScrollToProject={() => {
                document
                  .getElementById('roadmap-domain-project')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />

            {trackLoading && activeTopics.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-12 flex flex-col items-center justify-center gap-2">
                <LoadingSpinner size="lg" />
                <p className="text-sm text-[#64748B]">Loading track milestones...</p>
              </div>
            ) : (
              <div className="flex items-stretch gap-6">
                <LearningSidebar
                  domain={activeDomain}
                  domains={domains}
                  topics={activeTopics}
                  totalHours={activeTrackHours.totalHours}
                  completedHours={activeTrackHours.completedHours}
                  activeTopicId={expandedTopicId}
                  hasProject={Boolean(activeProject)}
                  collapsed={sidebarCollapsed}
                  mobileOpen={mobileSidebarOpen}
                  onCloseMobile={() => setMobileSidebarOpen(false)}
                  onSelectTopic={(topicId) => handleSelectOrExpandTopic(topicId, true)}
                  onSelectProject={() => {
                    document
                      .getElementById('roadmap-domain-project')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  onSwitchTrack={(domainId) => handleOpenTrack(domainId)}
                />

                <LearningTimeline
                  topics={activeTopics}
                  domainProject={activeProject}
                  expandedTopicId={expandedTopicId}
                  topicDetailsCache={topicDetailsCache}
                  loadingTopicId={loadingTopicId}
                  topicDetailError={topicDetailError}
                  updatingTopicId={updatingTopicId}
                  onToggleExpand={(topicId) => handleSelectOrExpandTopic(topicId, false)}
                  onToggleComplete={handleToggleComplete}
                  onSelectTopicById={(topicId) => handleSelectOrExpandTopic(topicId, true)}
                />
              </div>
            )}
          </BlurDrop>
        )}
      </div>
    </div>
  );
}
