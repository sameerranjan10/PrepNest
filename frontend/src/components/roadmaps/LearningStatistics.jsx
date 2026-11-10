import React from 'react';
import { TrendingUp, CheckCircle2, Layers, Clock } from 'lucide-react';

export function LearningStatistics({
  overall = { total_topics: 0, completed_topics: 0, progress_percentage: 0 },
  totalTracks = 0,
  completedTracks = 0,
  hoursSummary = { totalHours: 0, completedHours: 0, hasData: false },
  totalWeeks = 0,
}) {
  const stats = [
    {
      label: 'Overall Progress',
      value: `${overall.progress_percentage || 0}%`,
      sublabel:
        overall.progress_percentage >= 100
          ? 'Curriculum completed'
          : `${Math.max(0, (overall.total_topics || 0) - (overall.completed_topics || 0))} topics remaining`,
      icon: TrendingUp,
      accent: 'text-[#FFA116] bg-[#FFF8EE]',
    },
    {
      label: 'Topics Completed',
      value: `${overall.completed_topics || 0} / ${overall.total_topics || 0}`,
      sublabel: 'Sequential milestone mastery',
      icon: CheckCircle2,
      accent: 'text-[#16A34A] bg-[#F0FDF4]',
    },
    {
      label: 'Learning Tracks',
      value: `${totalTracks}`,
      sublabel: `${completedTracks} track${completedTracks === 1 ? '' : 's'} completed`,
      icon: Layers,
      accent: 'text-[#262626] bg-[#F7F8FA]',
    },
    {
      label: 'Learning Hours',
      value: hoursSummary.hasData ? `${hoursSummary.completedHours}h / ${hoursSummary.totalHours}h` : '—',
      sublabel: hoursSummary.hasData ? 'Completed vs total study time' : 'Loading curriculum hours',
      icon: Clock,
      accent: 'text-[#D97706] bg-[#FFF9E6]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3.5 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#64748B] truncate">{item.label}</p>
              <p className="text-xl font-bold text-[#262626] tracking-tight mt-1 tabular-nums">
                {item.value}
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{item.sublabel}</p>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.accent}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
