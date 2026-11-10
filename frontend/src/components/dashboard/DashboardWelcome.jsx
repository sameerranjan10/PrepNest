import React from 'react';
import { Sparkles, ShieldCheck, Target } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { PlacementReadiness } from './PlacementReadiness';

export function DashboardWelcome({
  displayName = 'Student',
  plan = 'Pro',
  targetRole = null,
  targetCompany = null,
  readiness = 0,
  weeklyDelta = 0,
  readinessCategory = null,
}) {
  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="space-y-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="accent"
            size="sm"
            icon={<Sparkles className="w-3 h-3 text-[#FFA116]" />}
          >
            Placement Season 2026
          </Badge>
          {plan && (
            <Badge
              variant="success"
              size="sm"
              icon={<ShieldCheck className="w-3 h-3 text-[#16A34A]" />}
            >
              {plan} Active
            </Badge>
          )}
          {targetRole && (
            <Badge
              variant="neutral"
              size="sm"
              icon={<Target className="w-3 h-3 text-[#64748B]" />}
            >
              {targetRole}
              {targetCompany ? ` · ${targetCompany}` : ''}
            </Badge>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-[#262626] tracking-tight">
          Welcome back, {displayName}
        </h1>

        <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
          {targetCompany || targetRole
            ? `Focused preparation workspace for ${targetRole || 'your target role'}${targetCompany ? ` at ${targetCompany}` : ''}. Track solved problems, milestones, and interview readiness in one place.`
            : 'Track your placement trajectory across Data Structures, Aptitude drills, structured roadmaps, and company-specific interview archives.'}
        </p>
      </div>

      <PlacementReadiness
        readiness={readiness}
        weeklyDelta={weeklyDelta}
        categoryLabel={readinessCategory}
      />
    </section>
  );
}

