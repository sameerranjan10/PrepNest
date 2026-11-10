import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Bookmark,
  Play,
  Code2,
  BookOpen,
  Cpu,
  MessageSquare,
  Timer,
  ArrowRight,
  CheckCircle2,
  Circle,
  Bot,
  Video,
  ExternalLink,
} from 'lucide-react';
import { ComponentLoader } from '@/components/ui/PrepNestLoader';
import { CompanyLogo } from './CompanyLogo';
import { RecruitmentOverview } from './RecruitmentOverview';
import { CompanyProgress } from './CompanyProgress';
import QuestionDirectory from '@/components/QuestionDirectory';
import DSAPracticeModal from '@/components/DSAPracticeModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const MODULE_TABS = [
  { id: 'aptitude', label: 'Aptitude Preparation', icon: BookOpen },
  { id: 'dsa', label: 'DSA Question Bank', icon: Code2 },
  { id: 'technical', label: 'Technical Interview Prep', icon: Cpu },
  { id: 'experiences', label: 'Interview Experiences', icon: MessageSquare },
  { id: 'mock_oa', label: 'Quick OA Mock', icon: Timer }
];

export function CompanyDetails({
  company,
  availableCompanies,
  isBookmarked,
  onToggleBookmark,
  onBack,
  onStartMockOA,
  userId
}) {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState('aptitude');

  // Company-specific DSA preview list
  const [dsaProblems, setDsaProblems] = useState([]);
  const [dsaLoading, setDsaLoading] = useState(false);
  const [activePracticeProblemId, setActivePracticeProblemId] = useState(null);

  useEffect(() => {
    setActiveModule('aptitude');
    fetchCompanyDsa();
  }, [company.name]);

  const fetchCompanyDsa = async () => {
    setDsaLoading(true);
    try {
      const uidParam = userId ? `&user_id=${userId}` : '';
      const res = await fetch(
        `${API_BASE}/api/dsa/problems?company=${encodeURIComponent(company.name)}&limit=15${uidParam}`
      );
      if (res.ok) {
        const data = await res.json();
        setDsaProblems(data.problems || []);
      }
    } catch (err) {
      console.warn('Could not load company DSA preview:', err);
    } finally {
      setDsaLoading(false);
    }
  };

  const diffVariant =
    company.hiringDifficulty === 'Extreme'
      ? 'hard'
      : company.hiringDifficulty === 'Hard'
      ? 'medium'
      : 'easy';

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBack}
          icon={<ChevronLeft className="w-4 h-4" />}
        >
          Back to All Companies
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dsa?company=${encodeURIComponent(company.name)}`)}
            icon={<Code2 className="w-3.5 h-3.5 text-[#FFA116]" />}
          >
            Open {company.name} DSA ({company.dsaTotal || 0})
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onStartMockOA(company.name)}
            icon={<Play className="w-3.5 h-3.5 fill-white" />}
          >
            Start Timed {company.name} Mock OA
          </Button>
        </div>
      </div>

      {/* A. COMPANY HEADER CARD */}
      <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <CompanyLogo
              companyName={company.name}
              logo={company.logo}
              size="xl"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#262626] tracking-tight">
                  {company.name}
                </h1>
                <Badge variant={diffVariant} size="xs">
                  {company.hiringDifficulty} Difficulty
                </Badge>
                <span className="text-[11px] font-semibold text-[#64748B] bg-[#F7F8FA] border border-[#E5E7EB] px-2.5 py-0.5 rounded-full">
                  {company.category}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#64748B]">
                Target Roles: <strong className="text-[#262626] font-semibold">{company.role}</strong>
              </p>

              <p className="text-xs text-[#64748B] leading-relaxed max-w-3xl pt-0.5">
                {company.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleBookmark(company.name)}
            className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition shrink-0 ${
              isBookmarked
                ? 'bg-[#FFF8EE] border-[#FFA116]/40 text-[#FFA116]'
                : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#FFA116]' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
          </button>
        </div>
      </section>

      {/* B. RECRUITMENT OVERVIEW + C. PREPARATION PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7">
          <RecruitmentOverview company={company} />
        </div>
        <div className="lg:col-span-5">
          <CompanyProgress company={company} />
        </div>
      </div>

      {/* D. PREPARATION MODULES */}
      <section className="space-y-4">
        {/* Module Tabs */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-2xs">
          {MODULE_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveModule(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                  isActive
                    ? 'bg-[#FFA116] text-white shadow-2xs'
                    : 'text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA]'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Module 1: Aptitude Preparation */}
        {activeModule === 'aptitude' && (
          <QuestionDirectory
            availableCompanies={availableCompanies}
            initialCompany={company.name}
            lockCompany={true}
            onStartQuiz={() => onStartMockOA(company.name)}
          />
        )}

        {/* Module 2: DSA Question Bank */}
        {activeModule === 'dsa' && (
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F3F5]">
              <div>
                <h3 className="text-base font-bold text-[#262626]">
                  {company.name} Tagged DSA Question Bank
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Solve LeetCode-style coding problems frequently asked in {company.name} assessments.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dsa?company=${encodeURIComponent(company.name)}`)}
                icon={<ExternalLink className="w-3.5 h-3.5 text-[#FFA116]" />}
              >
                View All ({company.dsaTotal || dsaProblems.length}) in Directory
              </Button>
            </div>

            {dsaLoading ? (
              <ComponentLoader size="sm" message={`Loading ${company.name} DSA problems...`} />
            ) : dsaProblems.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB]">
                <Code2 className="w-8 h-8 text-[#94A3B8] mx-auto" />
                <div>
                  <p className="text-sm font-bold text-[#262626]">
                    Explore curated DSA problems for {company.name}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    Open the main DSA Directory to practice core patterns tailored for {company.name}.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/dsa')}
                >
                  Browse Full DSA Directory
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F3F5] border border-[#E5E7EB] rounded-xl overflow-hidden">
                {dsaProblems.map((prob) => {
                  const pVariant =
                    prob.difficulty === 'Hard'
                      ? 'hard'
                      : prob.difficulty === 'Medium'
                      ? 'medium'
                      : 'easy';

                  return (
                    <div
                      key={prob.id}
                      onClick={() => setActivePracticeProblemId(prob.id)}
                      className="p-3.5 sm:px-4 hover:bg-[#F7F8FA] transition flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {prob.is_solved ? (
                          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#CBD5E1] shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-[#262626] group-hover:text-[#FFA116] transition truncate">
                            {prob.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {(prob.topics || []).slice(0, 3).map((t, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-[#F1F3F5] text-[#64748B] font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={pVariant} size="xs">
                          {prob.difficulty}
                        </Badge>
                        <span className="text-xs font-semibold text-[#FFA116] hidden sm:inline-flex items-center gap-1">
                          Solve <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Module 3: Technical Interview Preparation */}
        {activeModule === 'technical' && (
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xs">
            <div>
              <h3 className="text-base font-bold text-[#262626]">
                Technical Interview Preparation Guide — {company.name}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Core CS, coding patterns, and assessment modules prioritized during {company.name} technical loops.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(company.sections && company.sections.length > 0
                ? company.sections
                : ['Data Structures & Algorithms', 'DBMS & SQL Queries', 'Operating Systems & OOPs']
              ).map((section, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#FFF8EE] border border-[#FFA116]/30 text-[#FFA116] text-xs font-bold">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-[#262626]">{section}</h4>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    Frequently evaluated in {company.name} {company.role} screening & live technical discussions.
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#F1F3F5]">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/mock-interview')}
                icon={<Video className="w-3.5 h-3.5" />}
              >
                Launch AI Mock Interview Room
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/ai-assistant')}
                icon={<Bot className="w-3.5 h-3.5 text-[#FFA116]" />}
              >
                Practice Technical Q&A with AI Mentor
              </Button>
            </div>
          </div>
        )}

        {/* Module 4: Company Interview Experiences */}
        {activeModule === 'experiences' && (
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#262626]">
                  {company.name} Candidate Interview Experiences
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Synthesized round takeaways and evaluation patterns for {company.name}.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/community')}
                icon={<MessageSquare className="w-3.5 h-3.5 text-[#FFA116]" />}
              >
                Discuss in Community
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#262626]">{exp.role}</span>
                    <Badge variant="success" size="xs">
                      {exp.verdict}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed">
                    {exp.takeaway}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Module 5: Quick Online Assessment Mock */}
        {activeModule === 'mock_oa' && (
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFA116] uppercase tracking-wider">
                <Timer className="w-4 h-4" />
                Simulated Assessment Environment
              </div>
              <h3 className="text-lg font-bold text-[#262626]">
                {company.name} Timed Online Assessment Mock
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                Practice under realistic exam pressure with {company.name}-tagged questions following the pattern:{' '}
                <strong className="text-[#262626] font-medium">{company.testPattern}</strong>.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => onStartMockOA(company.name)}
              icon={<Play className="w-4 h-4 fill-white" />}
              className="shrink-0"
            >
              Start Timed Mock OA
            </Button>
          </div>
        )}
      </section>

      {/* In-place DSA Practice Modal */}
      {activePracticeProblemId && (
        <DSAPracticeModal
          problemId={activePracticeProblemId}
          onClose={() => setActivePracticeProblemId(null)}
          onProblemUpdated={(id, updates) => {
            setDsaProblems((prev) =>
              prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
            );
          }}
        />
      )}
    </div>
  );
}

