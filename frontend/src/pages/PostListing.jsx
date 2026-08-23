import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import AutocompleteInput from '../components/AutocompleteInput';
import { PlusCircle, Building2, MapPin, DollarSign, Calendar, Sparkles, FileText, ChevronLeft, Tag, X } from 'lucide-react';

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

const PostListing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Engineering & Technology',
    type: 'internship',
    workMode: 'onsite',
    location: 'Bangalore, India',
    stipendMin: 15000,
    stipendMax: 25000,
    durationMonths: 6,
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    skillsRequired: ['React', 'JavaScript', 'HTML', 'CSS'],
    openings: 2,
    description: '',
    responsibilities: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || '').trim();
    if (!trimmed) return;
    if (!formData.skillsRequired.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, trimmed]
      }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(s => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.skillsRequired.length === 0 && skillInput.trim()) {
      formData.skillsRequired = [skillInput.trim()];
    }

    if (formData.skillsRequired.length === 0) {
      setErrorMsg('Please add at least one required skill tag.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await api.post('/listings', formData);
      navigate('/recruiter-dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || t('postListing.failedMsg'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      
      <button
        onClick={() => navigate('/recruiter-dashboard')}
        className="btn-animate flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-6 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('postListing.backToDashboard')}
      </button>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-extrabold text-slate-850 dark:text-white">{t('postListing.title')}</h1>
            <p className="text-xs text-slate-400">{t('postListing.subtitle')}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('postListing.oppTitle')}</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Frontend React Developer Intern"
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Category / Domain <span className="text-sky-600 dark:text-sky-400">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('postListing.typeLabel')}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="internship">{t('postListing.typeInternship')}</option>
                <option value="job">{t('postListing.typeJob')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('postListing.workModeLabel')}</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              >
                <option value="onsite">{t('postListing.onsite')}</option>
                <option value="hybrid">{t('postListing.hybrid')}</option>
                <option value="remote">{t('postListing.remote')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('postListing.durationLabel')}</label>
              <input
                type="number"
                required
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('postListing.locationLabel')}</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Bangalore, India"
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('postListing.openingsLabel')}</label>
              <input
                type="number"
                required
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: parseInt(e.target.value) })}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('postListing.minStipendLabel')}</label>
              <input
                type="number"
                value={formData.stipendMin}
                onChange={(e) => setFormData({ ...formData, stipendMin: parseInt(e.target.value) })}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('postListing.maxStipendLabel')}</label>
              <input
                type="number"
                value={formData.stipendMax}
                onChange={(e) => setFormData({ ...formData, stipendMax: parseInt(e.target.value) })}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Application Deadline <span className="text-sky-600 dark:text-sky-400">*</span>
              </label>
              <input
                type="date"
                required
                name="deadline"
                value={formData.deadline || formData.applicationDeadline || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  deadline: e.target.value,
                  applicationDeadline: e.target.value
                })}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Estimated Start Date <span className="text-sky-600 dark:text-sky-400">*</span>
              </label>
              <input
                type="date"
                required
                name="startDate"
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Skills Required Multi-Tag Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('postListing.skillsLabel')} <span className="text-sky-600 dark:text-sky-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {formData.skillsRequired.length} skill(s) added
              </span>
            </div>

            {formData.skillsRequired.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750">
                {formData.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2.5 py-1 text-xs font-bold text-sky-700 dark:text-sky-300"
                  >
                    <Tag className="h-3 w-3 opacity-70" />
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="rounded p-0.5 text-sky-500 hover:text-sky-800 dark:hover:text-white hover:bg-sky-200/50 dark:hover:bg-sky-800 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <AutocompleteInput
                  value={skillInput}
                  onChange={setSkillInput}
                  onSelect={handleAddSkill}
                  type="skill"
                  placeholder="Type a skill and select from suggestion or click Add..."
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddSkill(skillInput)}
                className="btn-animate rounded-xl bg-slate-800 dark:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer shrink-0"
              >
                Add Skill
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('postListing.descLabel')}</label>
            <textarea
              required
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('postListing.descPlaceholder')}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-animate w-full rounded-xl bg-sky-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 cursor-pointer disabled:opacity-50"
          >
            {submitting ? t('postListing.publishing') : t('postListing.publishBtn')}
          </button>

        </form>
      </div>

    </div>
  );
};

export default PostListing;
