import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../services/api';
import { DetailSkeleton } from '../components/SkeletonLoader';
import { MapPin, DollarSign, Calendar, Users, Bookmark, FileText, CheckCircle2, ChevronLeft, Building2, Globe, AlertTriangle, Briefcase, Award, X } from 'lucide-react';

const ListingDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const listRes = await api.get(`/listings/${id}`);
        setListing(listRes.data.listing);

        if (user?.role === 'student') {
          const profileRes = await api.get('/students/me');
          const studentProfile = profileRes.data.profile;
          setProfile(studentProfile);
          
          if (studentProfile) {
            const isSaved = (studentProfile.savedListings || []).some(
              (item) => String(item?._id || item) === String(id)
            );
            setIsBookmarked(isSaved);
          }

          const appsRes = await api.get('/students/me/applications');
          const alreadyApplied = (appsRes.data.applications || []).some(
            (app) => String(app.listingId?._id || app.listingId) === String(id)
          );
          setHasApplied(alreadyApplied);
        }
      } catch (err) {
        console.error('Error loading listing detail:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  // Lock body scroll when apply modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const handleBookmark = async () => {
    if (!user) return navigate('/login');
    if (user.role !== 'student') return;

    try {
      const res = await api.post(`/students/me/saved-listings/${id}`);
      const saved = Boolean(res.data.saved);
      setIsBookmarked(saved);
      setProfile((prev) => {
        if (!prev) return prev;
        const currentSaved = (prev.savedListings || []).map((item) => String(item?._id || item));
        const updated = saved
          ? [...currentSaved, id]
          : currentSaved.filter((savedId) => savedId !== String(id));
        return { ...prev, savedListings: updated };
      });
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await api.post('/applications', {
        listingId: id,
        coverNote
      });
      setHasApplied(true);
      setModalOpen(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t('listingDetail.failedSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center text-slate-500 dark:text-slate-400">
        <p className="text-lg font-medium">{t('listingDetail.notFound')}</p>
        <Link to="/browse" className="mt-4 inline-block text-sm text-sky-600 dark:text-sky-400 font-semibold hover:underline">
          {t('listingDetail.backToBrowsing')}
        </Link>
      </div>
    );
  }

  const isClosed = listing.status === 'closed';
  const hasResume = profile?.resumeUrl;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="btn-animate flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 mb-6 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('listingDetail.back')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Listing Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            
            {/* Header info */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <img
                  src={getMediaUrl(listing.companyId?.logoUrl) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150'}
                  alt={listing.companyId?.companyName}
                  className="h-14 w-14 rounded-xl object-contain ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-950 p-1 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      {listing.type}
                    </span>
                    {listing.category && (
                      <span className="rounded-full bg-sky-50 dark:bg-sky-950/60 px-3 py-1 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        {listing.category}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-2 font-sans text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white leading-tight break-words">
                    {listing.title}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-slate-400 dark:text-slate-500">
                    {listing.companyId?.companyName}
                  </p>

                  {/* Smart Eligibility Banner (Students only) */}
                  {listing.matchLabel && (
                    <div
                      className={`mt-3 inline-flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-xl p-3 text-xs border ${
                        listing.matchLabel === 'High Eligibility'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                          : listing.matchLabel === 'Low Eligibility'
                          ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                          : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            listing.matchLabel === 'High Eligibility'
                              ? 'bg-emerald-500 animate-pulse'
                              : listing.matchLabel === 'Low Eligibility'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span>{listing.matchLabel} ({listing.matchPercentage}% Match)</span>
                      </div>
                      <p className="text-[11px] opacity-90">
                        {listing.matchNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleBookmark}
                className={`btn-animate rounded-xl border p-2.5 transition cursor-pointer shrink-0 relative z-10 ${
                  isBookmarked
                    ? 'border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400'
                } ${user?.role === 'recruiter' ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={
                  !user
                    ? t('browse.signInToSave') || 'Sign in to save'
                    : user.role !== 'student'
                    ? t('browse.onlyStudentsSave') || 'Only candidates can bookmark opportunities'
                    : isBookmarked
                    ? 'Bookmarked'
                    : 'Bookmark'
                }
              >
                <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-sky-600 text-sky-600 dark:fill-sky-400 dark:text-sky-400' : ''}`} />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-y border-slate-100 dark:border-slate-800 py-5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t('listingDetail.workMode')}</span>
                <p className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 capitalize">
                  <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  {listing.workMode} ({listing.location})
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t('listingDetail.stipendSalary')}</span>
                <p className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                  <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  {listing.stipendMax > 0 ? `₹${listing.stipendMin.toLocaleString()} - ${listing.stipendMax.toLocaleString()}${t('listingDetail.perMonthShort')}` : t('listingDetail.unpaid')}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t('listingDetail.duration')}</span>
                <p className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  {t('listingDetail.monthsCount', { count: listing.durationMonths })}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{t('listingDetail.openings')}</span>
                <p className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                  <Users className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  {t('listingDetail.openingsCount', { count: listing.openings })}
                </p>
              </div>
            </div>

            {/* Detail Content */}
            <div className="mt-6 space-y-6">
              
              {/* Skills */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('listingDetail.requiredSkills')}</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.skillsRequired.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-sky-50 dark:bg-sky-950/60 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('listingDetail.aboutRole')}</h3>
                <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Responsibilities */}
              {listing.responsibilities?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('listingDetail.keyResponsibilities')}</h3>
                  <ul className="list-disc pl-5 text-sm text-slate-650 dark:text-slate-300 space-y-2 leading-relaxed">
                    {listing.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Application Deadline details */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-semibold text-slate-500 dark:text-slate-400 gap-2">
                <span>
                  {t('listingDetail.startDate', { date: new Date(listing.startDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) })}
                </span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  {t('listingDetail.applyDeadline', { date: new Date(listing.applicationDeadline).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) })}
                </span>
              </div>

            </div>

          </div>

          {/* Owner options if logged in as owner */}
          {user?.role === 'recruiter' && listing.companyId?.userId === user.userId && (
            <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50/20 dark:bg-sky-950/20 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t('listingDetail.recruiterControls')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('listingDetail.recruiterNotice', { count: listing.applicantCount || 0 })}</p>
              </div>
              <Link
                to={`/listing/${listing._id}/applicants`}
                className="btn-animate rounded-xl bg-sky-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm hover:bg-sky-500 transition-colors"
              >
                {t('listingDetail.trackApplicants', { count: listing.applicantCount || 0 })}
              </Link>
            </div>
          )}

        </div>

        {/* Right Sidebar: Company Card & Sticky Apply Controls */}
        <div className="space-y-6">
          
          {/* Company Profile Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('listingDetail.aboutCompany', { company: listing.companyId?.companyName })}</h3>
            <div className="flex items-center gap-3">
              <img
                src={getMediaUrl(listing.companyId?.logoUrl) || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150'}
                alt={listing.companyId?.companyName}
                className="h-12 w-12 rounded-xl object-contain ring-1 ring-slate-100 dark:ring-slate-800 bg-white dark:bg-slate-950 p-1"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  {listing.companyId?.companyName}
                </h4>
                <span className="text-[11px] text-slate-400 font-semibold capitalize">
                  {listing.companyId?.industry || 'Technology'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed line-clamp-4">
              {listing.companyId?.description || t('listingDetail.noDesc')}
            </p>

            <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                <a
                  href={listing.companyId?.website || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 dark:text-sky-400 hover:underline truncate"
                >
                  {listing.companyId?.website || t('listingDetail.visitWebsite')}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{t('listingDetail.hqLocation', { location: listing.companyId?.location || 'India' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{t('listingDetail.companySize', { size: listing.companyId?.companySize || '1000+' })}</span>
              </div>
            </div>
          </div>

          {/* Sticky Apply Button / Status Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md relative">
            
            {!user ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('listingDetail.signInPrompt')}
                </p>
                <Link
                  to="/login"
                  className="btn-animate block w-full text-center rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow hover:bg-sky-500 transition-colors"
                >
                  {t('listingDetail.signInToApply')}
                </Link>
              </div>
            ) : user.role === 'recruiter' ? (
              <p className="text-xs font-semibold text-slate-400 text-center">
                {t('listingDetail.recruiterCannotApply')}
              </p>
            ) : isClosed ? (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 text-center">
                <AlertTriangle className="mx-auto h-5 w-5 text-slate-400" />
                <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{t('listingDetail.opportunityClosed')}</p>
              </div>
            ) : hasApplied ? (
              <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 p-4 border border-emerald-100 dark:border-emerald-800 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{t('listingDetail.appSubmitted')}</p>
                  <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mt-0.5">{t('listingDetail.trackStatusDesc')}</p>
                </div>
                <Link
                  to="/my-applications"
                  className="btn-animate block w-full text-center rounded-lg border border-emerald-250 dark:border-emerald-800 bg-white dark:bg-slate-900 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('listingDetail.trackStatusBtn')}
                </Link>
              </div>
            ) : !hasResume ? (
              <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/40 p-4 border border-amber-100 dark:border-amber-800 text-left space-y-3">
                <div className="flex gap-2 items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">{t('listingDetail.resumeMissing')}</p>
                </div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-normal">
                  {t('listingDetail.resumeMissingDesc')}
                </p>
                <Link
                  to="/profile"
                  className="btn-animate block w-full text-center rounded-lg bg-amber-600 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-500 transition-colors"
                >
                  {t('listingDetail.uploadResumeBtn')}
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="btn-animate w-full rounded-xl bg-sky-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 hover:shadow-lg transition-colors cursor-pointer"
              >
                {t('listingDetail.applyInstantly')}
              </button>
            )}

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <span>{t('listingDetail.applicantsCount', { count: listing.applicantCount || 0 })}</span>
              <span>•</span>
              <span>{t('listingDetail.verifiedEmployer')}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Apply Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl fade-in text-left max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-sans text-lg font-bold text-slate-800 dark:text-white">{t('listingDetail.applyModalTitle', { company: listing.companyId?.companyName })}</h2>
                <p className="text-xs text-slate-400 mt-1">{t('listingDetail.applyModalSub')}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer -mt-1 -mr-1"
                title={t('common.cancel')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {errorMsg && (
              <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-950/40 p-2.5 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="mt-5 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">{t('listingDetail.candidateLabel')}</span>
                  <span className="text-slate-800 dark:text-white mt-0.5 block truncate font-bold">{user?.name}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase">{t('listingDetail.collegeLabel')}</span>
                  <span className="text-slate-800 dark:text-white mt-0.5 block truncate font-bold">{profile?.college}</span>
                </div>
              </div>

              <div className="bg-sky-50/50 dark:bg-sky-950/40 rounded-xl p-3.5 border border-sky-100/50 dark:border-sky-800 flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold block">{t('listingDetail.attachedPdf')}</span>
                  <a
                    href={getMediaUrl(profile?.resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-slate-700 dark:text-slate-300 font-medium hover:underline truncate block"
                  >
                    {t('listingDetail.viewUploadedResume')}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t('listingDetail.coverNoteLabel')}
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder={t('listingDetail.coverNotePlaceholder')}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-animate rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-animate rounded-xl bg-sky-600 px-5 py-3 text-white shadow-sm hover:bg-sky-500 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {submitting ? t('listingDetail.submitting') : t('listingDetail.submitApplication')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ListingDetail;
