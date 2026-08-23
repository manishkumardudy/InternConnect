import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../services/api';
import { ChevronLeft, FileText, CheckCircle2, XCircle, Award, User, Download, Mail, School, MapPin, Check, X } from 'lucide-react';

// Calculate skill match percentage between candidate profile and job requirements
const calculateMatchPercentage = (candidateSkills = [], jobSkills = []) => {
  const reqSkills = Array.isArray(jobSkills) ? jobSkills : [];
  if (reqSkills.length === 0) return 100; // If no specific skills required, 100% baseline match

  const candSkills = Array.isArray(candidateSkills) ? candidateSkills : [];
  if (candSkills.length === 0) return 0;

  const normalizedCand = candSkills.map(s => String(s || '').trim().toLowerCase()).filter(Boolean);
  const matchedCount = reqSkills.reduce((count, reqSkill) => {
    const normReq = String(reqSkill || '').trim().toLowerCase();
    if (!normReq) return count;
    // Direct match or substring match (e.g. "React.js" matches "React")
    const isMatched = normalizedCand.some(cs => cs === normReq || cs.includes(normReq) || normReq.includes(cs));
    return isMatched ? count + 1 : count;
  }, 0);

  return Math.round((matchedCount / reqSkills.length) * 100);
};

const getMatchBadgeStyle = (percentage) => {
  if (percentage >= 75) {
    return {
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      dotClass: 'bg-emerald-500'
    };
  }
  if (percentage >= 50) {
    return {
      badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      dotClass: 'bg-amber-500'
    };
  }
  return {
    badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    dotClass: 'bg-rose-500'
  };
};

