import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Search, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FilterSidebar from '../components/listings/FilterSidebar';
import ListingCard from '../components/listings/ListingCard';

export default function BrowseListings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ---------- 1. Filters: sab kuch URL se aata hai ----------
  // Example URL: /browse?type=job&workMode=remote&page=2
  // URL hi "single source of truth" hai, isliye page refresh/share karne par bhi filters bache rehte hain.
  const filters = {
    q: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    workMode: searchParams.get('workMode') || '',
    stipendMin: searchParams.get('stipendMin') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  };

  // Filter badalna: purane params me naye changes mila do, aur page 1 par wapas aa jao
  const updateFilters = (changes) => {
    const next = { ...Object.fromEntries(searchParams), ...changes, page: '1' };
    Object.keys(next).forEach((key) => {
      if (!next[key]) delete next[key]; // khali values URL se hata do
    });
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const goToPage = (page) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------- 2. Backend se listings laana ----------
  const [listings, setListings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const queryString = searchParams.toString(); // URL badle to dobara fetch ho

  useEffect(() => {
    let cancelled = false; // purana request late aaye to uska result ignore karo
    setLoading(true);
    setError('');

    api
      .get('/listings', { params: Object.fromEntries(searchParams) })
      .then((res) => {
        if (cancelled) return;
        setListings(res.data.listings || []);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || t('browseListings.loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryString]);

  // ---------- 3. Student ke saved aur applied listings ----------
  const [savedIds, setSavedIds] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const isStudent = user?.role === 'student';

  useEffect(() => {
    if (!isStudent) return;
    Promise.all([api.get('/students/me'), api.get('/students/me/applications')])
      .then(([profileRes, appsRes]) => {
        const saved = profileRes.data.profile?.savedListings || [];
        setSavedIds(saved.map((id) => String(id._id || id)));
        const applied = appsRes.data.applications || [];
        setAppliedIds(applied.map((app) => String(app.listingId._id || app.listingId)));
      })
      .catch((err) => console.error('Student data load nahi hua:', err));
  }, [isStudent]);

  const handleToggleSave = async (e, listingId) => {
    e.stopPropagation(); // card ka click (details page) na chale
    if (!user) return navigate('/login');
    if (!isStudent) return;

    try {
      const res = await api.post(`/students/me/saved-listings/${listingId}`);
      const id = String(listingId);
      setSavedIds((prev) => (res.data.saved ? [...prev, id] : prev.filter((x) => x !== id)));
    } catch (err) {
      console.error('Save nahi hua:', err);
    }
  };

  // ---------- 4. Top search box ----------
  const [keyword, setKeyword] = useState(filters.q);
  useEffect(() => setKeyword(filters.q), [filters.q]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ q: keyword.trim() });
  };

  // Mobile par filters ko chhupa/dikha sakte hain
  const [showFilters, setShowFilters] = useState(false);

  const heading =
    filters.type === 'job'
      ? t('browseListings.titleJobs')
      : filters.type === 'internship'
      ? t('browseListings.titleInternships')
      : t('browseListings.titleAll');

  // ---------- 5. Screen ----------
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {loading ? t('common.loading') : `${totalCount} ${heading}`}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{t('browseListings.subtitle')}</p>
      </div>

      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        {/* Left: filters */}
        <aside className="shrink-0 lg:w-72">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showFilters ? t('browseListings.hideFilters') : t('browseListings.showFilters')}
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} lg:sticky lg:top-24 lg:block`}>
            <FilterSidebar filters={filters} onChange={updateFilters} onClear={clearFilters} />
          </div>
        </aside>

        {/* Right: search + sort + cards */}
        <section className="min-w-0 flex-1">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('browseListings.searchPlaceholder')}
                className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-24 text-sm"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                {t('browseListings.search')}
              </button>
            </form>

            <select
              value={filters.sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="newest">{t('browseListings.newest')}</option>
              <option value="stipend_high">{t('browseListings.highestStipend')}</option>
              <option value="trending">{t('browseListings.mostApplied')}</option>
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 animate-pulse rounded-lg border border-gray-200 bg-white" />
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && listings.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
              <p className="font-medium text-gray-800">{t('browseListings.noResults')}</p>
              <p className="mt-1 text-sm text-gray-500">{t('browseListings.noResultsHint')}</p>
              <button onClick={clearFilters} className="mt-4 text-sm font-medium text-primary hover:underline">
                {t('browseListings.resetFilters')}
              </button>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && listings.length > 0 && (
            <div className="space-y-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  isSaved={savedIds.includes(String(listing._id))}
                  isApplied={appliedIds.includes(String(listing._id))}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 text-sm">
              <button
                onClick={() => goToPage(filters.page - 1)}
                disabled={filters.page <= 1}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                {t('browseListings.previous')}
              </button>
              <span className="text-gray-600">
                {t('browseListings.pageOf', { current: filters.page, total: totalPages })}
              </span>
              <button
                onClick={() => goToPage(filters.page + 1)}
                disabled={filters.page >= totalPages}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                {t('browseListings.next')}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
