export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  college?: string;
  graduationYear?: number;
  skills: string[];
  placementReadiness: number; // 0 to 100
  streakDays: number;
  xp: number;
  level: number;
}

export interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  acceptanceRate: number;
  companies: string[];
  solved: boolean;
  bookmarked: boolean;
}

export interface CompanyPrepTrack {
  id: string;
  name: string;
  logo: string;
  role: string;
  hiringDifficulty: 'Medium' | 'Hard' | 'Extreme';
  totalQuestions: number;
  solvedQuestions: number;
  dsaSheetUrl: string;
}

export interface ResumeAnalysis {
  atsScore: number;
  keywordMatchPercentage: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvementSuggestions: string[];
}

export interface MockInterviewSession {
  id: string;
  type: 'Technical' | 'HR' | 'System Design';
  company: string;
  date: string;
  score: number; // 0-100
  confidenceMeter: number;
  feedback: string;
  status: 'Completed' | 'Upcoming' | 'In Progress';
}