const ApplicantTracker = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetApplicantId = searchParams.get('applicantId');

  const columns = [
    { id: 'applied', label: t('applicantTracker.colApplied'), color: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
    { id: 'shortlisted', label: t('applicantTracker.colShortlisted'), color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    { id: 'hired', label: t('applicantTracker.colHired'), color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
    { id: 'rejected', label: t('applicantTracker.colRejected'), color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  ];

  const [listing, setListing] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [listRes, appsRes] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get(`/applications/listing/${id}`)
        ]);

        setListing(listRes.data.listing);
        const apps = appsRes.data.applications || [];
        setApplications(apps);

        // Auto-select candidate if highlighted via query param from notification click
        if (targetApplicantId && apps.length > 0) {
          const match = apps.find(a =>
            String(a._id) === String(targetApplicantId) ||
            String(a.studentId?._id) === String(targetApplicantId) ||
            String(a.studentProfile?.userId) === String(targetApplicantId)
          );
          if (match) {
            setSelectedApp(match);
            setTimeout(() => {
              const el = document.getElementById(`applicant-card-${match._id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);
          }
        }
      } catch (err) {
        console.error('Error loading applicant tracker:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, targetApplicantId]);

  // Lock body scroll when applicant drawer is open
  useEffect(() => {
    if (selectedApp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedApp]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.patch(`/applications/${appId}/status`, { status: newStatus });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      if (selectedApp && selectedApp._id === appId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <button
              onClick={() => navigate('/recruiter-dashboard')}
              className="btn-animate flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-2 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('applicantTracker.backToDashboard')}
            </button>
            <h1 className="font-sans text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white">
              {t('applicantTracker.kanbanTitle', { title: listing?.title || '' })}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('applicantTracker.totalReceived', { count: applications.length })}
            </p>
          </div>
        </div>

        {/* Kanban Board Grid (4 Columns) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((col) => {
            // Filter applications by status matching column ID (default 'applied' includes 'pending' and unassigned status)
            const colApps = applications.filter(a => {
              if (col.id === 'applied') {
                return !a.status || a.status === 'applied' || a.status === 'pending';
              }
              return a.status === col.id;
            });

            return (
              <div key={col.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 p-4 min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/80 dark:border-slate-800 mb-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold border ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colApps.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-400 font-medium italic">
                      {t('applicantTracker.noCandidatesInCol', { label: col.label })}
                    </div>
                  ) : (
                    colApps.map((app) => {
                      const studentUser = app.studentId || {};
                      const profile = app.studentProfile || {};
                      const name = studentUser.name || 'Candidate';
                      const isSelected = selectedApp && selectedApp._id === app._id;

                      const candidateSkills = profile?.skills || studentUser?.skills || [];
                      const jobSkills = listing?.skillsRequired || listing?.requiredSkills || [];
                      const matchPercentage = calculateMatchPercentage(candidateSkills, jobSkills);
                      const matchStyle = getMatchBadgeStyle(matchPercentage);

                      return (
                        <div
                          key={app._id}
                          id={`applicant-card-${app._id}`}
                          onClick={() => setSelectedApp(app)}
                          className={`card-hover cursor-pointer rounded-xl border p-4 shadow-sm space-y-3 transition-all ${
                            isSelected
                              ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/30 dark:bg-sky-950/30 scale-[1.02]'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase shadow-xs shrink-0">
                                {name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-850 dark:text-white truncate max-w-[130px]">
                                  {name}
                                </h4>
                                <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                  {profile.college || 'College N/A'}
                                </p>
                              </div>
                            </div>

                            {/* Match Percentage Badge */}
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border shrink-0 ${matchStyle.badgeClass}`}
                              title={`${matchPercentage}% Skills Match`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${matchStyle.dotClass}`} />
                              <span>{matchPercentage}% Match</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80">
                            "{app.coverNote || t('applicantTracker.noCoverNote')}"
                          </p>

                          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                            <span>{new Date(app.createdAt || app.appliedAt || Date.now()).toLocaleDateString()}</span>
                            <span className="text-sky-600 dark:text-sky-400 font-bold flex items-center gap-0.5">
                              {t('applicantTracker.viewProfileResume')}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Candidate Details Drawer Modal - Rendered at Root Level Outside Stacking Context */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex justify-end"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="w-full max-w-md h-screen fixed right-0 top-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto shadow-2xl text-left flex flex-col justify-between z-[70] animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('applicantTracker.drawerHeader')}</span>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-sm cursor-pointer transition-colors"
                  title={t('common.cancel')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div className="flex items-center justify-between gap-3.5">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-white font-extrabold text-lg uppercase shadow-md shrink-0">
                      {(selectedApp.studentId?.name || 'C').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-sans text-lg font-extrabold text-slate-850 dark:text-white truncate">
                        {selectedApp.studentId?.name || 'Candidate'}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{selectedApp.studentId?.email || 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const drawerCandSkills = selectedApp.studentProfile?.skills || selectedApp.studentId?.skills || [];
                    const drawerJobSkills = listing?.skillsRequired || listing?.requiredSkills || [];
                    const drawerMatchPct = calculateMatchPercentage(drawerCandSkills, drawerJobSkills);
                    const drawerMatchStyle = getMatchBadgeStyle(drawerMatchPct);
                    return (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border shrink-0 ${drawerMatchStyle.badgeClass}`}>
                        <span className={`h-2 w-2 rounded-full ${drawerMatchStyle.dotClass}`} />
                        <span>{drawerMatchPct}% Match</span>
                      </span>
                    );
                  })()}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <p className="flex items-center gap-2">
                    <School className="h-4 w-4 text-sky-600 shrink-0" />
                    <span><strong>{t('applicantTracker.collegeLabel')}</strong> {selectedApp.studentProfile?.college || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-sky-600 shrink-0" />
                    <span><strong>{t('applicantTracker.degreeLabel')}</strong> {selectedApp.studentProfile?.degree || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-sky-600 shrink-0" />
                    <span><strong>{t('applicantTracker.locationLabel')}</strong> {selectedApp.studentProfile?.location || 'N/A'}</span>
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('applicantTracker.skillsHeading')}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedApp.studentProfile?.skills || []).length > 0 ? (
                      selectedApp.studentProfile.skills.map((skill, idx) => (
                        <span key={idx} className="rounded-lg bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-800">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">{t('applicantTracker.noSkillsListed')}</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('applicantTracker.coverNoteHeading')}</h4>
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedApp.coverNote || t('applicantTracker.noCoverNote')}
                  </p>
                </div>

                {(selectedApp.studentProfile?.resumeUrl || selectedApp.resumeUrlSnapshot) && (
                  <a
                    href={getMediaUrl(selectedApp.studentProfile?.resumeUrl || selectedApp.resumeUrlSnapshot)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-animate flex items-center justify-center gap-2 w-full rounded-xl bg-sky-600 py-3 text-xs font-bold text-white shadow hover:bg-sky-500 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    {t('applicantTracker.downloadResume')}
                  </a>
                )}
              </div>
            </div>

            {/* Recruiter Action Buttons to move status across columns */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{t('applicantTracker.actionsHeading')}</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange(selectedApp._id, 'shortlisted')}
                  className="btn-animate rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 text-[11px] shadow cursor-pointer"
                >
                  {t('applicantTracker.shortlistBtn')}
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApp._id, 'hired')}
                  className="btn-animate rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 text-[11px] shadow cursor-pointer"
                >
                  {t('applicantTracker.hireBtn')}
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApp._id, 'rejected')}
                  className="btn-animate rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 text-[11px] shadow cursor-pointer"
                >
                  {t('applicantTracker.rejectBtn')}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ApplicantTracker;
