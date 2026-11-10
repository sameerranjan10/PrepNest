import React from 'react';
import { FolderGit2, Layers, CheckCircle2, Clock, ArrowUp } from 'lucide-react';
import { TopicItem } from './TopicItem';
import { Badge } from '@/components/ui/Badge';

export function LearningTimeline({
  topics = [],
  domainProject = null,
  expandedTopicId = null,
  topicDetailsCache = {},
  loadingTopicId = null,
  topicDetailError = null,
  updatingTopicId = null,
  onToggleExpand,
  onToggleComplete,
  onSelectTopicById,
}) {
  const firstAvailableTopic =
    topics.find((t) => !t.completed && t.unlocked) || null;
  const firstAvailableId = firstAvailableTopic?.id || null;

  return (
    <div className="flex-1 min-w-0 space-y-6">
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 pb-5 mb-5 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-base font-semibold text-[#262626]">
              Sequential Learning Timeline
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Complete each milestone in order to unlock the next topic in this track.
            </p>
          </div>
          <span className="text-xs font-medium text-[#64748B] tabular-nums">
            {topics.length} milestones
          </span>
        </div>

        {topics.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#64748B]">
            No topics found in this track yet.
          </div>
        ) : (
          <div>
            {topics.map((topic, idx) => {
              const isExpanded = Number(expandedTopicId) === Number(topic.id);
              const nextTopic = topics[idx + 1] || null;
              const prevTopic = idx > 0 ? topics[idx - 1] : null;

              return (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  index={idx}
                  isLast={idx === topics.length - 1}
                  prevTopicTitle={prevTopic?.title || null}
                  isExpanded={isExpanded}
                  isCurrentHighlight={Number(firstAvailableId) === Number(topic.id)}
                  activeAvailableTopic={firstAvailableTopic}
                  detailData={topicDetailsCache[topic.id] || null}
                  detailLoading={Number(loadingTopicId) === Number(topic.id)}
                  detailError={isExpanded ? topicDetailError : null}
                  isUpdatingProgress={Number(updatingTopicId) === Number(topic.id)}
                  hasNextTopic={Boolean(nextTopic)}
                  onToggleExpand={onToggleExpand}
                  onToggleComplete={onToggleComplete}
                  onNextTopic={() => nextTopic && onSelectTopicById?.(nextTopic.id)}
                  onJumpToTopic={(targetId) => onSelectTopicById?.(targetId)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Capstone Mini-Project Section */}
      {domainProject && (
        <section
          id="roadmap-domain-project"
          className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 sm:p-6 space-y-4 scroll-mt-[calc(var(--header-offset,0px)+1.5rem)]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 text-[#FFA116] flex items-center justify-center shrink-0">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FFA116]">
                    Track Capstone Mini-Project
                  </span>
                  {domainProject.difficulty && (
                    <Badge variant="accent" size="xs">
                      {domainProject.difficulty}
                    </Badge>
                  )}
                  {domainProject.estimated_hours ? (
                    <span className="inline-flex items-center gap-1 text-xs text-[#64748B] tabular-nums">
                      <Clock className="w-3 h-3" />
                      <span>~{domainProject.estimated_hours}h</span>
                    </span>
                  ) : null}
                </div>
                <h3 className="text-lg font-semibold text-[#262626] mt-0.5">
                  {domainProject.title}
                </h3>
              </div>
            </div>
          </div>

          {domainProject.description && (
            <p className="text-sm text-[#64748B] leading-relaxed">
              {domainProject.description}
            </p>
          )}

          {Array.isArray(domainProject.tech_stack) && domainProject.tech_stack.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Recommended Tech Stack
              </p>
              <div className="flex flex-wrap gap-1.5">
                {domainProject.tech_stack.map((tech, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const items =
              Array.isArray(domainProject.requirements) && domainProject.requirements.length > 0
                ? domainProject.requirements
                : Array.isArray(domainProject.deliverables) && domainProject.deliverables.length > 0
                ? domainProject.deliverables
                : Array.isArray(domainProject.tasks) && domainProject.tasks.length > 0
                ? domainProject.tasks
                : [];
            if (!items.length) return null;
            return (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Project Requirements &amp; Deliverables
                </p>
                <ul className="space-y-2">
                  {items.map((task, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-[#262626] bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3.5 py-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#FFA116] shrink-0 mt-0.5" />
                      <span>{typeof task === 'string' ? task : task?.title || JSON.stringify(task)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          <div className="pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B]">
            <span>
              {topics.length > 0 && topics.every((t) => t.completed)
                ? 'You have mastered every prerequisite topic for this capstone.'
                : `${topics.filter((t) => t.completed).length} of ${topics.length} prerequisite milestones completed.`}
            </span>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1 font-medium text-[#FFA116] hover:underline cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
