import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Code,
  Copy,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getDifficultyBadgeVariant } from './roadmapHelpers';

export function TopicDetails({
  topicSummary,
  detailData,
  loading = false,
  error = null,
  hasNextTopic = false,
  isUpdatingProgress = false,
  onToggleComplete,
  onNextTopic,
}) {
  const [activeSection, setActiveSection] = useState('overview'); // 'overview' | 'materials' | 'practice'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [openHints, setOpenHints] = useState({});
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('prepnest_roadmap_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    setActiveSection('overview');
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setCopiedCode(false);
    setOpenHints({});
  }, [topicSummary?.id]);

  const toggleTaskDone = (taskId) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem('prepnest_roadmap_tasks', JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  if (loading) {
    return (
      <div className="p-5 sm:p-6 border-t border-[#E5E7EB] bg-[#F7F8FA]/50 space-y-4 animate-pulse">
        <div className="h-4 bg-[#E5E7EB] rounded w-1/3" />
        <div className="h-3 bg-[#E5E7EB] rounded w-full" />
        <div className="h-3 bg-[#E5E7EB] rounded w-5/6" />
        <div className="h-24 bg-[#E5E7EB] rounded-lg w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 border-t border-[#E5E7EB] bg-[#FFEBEF]/40 text-sm text-[#DC2626]">
        {error}
      </div>
    );
  }

  const topic = detailData?.topic || topicSummary || {};
  const resources = detailData?.resources || [];
  const practiceTasks = detailData?.practice_tasks || [];
  const dsaProblems = detailData?.dsa_problems || [];
  const keyPoints = Array.isArray(topic.key_points) ? topic.key_points : [];
  const quiz = topic.quiz && Object.keys(topic.quiz).length > 0 ? topic.quiz : null;
  const isCompleted = Boolean(topicSummary?.completed ?? topic?.is_completed);

  const quizOptions = quiz?.options
    ? Array.isArray(quiz.options)
      ? quiz.options.map((v, idx) => [String(idx), String.fromCharCode(65 + idx), v])
      : Object.entries(quiz.options).map(([k, v]) => [String(k), String(k).toUpperCase(), v])
    : [];
  const rawCorrect =
    quiz?.answer !== undefined
      ? quiz.answer
      : quiz?.correct_answer !== undefined
      ? quiz.correct_answer
      : quiz?.answer_index !== undefined
      ? quiz.answer_index
      : null;
  const correctKey = rawCorrect !== null ? String(rawCorrect) : null;

  const handleSubmitQuiz = () => {
    if (selectedAnswer === null) return;
    setQuizSubmitted(true);
    if (correctKey !== null && String(selectedAnswer) === correctKey && !isCompleted) {
      onToggleComplete?.(topicSummary.id, false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Objectives', icon: BookOpen },
    { id: 'materials', label: `Study Material (${resources.length})`, icon: ExternalLink },
    {
      id: 'practice',
      label: `Practice & Quiz (${practiceTasks.length + (quiz ? 1 : 0)})`,
      icon: ListChecks,
    },
  ];

  return (
    <div className="border-t border-[#E5E7EB] bg-[#FFFFFF]">
      {/* Sub-navigation bar */}
      <div className="px-5 py-2.5 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center gap-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const active = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                active
                  ? 'bg-[#FFFFFF] text-[#FFA116] border border-[#FFA116]/35 shadow-2xs font-semibold'
                  : 'text-[#64748B] hover:text-[#262626] hover:bg-[#FFFFFF]/70 border border-transparent'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="p-5 sm:p-6 space-y-6">
        {activeSection === 'overview' && (
          <>
            {/* Topic Overview */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#FFA116]" />
                Topic Overview
              </h4>
              {topic.explanation ? (
                <div className="text-sm text-[#262626] leading-relaxed space-y-2.5">
                  {String(topic.explanation)
                    .split('\n\n')
                    .map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-[#64748B]">
                  {topic.description || 'Structured concept overview for this roadmap milestone.'}
                </p>
              )}
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2.5 pt-4 border-t border-[#E5E7EB]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#FFA116]" />
                Learning Objectives
              </h4>
              {keyPoints.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {keyPoints.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-[#262626] bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3.5 py-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span className="leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#64748B] bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3.5 py-2.5">
                  No key takeaways recorded for this topic yet.
                </p>
              )}
            </div>

            {/* Code Example */}
            {topic.code_example && (
              <div className="space-y-2 pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-[#FFA116]" />
                    Reference Implementation
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(topic.code_example)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B] hover:text-[#262626] px-2 py-1 rounded hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span className="text-[#16A34A]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#F7F8FA] text-[#262626] border border-[#E5E7EB] text-xs font-mono rounded-lg p-4 overflow-x-auto leading-relaxed">
                  <code>{topic.code_example}</code>
                </pre>
              </div>
            )}
          </>
        )}

        {activeSection === 'materials' && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Curated Study Material
            </h4>
            {resources.length === 0 ? (
              <div className="py-6 text-center bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg">
                <p className="text-sm font-medium text-[#262626]">No study resources linked yet</p>
                <p className="text-xs text-[#64748B] mt-1">
                  Review the overview tab and practice exercises for this milestone.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-xl overflow-hidden">
                {resources.map((res) => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-[#FFFFFF] hover:bg-[#F7F8FA] transition-colors group"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#262626] group-hover:text-[#FFA116] transition-colors">
                          {res.title}
                        </span>
                        {res.resource_type && (
                          <Badge variant="neutral" size="xs">
                            {res.resource_type}
                          </Badge>
                        )}
                        {res.is_free && (
                          <Badge variant="success" size="xs">
                            Free
                          </Badge>
                        )}
                      </div>
                      {res.provider && (
                        <p className="text-xs text-[#64748B]">{res.provider}</p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-[#FFA116] shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'practice' && (
          <div className="space-y-6">
            {/* Practice Tasks */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Hands-on Practice Tasks
              </h4>
              {practiceTasks.length === 0 ? (
                <p className="text-xs text-[#64748B] bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3.5 py-2.5">
                  No hands-on checklist tasks defined for this topic.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {practiceTasks.map((task) => {
                    const checked = Boolean(completedTasks[task.id]);
                    const hintVisible = Boolean(openHints[task.id]);
                    return (
                      <div
                        key={task.id}
                        className={`border rounded-xl p-3.5 transition-colors ${
                          checked
                            ? 'bg-[#F0FDF4]/60 border-[#16A34A]/25'
                            : 'bg-[#FFFFFF] border-[#E5E7EB]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTaskDone(task.id)}
                            className="mt-1 h-4 w-4 rounded border-[#E5E7EB] accent-[#16A34A] cursor-pointer shrink-0"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span
                                className={`text-sm font-medium ${
                                  checked ? 'line-through text-[#64748B]' : 'text-[#262626]'
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.difficulty && (
                                <Badge
                                  variant={getDifficultyBadgeVariant(task.difficulty)}
                                  size="xs"
                                >
                                  {task.difficulty}
                                </Badge>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-xs text-[#64748B] leading-relaxed">
                                {task.description}
                              </p>
                            )}
                            {task.hint && (
                              <div className="pt-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenHints((prev) => ({
                                      ...prev,
                                      [task.id]: !prev[task.id],
                                    }))
                                  }
                                  className="inline-flex items-center gap-1 text-xs font-medium text-[#FFA116] hover:underline cursor-pointer"
                                >
                                  <Lightbulb className="w-3.5 h-3.5" />
                                  <span>{hintVisible ? 'Hide Hint' : 'Show Hint'}</span>
                                </button>
                                {hintVisible && (
                                  <p className="mt-1.5 text-xs text-[#64748B] bg-[#FFF8EE] border border-[#FFA116]/25 rounded-lg px-3 py-2">
                                    {task.hint}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Related DSA Problems */}
            {dsaProblems.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-[#E5E7EB]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Related DSA Practice Problems
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dsaProblems.map((prob) => (
                    <a
                      key={prob.id}
                      href={prob.link || '/dsa'}
                      target={prob.link ? '_blank' : undefined}
                      rel={prob.link ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-between gap-2 px-3.5 py-2.5 border border-[#E5E7EB] hover:border-[#FFA116]/50 rounded-lg bg-[#FFFFFF] transition-colors group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#262626] truncate group-hover:text-[#FFA116]">
                          {prob.title}
                        </p>
                        {prob.acceptance_rate && (
                          <p className="text-[11px] text-[#64748B]">
                            Acceptance: {prob.acceptance_rate}%
                          </p>
                        )}
                      </div>
                      <Badge variant={getDifficultyBadgeVariant(prob.difficulty)} size="xs">
                        {prob.difficulty}
                      </Badge>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Verification Quiz */}
            {quiz && (
              <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#FFA116]" />
                    Knowledge Check
                  </h4>
                  {quizSubmitted && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuizSubmitted(false);
                        setSelectedAnswer(null);
                      }}
                      className="text-xs font-medium text-[#64748B] hover:text-[#262626] cursor-pointer"
                    >
                      Try Again
                    </button>
                  )}
                </div>

                <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-[#262626]">{quiz.question}</p>

                  <div className="space-y-2">
                    {quizOptions.map(([optKey, optPrefix, optLabel]) => {
                      const isSelected = String(selectedAnswer) === String(optKey);
                      const isCorrect = correctKey !== null && String(optKey) === correctKey;

                      let rowClass =
                        'bg-[#FFFFFF] border-[#E5E7EB] text-[#262626] hover:border-[#FFA116]/60';
                      if (quizSubmitted) {
                        if (isCorrect) {
                          rowClass =
                            'bg-[#F0FDF4] border-[#16A34A] text-[#16A34A] font-medium';
                        } else if (isSelected && !isCorrect) {
                          rowClass =
                            'bg-[#FFEBEF] border-[#DC2626] text-[#DC2626] font-medium';
                        }
                      } else if (isSelected) {
                        rowClass =
                          'bg-[#FFF8EE] border-[#FFA116] text-[#262626] font-medium';
                      }

                      return (
                        <button
                          key={optKey}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => setSelectedAnswer(optKey)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors ${rowClass} ${
                            quizSubmitted ? 'cursor-default' : 'cursor-pointer'
                          }`}
                        >
                          <span>
                            <strong className="mr-2 uppercase">{optPrefix}.</strong>
                            {optLabel}
                          </span>
                          {quizSubmitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <div className="pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={selectedAnswer === null}
                        onClick={handleSubmitQuiz}
                      >
                        Submit Answer
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-1 space-y-1.5 text-xs">
                      {String(selectedAnswer) === correctKey ? (
                        <p className="text-[#16A34A] font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            Correct! {isCompleted ? 'This topic is completed.' : 'Topic marked as complete.'}
                          </span>
                        </p>
                      ) : (
                        <p className="text-[#DC2626] font-semibold">
                          Incorrect answer. Review the overview and try again.
                        </p>
                      )}
                      {quiz.explanation && (
                        <p className="text-[#64748B] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3 py-2">
                          {quiz.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completion Footer */}
      <div className="px-5 py-3.5 bg-[#F7F8FA] border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#64748B]">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 text-[#16A34A] font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Milestone completed
            </span>
          ) : (
            <span>Mark this topic completed to unlock the next sequential step.</span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={isCompleted ? 'secondary' : 'success'}
            size="sm"
            loading={isUpdatingProgress}
            onClick={() => onToggleComplete?.(topicSummary.id, isCompleted)}
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            {isCompleted ? 'Completed (Undo)' : 'Mark as Completed'}
          </Button>

          {hasNextTopic && (
            <Button
              variant="primary"
              size="sm"
              disabled={!isCompleted}
              onClick={onNextTopic}
              iconRight={<ArrowRight className="w-3.5 h-3.5" />}
              title={!isCompleted ? 'Complete this topic first to unlock the next topic' : 'Proceed to next topic'}
            >
              Next Topic
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
