import {
  Bot,
  Briefcase,
  Calendar,
  Compass,
  GraduationCap,
  Code2,
  FileText,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  Building2,
  Lightbulb,
  BookOpen
} from 'lucide-react';

export const MODE_GROUPS = [
  { id: 'placement', label: 'PLACEMENT' },
  { id: 'learning', label: 'LEARNING' },
  { id: 'technical', label: 'TECHNICAL' },
  { id: 'career', label: 'CAREER' }
];

export const MENTOR_MODES = [
  {
    id: 'general',
    group: 'placement',
    name: 'Placement Coach',
    icon: Bot,
    description: 'Holistic placement preparation, strategy, and daily milestones.'
  },
  {
    id: 'career',
    group: 'placement',
    name: 'Company Bar',
    icon: Briefcase,
    description: 'Hiring criteria, interview rounds and company preparation.'
  },
  {
    id: 'study_plan',
    group: 'learning',
    name: 'Study Sprint',
    icon: Calendar,
    description: 'Time-boxed daily routines, 7-day sprints, and topic schedules.'
  },
  {
    id: 'roadmap',
    group: 'learning',
    name: 'Curriculum',
    icon: Compass,
    description: 'Next roadmap topics, conceptual links, and prerequisite clarity.'
  },
  {
    id: 'tutor',
    group: 'learning',
    name: 'CS Tutor',
    icon: GraduationCap,
    description: 'Intuitive deep-dives on DBMS, OS, System Design, and Algorithms.'
  },
  {
    id: 'dsa',
    group: 'technical',
    name: 'Guided DSA',
    icon: Code2,
    description: 'Progressive hints, constraints, intuition, and optimal complexity.'
  },
  {
    id: 'resume',
    group: 'career',
    name: 'Resume & STAR',
    icon: FileText,
    description: 'ATS keywords, impact quantification, and XYZ bullet restructuring.'
  },
  {
    id: 'interview',
    group: 'career',
    name: 'Mock 1-on-1',
    icon: Users,
    description: 'Interactive single-question technical & behavioral mock interview.'
  }
];

