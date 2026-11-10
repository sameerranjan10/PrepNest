export const SUGGESTED_SKILLS = [
  'Data Structures & Algorithms',
  'Python',
  'Java',
  'C++',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'FastAPI',
  'PostgreSQL',
  'MongoDB',
  'System Design',
  'Docker',
  'AWS',
  'Git & GitHub',
  'SQL',
];

export const SUGGESTED_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'Atlassian',
  'Goldman Sachs',
  'Netflix',
  'Adobe',
  'Salesforce',
  'Oracle',
  'TCS',
  'Infosys',
  'Accenture',
];

export const SUGGESTED_ROLES = [
  'Software Development Engineer (SDE-1)',
  'Full Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'Data Analyst',
  'Machine Learning Engineer',
  'Cloud / DevOps Engineer',
];

export const SUBJECT_OPTIONS = [
  'Data Structures & Algorithms',
  'System Design',
  'Database & DBMS',
  'Operating Systems',
  'Computer Networks',
  'Object-Oriented Programming',
  'SQL & Queries',
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Behavioral & HR Prep',
];

export const CODING_PLATFORMS = [
  {
    id: 'leetcode',
    field: 'leetcode_username',
    name: 'LeetCode',
    placeholder: 'username or https://leetcode.com/u/username',
    buildUrl: (handle) => `https://leetcode.com/u/${encodeURIComponent(handle)}/`,
    accentColor: '#FFA116',
    bgTint: 'bg-[#FFF8EE] dark:bg-[#FFA116]/12',
    borderTint: 'border-[#FFA116]/30',
  },
  {
    id: 'github',
    field: 'github_username',
    name: 'GitHub',
    placeholder: 'username or https://github.com/username',
    buildUrl: (handle) => `https://github.com/${encodeURIComponent(handle)}`,
    accentColor: '#1E293B',
    bgTint: 'bg-[#F1F5F9] dark:bg-[#21262D]',
    borderTint: 'border-[#CBD5E1] dark:border-[#30363D]',
  },
  {
    id: 'codechef',
    field: 'codechef_username',
    name: 'CodeChef',
    placeholder: 'username or https://www.codechef.com/users/handle',
    buildUrl: (handle) => `https://www.codechef.com/users/${encodeURIComponent(handle)}`,
    accentColor: '#B45309',
    bgTint: 'bg-[#FEF3C7]/60 dark:bg-[#D97706]/15',
    borderTint: 'border-[#F59E0B]/30',
  },
  {
    id: 'codeforces',
    field: 'codeforces_username',
    name: 'Codeforces',
    placeholder: 'handle or https://codeforces.com/profile/handle',
    buildUrl: (handle) => `https://codeforces.com/profile/${encodeURIComponent(handle)}`,
    accentColor: '#2563EB',
    bgTint: 'bg-[#EFF6FF] dark:bg-[#2563EB]/15',
    borderTint: 'border-[#93C5FD]/40',
  },
  {
    id: 'hackerrank',
    field: 'hackerrank_username',
    name: 'HackerRank',
    placeholder: 'username or https://www.hackerrank.com/profile/username',
    buildUrl: (handle) => `https://www.hackerrank.com/profile/${encodeURIComponent(handle)}`,
    accentColor: '#16A34A',
    bgTint: 'bg-[#F0FDF4] dark:bg-[#16A34A]/15',
    borderTint: 'border-[#86EFAC]/40',
  },
  {
    id: 'gfg',
    field: 'gfg_username',
    name: 'GeeksforGeeks',
    placeholder: 'username or https://www.geeksforgeeks.org/user/username',
    buildUrl: (handle) => `https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`,
    accentColor: '#15803D',
    bgTint: 'bg-[#ECFDF5] dark:bg-[#16A34A]/15',
    borderTint: 'border-[#6EE7B7]/40',
  },
];

export function parseJsonOrCsvList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (!s) return [];
    if (s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) {
          return parsed.map((x) => String(x).trim()).filter(Boolean);
        }
      } catch {
        // fallback to CSV split
      }
    }
    return s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

export function parseOtherLinks(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.filter((item) => item && item.url);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => item && item.url);
      }
    } catch {
      return [];
    }
  }
  return [];
}

export function extractHandleOrUrl(rawValue, platformId) {
  const val = (rawValue || '').trim();
  if (!val) return { handle: '', url: '' };
  if (/^https?:\/\//i.test(val)) {
    try {
      const parsed = new URL(val);
      const parts = parsed.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1] || '';
      const handle = last.replace(/^@/, '');
      return { handle, url: val };
    } catch {
      return { handle: val, url: val };
    }
  }
  const cleanHandle = val.replace(/^@/, '').replace(/\/+$/, '');
  const platform = CODING_PLATFORMS.find((p) => p.id === platformId);
  return {
    handle: cleanHandle,
    url: platform && cleanHandle ? platform.buildUrl(cleanHandle) : '',
  };
}

