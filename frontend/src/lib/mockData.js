export const mockUser = {
  id: 'usr_1',
  name: 'Alex Johnson',
  email: 'alex@prepnest.ai',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  role: 'student',
  college: 'Indian Institute of Technology (IIT)',
  graduationYear: 2026,
  skills: ['React', 'Next.js', 'Python', 'Data Structures', 'System Design'],
  placementReadiness: 86,
  streakDays: 14,
  xp: 4850,
  level: 12,
};

export const mockDSAProblems = [
  { id: 'p1', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays', tags: ['Hash Table', 'Array'], acceptanceRate: 49.2, companies: ['Google', 'Amazon', 'Meta'], solved: true, bookmarked: true },
  { id: 'p2', title: 'Add Two Numbers', difficulty: 'Medium', category: 'Linked List', tags: ['Recursion', 'Math'], acceptanceRate: 41.5, companies: ['Microsoft', 'Amazon'], solved: true, bookmarked: false },
  { id: 'p3', title: 'Trapping Rain Water', difficulty: 'Hard', category: 'Two Pointers', tags: ['Stack', 'Dynamic Programming'], acceptanceRate: 60.1, companies: ['Google', 'Adobe'], solved: false, bookmarked: true },
  { id: 'p4', title: 'LRU Cache Design', difficulty: 'Medium', category: 'Design', tags: ['Hash Table', 'Doubly Linked List'], acceptanceRate: 42.0, companies: ['Amazon', 'Meta', 'Microsoft'], solved: false, bookmarked: false },
  { id: 'p5', title: 'Binary Tree Zigzag Level Order Traversal', difficulty: 'Medium', category: 'Trees', tags: ['BFS', 'Tree'], acceptanceRate: 57.8, companies: ['Google'], solved: true, bookmarked: false },
];

export const mockCompanies = [
  { id: 'c1', name: 'Google', logo: '🌐', role: 'Software Development Engineer (SDE-1)', hiringDifficulty: 'Hard', totalQuestions: 150, solvedQuestions: 84, dsaSheetUrl: '#' },
  { id: 'c2', name: 'Microsoft', logo: '🪟', role: 'Software Engineer', hiringDifficulty: 'Medium', totalQuestions: 120, solvedQuestions: 92, dsaSheetUrl: '#' },
  { id: 'c3', name: 'Amazon', logo: '📦', role: 'SDE-1 (Frontend / Backend)', hiringDifficulty: 'Hard', totalQuestions: 180, solvedQuestions: 110, dsaSheetUrl: '#' },
  { id: 'c4', name: 'Meta', logo: '♾️', role: 'Rotational Software Engineer', hiringDifficulty: 'Extreme', totalQuestions: 140, solvedQuestions: 65, dsaSheetUrl: '#' },
];

export const mockResumeAnalysis = {
  atsScore: 84,
  keywordMatchPercentage: 78,
  strengths: [
    'Strong quantitative breakdown in project impact bullet points.',
    'Clear emphasis on modern React 19 & Next.js App Router skills.',
    'Clean single-page format with verified GitHub repository links.'
  ],
  weaknesses: [
    'Missing cloud deployment metrics (AWS / Vercel uptime).',
    'Low keyword frequency for CI/CD and Docker tools.'
  ],
  missingKeywords: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'GraphQL', 'Redis'],
  improvementSuggestions: [
    'Add numerical outcomes to your project section (e.g. "Improved page speed by 40%").',
    'Include Docker and containerization under technical tools.'
  ]
};

export const mockInterviews = [
  { id: 'i1', type: 'Technical', company: 'Google Mock Track', date: '2026-07-28', score: 90, confidenceMeter: 88, feedback: 'Excellent problem solving approach and clean time complexity breakdown.', status: 'Completed' },
  { id: 'i2', type: 'HR', company: 'Amazon Behavioral', date: '2026-08-02', score: 0, confidenceMeter: 0, feedback: 'Pending session', status: 'Upcoming' },
];
