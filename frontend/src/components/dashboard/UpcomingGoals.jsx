import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function UpcomingGoals({
  roadmapRecommendations = [],
  missingSkills = [],
  dsaSolved = 0,
  aptitudeSolved = 0,
  hasResumeScan = false,
}) {
  const goals = [];

  if (roadmapRecommendations.length > 0) {
    roadmapRecommendations.slice(0, 2).forEach((rec) => {
      goals.push({
        id: `rec-${rec.topic_id}`,
        title: `Complete "${rec.title}"`,
        meta: rec.domain_name || 'Learning Roadmap',
        status: 'Next Step',
        variant: 'accent',
        to: `/roadmaps?track=${encodeURIComponent(rec.domain_id)}&topic=${encodeURIComponent(rec.topic_id)}`,
      });
    });
  }

  if (missingSkills.length > 0) {
    goals.push({
      id: 'skill-gap',
      title: `Close skill gap: ${missingSkills.slice(0, 2).join(', ')}`,
      meta: 'Resume & Role Alignment',
      status: 'Priority',
      variant: 'medium',
      to: '/resume-analyzer',
    });
  } else if (!hasResumeScan) {
    goals.push({
      id: 'resume-scan',
      title: 'Run ATS Resume Scan for target role',
      meta: 'Resume Analyzer',
      status: 'Pending',
      variant: 'neutral',
      to: '/resume-analyzer',
    });
  }

  if (dsaSolved < 5) {
    goals.push({
      id: 'dsa-milestone',
      title: `Solve ${Math.max(1, 5 - dsaSolved)} more foundational DSA problems`,
      meta: 'DSA Directory',
      status: dsaSolved > 0 ? 'In Progress' : 'Pending',
      variant: dsaSolved > 0 ? 'accent' : 'neutral',
      to: '/dsa',
    });
  }

  if (aptitudeSolved === 0 && goals.length < 4) {
    goals.push({
      id: 'apt-drill',
      title: 'Complete first Aptitude practice drill',
      meta: 'Aptitude Hub',
      status: 'Pending',
      variant: 'neutral',
      to: '/aptitude',
    });
  }

  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-2 border-b border-[#E5E7EB]">
        <h2 className="text-base font-semibold text-[#262626] flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-[#FFA116]" />
          <span>Upcoming Goals</span>
        </h2>
        <span className="text-[11px] text-[#64748B] font-medium tabular-nums">
          {goals.length} active
        </span>
      </div>

      {goals.length === 0 ? (
        <div className="p-6 text-center space-y-1.5">
          <CheckCircle2 className="w-6 h-6 text-[#16A34A] mx-auto" />
          <p className="text-xs font-semibold text-[#262626]">All immediate milestones completed</p>
          <p className="text-[11px] text-[#64748B]">
            Explore mock interviews or company-specific archives next.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F1F3F5]">
          {goals.slice(0, 4).map((goal) => (
            <Link
              key={goal.id}
              to={goal.to}
              className="flex items-start justify-between gap-3 px-5 py-3 hover:bg-[#F7F8FA]/80 transition-colors group"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <Circle className="w-4 h-4 text-[#FFA116] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#262626] group-hover:text-[#FFA116] transition-colors leading-snug">
                    {goal.title}
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{goal.meta}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                <Badge variant={goal.variant} size="xs">
                  {goal.status}
                </Badge>
                <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#FFA116]" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

