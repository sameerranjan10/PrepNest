import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Clock, Flame, Sparkles } from 'lucide-react';

function toDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getHeatClass(count) {
  if (!count || count <= 0) return 'heat-0';
  if (count === 1) return 'heat-1';
  if (count === 2) return 'heat-2';
  if (count === 3) return 'heat-3';
  return 'heat-4';
}

function formatRelativeTime(ts) {
  if (!ts) return 'Recently';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return 'Recently';
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function WeeklyActivityHeatmap({
  recentActivities = [],
  aptitudeResults = [],
  resumeCreatedAt = null,
  dsaSolved = 0,
  roadmapPct = 0,
  xp = 0,
  streak = 0,
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const { weeks, monthLabels, totalActions, activeDaysCount, timelineEvents } = useMemo(() => {
    const countsByDate = {};
    const labelsByDate = {};
    const events = [];

    const addEvent = (rawTs, label, category = 'Activity') => {
      if (!rawTs) return;
      const parsed = new Date(rawTs);
      if (Number.isNaN(parsed.getTime())) return;
      const key = toDateKey(parsed);
      countsByDate[key] = (countsByDate[key] || 0) + 1;
      if (!labelsByDate[key]) labelsByDate[key] = [];
      if (label && labelsByDate[key].length < 3) {
        labelsByDate[key].push(label);
      }
      events.push({
        id: `${key}-${events.length}`,
        title: label,
        category,
        ts: parsed.getTime(),
        rawTs,
      });
    };

    (recentActivities || []).forEach((act) => {
      addEvent(
        act?.created_at || act?.timestamp,
        act?.title || act?.type || 'XP activity',
        act?.amount ? `+${act.amount} XP` : 'Milestone'
      );
    });
    (aptitudeResults || []).forEach((res) => {
      addEvent(
        res?.created_at || res?.submitted_at,
        `Aptitude test completed (${res?.score ?? 0}%)`,
        'Aptitude'
      );
    });
    if (resumeCreatedAt) {
      addEvent(resumeCreatedAt, 'Resume ATS analysis updated', 'Resume');
    }

    events.sort((a, b) => b.ts - a.ts);

    // Align 24 calendar weeks (Sun..Sat) cleanly up to the current week containing today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endSundayOffset = today.getDay(); // 0 = Sun ... 6 = Sat
    const endWeekStart = new Date(today);
    endWeekStart.setDate(today.getDate() - endSundayOffset);

    const totalWeeks = 24;
    const firstWeekStart = new Date(endWeekStart);
    firstWeekStart.setDate(endWeekStart.getDate() - (totalWeeks - 1) * 7);

    const builtWeeks = [];
    const months = [];
    let lastMonth = -1;
    let actionsSum = 0;
    let activeDays = 0;

    for (let w = 0; w < totalWeeks; w++) {
      const col = [];
      const colDate = new Date(firstWeekStart);
      colDate.setDate(firstWeekStart.getDate() + w * 7);
      const colMonth = colDate.getMonth();

      if (colMonth !== lastMonth) {
        months.push({
          weekIdx: w,
          label: colDate.toLocaleDateString([], { month: 'short' }),
        });
        lastMonth = colMonth;
      }

      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(firstWeekStart);
        cellDate.setDate(firstWeekStart.getDate() + w * 7 + d);
        const isFuture = cellDate > today;
        const key = toDateKey(cellDate);
        const count = isFuture ? 0 : countsByDate[key] || 0;
        if (!isFuture && count > 0) {
          activeDays += 1;
          actionsSum += count;
        }
        col.push({
          key,
          isFuture,
          dateLabel: cellDate.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          count,
          notes: labelsByDate[key] || [],
        });
      }
      builtWeeks.push(col);
    }

    return {
      weeks: builtWeeks,
      monthLabels: months,
      totalActions: actionsSum,
      activeDaysCount: activeDays,
      timelineEvents: events.slice(0, 3),
    };
  }, [recentActivities, aptitudeResults, resumeCreatedAt]);

  return (
    <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-5 space-y-4">
      {/* Header + Compact Summary Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-base font-semibold text-[#262626] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FFA116]" />
            <span>Weekly Activity &amp; Consistency</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            24-week preparation activity log across solved problems, aptitude tests, and XP milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF8EE] border border-[#FFA116]/25 font-semibold text-[#FFA116] tabular-nums">
            <Flame className="w-3.5 h-3.5 fill-[#FFA116]" />
            {streak}d streak
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] font-medium text-[#262626] tabular-nums">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            {activeDaysCount} active days
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] font-medium text-[#262626] tabular-nums">
            <Sparkles className="w-3.5 h-3.5 text-[#FFA116]" />
            {xp} XP
          </span>
        </div>
      </div>

      {/* Calendar Heatmap Container */}
      <div className="bg-[#F7F8FA]/65 border border-[#E5E7EB]/80 rounded-xl p-3.5 overflow-x-auto">
        <div className="min-w-[540px] space-y-1.5">
          {/* Month Row */}
          <div className="flex items-center pl-8 text-[10px] font-medium text-[#64748B]">
            {weeks.map((_, wIdx) => {
              const found = monthLabels.find((m) => m.weekIdx === wIdx);
              return (
                <div key={wIdx} className="flex-1 min-w-[16px]">
                  {found ? found.label : ''}
                </div>
              );
            })}
          </div>

          {/* Grid Rows (Day labels + 24 Week Columns) */}
          <div className="flex items-start gap-2">
            <div className="w-6 flex flex-col justify-between text-[10px] text-[#94A3B8] h-[106px] py-[2px] shrink-0 select-none">
              <span>Sun</span>
              <span>Wed</span>
              <span>Sat</span>
            </div>

            <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
              {weeks.map((weekCol, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {weekCol.map((cell) =>
                    cell.isFuture ? (
                      <span
                        key={cell.key}
                        className="w-3.5 h-3.5 rounded-[3px] opacity-0 pointer-events-none"
                      />
                    ) : (
                      <button
                        key={cell.key}
                        type="button"
                        onMouseEnter={() => setHoveredCell(cell)}
                        onFocus={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        aria-label={`${cell.dateLabel}: ${cell.count} activities`}
                        className={`w-3.5 h-3.5 rounded-[3px] border transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-[#FFA116]/40 cursor-default ${getHeatClass(
                          cell.count
                        )}`}
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip / Status Line + Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="text-[#64748B] min-h-[18px] truncate">
          {hoveredCell ? (
            <span>
              <strong className="text-[#262626]">{hoveredCell.dateLabel}:</strong>{' '}
              {hoveredCell.count === 0
                ? 'No logged activity'
                : `${hoveredCell.count} ${hoveredCell.count === 1 ? 'activity' : 'activities'}${
                    hoveredCell.notes.length ? ` — ${hoveredCell.notes.join(', ')}` : ''
                  }`}
            </span>
          ) : (
            <span>
              {totalActions > 0
                ? `${totalActions} events logged in the past 24 weeks · ${dsaSolved} DSA solved · ${roadmapPct}% roadmap progress`
                : `${dsaSolved} DSA solved · ${roadmapPct}% roadmap progress — hover any day cell for details`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] shrink-0 select-none">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <span
              key={lvl}
              className={`w-3 h-3 rounded-[2px] border inline-block ${getHeatClass(lvl)}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Compact Recent Activity Log */}
      {timelineEvents.length > 0 && (
        <div className="pt-3 border-t border-[#E5E7EB]/80 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#FFA116]" />
            <span>Recent Logged Milestones</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {timelineEvents.map((ev) => (
              <div
                key={ev.id}
                className="px-3 py-2 rounded-lg bg-[#F7F8FA]/80 border border-[#E5E7EB]/80 flex items-center justify-between gap-2 min-w-0"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[#262626] truncate" title={ev.title}>
                    {ev.title}
                  </p>
                  <p className="text-[10px] text-[#64748B]">{formatRelativeTime(ev.rawTs)}</p>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FFF8EE] text-[#FFA116] border border-[#FFA116]/25 shrink-0">
                  {ev.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