export function normalizeExternalUrl(val) {
  const trimmed = (val || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function buildFormStateFromUser(user) {
  const u = user || {};
  const githubFromUrl = u.github_url
    ? extractHandleOrUrl(u.github_url, 'github').handle
    : '';

  return {
    full_name: u.full_name || u.name || '',
    email: u.email || '',
    phone: u.phone || '',
    location: u.location || '',
    career_objective: u.career_objective || '',
    bio: u.bio || '',
    target_role: u.target_role || 'Software Development Engineer (SDE-1)',
    target_companies: parseJsonOrCsvList(u.target_companies),
    skills: parseJsonOrCsvList(u.skills),
    college: u.college || '',
    degree: u.degree || 'B.Tech / B.E.',
    department: u.department || '',
    grad_year: Number(u.grad_year) || 2026,
    current_semester: u.current_semester || 'Semester 6',
    cgpa: u.cgpa || '',
    backlogs: u.backlogs ?? '0',
    tenth_percentage: u.tenth_percentage || '',
    twelfth_percentage: u.twelfth_percentage || '',
    leetcode_username: u.leetcode_username || '',
    github_username: u.github_username || githubFromUrl || '',
    codechef_username: u.codechef_username || '',
    codeforces_username: u.codeforces_username || '',
    hackerrank_username: u.hackerrank_username || '',
    gfg_username: u.gfg_username || '',
    github_url: u.github_url || '',
    linkedin_url: u.linkedin_url || '',
    portfolio_url: u.portfolio_url || '',
    resume_url: u.resume_url || '',
    other_links: parseOtherLinks(u.other_links),
    preferred_language: u.preferred_language || 'Python',
    daily_dsa_goal: Number(u.daily_dsa_goal ?? 2),
    daily_aptitude_goal: Number(u.daily_aptitude_goal ?? 1),
    daily_study_hours: Number(u.daily_study_hours ?? 2),
    weekly_prep_goal: u.weekly_prep_goal || '',
    prep_deadline: u.prep_deadline || '',
    preferred_subjects: parseJsonOrCsvList(u.preferred_subjects),
    preferred_difficulty: u.preferred_difficulty || 'Medium',
    prep_level: u.prep_level || 'Intermediate',
    email_notifications: u.email_notifications ?? true,
    streak_reminders: u.streak_reminders ?? true,
    weekly_digest: u.weekly_digest ?? true,
  };
}

export function buildPayloadFromForm(formData) {
  const ghInput = (formData.github_username || '').trim();
  const ghUrl = (formData.github_url || '').trim();
  const syncedGithubUrl =
    ghUrl || (ghInput ? extractHandleOrUrl(ghInput, 'github').url : '');
  const syncedGithubUsername =
    ghInput || (ghUrl ? extractHandleOrUrl(ghUrl, 'github').handle : '');

  return {
    full_name: formData.full_name.trim(),
    phone: formData.phone.trim(),
    location: formData.location.trim(),
    career_objective: formData.career_objective.trim(),
    bio: formData.bio.trim(),
    target_role: formData.target_role.trim(),
    target_companies: JSON.stringify(formData.target_companies),
    skills: JSON.stringify(formData.skills),
    college: formData.college.trim(),
    degree: formData.degree.trim(),
    department: formData.department.trim(),
    grad_year: Number(formData.grad_year) || 2026,
    current_semester: formData.current_semester.trim(),
    cgpa: String(formData.cgpa || '').trim(),
    backlogs: String(formData.backlogs ?? '0').trim(),
    tenth_percentage: String(formData.tenth_percentage || '').trim(),
    twelfth_percentage: String(formData.twelfth_percentage || '').trim(),
    leetcode_username: formData.leetcode_username.trim(),
    github_username: syncedGithubUsername,
    codechef_username: formData.codechef_username.trim(),
    codeforces_username: formData.codeforces_username.trim(),
    hackerrank_username: formData.hackerrank_username.trim(),
    gfg_username: formData.gfg_username.trim(),
    github_url: syncedGithubUrl,
    linkedin_url: formData.linkedin_url.trim(),
    portfolio_url: formData.portfolio_url.trim(),
    resume_url: formData.resume_url.trim(),
    other_links: JSON.stringify(formData.other_links || []),
    preferred_language: formData.preferred_language,
    daily_dsa_goal: Number(formData.daily_dsa_goal) || 2,
    daily_aptitude_goal: Number(formData.daily_aptitude_goal) || 1,
    daily_study_hours: Number(formData.daily_study_hours) || 2,
    weekly_prep_goal: formData.weekly_prep_goal.trim(),
    prep_deadline: formData.prep_deadline,
    preferred_subjects: JSON.stringify(formData.preferred_subjects || []),
    preferred_difficulty: formData.preferred_difficulty,
    prep_level: formData.prep_level,
    email_notifications: Boolean(formData.email_notifications),
    streak_reminders: Boolean(formData.streak_reminders),
    weekly_digest: Boolean(formData.weekly_digest),
  };
}

export function calculateProfileCompletion(formData, user) {
  const checks = [
    Boolean(user?.avatar_url),
    Boolean(formData.full_name?.trim()),
    Boolean(formData.email?.trim()),
    Boolean(formData.phone?.trim()),
    Boolean(formData.location?.trim()),
    Boolean(formData.target_role?.trim()),
    Boolean(formData.bio?.trim() || formData.career_objective?.trim()),
    formData.skills.length > 0,
    formData.target_companies.length > 0,
    Boolean(formData.college?.trim()),
    Boolean(formData.cgpa?.trim()),
    Boolean(formData.leetcode_username?.trim() || formData.codeforces_username?.trim() || formData.gfg_username?.trim()),
    Boolean(formData.github_url?.trim() || formData.github_username?.trim()),
    Boolean(formData.linkedin_url?.trim()),
  ];
  const completed = checks.filter(Boolean).length;
  return {
    completed,
    total: checks.length,
    percentage: Math.round((completed / checks.length) * 100),
  };
}

