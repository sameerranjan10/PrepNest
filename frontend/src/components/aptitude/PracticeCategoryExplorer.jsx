import React from 'react';
import { Calculator, BrainCircuit, BookOpen, Layers } from 'lucide-react';
import { CategoryCard } from './CategoryCard';

const CATEGORY_ICON_MAP = {
  quantitative: Calculator,
  logical: BrainCircuit,
  verbal: BookOpen,
};

export function PracticeCategoryExplorer({
  categories = [],
  loading = false,
  activeCategory = 'all',
  onSelectCategory,
  onSelectSubtopic,
}) {
  return (
    <section aria-label="Practice Category Explorer" className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[var(--foreground)]">
            Practice Category Explorer
          </h2>
          <p className="text-xs text-[var(--foreground-secondary)]">
            Focus on Quantitative Aptitude, Logical Reasoning, or Verbal Ability topics.
          </p>
        </div>
        {activeCategory !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectCategory?.('all')}
            className="text-xs font-semibold text-[#FFA116] hover:underline cursor-pointer shrink-0"
          >
            Show All Categories
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg skeleton-shimmer" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 rounded skeleton-shimmer" />
                  <div className="h-3 w-24 rounded skeleton-shimmer" />
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full skeleton-shimmer" />
              <div className="h-8 w-full rounded-lg skeleton-shimmer" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center space-y-1.5">
          <Layers className="w-6 h-6 text-[var(--foreground-muted)] mx-auto" />
          <p className="text-xs font-semibold text-[var(--foreground)]">
            No aptitude categories available
          </p>
          <p className="text-[11px] text-[var(--foreground-secondary)]">
            No aptitude question categories were found in the database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              icon={CATEGORY_ICON_MAP[cat.id] || BookOpen}
              totalQuestions={Number(cat.total_questions) || 0}
              solvedQuestions={Number(cat.solved_questions) || 0}
              subtopics={Array.isArray(cat.subtopics) ? cat.subtopics : []}
              isActive={activeCategory === cat.id}
              onExplore={(id) =>
                onSelectCategory?.(activeCategory === id ? 'all' : id)
              }
              onSelectSubtopic={onSelectSubtopic}
            />
          ))}
        </div>
      )}
    </section>
  );
}
