import {
  Code2,
  Globe,
  BrainCircuit,
  Database,
  Server,
  GitBranch,
  Briefcase,
  BookOpen,
} from 'lucide-react';

export const ICON_MAP = {
  Code2,
  Globe,
  BrainCircuit,
  Database,
  Server,
  GitBranch,
  Briefcase,
};

export function getTrackIcon(iconName) {
  return ICON_MAP[iconName] || BookOpen;
}

/**
 * Normalizes backend domain difficulty ('Easy' / 'Medium' / 'Hard' / 'Beginner' / etc.)
 * into clean LMS track labels while mapping consistently to Badge variants.
 */
export function normalizeTrackDifficulty(difficulty) {
  const raw = (difficulty || '').toLowerCase().trim();
  if (raw === 'easy' || raw === 'beginner' || raw === 'foundation') return 'Beginner';
  if (raw === 'medium' || raw === 'intermediate') return 'Intermediate';
  if (raw === 'hard' || raw === 'advanced') return 'Advanced';
  return difficulty || 'General';
}

export function getDifficultyBadgeVariant(difficulty) {
  const raw = (difficulty || '').toLowerCase().trim();
  if (raw === 'easy' || raw === 'beginner' || raw === 'foundation') return 'easy';
  if (raw === 'medium' || raw === 'intermediate') return 'medium';
  if (raw === 'hard' || raw === 'advanced') return 'hard';
  return 'neutral';
}

export function getTrackStatus(domain) {
  const total = Number(domain?.total_topics || 0);
  const completed = Number(domain?.completed_topics || 0);
  if (total > 0 && completed >= total) return 'Completed';
  if (completed > 0) return 'In Progress';
  return 'Not Started';
}

export const TRACK_FILTER_OPTIONS = [
  'All Tracks',
  'Beginner',
  'Intermediate',
  'Advanced',
  'In Progress',
  'Completed',
];

export function filterTracks(domains = [], { search = '', filter = 'All Tracks' } = {}) {
  const q = search.trim().toLowerCase();

  return domains.filter((domain) => {
    const matchesSearch =
      !q ||
      (domain.name || '').toLowerCase().includes(q) ||
      (domain.description || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (!filter || filter === 'All Tracks') return true;
    if (filter === 'Beginner' || filter === 'Intermediate' || filter === 'Advanced') {
      return normalizeTrackDifficulty(domain.difficulty) === filter;
    }
    if (filter === 'In Progress') {
      return getTrackStatus(domain) === 'In Progress';
    }
    if (filter === 'Completed') {
      return getTrackStatus(domain) === 'Completed';
    }
    return true;
  });
}

export function computeTopicsHoursSummary(topics = []) {
  return topics.reduce(
    (acc, topic) => {
      const hrs = Number(topic?.estimated_hours || 0);
      acc.totalHours += hrs;
      if (topic?.completed) acc.completedHours += hrs;
      return acc;
    },
    { totalHours: 0, completedHours: 0 }
  );
}

/**
 * Resolves the best target { domainId, topicId, domainName, topicTitle } for Continue Learning.
 * Prioritizes:
 * 1. Most recently accessed incomplete topic (or unlocked topic in that domain)
 * 2. First track currently In Progress -> its next unlocked incomplete topic
 * 3. First incomplete track -> its first unlocked incomplete topic
 */
export function pickContinueTarget(domains = [], topicsByDomain = {}, recentAccess = null) {
  if (!domains.length) return null;

  const findNextIncompleteTopic = (domainId) => {
    const list = topicsByDomain[domainId] || [];
    return (
      list.find((t) => !t.completed && t.unlocked) ||
      list.find((t) => !t.completed) ||
      list[0] ||
      null
    );
  };

  if (recentAccess?.domainId) {
    const recentDomain = domains.find((d) => String(d.id) === String(recentAccess.domainId));
    if (recentDomain && Number(recentDomain.completed_topics) < Number(recentDomain.total_topics)) {
      const list = topicsByDomain[recentDomain.id] || [];
      const exactRecentTopic = recentAccess.topicId
        ? list.find((t) => Number(t.id) === Number(recentAccess.topicId) && !t.completed && t.unlocked)
        : null;
      const chosen = exactRecentTopic || findNextIncompleteTopic(recentDomain.id);
      return {
        domainId: recentDomain.id,
        domainName: recentDomain.name,
        topicId: chosen?.id || null,
        topicTitle: chosen?.title || null,
      };
    }
  }

  const inProgressDomain = domains.find(
    (d) => Number(d.completed_topics) > 0 && Number(d.completed_topics) < Number(d.total_topics)
  );
  if (inProgressDomain) {
    const chosen = findNextIncompleteTopic(inProgressDomain.id);
    return {
      domainId: inProgressDomain.id,
      domainName: inProgressDomain.name,
      topicId: chosen?.id || null,
      topicTitle: chosen?.title || null,
    };
  }

  const firstIncompleteDomain = domains.find(
    (d) => Number(d.completed_topics) < Number(d.total_topics)
  );
  const fallbackDomain = firstIncompleteDomain || domains[0];
  const chosen = findNextIncompleteTopic(fallbackDomain.id);
  return {
    domainId: fallbackDomain.id,
    domainName: fallbackDomain.name,
    topicId: chosen?.id || null,
    topicTitle: chosen?.title || null,
  };
}
