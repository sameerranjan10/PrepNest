import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { BlurDrop } from '@/components/ui/BlurDrop';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import { COMPANY_CATEGORIES, enrichCompany } from '@/components/company/companyHelpers';
import { CompanyHeader } from '@/components/company/CompanyHeader';
import { FeaturedCompanies } from '@/components/company/FeaturedCompanies';
import { CompanyFilters } from '@/components/company/CompanyFilters';
import { CompanyCard } from '@/components/company/CompanyCard';
import { CompanyTable } from '@/components/company/CompanyTable';
import { CompanyDetails } from '@/components/company/CompanyDetails';
import { UpcomingCompaniesCard } from '@/components/company/UpcomingCompaniesCard';

export default function CompanyPrepPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyFromUrl = searchParams.get('company');

  const [rawCompanies, setRawCompanies] = useState([]);
  const [upcomingCompanies, setUpcomingCompanies] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedCompanyName, setSelectedCompanyName] = useState(companyFromUrl || null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [assessmentFilter, setAssessmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('questions_desc');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchCompanyTracks();
  }, [user?.id]);

  const fetchCompanyTracks = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetch('/api/companies');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setRawCompanies(data.companies || []);
      setUpcomingCompanies(data.upcoming_companies || []);
      setBookmarks(data.bookmarked_companies || []);
    } catch (err) {
      console.error('Failed to load company tracks:', err);
      setLoadError('Unable to load company preparation tracks from the database.');
      setRawCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Sync URL ?company= param
  useEffect(() => {
    if (companyFromUrl) {
      setSelectedCompanyName(companyFromUrl);
    } else {
      setSelectedCompanyName(null);
    }
  }, [companyFromUrl]);

  const companies = useMemo(
    () => rawCompanies.map(enrichCompany),
    [rawCompanies]
  );

  const selectedCompany = useMemo(() => {
    if (!selectedCompanyName) return null;
    return (
      companies.find(
        (c) => c.name.toLowerCase() === selectedCompanyName.toLowerCase()
      ) || null
    );
  }, [companies, selectedCompanyName]);

  const bookmarkedSet = useMemo(() => new Set(bookmarks), [bookmarks]);

  const handleToggleBookmark = async (companyName) => {
    const exists = bookmarks.includes(companyName);
    setBookmarks((prev) =>
      exists ? prev.filter((name) => name !== companyName) : [...prev, companyName]
    );
    try {
      const res = await apiFetch(`/api/companies/${encodeURIComponent(companyName)}/bookmark`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks((prev) => {
          const filtered = prev.filter((name) => name !== companyName);
          return data.is_bookmarked ? [...filtered, companyName] : filtered;
        });
      }
    } catch (err) {
      console.error('Failed to persist company bookmark:', err);
    }
  };

  const handleSelectCompany = (comp) => {
    setSelectedCompanyName(comp.name);
    setSearchParams({ company: comp.name });
  };

  const handleBackToAll = () => {
    setSelectedCompanyName(null);
    setSearchParams({});
    fetchCompanyTracks();
  };

  const handleStartCompanyMock = (companyName) => {
    navigate(`/aptitude?company=${encodeURIComponent(companyName)}`);
  };

  // Compute real global stats across dataset
  const stats = useMemo(() => {
    const totalAptitude = companies.reduce((acc, c) => acc + (c.totalQuestions || 0), 0);
    const totalDsa = companies.reduce((acc, c) => acc + (c.dsaTotal || 0), 0);
    return {
      totalCompanies: companies.length,
      totalQuestions: totalAptitude + totalDsa,
      totalDsa,
      totalAptitude
    };
  }, [companies]);

  // Only display categories & filter options supported by actual dataset
  const availableCategories = useMemo(() => {
    const present = new Set(companies.map((c) => c.category));
    return COMPANY_CATEGORIES.filter((cat) => present.has(cat));
  }, [companies]);

  const availableRoles = useMemo(() => {
    const roles = new Set(companies.map((c) => c.role).filter(Boolean));
    return Array.from(roles).sort();
  }, [companies]);

  const availableAssessments = useMemo(() => {
    const types = new Set(companies.map((c) => c.assessmentType).filter(Boolean));
    return Array.from(types).sort();
  }, [companies]);

  // Apply Search, Filters & Sorting
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = companies.filter((c) => {
      if (q) {
        const matchesSearch =
          c.name.toLowerCase().includes(q) ||
          (c.role && c.role.toLowerCase().includes(q)) ||
          (c.testPattern && c.testPattern.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      if (selectedCategory === 'bookmarked') {
        if (!bookmarkedSet.has(c.name)) return false;
      } else if (selectedCategory !== 'all') {
        if (c.category !== selectedCategory) return false;
      }

      if (difficultyFilter !== 'all' && c.hiringDifficulty !== difficultyFilter) {
        return false;
      }

      if (roleFilter !== 'all' && c.role !== roleFilter) {
        return false;
      }

      if (assessmentFilter !== 'all' && c.assessmentType !== assessmentFilter) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'progress_desc':
          return b.combinedProgress - a.combinedProgress;
        case 'questions_desc':
        default:
          return b.combinedTotal - a.combinedTotal;
      }
    });
  }, [
    companies,
    searchQuery,
    selectedCategory,
    difficultyFilter,
    roleFilter,
    assessmentFilter,
    sortBy,
    bookmarkedSet
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    difficultyFilter !== 'all' ||
    roleFilter !== 'all' ||
    assessmentFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setDifficultyFilter('all');
    setRoleFilter('all');
    setAssessmentFilter('all');
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] text-[#262626] font-sans">
      <Sidebar activeRoute="company-prep" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header defaultCollapsed />

        <BlurDrop as="main" className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
          {selectedCompany ? (
            /* COMPANY DETAILS VIEW */
            <CompanyDetails
              company={selectedCompany}
              availableCompanies={companies.map((c) => c.name)}
              isBookmarked={bookmarkedSet.has(selectedCompany.name)}
              onToggleBookmark={handleToggleBookmark}
              onBack={handleBackToAll}
              onStartMockOA={handleStartCompanyMock}
              userId={user?.id}
            />
          ) : (
            /* COMPANY PREPARATION HUB VIEW */
            <>
              {/* SECTION A: PAGE HEADER & COMPACT STATS */}
              <CompanyHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                stats={stats}
              />

              {/* SECTION B: FEATURED COMPANIES */}
              {!searchQuery && selectedCategory === 'all' && (
                <FeaturedCompanies
                  companies={companies}
                  onSelectCompany={handleSelectCompany}
                />
              )}

              {/* SECTION C & D: DIRECTORY CATEGORIES, FILTERS & LISTING */}
              <section className="space-y-4">
                <CompanyFilters
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  availableCategories={availableCategories}
                  bookmarkedCount={bookmarks.length}
                  difficultyFilter={difficultyFilter}
                  onDifficultyChange={setDifficultyFilter}
                  roleFilter={roleFilter}
                  onRoleChange={setRoleFilter}
                  availableRoles={availableRoles}
                  assessmentFilter={assessmentFilter}
                  onAssessmentChange={setAssessmentFilter}
                  availableAssessments={availableAssessments}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  resultCount={filteredCompanies.length}
                  onResetFilters={handleResetFilters}
                  hasActiveFilters={hasActiveFilters}
                />

                {loadError && !loading && (
                  <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/25 text-xs text-[#DC2626] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loadError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={fetchCompanyTracks}
                      className="inline-flex items-center gap-1 font-semibold underline cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retry
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div
                        key={n}
                        className="h-64 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] p-5 animate-pulse space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F1F3F5]" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-[#F1F3F5] rounded w-1/2" />
                            <div className="h-3 bg-[#F1F3F5] rounded w-1/3" />
                          </div>
                        </div>
                        <div className="h-14 bg-[#F7F8FA] rounded-lg" />
                        <div className="h-8 bg-[#F1F3F5] rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : filteredCompanies.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] space-y-3 shadow-2xs">
                    <Building2 className="w-10 h-10 text-[#94A3B8] mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#262626]">
                        No companies match your filters
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Try clearing a filter or searching for another company like Google, Amazon, TCS, or Deloitte.
                      </p>
                    </div>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFA116] hover:bg-[#F7931E] text-white text-xs font-semibold transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset All Filters</span>
                      </button>
                    )}
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCompanies.map((company) => (
                      <CompanyCard
                        key={company.id || company.name}
                        company={company}
                        isBookmarked={bookmarkedSet.has(company.name)}
                        onToggleBookmark={handleToggleBookmark}
                        onExplore={handleSelectCompany}
                      />
                    ))}
                    <UpcomingCompaniesCard
                      itemCount={filteredCompanies.length}
                      upcomingCompanies={upcomingCompanies}
                    />
                  </div>
                ) : (
                  <CompanyTable
                    companies={filteredCompanies}
                    bookmarkedSet={bookmarkedSet}
                    onToggleBookmark={handleToggleBookmark}
                    onExplore={handleSelectCompany}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />
                )}
              </section>
            </>
          )}
        </BlurDrop>
      </div>
    </div>
  );
}
