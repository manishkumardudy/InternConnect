import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../services/api';
import { User, Building, FileText, CheckCircle, Upload, AlertCircle, ExternalLink, Image } from 'lucide-react';

const ProfileForms = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role === 'recruiter') {
    return <CompanyProfileForm />;
  }
  return <StudentProfileForm />;
};

// ==========================================
// STUDENT PROFILE FORM
// ==========================================
const StudentProfileForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  
  // File upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' }); // type: success / error

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/students/me');
        if (res.data.profile) {
          const p = res.data.profile;
          setCollege(p.college || '');
          setDegree(p.degree || '');
          setGraduationYear(p.graduationYear || '');
          setLocation(p.location || '');
          setBio(p.bio || '');
          setSkills(p.skills ? p.skills.join(', ') : '');
          setResumeUrl(p.resumeUrl || '');
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    setSubmitting(true);

    try {
      await api.put('/students/me', {
        college,
        degree,
        graduationYear,
        location,
        bio,
        skills
      });
      setMsg({ text: t('profileForms.pdfSavedMsg'), type: 'success' });
      
      // Auto redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/student-dashboard');
      }, 1500);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || t('profileForms.pdfFailedMsg'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      return setMsg({ text: t('profileForms.validPdfMsg'), type: 'error' });
    }

    setUploading(true);
    setMsg({ text: '', type: '' });

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/students/me/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeUrl(res.data.resumeUrl);
      setMsg({ text: t('profileForms.pdfUploadedMsg'), type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || t('profileForms.pdfUploadFailed'), type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <User className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-extrabold text-slate-800">{t('profileForms.studentTitle')}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t('profileForms.studentSub')}</p>
          </div>
        </div>

        {msg.text && (
          <div className={`mt-5 rounded-xl p-3.5 text-xs font-semibold border flex gap-2 items-center ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {msg.type === 'success' ? <CheckCircle className="h-4.5 w-4.5 shrink-0" /> : <AlertCircle className="h-4.5 w-4.5 shrink-0" />}
            {msg.text}
          </div>
        )}

        {/* Resume PDF upload */}
        <div className="mt-6 border-b border-slate-150 pb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.resumeLabel')}</label>
          
          <div className="mt-2 flex flex-col sm:flex-row items-center gap-4">
            <label className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-250 px-4 py-3 text-xs font-bold text-slate-700 cursor-pointer border border-slate-200 transition-colors">
              <Upload className="h-4 w-4" />
              {uploading ? t('profileForms.uploading') : t('profileForms.choosePdf')}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleResumeUpload}
              />
            </label>
            
            <div className="flex-1 min-w-0 text-xs text-slate-400">
              {resumeUrl ? (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <a
                    href={getMediaUrl(resumeUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-655 font-semibold hover:underline truncate flex items-center gap-0.5"
                  >
                    {t('profileForms.viewActivePdf')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <span>{t('profileForms.noResumeNotice')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Profile details */}
        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.collegeLabel')}</label>
              <input
                type="text"
                required
                placeholder={t('profileForms.collegePlaceholder')}
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.degreeLabel')}</label>
              <input
                type="text"
                required
                placeholder={t('profileForms.degreePlaceholder')}
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.gradYearLabel')}</label>
              <input
                type="number"
                required
                placeholder="e.g. 2027"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.locationLabel')}</label>
              <input
                type="text"
                required
                placeholder={t('profileForms.locationPlaceholder')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.skillsLabel')}</label>
            <input
              type="text"
              placeholder={t('profileForms.skillsPlaceholder')}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
            />
            <p className="mt-1.5 text-[10px] text-slate-400 font-semibold">
              {t('profileForms.skillsSub')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.bioLabel')}</label>
            <textarea
              rows="4"
              placeholder={t('profileForms.bioPlaceholder')}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/student-dashboard')}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              {t('profileForms.cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-sky-600 px-5 py-3 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {submitting ? t('profileForms.saving') : t('profileForms.saveProfileBtn')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

// ==========================================
// RECRUITER COMPANY PROFILE FORM
// ==========================================
const CompanyProfileForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('1-10');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Logo file upload state
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/companies/me');
        if (res.data.company) {
          const c = res.data.company;
          setCompanyName(c.companyName || '');
          setWebsite(c.website || '');
          setIndustry(c.industry || '');
          setCompanySize(c.companySize || '1-10');
          setDescription(c.description || '');
          setLocation(c.location || '');
          setLogoUrl(c.logoUrl || '');
        }
      } catch (err) {
        console.error('Error fetching company profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    setSubmitting(true);

    try {
      await api.put('/companies/me', {
        companyName,
        website,
        industry,
        companySize,
        description,
        location
      });
      setMsg({ text: t('profileForms.companyUpdatedMsg'), type: 'success' });
      
      setTimeout(() => {
        navigate('/recruiter-dashboard');
      }, 1500);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || t('profileForms.companyUpdateFailed'), type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return setMsg({ text: t('profileForms.validImageMsg'), type: 'error' });
    }

    setUploading(true);
    setMsg({ text: '', type: '' });

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const res = await api.post('/companies/me/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLogoUrl(res.data.logoUrl);
      setMsg({ text: t('profileForms.logoUploadedMsg'), type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || t('profileForms.logoUploadFailed'), type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Building className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-extrabold text-slate-800">{t('profileForms.companyTitle')}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t('profileForms.companySub')}</p>
          </div>
        </div>

        {msg.text && (
          <div className={`mt-5 rounded-xl p-3.5 text-xs font-semibold border flex gap-2 items-center ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {msg.type === 'success' ? <CheckCircle className="h-4.5 w-4.5 shrink-0" /> : <AlertCircle className="h-4.5 w-4.5 shrink-0" />}
            {msg.text}
          </div>
        )}

        {/* Logo Upload Section */}
        <div className="mt-6 border-b border-slate-150 pb-6 flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            {logoUrl ? (
              <img src={getMediaUrl(logoUrl)} alt="Company Logo" className="h-full w-full object-cover" />
            ) : (
              <Image className="h-6 w-6 text-slate-350" />
            )}
          </div>
          
          <div className="flex-1 text-left space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.logoLabel')}</label>
            <label className="inline-flex items-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-250 px-3.5 py-2 text-xs font-bold text-slate-700 cursor-pointer border border-slate-200 transition-colors">
              <Upload className="h-3.5 w-3.5" />
              {uploading ? t('profileForms.uploading') : t('profileForms.uploadImageBtn')}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleLogoUpload}
              />
            </label>
            <p className="text-[10px] text-slate-400 font-semibold">{t('profileForms.logoNotice')}</p>
          </div>
        </div>

        {/* Company form details */}
        <form onSubmit={handleCompanySubmit} className="mt-6 space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.companyNameLabel')}</label>
              <input
                type="text"
                required
                placeholder={t('profileForms.companyNamePlaceholder')}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.websiteLabel')}</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.industryLabel')}</label>
              <input
                type="text"
                placeholder={t('profileForms.industryPlaceholder')}
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.companySizeLabel')}</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="1-10">{t('profileForms.size1_10')}</option>
                <option value="11-50">{t('profileForms.size11_50')}</option>
                <option value="51-200">{t('profileForms.size51_200')}</option>
                <option value="201-500">{t('profileForms.size201_500')}</option>
                <option value="501+">{t('profileForms.size501_plus')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.hqLocationLabel')}</label>
            <input
              type="text"
              placeholder={t('profileForms.hqLocationPlaceholder')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">{t('profileForms.companyDescLabel')}</label>
            <textarea
              rows="4"
              placeholder={t('profileForms.companyDescPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/recruiter-dashboard')}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              {t('profileForms.cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-sky-600 px-5 py-3 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {submitting ? t('profileForms.saving') : t('profileForms.saveCompanyBtn')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ProfileForms;
export { StudentProfileForm, CompanyProfileForm };
