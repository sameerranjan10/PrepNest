import React from 'react';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Bookmark,
  RotateCcw
} from 'lucide-react';

export function CompanyFilters({
  selectedCategory,
  onCategoryChange,
  availableCategories,
  bookmarkedCount,
  difficultyFilter,
  onDifficultyChange,
  roleFilter,
  onRoleChange,
  availableRoles,
  assessmentFilter,
  onAssessmentChange,
  availableAssessments,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
  onResetFilters,
  hasActiveFilters
}) {
  return (
    <div className="space-y-3">
      {/* Row 1: Category Tabs + Grid/List Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition ${
              selectedCategory === 'all'
                ? 'bg-[#FFA116] border-[#FFA116] text-white shadow-2xs'
                : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA]'
            }`}
          >
            All Companies
          </button>

          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition ${
                selectedCategory === cat
                  ? 'bg-[#FFA116] border-[#FFA116] text-white shadow-2xs'
                  : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA]'
              }`}
            >
              {cat}
            </button>
          ))}

          {bookmarkedCount > 0 && (
            <button
              onClick={() => onCategoryChange('bookmarked')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition ${
                selectedCategory === 'bookmarked'
                  ? 'bg-[#FFA116] border-[#FFA116] text-white shadow-2xs'
                  : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#64748B] hover:text-[#262626] hover:bg-[#F7F8FA]'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>Saved ({bookmarkedCount})</span>
            </button>
          )}
        </div>

        {/* Result Count & View Mode Switcher */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-[#64748B] hidden sm:inline">
            Showing <strong className="text-[#262626]">{resultCount}</strong> tracks
          </span>

          <div className="inline-flex rounded-lg bg-[#FFFFFF] p-0.5 border border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              title="Grid view"
              className={`p-1.5 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-[#FFF8EE] text-[#FFA116]'
                  : 'text-[#64748B] hover:text-[#262626]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              title="List view"
              className={`p-1.5 rounded-md transition ${
                viewMode === 'list'
                  ? 'bg-[#FFF8EE] text-[#FFA116]'
                  : 'text-[#64748B] hover:text-[#262626]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Filter Dropdowns & Sort Controls */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-3 flex flex-wrap items-center gap-2.5 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#FFA116]" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {/* Difficulty Filter */}
        <select
          value={difficultyFilter}
          onChange={(e) => onDifficultyChange(e.target.value)}
          aria-label="Filter by difficulty"
          className="bg-[#F7F8FA] border border-[#E5E7EB] hover:border-[#CBD5E1] focus:border-[#FFA116] rounded-lg px-2.5 py-1.5 text-xs text-[#262626] font-medium outline-none transition"
        >
          <option value="all">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
          <option value="Extreme">Extreme</option>
        </select>

        {/* Job Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          aria-label="Filter by job role"
          className="bg-[#F7F8FA] border border-[#E5E7EB] hover:border-[#CBD5E1] focus:border-[#FFA116] rounded-lg px-2.5 py-1.5 text-xs text-[#262626] font-medium outline-none transition max-w-[200px]"
        >
          <option value="all">All Job Roles</option>
          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        {/* Assessment Type Filter */}
        <select
          value={assessmentFilter}
          onChange={(e) => onAssessmentChange(e.target.value)}
          aria-label="Filter by assessment type"
          className="bg-[#F7F8FA] border border-[#E5E7EB] hover:border-[#CBD5E1] focus:border-[#FFA116] rounded-lg px-2.5 py-1.5 text-xs text-[#262626] font-medium outline-none transition"
        >
          <option value="all">All Assessments</option>
          {availableAssessments.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Sort Control */}
        <div className="flex items-center gap-1.5 sm:ml-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B]" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort companies"
            className="bg-[#F7F8FA] border border-[#E5E7EB] hover:border-[#CBD5E1] focus:border-[#FFA116] rounded-lg px-2.5 py-1.5 text-xs text-[#262626] font-medium outline-none transition"
          >
            <option value="questions_desc">Sort: Most Questions</option>
            <option value="name_asc">Sort: Name (A–Z)</option>
            <option value="name_desc">Sort: Name (Z–A)</option>
            <option value="progress_desc">Sort: Highest Progress</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#DC2626] hover:bg-[#FFEBEF]/60 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}

