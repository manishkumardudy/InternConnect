import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../services/api';
import ExploreOpportunities from '../components/ExploreOpportunities';
import {
  PlusCircle, Building2, Users, FileText, CheckCircle, BarChart,
  Eye, Settings, AlertCircle, Edit3, Trash2, X, Tag, Calendar,
  Loader2, Save, ArrowRight
} from 'lucide-react';

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

const RecruiterDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');

  // Edit Modal state
  const [editModal, setEditModal] = useState({
    open: false,
    listingId: null,
    saving: false,
    error: '',
    skillInput: '',
    formData: {
      title: '',
      category: 'Engineering & Technology',
      type: 'internship',
      workMode: 'onsite',
      location: '',
      stipendMin: 0,
      stipendMax: 0,
      durationMonths: 3,
      startDate: '',
      deadline: '',
      openings: 1,
      status: 'active',
      skillsRequired: [],
      description: '',
      responsibilities: ''
    }
  });

  useEffect(() => {
    const fetchRecruiterData = async () => {
      setLoading(true);
      try {
        const [compRes, listRes] = await Promise.all([
          api.get('/companies/me'),
          api.get('/listings/recruiter/me')
        ]);

        setCompany(compRes.data.company);
        setListings(listRes.data.listings || []);
      } catch (err) {
        console.error('Error loading recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, []);

  const totalPostings = listings.length;
  const activePostings = listings.filter(l => l.status === 'active').length;
  const totalApplicants = listings.reduce((sum, l) => sum + (l.applicantCount || 0), 0);

  // Handle Delete listing
  const handleDelete = async (jobId, title) => {
    if (!jobId) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${title || 'this listing'}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(jobId);
    try {
      await api.delete(`/listings/${jobId}`);
      // Immediately filter deleted job out of local state
      setListings(prev => prev.filter(l => l._id !== jobId));
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert(err.response?.data?.message || 'Failed to delete listing. Please try again.');
    } finally {
      setDeletingId('');
    }
  };

  // Open Edit modal
  const handleOpenEdit = (listing) => {
    setEditModal({
      open: true,
      listingId: listing._id,
      saving: false,
      error: '',
      skillInput: '',
      formData: {
        title: listing.title || '',
        category: listing.category || 'Engineering & Technology',
        type: listing.type || 'internship',
        workMode: listing.workMode || 'onsite',
        location: listing.location || '',
        stipendMin: listing.stipendMin || 0,
        stipendMax: listing.stipendMax || 0,
        durationMonths: listing.durationMonths || 3,
        startDate: listing.startDate ? new Date(listing.startDate).toISOString().split('T')[0] : '',
        deadline: listing.deadline ? new Date(listing.deadline).toISOString().split('T')[0] : (listing.applicationDeadline ? new Date(listing.applicationDeadline).toISOString().split('T')[0] : ''),
        openings: listing.openings || 1,
        status: listing.status || 'active',
        skillsRequired: Array.isArray(listing.skillsRequired) ? [...listing.skillsRequired] : [],
        description: listing.description || '',
        responsibilities: Array.isArray(listing.responsibilities) ? listing.responsibilities.join('\n') : (listing.responsibilities || '')
      }
    });
  };

  // Add skill in Edit modal
  const handleAddEditSkill = (e) => {
    e?.preventDefault?.();
    const trimmed = (editModal.skillInput || '').trim();
    if (!trimmed) return;
    if (!editModal.formData.skillsRequired.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setEditModal(prev => ({
        ...prev,
        skillInput: '',
        formData: {
          ...prev.formData,
          skillsRequired: [...prev.formData.skillsRequired, trimmed]
        }
      }));
    } else {
      setEditModal(prev => ({ ...prev, skillInput: '' }));
    }
  };

  // Remove skill in Edit modal
  const handleRemoveEditSkill = (skillToRemove) => {
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        skillsRequired: prev.formData.skillsRequired.filter(s => s !== skillToRemove)
      }
    }));
  };

  // Submit Edit form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModal.listingId) return;

    setEditModal(prev => ({ ...prev, saving: true, error: '' }));

    try {
      const res = await api.put(`/listings/${editModal.listingId}`, editModal.formData);
      const updated = res.data.listing;

      // Update local state instantly
      setListings(prev => prev.map(l => (l._id === updated._id ? { ...l, ...updated } : l)));
      setEditModal(prev => ({ ...prev, open: false, saving: false }));
    } catch (err) {
      console.error('Error updating listing:', err);
      setEditModal(prev => ({
        ...prev,
        saving: false,
        error: err.response?.data?.message || 'Failed to update listing.'
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 fade-in text-left">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Recruiter Header Banner */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              {company?.logoUrl && (
                <img
                  src={getMediaUrl(company.logoUrl)}
                  alt={company.companyName}
                  className="h-9 w-9 rounded-xl object-contain bg-white p-1"
                />
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-sky-400">
                <Building2 className="h-3.5 w-3.5" />
                {company?.companyName || t('recruiterDashboard.verifiedEmployer')}
              </span>
            </div>

            <h1 className="mt-3 font-sans text-2xl sm:text-3xl font-extrabold">{t('recruiterDashboard.title')}</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
              {t('recruiterDashboard.subtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/company-profile"
              className="btn-animate rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold text-white hover:bg-slate-750"
            >
              {t('recruiterDashboard.editProfile')}
            </Link>
            <Link
              to="/post-listing"
              className="btn-animate inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-sky-500 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              {t('recruiterDashboard.postOpportunity')}
            </Link>
          </div>
        </div>

        {/* 3 Metric Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('recruiterDashboard.statTotalPostings')}</span>
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-850 dark:text-white">{totalPostings}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">{t('recruiterDashboard.statTotalPostingsSub')}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('recruiterDashboard.statActivePostings')}</span>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{activePostings}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">{t('recruiterDashboard.statActivePostingsSub')}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('recruiterDashboard.statTotalApplicants')}</span>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-slate-850 dark:text-white">{totalApplicants}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">{t('recruiterDashboard.statTotalApplicantsSub')}</p>
          </div>

        </div>

        {/* Postings Table / Cards */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-sans text-base font-bold text-slate-850 dark:text-white">{t('recruiterDashboard.postingsHeading')}</h2>
            <Link
              to="/post-listing"
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              {t('recruiterDashboard.createNewPosting')}
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500">
              <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
              <p className="mt-4 text-sm font-semibold">{t('recruiterDashboard.noPostings')}</p>
              <Link
                to="/post-listing"
                className="btn-animate mt-4 inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-sky-500"
              >
                {t('recruiterDashboard.postFirstBtn')}
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-3 px-2">{t('recruiterDashboard.thRoleTitle')}</th>
                    <th className="py-3 px-2">{t('recruiterDashboard.thTypeMode')}</th>
                    <th className="py-3 px-2">{t('recruiterDashboard.thStipend')}</th>
                    <th className="py-3 px-2">{t('recruiterDashboard.thApplicants')}</th>
                    <th className="py-3 px-2">{t('recruiterDashboard.thStatus')}</th>
                    <th className="py-3 px-2 text-right">{t('recruiterDashboard.thActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {listings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-4 px-2 font-bold text-slate-850 dark:text-white">
                        <Link to={`/listings/${listing._id}`} className="hover:text-sky-600 dark:hover:text-sky-400 block max-w-xs truncate">
                          {listing.title}
                        </Link>
                        {listing.deadline && (
                          <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                            Deadline: {new Date(listing.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2 capitalize text-slate-500 dark:text-slate-400">
                        {listing.type} • {listing.workMode}
                      </td>
                      <td className="py-4 px-2 font-bold text-slate-800 dark:text-slate-200">
                        {listing.stipendMax > 0 ? `₹${listing.stipendMin?.toLocaleString()}-${listing.stipendMax?.toLocaleString()}/mo` : t('recruiterDashboard.unpaid')}
                      </td>
                      <td className="py-4 px-2 font-bold text-sky-600 dark:text-sky-400">
                        {t('recruiterDashboard.candidatesCount', { count: listing.applicantCount || 0 })}
                      </td>
                      <td className="py-4 px-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          listing.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {listing.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Track Button */}
                          <Link
                            to={`/listing/${listing._id}/applicants`}
                            className="btn-animate inline-flex items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-950/50 px-2.5 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-150 dark:border-sky-800"
                            title="Track applicant pipeline"
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>{t('recruiterDashboard.trackBtn', { count: listing.applicantCount || 0 })}</span>
                          </Link>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(listing)}
                            className="btn-animate inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer"
                            title="Edit opportunity details"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-amber-500" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={deletingId === listing._id}
                            onClick={() => handleDelete(listing._id, listing.title)}
                            className="btn-animate inline-flex items-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-150 dark:border-rose-800 cursor-pointer disabled:opacity-50"
                            title="Delete this listing"
                          >
                            {deletingId === listing._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            )}
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Edit Opportunity Modal */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800 text-left my-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Edit3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold text-slate-850 dark:text-white">
                    Edit Opportunity
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update listing information, stipend, and deadlines.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModal(prev => ({ ...prev, open: false }))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editModal.error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                {editModal.error}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Role Title <span className="text-sky-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editModal.formData.title}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, title: e.target.value } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Category <span className="text-sky-600">*</span>
                  </label>
                  <select
                    required
                    value={editModal.formData.category}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, category: e.target.value } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Type</label>
                  <select
                    value={editModal.formData.type}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, type: e.target.value } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="internship">Internship</option>
                    <option value="job">Full-time Job</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Work Mode</label>
                  <select
                    value={editModal.formData.workMode}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, workMode: e.target.value } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Status</label>
                  <select
                    value={editModal.formData.status}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, status: e.target.value } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editModal.formData.location}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, location: e.target.value } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    required
                    value={editModal.formData.durationMonths}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, durationMonths: parseInt(e.target.value) || 0 } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Openings</label>
                  <input
                    type="number"
                    required
                    value={editModal.formData.openings}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, openings: parseInt(e.target.value) || 1 } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Min Stipend (₹/mo)</label>
                  <input
                    type="number"
                    value={editModal.formData.stipendMin}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, stipendMin: parseInt(e.target.value) || 0 } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Max Stipend (₹/mo)</label>
                  <input
                    type="number"
                    value={editModal.formData.stipendMax}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, stipendMax: parseInt(e.target.value) || 0 } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Application Deadline <span className="text-sky-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editModal.formData.deadline}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, deadline: e.target.value } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Estimated Start Date <span className="text-sky-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editModal.formData.startDate}
                    onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, startDate: e.target.value } }))}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Skills Required */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Skills Required
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editModal.formData.skillsRequired.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2 py-0.5 text-xs font-bold text-sky-700 dark:text-sky-300"
                    >
                      <Tag className="h-3 w-3 opacity-70" />
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditSkill(skill)}
                        className="text-sky-500 hover:text-sky-800 dark:hover:text-white ml-1 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editModal.skillInput}
                    onChange={(e) => setEditModal(prev => ({ ...prev, skillInput: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEditSkill(); } }}
                    placeholder="Type skill and press Enter or Add..."
                    className="block flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditSkill}
                    className="rounded-xl bg-slate-800 dark:bg-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={editModal.formData.description}
                  onChange={(e) => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, description: e.target.value } }))}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModal(prev => ({ ...prev, open: false }))}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editModal.saving}
                  className="btn-animate inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {editModal.saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Opportunity</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* SEO Explore Opportunities Directory Section */}
      <div className="mt-12">
        <ExploreOpportunities />
      </div>

    </div>
  );
};

export default RecruiterDashboard;
