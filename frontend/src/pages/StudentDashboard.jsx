import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../services/api';
import ExploreOpportunities from '../components/ExploreOpportunities';
import { FileText, Bookmark, CheckCircle, Search, ArrowRight, MapPin, DollarSign, Building2, UserCheck, AlertCircle, Crown } from 'lucide-react';

const StudentDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [profileRes, appsRes, listingsRes] = await Promise.all([
          api.get('/students/me'),
          api.get('/students/me/applications'),
          api.get('/listings?limit=4')
        ]);

        setProfile(profileRes.data.profile);
        setApplications(appsRes.data.applications || []);
        setRecommended(listingsRes.data.listings || []);
      } catch (err) {
        console.error('Error loading candidate dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const countApplied = applications.filter(a => !a.status || a.status === 'applied' || a.status === 'pending').length;
  const countShortlisted = applications.filter(a => a.status === 'shortlisted').length;
  const countHired = applications.filter(a => a.status === 'hired').length;
  const countSaved = profile?.savedListings?.length || 0;

  // Profile Completeness calculation (Accurately reflects filled-in candidate profile fields up to 100%)
  let completeness = 0;
  if (user?.name || user?.email) completeness += 10;
  if (profile?.college && profile.college !== 'N/A') completeness += 15;
  if (profile?.degree && profile.degree !== 'N/A') completeness += 15;
  if (profile?.graduationYear) completeness += 15;
  if (profile?.location && profile.location !== 'N/A') completeness += 15;
  if (profile?.skills && profile.skills.length > 0) completeness += 15;
  if (profile?.resumeUrl) completeness += 15;
  if (completeness > 100) completeness = 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 fade-in text-left">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-600 dark:from-sky-700 dark:via-sky-600 dark:to-cyan-700 p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs mb-2">
              <UserCheck className="h-3.5 w-3.5" />
              {t('studentDashboard.portalBadge')}
            </span>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold">{t('dashboard.welcome')}, {user?.name}!</h1>
            <p className="mt-1 text-xs sm:text-sm text-sky-100 max-w-xl">
              {t('studentDashboard.bannerSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/resume-builder"
              className="btn-animate shrink-0 inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs px-5 py-3 text-xs font-extrabold shadow-md cursor-pointer border border-white/30"
            >
              <Crown className="h-4 w-4 text-amber-300" />
              {t('studentDashboard.resumeBuilderBtn')}
            </Link>
            <Link
              to="/subscription"
              className="btn-animate shrink-0 inline-flex items-center gap-2 rounded-xl bg-amber-400 text-slate-950 px-5 py-3 text-xs font-extrabold shadow-md hover:bg-amber-300 cursor-pointer"
            >
              <Crown className="h-4 w-4" />
              {t('studentDashboard.subscriptionBtn')}
            </Link>
            <Link
              to="/browse"
              className="btn-animate shrink-0 inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 px-5 py-3 text-xs font-bold text-sky-600 dark:text-sky-400 shadow-md hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer border border-transparent dark:border-slate-800"
            >
              <Search className="h-4 w-4" />
              {t('studentDashboard.exploreBtn')}
            </Link>
          </div>
        </div>

        {/* Profile Completeness Bar */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-slate-700 dark:text-slate-300">{t('studentDashboard.profileCompleteness')}</span>
              <span className="text-sky-600 dark:text-sky-400">{completeness}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          {completeness < 100 && (
            <Link
              to="/profile"
              className="btn-animate shrink-0 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              {t('studentDashboard.completeProfile')}
            </Link>
          )}
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link
            to="/my-applications"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs card-hover group block cursor-pointer transition-all hover:border-sky-300 dark:hover:border-sky-600/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{t('studentDashboard.statApplied')}</span>
              <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-3">
              <p className="text-2xl font-extrabold text-slate-850 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{countApplied}</p>
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                View All →
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{t('studentDashboard.statAppliedSub')}</p>
          </Link>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('studentDashboard.statShortlisted')}</span>
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-850 dark:text-white">{countShortlisted}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{t('studentDashboard.statShortlistedSub')}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('studentDashboard.statHired')}</span>
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{countHired}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{t('studentDashboard.statHiredSub')}</p>
          </div>

          <Link
            to="/saved-jobs"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs card-hover group block cursor-pointer transition-all hover:border-purple-300 dark:hover:border-purple-600/60"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {t('studentDashboard.statBookmarks')}
              </span>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Bookmark className="h-5 w-5 fill-purple-600/20 dark:fill-purple-400/20" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-3">
              <p className="text-2xl font-extrabold text-slate-850 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {countSaved}
              </p>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                View All →
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
              {t('studentDashboard.statBookmarksSub')}
            </p>
          </Link>

        </div>

        {/* Recent Applications & Recommended Roles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Applications */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-sans text-base font-bold text-slate-850 dark:text-white">{t('studentDashboard.recentApplicationsHeading')}</h2>
              <Link to="/my-applications" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
                {t('studentDashboard.viewAll', { count: applications.length })}
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <AlertCircle className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                <p className="mt-3 text-xs font-semibold">{t('studentDashboard.noApplications')}</p>
                <Link to="/browse" className="mt-2 inline-block text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
                  {t('studentDashboard.browseOpenRoles')}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {applications.slice(0, 4).map((app) => (
                  <div key={app._id} className="py-4 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={getMediaUrl(app.listingId?.companyId?.logoUrl) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150'}
                        alt={app.listingId?.title}
                        className="h-10 w-10 rounded-lg object-contain border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 p-0.5"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {app.listingId?.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                          {app.listingId?.companyId?.companyName}
                        </p>
                      </div>
                    </div>

                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'hired' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' :
                      app.status === 'shortlisted' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800' :
                      app.status === 'rejected' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Roles */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
            <h2 className="font-sans text-base font-bold text-slate-850 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-800">
              {t('studentDashboard.recommendedHeading')}
            </h2>

            <div className="mt-4 space-y-4">
              {recommended.map((listing) => (
                <div
                  key={listing._id}
                  onClick={() => navigate(`/listings/${listing._id}`)}
                  className="p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-sky-50/30 dark:hover:bg-sky-950/30 hover:border-sky-200 dark:hover:border-sky-700 cursor-pointer transition-all text-left"
                >
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{listing.title}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {listing.companyId?.companyName}
                  </p>
                  <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{listing.location}</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      {listing.stipendMax > 0 ? `₹${listing.stipendMin.toLocaleString()}/mo` : t('studentDashboard.unpaid')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* SEO Explore Opportunities Directory Section */}
      <div className="mt-12">
        <ExploreOpportunities />
      </div>

    </div>
  );
};

export default StudentDashboard;
