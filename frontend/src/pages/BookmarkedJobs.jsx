import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../services/api';
import { ListingCardSkeleton } from '../components/SkeletonLoader';
import {
  Bookmark, Building2, MapPin, DollarSign, Calendar, AlertCircle,
  ArrowRight, Trash2, ArrowLeft, Briefcase, ExternalLink, Sparkles, Tag
} from 'lucide-react';

const BookmarkedJobs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchSavedListings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/students/me/saved-listings');
        setSavedListings(res.data.savedListings || []);
      } catch (err) {
        console.error('Error fetching bookmarked opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedListings();
  }, []);

  const handleRemoveBookmark = async (e, listingId) => {
    e.stopPropagation();
    setRemovingId(listingId);
    try {
      await api.post(`/students/me/saved-listings/${listingId}`);
      setSavedListings((prev) => prev.filter((item) => String(item._id) !== String(listingId)));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to="/student-dashboard"
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('savedJobs.backToDashboard') || 'Back to Dashboard'}
            </Link>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 shadow-xs">
              <Bookmark className="h-6 w-6 fill-purple-600 dark:fill-purple-400" />
            </div>
            {t('savedJobs.title') || 'Bookmarked Opportunities'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('savedJobs.subtitle') || 'Quickly access, review, and apply to all the opportunities you have saved.'}
          </p>
        </div>

        <Link
          to="/browse"
          className="btn-animate shrink-0 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-sky-500 transition cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t('savedJobs.exploreMore') || 'Explore More Roles'}
        </Link>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="mt-8 space-y-4">
          <ListingCardSkeleton />
          <ListingCardSkeleton />
          <ListingCardSkeleton />
        </div>
      ) : savedListings.length === 0 ? (
        /* Empty State */
        <div className="mt-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 px-6 text-center shadow-xs">
          <div className="mx-auto h-16 w-16 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-400 dark:text-purple-500 mb-4">
            <Bookmark className="h-8 w-8" />
          </div>
          <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white">
            {t('savedJobs.noSavedTitle') || 'No Bookmarked Opportunities Yet'}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {t('savedJobs.noSavedDesc') || "When browsing internships and jobs, click the bookmark icon on any card to save roles you want to apply to later."}
          </p>
          <Link
            to="/browse"
            className="btn-animate mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-xs font-extrabold text-white shadow-md hover:bg-sky-500 cursor-pointer"
          >
            {t('savedJobs.browseBtn') || 'Browse 250+ Opportunities'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Bookmarked Cards List */
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 px-1">
            <span>{savedListings.length} {savedListings.length === 1 ? 'Opportunity Saved' : 'Opportunities Saved'}</span>
          </div>

          {savedListings.map((listing) => {
            const company = listing.companyId || {};
            const companyName = company.companyName || listing.companyName || 'Company';
            const companyLogo = getMediaUrl(company.logoUrl || company.companyLogo);

            return (
              <div
                key={listing._id}
                onClick={() => navigate(`/listings/${listing._id}`)}
                className="card-hover group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5 transition-all"
              >
                {/* Left: Company & Job Info */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt={companyName}
                      className="h-14 w-14 rounded-2xl object-contain ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-950 p-1.5 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                        listing.type === 'internship'
                          ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {listing.type}
                      </span>
                      {listing.category && (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {listing.category}
                        </span>
                      )}
                      {listing.workMode && (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 capitalize">
                          {listing.workMode}
                        </span>
                      )}
                    </div>

                    <h2 className="font-sans text-base sm:text-lg font-extrabold text-slate-850 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {listing.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {companyName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {listing.location || 'Flexible'}
                      </span>
                      {listing.stipend !== undefined && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <DollarSign className="h-3.5 w-3.5" />
                          {Number(listing.stipend) > 0 ? `₹${Number(listing.stipend).toLocaleString('en-IN')}/mo` : 'Unpaid'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={(e) => handleRemoveBookmark(e, listing._id)}
                    disabled={removingId === listing._id}
                    title="Remove from saved bookmarks"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/listings/${listing._id}`)}
                    className="btn-animate inline-flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default BookmarkedJobs;
