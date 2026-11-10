import React from 'react';
import { Search, X, FolderSearch } from 'lucide-react';
import { LearningTrackCard } from './LearningTrackCard';
import { UpcomingTracksCard } from './UpcomingTracksCard';
import {
  TRACK_FILTER_OPTIONS,
  computeTopicsHoursSummary,
} from './roadmapHelpers';
import { Button } from '@/components/ui/Button';

export function LearningTrackGrid({
  domains = [],
  filteredDomains = [],
  topicsByDomain = {},
  search = '',
  onSearchChange,
  activeFilter = 'All Tracks',
  onFilterChange,
  onOpenTrack,
}) {
  return (
    <section aria-label="Learning Tracks" className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1E293B] dark:text-[#E6EDF3] tracking-tight">
            Learning Tracks
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#8B949E] mt-0.5">
            Explore structured learning paths and track your placement preparation progress.
          </p>
        </div>

        <div className="text-xs text-[#64748B] dark:text-[#8B949E] tabular-nums">
          Showing <span className="font-semibold text-[#1E293B] dark:text-[#E6EDF3]">{filteredDomains.length}</span> of{' '}
          {domains.length} tracks
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search tracks by name or focus area..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg text-[#262626] placeholder-[#64748B] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#FFA116] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#262626] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {TRACK_FILTER_OPTIONS.map((option) => {
            const isActive = activeFilter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onFilterChange?.(option)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[#FFF8EE] text-[#FFA116] border-[#FFA116]/40 font-semibold'
                    : 'bg-[#FFFFFF] text-[#64748B] border-[#E5E7EB] hover:bg-[#F7F8FA] hover:text-[#262626]'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      {filteredDomains.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl py-12 px-4 text-center">
          <div className="w-11 h-11 rounded-full bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#64748B] mb-3">
            <FolderSearch className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#262626]">
            No learning tracks match your filters
          </h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            Try clearing your search query or switching back to All Tracks.
          </p>
          <div className="mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onSearchChange?.('');
                onFilterChange?.('All Tracks');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDomains.map((domain) => {
            const { totalHours } = computeTopicsHoursSummary(topicsByDomain[domain.id] || []);
            return (
              <LearningTrackCard
                key={domain.id}
                domain={domain}
                totalHours={totalHours}
                onOpenTrack={onOpenTrack}
              />
            );
          })}
          <UpcomingTracksCard itemCount={filteredDomains.length} />
        </div>
      )}
    </section>
  );
}

