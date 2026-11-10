export const INTERVIEW_CATEGORIES = [
  {
    id: "Technical",
    label: "Technical Interview",
    subtitle: "DSA, Arrays/Trees/Graphs/DP, OS, DBMS, Networks, OOP & System Design",
    badge: "Core CS + DSA",
  },
  {
    id: "HR",
    label: "HR Interview",
    subtitle: "Career goals, role/company fit, strengths, pressure & conflict scenarios",
    badge: "Role & Culture",
  },
  {
    id: "Behavioral",
    label: "Behavioral (STAR)",
    subtitle: "Situation, Task, Action, Result evaluation with ownership probing",
    badge: "STAR Framework",
  },
  {
    id: "Mixed",
    label: "Mixed Interview",
    subtitle: "Combined technical, problem-solving, behavioral & HR round simulation",
    badge: "Full Loop",
  },
];

export const INTERVIEW_MODES = [
  {
    id: "realistic",
    label: "Realistic Interview",
    tag: "Standard",
    description:
      "Human-like panel round. No hints or answers revealed during questioning; full evaluation delivered after completion.",
  },
  {
    id: "practice",
    label: "Practice Mode",
    tag: "Guided",
    description:
      "Helpful coaching hints on demand, immediate turn-level feedback, and conceptual learning pointers.",
  },
  {
    id: "pressure",
    label: "Pressure Mode",
    tag: "Intense",
    description:
      "Shorter per-turn timer, challenging follow-ups, and strict technical justification without assistance.",
  },
];

export const INTERVIEW_PERSONALITIES = [
  {
    id: "professional",
    label: "Professional",
    description: "Formal, structured questioning with balanced probing follow-ups.",
  },
  {
    id: "friendly",
    label: "Friendly",
    description: "Encouraging tone and supportive clarifications while keeping objective grading.",
  },
  {
    id: "strict",
    label: "Strict",
    description: "Direct high-bar communication that immediately challenges incomplete explanations.",
  },
];

export const EXPERIENCE_LEVELS = [
  { id: "fresher", label: "Fresher / Campus Grad" },
  { id: "intermediate", label: "Intermediate (1–2 yrs / Intern)" },
  { id: "experienced", label: "Experienced (2+ yrs)" },
];

export const DURATION_OPTIONS = [
  { minutes: 10, label: "10 Min Quick" },
  { minutes: 15, label: "15 Min Standard" },
  { minutes: 25, label: "25 Min Deep Dive" },
];

export const PHASE_STEPS = [
  { id: "introduction", label: "Intro" },
  { id: "warmup", label: "Warm-Up" },
  { id: "main", label: "Core Qs" },
  { id: "followup", label: "Follow-Up" },
  { id: "final", label: "Closing" },
];

export const PROVENANCE_LABELS = {
  verified_question_bank: {
    label: "Verified Question Bank",
    className:
      "bg-[#F0FDF4] dark:bg-[#16A34A]/15 border-[#16A34A]/30 text-[#16A34A] dark:text-[#3FB950]",
  },
  company_pattern: {
    label: "Company Pattern Practice",
    className:
      "bg-[#EFF6FF] dark:bg-[#2563EB]/15 border-[#2563EB]/30 text-[#2563EB] dark:text-[#60A5FA]",
  },
  topic_directory: {
    label: "Technical Topic Bank",
    className:
      "bg-[#F8FAFC] dark:bg-[#21262D] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B] dark:text-[#8B949E]",
  },
  ai_followup: {
    label: "AI Adaptive Follow-Up",
    className:
      "bg-[#FFFBEB] dark:bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#D97706] dark:text-[#FBBF24]",
  },
  ai_generated: {
    label: "AI Practice Question",
    className:
      "bg-[#FFFBEB] dark:bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#D97706] dark:text-[#FBBF24]",
  },
  project_defense: {
    label: "Project Defense",
    className:
      "bg-[#FFF8EE] dark:bg-[#FFA116]/15 border-[#FFA116]/30 text-[#D97706] dark:text-[#FFA116]",
  },
  introduction: {
    label: "Session Intro",
    className:
      "bg-[#F8FAFC] dark:bg-[#21262D] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B]",
  },
  closing: {
    label: "Closing Stage",
    className:
      "bg-[#F8FAFC] dark:bg-[#21262D] border-[#E2E8F0] dark:border-[#30363D] text-[#64748B]",
  },
};

export const STRATEGY_LABELS = {
  clarification: "Clarification Probe",
  depth: "Depth Probe",
  application: "Practical Application",
  challenge: "Edge-Case Challenge",
  correction: "Guiding Correction",
  alternative: "Alternative Approach",
  reflection: "Design Justification",
};

