import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../services/api';
import AutocompleteInput from '../components/AutocompleteInput';
import { ListingCardSkeleton } from '../components/SkeletonLoader';
import { Search, MapPin, DollarSign, Calendar, SlidersHorizontal, Bookmark, RotateCcw, AlertCircle, Building2, X, Tag } from 'lucide-react';

const CATEGORIES = [
  'Engineering & Technology',
  'Business & Management',
  'Design & Creative',
  'Marketing & Sales',
  'Data & Analytics',
  'Finance & Commerce',
  'Content & Writing',
  'Human Resources',
  'Operations',
  'Other'
];

const BrowseListings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query Parameters
  const queryParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || '';
  const categoryParam = searchParams.get('category') || '';
  const workModeParam = searchParams.get('workMode') || '';
  const locationParam = searchParams.get('location') || searchParams.get('city') || '';
  const stipendParam = searchParams.get('stipendMin') || '';
  const skillsParam = searchParams.get('skills') || '';
  const pageParam = parseInt(searchParams.get('page')) || 1;
  const sortParam = searchParams.get('sort') || 'newest';

  // Input states
  const [keyword, setKeyword] = useState(queryParam);
  const [locFilter, setLocFilter] = useState(locationParam);
  const [typeFilter, setTypeFilter] = useState(typeParam);
  const [categoryFilter, setCategoryFilter] = useState(categoryParam);
  const [modeFilter, setModeFilter] = useState(workModeParam);
  const [stipendFilter, setStipendFilter] = useState(stipendParam);
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState(
    skillsParam ? skillsParam.split(',').map(s => s.trim()).filter(Boolean) : []
  );

  const [listings, setListings] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Saved & Applied state for candidate
  const [savedIds, setSavedIds] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);

  const studentId = user?.role === 'student' ? (user._id || user.userId || user.email) : null;

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentState = async () => {
      try {
        const [profileRes, appsRes] = await Promise.all([
          api.get('/students/me'),
          api.get('/students/me/applications')
        ]);
        
        if (profileRes.data.profile) {
          setSavedIds(profileRes.data.profile.savedListings || []);
        }
        if (appsRes.data.applications) {
          setAppliedIds(appsRes.data.applications.map(app => String(app.listingId._id || app.listingId)));
        }
      } catch (err) {
        console.error('Error loading candidate state:', err);
      }
    };

    fetchStudentState();
  }, [studentId]);

  // Sync state with URL changes (with guards to avoid redundant re-renders)
  useEffect(() => {
    if (keyword !== queryParam) setKeyword(queryParam);
    if (locFilter !== locationParam) setLocFilter(locationParam);
    if (typeFilter !== typeParam) setTypeFilter(typeParam);
    if (categoryFilter !== categoryParam) setCategoryFilter(categoryParam);
    if (modeFilter !== workModeParam) setModeFilter(workModeParam);
    if (stipendFilter !== stipendParam) setStipendFilter(stipendParam);
    
    const parsedSkills = skillsParam ? skillsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (parsedSkills.join(',') !== selectedSkills.join(',')) {
      setSelectedSkills(parsedSkills);
    }
  }, [queryParam, locationParam, typeParam, categoryParam, workModeParam, stipendParam, skillsParam]);

  // Fetch listings matching URL parameters
  const fetchListings = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = {};
      if (queryParam && queryParam.trim()) params.q = queryParam.trim();
      if (typeParam && typeParam.trim()) params.type = typeParam.trim();
      if (categoryParam && categoryParam.trim() && categoryParam.trim().toLowerCase() !== 'all') {
        params.category = categoryParam.trim();
      }
      if (workModeParam && workModeParam.trim() && workModeParam.trim().toLowerCase() !== 'all') {
        params.workMode = workModeParam.trim();
      }
      if (locationParam && locationParam.trim()) params.location = locationParam.trim();
      if (stipendParam && stipendParam.trim()) params.stipendMin = stipendParam.trim();
      if (skillsParam && skillsParam.trim()) params.skills = skillsParam.trim();
      params.page = pageParam;
      params.sort = sortParam;

      const res = await api.get('/listings', { params });
      setListings(res.data.listings || []);
      setCategoryCounts(res.data.categoryCounts || {});
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setFetchError(err.response?.data?.message || err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [queryParam, locationParam, typeParam, categoryParam, workModeParam, stipendParam, skillsParam, pageParam, sortParam]);

  // Helper to update URL params and trigger query
  const updateQueryParams = (newValues) => {
    const current = Object.fromEntries(searchParams);
    const updated = { ...current, ...newValues, page: 1 };
    
    // Clean up empty params
    Object.keys(updated).forEach(key => {
      if (!updated[key] && updated[key] !== 0) delete updated[key];
    });

    setSearchParams(updated);
  };

  const handleTypeChange = (newType) => {
    setTypeFilter(newType);
    updateQueryParams({ type: newType });
  };

  const handleCategoryChange = (newCat) => {
    setCategoryFilter(newCat);
    updateQueryParams({ category: newCat });
  };

  const handleModeChange = (newMode) => {
    setModeFilter(newMode);
    updateQueryParams({ workMode: newMode });
  };

  const handleCitySelect = (selectedCity) => {
    setLocFilter(selectedCity);
    updateQueryParams({ location: selectedCity });
  };

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || '').trim();
    if (!trimmed) return;
    
    if (!selectedSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...selectedSkills, trimmed];
      setSelectedSkills(updated);
      updateQueryParams({ skills: updated.join(',') });
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = selectedSkills.filter(s => s !== skillToRemove);
    setSelectedSkills(updated);
    updateQueryParams({ skills: updated.join(',') });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    let currentSkills = [...selectedSkills];
    if (skillInput.trim()) {
      const trimmed = skillInput.trim();
      if (!currentSkills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
        currentSkills.push(trimmed);
        setSelectedSkills(currentSkills);
      }
      setSkillInput('');
    }
    updateQueryParams({
      q: keyword,
      location: locFilter,
      category: categoryFilter,
      skills: currentSkills.join(','),
      stipendMin: stipendFilter
    });
  };

  const handleReset = () => {
    setKeyword('');
    setLocFilter('');
    setTypeFilter('');
    setCategoryFilter('');
    setModeFilter('');
    setStipendFilter('');
    setSkillInput('');
    setSelectedSkills([]);
    setSearchParams({});
  };

  const handleSortChange = (newSort) => {
    const current = Object.fromEntries(searchParams);
    current.sort = newSort;
    current.page = 1;
    setSearchParams(current);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const current = Object.fromEntries(searchParams);
    current.page = newPage;
    setSearchParams(current);
  };

  const handleBookmark = async (e, listingId) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    if (user.role !== 'student') return;

    try {
      const res = await api.post(`/students/me/saved-listings/${listingId}`);
      if (res.data.saved) {
        setSavedIds(prev => [...prev, String(listingId)]);
      } else {
        setSavedIds(prev => prev.filter(id => id !== String(listingId)));
      }
    } catch (err) {
      console.error('Error bookmarking listing:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Filter Sidebar */}
        <aside className="w-full lg:w-1/4 shrink-0">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sticky top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="font-sans text-base font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                <SlidersHorizontal className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
                {t('browseListings.filters')}
              </span>
              <button
                onClick={handleReset}
                className="btn-animate text-xs font-semibold text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t('browseListings.reset')}
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-5 space-y-5">
              
              {/* Type Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">{t('browseListings.categoryType')}</label>
                <div className="mt-1.5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  <button
                    type="button"
                    onClick={() => handleTypeChange(typeFilter === 'internship' ? '' : 'internship')}
                    className={`rounded-lg py-2 text-xs font-bold transition-all ${
                      typeFilter === 'internship' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {t('browseListings.internship')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange(typeFilter === 'job' ? '' : 'job')}
                    className={`rounded-lg py-2 text-xs font-bold transition-all ${
                      typeFilter === 'job' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {t('browseListings.fullTime')}
                  </button>
                </div>
              </div>

              {/* Category / Field Filter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Field / Category
                  </label>
                  {categoryFilter && (
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('')}
                      className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      All
                    </button>
                  )}
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-sky-500 focus:outline-none cursor-pointer"
                >
                  <option value="">
                    All Categories ({Object.values(categoryCounts).reduce((s, v) => s + (Number(v) || 0), 0) || totalCount})
                  </option>
                  {CATEGORIES.map(cat => {
                    const count = categoryCounts[cat];
                    return (
                      <option key={cat} value={cat}>
                        {cat} {count !== undefined ? `(${count})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Work Mode Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">{t('browseListings.workMode')}</label>
                <select
                  value={modeFilter}
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="">{t('browseListings.allModes')}</option>
                  <option value="remote">{t('browseListings.remote')}</option>
                  <option value="hybrid">{t('browseListings.hybrid')}</option>
                  <option value="onsite">{t('browseListings.onsite')}</option>
                </select>
              </div>

              {/* City Autocomplete */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">{t('browseListings.cityLocation')}</label>
                <AutocompleteInput
                  value={locFilter}
                  onChange={setLocFilter}
                  onSelect={handleCitySelect}
                  type="city"
                  placeholder="e.g. Bangalore, Hyderabad, Pune..."
                  icon={MapPin}
                  className="dark:bg-slate-800/80 dark:border-slate-700 dark:text-white"
                />
              </div>

              {/* Skills Multi-Select Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {t('browseListings.skillsRequired')}
                  </label>
                  {selectedSkills.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSkills([]);
                        updateQueryParams({ skills: '' });
                      }}
                      className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      Clear ({selectedSkills.length})
                    </button>
                  )}
                </div>

                {/* Selected Skill Chips */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 px-2 py-1 text-xs font-bold text-sky-700 dark:text-sky-300 transition-all shadow-xs"
                      >
                        <Tag className="h-3 w-3 opacity-70" />
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="rounded p-0.5 text-sky-500 hover:text-sky-800 dark:hover:text-white hover:bg-sky-200/50 dark:hover:bg-sky-800 cursor-pointer"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <AutocompleteInput
                  value={skillInput}
                  onChange={setSkillInput}
                  onSelect={handleAddSkill}
                  type="skill"
                  placeholder="Type skill & press Enter..."
                  className="dark:bg-slate-800/80 dark:border-slate-700 dark:text-white"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Select from suggestions or press Enter
                </p>
              </div>

              {/* Stipend Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">{t('browseListings.minStipend')}</label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={stipendFilter}
                    onChange={(e) => setStipendFilter(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-animate w-full rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition-colors cursor-pointer"
              >
                {t('browseListings.applyFilters')}
              </button>
            </form>
          </div>
        </aside>

        {/* Right Listings Grid */}
        <main className="flex-1 text-left">
          
          {/* Top Search + Sort Control */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm mb-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
              <AutocompleteInput
                value={keyword}
                onChange={setKeyword}
                onSelect={(val) => {
                  setKeyword(val);
                  updateQueryParams({ q: val });
                }}
                type="search"
                placeholder={t('browseListings.searchPlaceholder')}
                icon={Search}
                className="dark:bg-slate-800/80 dark:border-slate-700 dark:text-white"
              />
            </form>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="shrink-0">{t('browseListings.sortBy')}</span>
              <select
                value={sortParam === 'stipend' ? 'stipend_high' : sortParam}
                onChange={(e) => handleSortChange(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 py-1.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 focus:border-sky-500 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="stipend_high">Stipend: High to Low</option>
                <option value="stipend_low">Stipend: Low to High</option>
                <option value="trending">Trending (Most Applicants)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4 px-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
              {t('browseListings.showingCount', { count: listings.length, total: totalCount })}
            </p>

            {keyword && (
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                Keyword: "{keyword}"
                <button onClick={() => { setKeyword(''); updateQueryParams({ q: '' }); }} className="cursor-pointer hover:text-sky-900 dark:hover:text-white ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {categoryFilter && (
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                Field: {categoryFilter}
                <button onClick={() => handleCategoryChange('')} className="cursor-pointer hover:text-sky-900 dark:hover:text-white ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {locFilter && (
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                Location: {locFilter}
                <button onClick={() => { setLocFilter(''); updateQueryParams({ location: '' }); }} className="cursor-pointer hover:text-sky-900 dark:hover:text-white ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {typeFilter && (
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                Type: {typeFilter === 'internship' ? 'Internship' : 'Full-time'}
                <button onClick={() => handleTypeChange('')} className="cursor-pointer hover:text-sky-900 dark:hover:text-white ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {modeFilter && (
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                Mode: {modeFilter}
                <button onClick={() => handleModeChange('')} className="cursor-pointer hover:text-sky-900 dark:hover:text-white ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {stipendFilter && (
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                Min Stipend: ₹{Number(stipendFilter).toLocaleString()}
                <button onClick={() => { setStipendFilter(''); updateQueryParams({ stipendMin: '' }); }} className="cursor-pointer hover:text-sky-900 dark:hover:text-white ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedSkills.map((skill) => (
              <span key={skill} className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                Skill: {skill}
                <button onClick={() => handleRemoveSkill(skill)} className="cursor-pointer hover:text-sky-900 dark:hover:text-white ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {(keyword || categoryFilter || locFilter || typeFilter || modeFilter || stipendFilter || selectedSkills.length > 0) && (
              <button
                onClick={handleReset}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors ml-auto cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Listings Loading / Error / Grid */}
          {loading ? (
            <ListingCardSkeleton count={6} />
          ) : fetchError ? (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 text-center text-red-600 dark:text-red-400">
              <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-2" />
              <p className="text-sm font-bold">{fetchError}</p>
              <button
                onClick={fetchListings}
                className="btn-animate mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : listings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-14 px-6 text-center text-slate-400">
              <AlertCircle className="mx-auto h-12 w-12 text-slate-350 dark:text-slate-700" />
              <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">
                {t('browseListings.noResults')}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                No opportunities matched all selected criteria simultaneously. Try relaxing your filters or removing specific constraints:
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                {locFilter && (
                  <button
                    onClick={() => { setLocFilter(''); updateQueryParams({ location: '' }); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                  >
                    <span>Remove Location ({locFilter})</span>
                    <X className="h-3 w-3" />
                  </button>
                )}
                {categoryFilter && (
                  <button
                    onClick={() => handleCategoryChange('')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                  >
                    <span>Remove Category ({categoryFilter})</span>
                    <X className="h-3 w-3" />
                  </button>
                )}
                {stipendFilter && (
                  <button
                    onClick={() => { setStipendFilter(''); updateQueryParams({ stipendMin: '' }); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                  >
                    <span>Remove Min Stipend</span>
                    <X className="h-3 w-3" />
                  </button>
                )}
                {selectedSkills.length > 0 && (
                  <button
                    onClick={() => { setSelectedSkills([]); updateQueryParams({ skills: '' }); }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1"
                  >
                    <span>Clear Selected Skills ({selectedSkills.length})</span>
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <button
                onClick={handleReset}
                className="btn-animate mt-6 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-500 transition-colors cursor-pointer shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t('browseListings.resetFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listings.map((listing) => {
                const isBookmarked = savedIds.includes(String(listing._id));
                const isApplied = appliedIds.includes(String(listing._id));
                
                return (
                  <div
                    key={listing._id}
                    onClick={() => navigate(`/listings/${listing._id}`)}
                    className="card-hover group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Logo + Type + Bookmark */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <img
                            src={getMediaUrl(listing.companyId?.logoUrl) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150'}
                            alt={listing.companyId?.companyName}
                            className="h-10 w-10 rounded-lg object-contain ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-950 p-0.5"
                          />
                          <div>
                            <h3 className="font-sans text-sm font-bold text-slate-800 dark:text-white line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              {listing.title}
                            </h3>
                            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {listing.companyId?.companyName || 'Verified Recruiter'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isApplied && (
                            <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[9px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide border border-blue-100 dark:border-blue-800">
                              {t('browseListings.applied')}
                            </span>
                          )}
                          {user?.role === 'student' && (
                            <button
                              onClick={(e) => handleBookmark(e, listing._id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                            >
                              <Bookmark
                                className={`h-4.5 w-4.5 ${
                                  isBookmarked ? 'fill-sky-600 text-sky-600 dark:fill-sky-400 dark:text-sky-400' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Category & Mode Badge Bar */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {listing.category && (
                          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {listing.category}
                          </span>
                        )}
                        <span className="rounded-md bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                          {listing.type}
                        </span>
                      </div>

                      {/* Smart Eligibility Badge (Student Only) */}
                      {listing.matchLabel && (
                        <div
                          title={listing.matchNote || undefined}
                          className={`mt-2.5 flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs border ${
                            listing.matchLabel === 'High Eligibility'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                              : listing.matchLabel === 'Low Eligibility'
                              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-[11px]">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                listing.matchLabel === 'High Eligibility'
                                  ? 'bg-emerald-500 animate-pulse'
                                  : listing.matchLabel === 'Low Eligibility'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span>{listing.matchLabel} ({listing.matchPercentage}%)</span>
                          </div>
                          <span className="text-[10px] font-medium opacity-85 truncate max-w-[130px]">
                            {listing.matchLabel === 'High Eligibility'
                              ? 'Strong Fit'
                              : listing.matchLabel === 'Low Eligibility'
                              ? 'Partial Match'
                              : 'Skills Missing'}
                          </span>
                        </div>
                      )}

                      {/* Info grid */}
                      <div className="mt-4 grid grid-cols-2 gap-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span className="capitalize truncate">{listing.workMode} ({listing.location})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {listing.stipendMax > 0 ? `₹${listing.stipendMin.toLocaleString()}-${listing.stipendMax.toLocaleString()}/mo` : t('browseListings.unpaid')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{listing.durationMonths} {t('browseListings.months')}</span>
                        </div>
                      </div>

                      {/* Skills Tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {listing.skillsRequired.slice(0, 4).map((skill, idx) => {
                          const isMatched = selectedSkills.some(s => s.toLowerCase() === (skill || '').toLowerCase());
                          return (
                            <span
                              key={idx}
                              className={`rounded px-2 py-0.5 text-[9px] font-semibold border transition-all ${
                                isMatched
                                  ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700 font-bold shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-750'
                              }`}
                            >
                              {skill} {isMatched && '✓'}
                            </span>
                          );
                        })}
                        {listing.skillsRequired.length > 4 && (
                          <span className="text-[9px] font-semibold text-slate-400 self-center">
                            {t('browseListings.moreSkills', { count: listing.skillsRequired.length - 4 })}
                          </span>
                        )}
                      </div>

                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-[10px] text-slate-400 font-semibold">
                      <span>
                        {t('browseListings.deadline', { date: new Date(listing.applicationDeadline).toLocaleDateString([], { month: 'short', day: 'numeric' }) })}
                      </span>
                      <span className="font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                        {t('browseListings.details')}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-4">
              <button
                disabled={pageParam === 1}
                onClick={() => handlePageChange(pageParam - 1)}
                className="btn-animate rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                {t('browseListings.previous')}
              </button>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t('browseListings.pageOf', { current: pageParam, total: totalPages })}
              </span>
              <button
                disabled={pageParam === totalPages}
                onClick={() => handlePageChange(pageParam + 1)}
                className="btn-animate rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                {t('browseListings.next')}
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default BrowseListings;
