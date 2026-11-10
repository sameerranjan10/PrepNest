import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function AIMentorWidget({ contextSummary = null }) {
  const targetRole = contextSummary?.target_role;
  const targetCompany = contextSummary?.target_company;
  const missingSkills = Array.isArray(contextSummary?.missing_skills)
    ? contextSummary.missing_skills.slice(0, 2)
    : [];

  const message = missingSkills.length > 0
    ? `Your resume scan flagged ${missingSkills.join(' and ')} as high-impact skill gaps${
        targetCompany ? ` for ${targetCompany}` : ''
      }. Build a targeted study sprint with your mentor.`
    : targetRole
    ? `Stay on track for ${targetRole}${targetCompany ? ` at ${targetCompany}` : ''}. Ask for mock behavioral rounds, DSA hints, or a weekly sprint.`
    : 'Get tailored guidance for coding interviews, ATS resume upgrades, and company-specific hiring rounds.';

  const suggestedAction = missingSkills.length > 0
    ? `Plan a 7-day sprint for ${missingSkills[0]}`
    : targetCompany
    ? `Prepare me for ${targetCompany} rounds`
    : 'Create a 30-day placement roadmap';

  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116] shrink-0">
          <Bot className="w-[18px] h-[18px]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#262626]">AI Placement Mentor</h2>
          <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{message}</p>
        </div>
      </div>

      <Link
        to="/ai-assistant"
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] hover:border-[#FFA116]/50 text-xs font-medium text-[#262626] transition-colors group"
      >
        <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
          <Sparkles className="w-3.5 h-3.5 text-[#FFA116] shrink-0" />
          <span className="truncate">{suggestedAction}</span>
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#FFA116] shrink-0" />
      </Link>

      <Link to="/ai-assistant" className="block">
        <Button
          variant="primary"
          size="md"
          iconRight={<ArrowRight className="w-4 h-4" />}
          className="w-full justify-between"
        >
          <span>Open AI Mentor</span>
        </Button>
      </Link>
    </section>
  );
}
