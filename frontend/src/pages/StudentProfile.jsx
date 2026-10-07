import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../services/api';
import AutocompleteInput from '../components/AutocompleteInput';
import {
  User, School, GraduationCap, MapPin, Code, FileText, CheckCircle,
  Save, Upload, AlertCircle, History, Tag, X, Plus, Trash2,
  Briefcase, Award, Heart, Compass, Sparkles
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

const StudentProfile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    college: '',
    degree: '',
    graduationYear: 2027,
    skills: [],
    location: '',
    bio: '',
    interestedFields: [],
    lookingFor: '',
    experience: [],
    achievements: [],
    hobbies: [],
    resumeUrl: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [hobbyInput, setHobbyInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/students/me');
        if (res.data.profile) {
          const p = res.data.profile;
          setProfile({
            college: p.college || '',
            degree: p.degree || '',
            graduationYear: p.graduationYear || 2027,
            skills: Array.isArray(p.skills) ? p.skills : [],
            location: p.location || '',
            bio: p.bio || '',
            interestedFields: Array.isArray(p.interestedFields) ? p.interestedFields : [],
            lookingFor: p.lookingFor || '',
            experience: Array.isArray(p.experience) ? p.experience : [],
            achievements: Array.isArray(p.achievements) ? p.achievements : [],
            hobbies: Array.isArray(p.hobbies) ? p.hobbies : [],
            resumeUrl: p.resumeUrl || ''
          });
        }
      } catch (err) {
        console.error('Error fetching student profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Skill Chip Handlers
  const handleAddSkill = (skill) => {
    const trimmed = (skill || '').trim();
    if (!trimmed) return;
    if (!profile.skills.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Interested Fields Toggle
  const handleToggleField = (field) => {
    setProfile(prev => {
      const exists = prev.interestedFields.includes(field);
      return {
        ...prev,
        interestedFields: exists
          ? prev.interestedFields.filter(f => f !== field)
          : [...prev.interestedFields, field]
      };
    });
  };

  // Experience Handlers
  const handleAddExperience = () => {
    setProfile(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', organization: '', duration: '', description: '' }
      ]
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setProfile(prev => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const handleRemoveExperience = (index) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  // Achievement Handlers
  const handleAddAchievement = (e) => {
    if (e) e.preventDefault();
    const trimmed = achievementInput.trim();
    if (!trimmed) return;
    setProfile(prev => ({
      ...prev,
      achievements: [...prev.achievements, trimmed]
    }));
    setAchievementInput('');
  };

  const handleRemoveAchievement = (index) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  // Hobby Handlers
  const handleAddHobby = (e) => {
    if (e) e.preventDefault();
    const trimmed = hobbyInput.trim();
    if (!trimmed) return;
    if (!profile.hobbies.some(h => h.toLowerCase() === trimmed.toLowerCase())) {
      setProfile(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, trimmed]
      }));
    }
    setHobbyInput('');
  };

  const handleRemoveHobby = (hobbyToRemove) => {
    setProfile(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobbyToRemove)
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/students/me', profile);
      setProfile(prev => ({ ...prev, ...(res.data.profile || {}) }));
      setMessage({ type: 'success', text: t('studentProfile.successSaved') });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('studentProfile.failedSaved') });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      const res = await api.post('/students/me/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProfile(prev => ({ ...prev, resumeUrl: res.data.resumeUrl }));
      setMessage({ type: 'success', text: t('studentProfile.resumeUploadedMsg') });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || t('studentProfile.failedUploadResume') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-sans text-2xl font-extrabold text-slate-850 dark:text-white">{t('studentProfile.title')}</h1>
          <p className="text-xs text-slate-400">{t('studentProfile.subtitle')}</p>
        </div>
      </div>

      {message.text && (
        <div className={`mt-6 rounded-xl p-4 text-xs font-bold border ${
          message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
            
            {/* 1. Basic & Academic Details */}
            <div className="space-y-4">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <School className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                Academic & Contact Information
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('studentProfile.fullName')}</label>
                <input
                  type="text"
                  disabled
                  value={user?.name || ''}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 p-3 text-xs font-bold text-slate-600 dark:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {t('studentProfile.collegeLabel')} <span className="text-sky-600 dark:text-sky-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profile.college || ''}
                  onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                  placeholder="e.g. National Institute of Technology (NIT)"
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {t('studentProfile.degreeLabel')} <span className="text-sky-600 dark:text-sky-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.degree || ''}
                    onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                    placeholder="e.g. B.Tech Computer Science"
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {t('studentProfile.gradYearLabel')} <span className="text-sky-600 dark:text-sky-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={profile.graduationYear || 2027}
                    onChange={(e) => setProfile({ ...profile, graduationYear: parseInt(e.target.value) })}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {t('studentProfile.cityLabel')} <span className="text-sky-600 dark:text-sky-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.location || ''}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="e.g. Bangalore"
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Looking For <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={profile.lookingFor || ''}
                    onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="">Flexible / Not Specified</option>
                    <option value="internship">Internship Only</option>
                    <option value="job">Full-time Job Only</option>
                    <option value="both">Both (Internship & Job)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{t('studentProfile.bioLabel')}</label>
                <textarea
                  rows="3"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder={t('studentProfile.bioPlaceholder')}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 2. Skills Multi-Tag Chips */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Code className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Skills & Technical Proficiencies
                </h2>
                <span className="text-[10px] text-slate-400 font-bold">
                  {profile.skills.length} added
                </span>
              </div>

              {profile.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750">
                  {profile.skills.map((skill) => (
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

              <div className="flex gap-2">
                <div className="flex-1">
                  <AutocompleteInput
                    value={skillInput}
                    onChange={setSkillInput}
                    onSelect={handleAddSkill}
                    type="skill"
                    placeholder="Type skill & pick from suggestions or click Add..."
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="btn-animate rounded-xl bg-slate-800 dark:bg-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            {/* 3. Interested Fields / Branches (Optional) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Interested Fields / Branches <span className="text-slate-400 font-normal">(Optional)</span>
                </h2>
                <span className="text-[10px] text-slate-400 font-bold">
                  {profile.interestedFields.length} selected
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Select the industries and domains you want to target for internships and jobs (+15% eligibility boost).
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const isSelected = profile.interestedFields.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleToggleField(cat)}
                      className={`btn-animate rounded-xl px-3 py-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                      }`}
                    >
                      {isSelected && <CheckCircle className="h-3.5 w-3.5" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Experience (Optional) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Past Experience & Internships <span className="text-slate-400 font-normal">(Optional)</span>
                </h2>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="btn-animate inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Experience
                </button>
              </div>

              {profile.experience.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1">
                  No experience records added yet. Click &ldquo;Add Experience&rdquo; to include past internships or roles.
                </p>
              ) : (
                <div className="space-y-3">
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Experience #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="text-red-500 hover:text-red-700 p-1 rounded cursor-pointer"
                          aria-label="Remove experience"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Role / Title (e.g. Frontend Intern)"
                          value={exp.title || ''}
                          onChange={(e) => handleExperienceChange(idx, 'title', e.target.value)}
                          className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                        />
                        <input
                          type="text"
                          placeholder="Company / Organization"
                          value={exp.organization || ''}
                          onChange={(e) => handleExperienceChange(idx, 'organization', e.target.value)}
                          className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Duration (e.g. 3 months, June 2025 - Aug 2025)"
                        value={exp.duration || ''}
                        onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />

                      <textarea
                        rows="2"
                        placeholder="Brief summary of your work or achievements..."
                        value={exp.description || ''}
                        onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Achievements (Optional) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Key Achievements <span className="text-slate-400 font-normal">(Optional)</span>
                </h2>
                <span className="text-[10px] text-slate-400 font-bold">
                  {profile.achievements.length} added
                </span>
              </div>

              {profile.achievements.length > 0 && (
                <ul className="space-y-2">
                  {profile.achievements.map((ach, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        {ach}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={achievementInput}
                  onChange={(e) => setAchievementInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAchievement();
                    }
                  }}
                  placeholder="e.g. 1st Place at National Hackathon 2026..."
                  className="block flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddAchievement}
                  className="btn-animate rounded-xl bg-slate-800 dark:bg-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            {/* 6. Hobbies & Interests (Optional) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  Hobbies & Interests <span className="text-slate-400 font-normal">(Optional)</span>
                </h2>
                <span className="text-[10px] text-slate-400 font-bold">
                  {profile.hobbies.length} added
                </span>
              </div>

              {profile.hobbies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750">
                  {profile.hobbies.map((hobby) => (
                    <span
                      key={hobby}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                    >
                      <span>{hobby}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHobby(hobby)}
                        className="rounded p-0.5 text-emerald-500 hover:text-emerald-800 dark:hover:text-white hover:bg-emerald-200/50 dark:hover:bg-emerald-800 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={hobbyInput}
                  onChange={(e) => setHobbyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHobby();
                    }
                  }}
                  placeholder="e.g. Open Source, Chess, Robotics..."
                  className="block flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddHobby}
                  className="btn-animate rounded-xl bg-slate-800 dark:bg-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 dark:hover:bg-slate-600 cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="btn-animate w-full rounded-xl bg-sky-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-sky-500 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                {saving ? t('studentProfile.saving') : t('studentProfile.saveBtn')}
              </button>
            </div>

          </form>
        </div>

        {/* Resume PDF Upload Column */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="font-sans text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
              {t('studentProfile.resumeHeading')}
            </h3>
            
            {profile.resumeUrl ? (
              <div className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-100 dark:border-emerald-800 text-left space-y-2">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">{t('studentProfile.resumeAttachedBadge')}</span>
                <a
                  href={getMediaUrl(profile.resumeUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline block truncate"
                >
                  {t('studentProfile.viewAttachedResume')}
                </a>
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-100 dark:border-amber-800 text-left">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">{t('studentProfile.noResumeAttached')}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">{t('studentProfile.noResumeSub')}</p>
              </div>
            )}

            <form onSubmit={handleResumeUpload} className="mt-5 space-y-4">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-sky-50 dark:file:bg-sky-950/60 file:text-sky-700 dark:file:text-sky-400 hover:file:bg-sky-100"
              />

              <button
                type="submit"
                disabled={!resumeFile || saving}
                className="btn-animate w-full rounded-xl bg-slate-900 dark:bg-slate-800 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Upload className="h-4 w-4" />
                {t('studentProfile.uploadResumeBtn')}
              </button>
            </form>
          </div>

          {/* Login History Security Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="font-sans text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
              {t('studentProfile.securityHeading')}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {t('studentProfile.securitySub')}
            </p>
            <Link
              to="/login-history"
              className="btn-animate mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {t('studentProfile.viewLoginHistoryBtn')}
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default StudentProfile;