export function getContextualPrompts(selectedMode, contextSummary) {
  const targetComp =
    contextSummary?.target_company && contextSummary.target_company !== 'Tech Company'
      ? contextSummary.target_company
      : 'Google';
  const targetRole = contextSummary?.target_role || 'Software Engineer';
  const missing = contextSummary?.missing_skills?.[0] || 'System Design';

  switch (selectedMode) {
    case 'career':
      return [
        {
          label: `Prepare me for ${targetComp}.`,
          prompt: `Prepare me for ${targetComp} (${targetRole}) — outline the hiring bar, top DSA focus areas, and key expectations.`,
          mode: 'career',
          icon: Building2
        },
        {
          label: 'Explain company interview rounds.',
          prompt: `Explain the typical OA and technical interview rounds for a ${targetRole} role at ${targetComp}.`,
          mode: 'career',
          icon: Briefcase
        },
        {
          label: 'Analyse company-specific requirements.',
          prompt: `What are the non-negotiable core skills and system design topics required for ${targetComp}?`,
          mode: 'career',
          icon: Target
        },
        {
          label: 'Evaluate my readiness gap.',
          prompt: `How close is my current profile to the ${targetComp} hiring bar, and what should I fix first?`,
          mode: 'career',
          icon: CheckCircle2
        }
      ];

    case 'study_plan':
      return [
        {
          label: 'Generate a 7-day study plan.',
          prompt: `Generate a focused 7-day study sprint covering DSA practice, ${missing}, and Core CS revision.`,
          mode: 'study_plan',
          icon: Calendar
        },
        {
          label: 'Prioritise my weak subjects.',
          prompt: `Based on my profile gaps (${missing}), how should I prioritise my study hours this week?`,
          mode: 'study_plan',
          icon: Target
        },
        {
          label: 'Design a 2-hour daily routine.',
          prompt: `Design an effective 2-hour daily placement routine balancing problem solving and core subjects.`,
          mode: 'study_plan',
          icon: Sparkles
        },
        {
          label: 'Create a 30-day milestone roadmap.',
          prompt: `Create a structured 30-day placement preparation plan with weekly checkpoints.`,
          mode: 'study_plan',
          icon: BookOpen
        }
      ];

    case 'roadmap':
      return [
        {
          label: 'Suggest next topic in my roadmap.',
          prompt: `Based on my current roadmap progress, what topic should I master next and why?`,
          mode: 'roadmap',
          icon: Compass
        },
        {
          label: 'Check prerequisite dependencies.',
          prompt: `What foundational topics should I solidify before jumping into Dynamic Programming and Graphs?`,
          mode: 'roadmap',
          icon: Code2
        },
        {
          label: 'Balance Core CS and Web Dev.',
          prompt: `How should I sequence DBMS, OS, and CN alongside development projects on my roadmap?`,
          mode: 'roadmap',
          icon: Target
        },
        {
          label: `Roadmap for ${targetRole}.`,
          prompt: `Outline the essential milestone topics required for a ${targetRole} interview.`,
          mode: 'roadmap',
          icon: Briefcase
        }
      ];

    case 'tutor':
      return [
        {
          label: 'Explain DBMS B-Tree vs Hash Indexing.',
          prompt: `Explain Database B-Tree indexing vs Hash indexing clearly with an intuitive example.`,
          mode: 'tutor',
          icon: GraduationCap
        },
        {
          label: 'Process vs Thread in OS.',
          prompt: `Explain the difference between Processes and Threads, including memory sharing and context switching.`,
          mode: 'tutor',
          icon: BookOpen
        },
        {
          label: 'CAP Theorem explained simply.',
          prompt: `Explain the CAP Theorem with a real-world distributed system example.`,
          mode: 'tutor',
          icon: Sparkles
        },
        {
          label: 'SQL Normalization (1NF to BCNF).',
          prompt: `Walk me through 1NF, 2NF, 3NF, and BCNF with concise table examples.`,
          mode: 'tutor',
          icon: CheckCircle2
        }
      ];

    case 'dsa':
      return [
        {
          label: 'Explain a DSA problem.',
          prompt: `Explain the intuition and step-by-step pattern behind Sliding Window and Two Pointers problems.`,
          mode: 'dsa',
          icon: Code2
        },
        {
          label: 'Give me a hint.',
          prompt: `Give me a progressive hint for solving LRU Cache in O(1) time without revealing the full solution code yet.`,
          mode: 'dsa',
          icon: Lightbulb
        },
        {
          label: `Top DSA patterns for ${targetComp}.`,
          prompt: `What are the highest-frequency DSA topics and patterns asked by ${targetComp}?`,
          mode: 'dsa',
          icon: Target
        },
        {
          label: 'Optimize time & space complexity.',
          prompt: `Help me optimize a brute-force O(N^2) solution into O(N) or O(N log N) time.`,
          mode: 'dsa',
          icon: Sparkles
        }
      ];

    case 'resume':
      return [
        {
          label: 'Analyse my resume.',
          prompt: `Analyse my resume profile for ATS readability and suggest improvements for missing keywords like ${missing}.`,
          mode: 'resume',
          icon: FileText
        },
        {
          label: 'Generate behavioural interview answers.',
          prompt: `Help me structure strong STAR-method behavioural answers based on my technical projects.`,
          mode: 'resume',
          icon: Sparkles
        },
        {
          label: 'Rewrite bullets in Google XYZ format.',
          prompt: `Help me rewrite my project bullet points using Google's "Accomplished [X] as measured by [Y], by doing [Z]" formula.`,
          mode: 'resume',
          icon: CheckCircle2
        },
        {
          label: `Tailor summary for ${targetRole}.`,
          prompt: `Write a concise, high-impact resume summary tailored for a ${targetRole} position at ${targetComp}.`,
          mode: 'resume',
          icon: Target
        }
      ];

    case 'interview':
      return [
        {
          label: `Start a mock interview for ${targetRole}.`,
          prompt: `Start a 1-on-1 mock technical interview for a ${targetRole} role. Ask me Question #1 and wait for my response.`,
          mode: 'interview',
          icon: Users
        },
        {
          label: 'Ask a behavioural scenario question.',
          prompt: `Ask me a realistic behavioural interview question about resolving a technical disagreement in a team.`,
          mode: 'interview',
          icon: Sparkles
        },
        {
          label: 'Quiz me on REST APIs & Databases.',
          prompt: `Quiz me on REST API idempotency, indexing, and system scalability one question at a time.`,
          mode: 'interview',
          icon: Code2
        },
        {
          label: 'Defend my project architecture.',
          prompt: `Ask me challenging follow-up architecture questions about my software engineering projects.`,
          mode: 'interview',
          icon: Target
        }
      ];

    case 'general':
    default:
      return [
        {
          label: 'Check my placement readiness.',
          prompt: `Check my current placement readiness across DSA, Resume, and Roadmap, and tell me my top 3 priorities.`,
          mode: 'general',
          icon: CheckCircle2
        },
        {
          label: 'Create a 30-day preparation plan.',
          prompt: `Create my structured 30-day placement preparation plan tailored for ${targetRole} roles.`,
          mode: 'study_plan',
          icon: Calendar
        },
        {
          label: 'Analyse my resume for ATS.',
          prompt: `Analyse my resume for ATS readiness and suggest high-impact bullet improvements.`,
          mode: 'resume',
          icon: FileText
        },
        {
          label: 'Help me solve a DSA problem.',
          prompt: `Help me approach and solve a DSA problem step-by-step using progressive hints.`,
          mode: 'dsa',
          icon: Code2
        }
      ];
  }
}
