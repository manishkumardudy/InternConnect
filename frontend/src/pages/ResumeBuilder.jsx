import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MockPaymentQR from '../components/MockPaymentQR';
import {
  FileText, Crown, Plus, Trash2, ShieldCheck, Sparkles, CheckCircle2,
  AlertCircle, ArrowRight, Lock, Loader2, Download, ExternalLink, X, RefreshCw,
  CreditCard, QrCode, ChevronRight, Zap
} from 'lucide-react';

const ResumeBuilder = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Personal Information State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [leetcode, setLeetcode] = useState('');

  // 2. Career Objective State
  const [careerObjective, setCareerObjective] = useState('');

  // 3. Education State
  const [education, setEducation] = useState([
    { degree: '', institution: '', yearRange: '', cgpa: '' }
  ]);

  // 4. Technical Skills State
  const [skills, setSkills] = useState({
    languages: '',
    tools: '',
    frameworks: '',
    other: ''
  });

  // 5. Projects State
  const [projects, setProjects] = useState([
    { title: '', techStack: '', link: '', description: '' }
  ]);

  // 6. Internship / Training State
  const [internships, setInternships] = useState([
    { organization: '', role: '', duration: '', description: '', certificateLink: '' }
  ]);

  // 7. Certifications State
  const [certifications, setCertifications] = useState([
    { name: '', issuer: '' }
  ]);

  // 8. Key Achievements State
  const [achievements, setAchievements] = useState(['']);

  // Unified Modal Step State: null | 'otp' | 'choice' | 'mock'
  const [modalStep, setModalStep] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Payment State (₹50)
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processingPayment, setProcessingPayment] = useState(false);

  // PDF Success State
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState('');

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (modalStep) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalStep]);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        setLoading(true);
        const res = await api.get('/subscriptions/current');
        setSubData(res.data.subscription);
      } catch (err) {
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSub();
  }, []);

  // Timer countdown effect for OTP resend
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Education Handlers
  const handleAddEducation = () => {
    setEducation([...education, { degree: '', institution: '', yearRange: '', cgpa: '' }]);
  };
  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };
  const handleEducationChange = (index, field, val) => {
    const updated = [...education];
    updated[index][field] = val;
    setEducation(updated);
  };

  // Skill Handlers
  const handleSkillChange = (field, val) => {
    setSkills({ ...skills, [field]: val });
  };

  // Project Handlers
  const handleAddProject = () => {
    setProjects([...projects, { title: '', techStack: '', link: '', description: '' }]);
  };
  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };
  const handleProjectChange = (index, field, val) => {
    const updated = [...projects];
    updated[index][field] = val;
    setProjects(updated);
  };

  // Internship Handlers
  const handleAddInternship = () => {
    setInternships([...internships, { organization: '', role: '', duration: '', description: '', certificateLink: '' }]);
  };
  const handleRemoveInternship = (index) => {
    setInternships(internships.filter((_, i) => i !== index));
  };
  const handleInternshipChange = (index, field, val) => {
    const updated = [...internships];
    updated[index][field] = val;
    setInternships(updated);
  };

  // Certification Handlers
  const handleAddCertification = () => {
    setCertifications([...certifications, { name: '', issuer: '' }]);
  };
  const handleRemoveCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };
  const handleCertificationChange = (index, field, val) => {
    const updated = [...certifications];
    updated[index][field] = val;
    setCertifications(updated);
  };

  // Achievement Handlers
  const handleAddAchievement = () => setAchievements([...achievements, '']);
  const handleRemoveAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };
  const handleAchievementChange = (index, val) => {
    const updated = [...achievements];
    updated[index] = val;
    setAchievements(updated);
  };

  // Form Validation
  const validateForm = () => {
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    if (!email.trim()) {
      setErrorMsg('Email Address is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone Number is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    const hasValidEducation = education.some(e => e.degree.trim() && e.institution.trim());
    if (!hasValidEducation) {
      setErrorMsg('At least one Education entry with Degree and Institution is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }

    return true;
  };

  // Step 1: Request OTP
  const handleInitiateGenerate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrorMsg('');
    setSendingOtp(true);
    try {
      await api.post('/otp/send', { purpose: 'resume_payment' });
      setOtpCode('');
      setResendTimer(60);
      setModalStep('otp');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send verification OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || sendingOtp) return;
    setErrorMsg('');
    setSendingOtp(true);
    try {
      await api.post('/otp/send', { purpose: 'resume_payment' });
      setResendTimer(60);
      setSuccessMsg('A new OTP has been sent to your registered email.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Helper to extract and format full resume payload
  const buildResumePayload = () => ({
    fullName: fullName.trim(),
    email: email.trim(),
    personalInfo: {
      phone: phone.trim(),
      address: address.trim(),
      dob: dob.trim(),
      linkedin: linkedin.trim(),
      github: github.trim(),
      leetcode: leetcode.trim()
    },
    careerObjective: careerObjective.trim(),
    education: education.map(e => ({
      degree: e.degree.trim(),
      institution: e.institution.trim(),
      yearRange: e.yearRange.trim(),
      cgpa: e.cgpa.trim()
    })).filter(e => e.degree || e.institution),
    skills,
    projects: projects.map(p => ({
      title: p.title.trim(),
      techStack: p.techStack.trim(),
      link: p.link.trim(),
      description: p.description.trim()
    })).filter(p => p.title),
    internships: internships.map(i => ({
      organization: i.organization.trim(),
      role: i.role.trim(),
      duration: i.duration.trim(),
      description: i.description.trim(),
      certificateLink: i.certificateLink.trim()
    })).filter(i => i.organization || i.role),
    certifications: certifications.map(c => ({
      name: c.name.trim(),
      issuer: c.issuer.trim()
    })).filter(c => c.name),
    achievements: achievements.map(a => a.trim()).filter(Boolean)
  });

  // Step 2: Verify OTP -> Open Payment Choice Modal
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP code.');
      return;
    }

    setErrorMsg('');
    setVerifyingOtp(true);
    try {
      await api.post('/otp/verify', { code: otpCode.trim(), purpose: 'resume_payment' });
      setModalStep('choice');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Option 1: Pay with Razorpay (Real Test Mode Gateway)
  const handlePayWithRazorpay = async () => {
    setErrorMsg('');
    setProcessingPayment(true);
    try {
      // 1. Create order with paymentMode: 'razorpay'
      const orderRes = await api.post('/resume-builder/create-order', { paymentMode: 'razorpay' });
      const { order, keyId, mockMode } = orderRes.data;

      // If backend reports mockMode (e.g. if keys not configured), fallback to mock modal
      if (mockMode || order.mock || keyId === 'rzp_test_mock') {
        setModalStep('mock');
        setUtrNumber('');
        return;
      }

      // 2. Open Real Razorpay Popup Checkout
      setModalStep(null);
      const resumeData = buildResumePayload();
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'InternConnect',
        description: 'AI PDF Resume Builder Generation (₹50)',
        order_id: order.id,
        prefill: {
          name: fullName || user?.name || '',
          email: email || user?.email || ''
        },
        theme: {
          color: '#0284c7'
        },
        handler: async function (response) {
          try {
            setProcessingPayment(true);
            const verifyRes = await api.post('/resume-builder/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              resumeData
            });
            setGeneratedPdfUrl(verifyRes.data.pdfUrl);
            setSuccessMsg('PDF Resume generated and linked to your profile successfully!');
          } catch (vErr) {
            setErrorMsg(vErr.response?.data?.message || 'Payment verification failed.');
          } finally {
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          }
        }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setErrorMsg('Razorpay Checkout SDK failed to load. Please refresh and try again.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to initiate Razorpay payment.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Step 3 (Mock Flow): Confirm Mock Payment -> Generate PDF
  const handleConfirmPayment = async () => {
    setErrorMsg('');
    setProcessingPayment(true);

    try {
      // 1. Create mock order
      const orderRes = await api.post('/resume-builder/create-order', { paymentMode: 'mock' });
      const { order } = orderRes.data;

      // 2. Prepare payload
      const resumeData = buildResumePayload();

      // 3. Verify Mock Payment & Generate PDF
      const verifyRes = await api.post('/resume-builder/verify-payment', {
        razorpay_order_id: order.id,
        razorpay_payment_id: `${paymentMethod}_${utrNumber.trim() || Date.now()}`,
        resumeData
      });

      setModalStep(null);
      setGeneratedPdfUrl(verifyRes.data.pdfUrl);
      setSuccessMsg('PDF Resume generated and linked to your profile successfully!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Payment processing or PDF generation failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  // Paid plan gate check
  const isPaidPlan = subData && subData.planName && subData.planName !== 'free';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 fade-in text-left">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-md">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-sans text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white">
              {t('resumeBuilder.title')}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
              <Crown className="h-3 w-3" /> {t('resumeBuilder.premiumBadge')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{t('resumeBuilder.subtitle')}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Free Plan Upgrade Gate */}
      {!isPaidPlan ? (
        <div className="mt-8 rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:to-slate-900 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 mb-4">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-850 dark:text-white">
            {t('resumeBuilder.gateTitle')}
          </h2>
          <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto">
            {t('resumeBuilder.gateDesc')}
          </p>
          <Link
            to="/subscription"
            className="btn-animate mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-6 py-3 text-xs font-bold text-slate-950 shadow-md"
          >
            <Crown className="h-4 w-4" />
            {t('resumeBuilder.gateBtn')}
          </Link>
        </div>
      ) : (
        /* Form or Success State */
        <div className="mt-8">
          {generatedPdfUrl ? (
            /* Success Card */
            <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30 p-8 text-center space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white">{t('resumeBuilder.successTitle')}</h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {t('resumeBuilder.successDesc')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <a
                  href={getMediaUrl(generatedPdfUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-animate inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-6 py-3 text-xs font-bold text-white shadow-md"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('resumeBuilder.viewPdf')}
                </a>
                <button
                  onClick={() => setGeneratedPdfUrl('')}
                  className="btn-animate inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 dark:bg-slate-800 px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                >
                  {t('resumeBuilder.createAnother')}
                </button>
              </div>
            </div>
          ) : (
            /* Multi-Section Form */
            <form onSubmit={handleInitiateGenerate} className="space-y-8">
              
              {/* SECTION 1: Personal Information */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">{t('resumeBuilder.secPersonal')}</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.fullName')}</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.email')}</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. aarav.sharma@example.com"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.phone')}</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.address')}</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Bangalore, India"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.linkedin')}</label>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="e.g. linkedin.com/in/aaravsharma"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.github')}</label>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="e.g. github.com/aaravsharma or behance.net/aarav"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.leetcode')}</label>
                    <input
                      type="text"
                      value={leetcode}
                      onChange={(e) => setLeetcode(e.target.value)}
                      placeholder="e.g. portfolio.aarav.me, behance.net, or leetcode.com/aarav"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.dob')}</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Career Objective */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">{t('resumeBuilder.secCareer')}</h2>
                <div>
                  <textarea
                    rows={3}
                    value={careerObjective}
                    onChange={(e) => setCareerObjective(e.target.value)}
                    placeholder="Enthusiastic and results-driven student seeking an internship opportunity to apply skills, collaborate on high-impact projects, and gain hands-on professional industry experience..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* SECTION 3: Education */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">{t('resumeBuilder.secEducation')}</h2>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="btn-animate text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> {t('resumeBuilder.addEducation')}
                  </button>
                </div>

                {education.map((edu, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 space-y-3 relative">
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="absolute top-3 right-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.degree')}</label>
                        <input
                          type="text"
                          required
                          value={edu.degree}
                          onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                          placeholder="e.g. B.Tech Computer Science / B.Com / BBA / B.Des / BA Economics"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.institution')}</label>
                        <input
                          type="text"
                          required
                          value={edu.institution}
                          onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                          placeholder="e.g. Delhi University, IIT Bombay, NID, Christ University"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.yearRange')}</label>
                        <input
                          type="text"
                          value={edu.yearRange}
                          onChange={(e) => handleEducationChange(idx, 'yearRange', e.target.value)}
                          placeholder="e.g. 2022 - 2026"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.cgpa')}</label>
                        <input
                          type="text"
                          value={edu.cgpa}
                          onChange={(e) => handleEducationChange(idx, 'cgpa', e.target.value)}
                          placeholder="e.g. 8.8 CGPA / 85%"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 4: Skills (Field-Agnostic) */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">{t('resumeBuilder.secSkills')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.languages')}</label>
                    <input
                      type="text"
                      value={skills.languages}
                      onChange={(e) => handleSkillChange('languages', e.target.value)}
                      placeholder="e.g. Python, Financial Modeling, Graphic Design, Content Strategy, Java"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.tools')}</label>
                    <input
                      type="text"
                      value={skills.tools}
                      onChange={(e) => handleSkillChange('tools', e.target.value)}
                      placeholder="e.g. Figma, Excel, Canva, Google Analytics, Git, Salesforce, Tableau"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.frameworks')}</label>
                    <input
                      type="text"
                      value={skills.frameworks}
                      onChange={(e) => handleSkillChange('frameworks', e.target.value)}
                      placeholder="e.g. Agile/Scrum, Design Thinking, SWOT Analysis, SEO, React, Six Sigma"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('resumeBuilder.otherSkills')}</label>
                    <input
                      type="text"
                      value={skills.other}
                      onChange={(e) => handleSkillChange('other', e.target.value)}
                      placeholder="e.g. Team Leadership, Public Speaking, Copywriting, Negotiation, Project Management"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Projects & Initiatives */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">{t('resumeBuilder.secProjects')}</h2>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="btn-animate text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> {t('resumeBuilder.addProject')}
                  </button>
                </div>

                {projects.map((proj, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 space-y-3 relative">
                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="absolute top-3 right-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.projectTitle')}</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                          placeholder="e.g. Brand Campaign / E-Commerce Store / Market Analysis"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.techStack')}</label>
                        <input
                          type="text"
                          value={proj.techStack}
                          onChange={(e) => handleProjectChange(idx, 'techStack', e.target.value)}
                          placeholder="e.g. Figma, Canva, Excel, React, Google Ads, Python"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.projectLink')}</label>
                        <input
                          type="text"
                          value={proj.link}
                          onChange={(e) => handleProjectChange(idx, 'link', e.target.value)}
                          placeholder="e.g. behance.net/..., github.com/..., or Google Drive"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.projectDesc')}</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                        placeholder={"• Spearheaded a team of 4 to execute project deliverables on schedule\n• Conducted audience/user research and designed actionable frameworks\n• Boosted efficiency / engagement metrics by 35% through optimized strategy"}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 6: Experience & Internships */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">{t('resumeBuilder.secInternship')}</h2>
                  <button
                    type="button"
                    onClick={handleAddInternship}
                    className="btn-animate text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> {t('resumeBuilder.addInternship')}
                  </button>
                </div>

                {internships.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 space-y-3 relative">
                    {internships.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInternship(idx)}
                        className="absolute top-3 right-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 p-1.5 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.organization')}</label>
                        <input
                          type="text"
                          value={item.organization}
                          onChange={(e) => handleInternshipChange(idx, 'organization', e.target.value)}
                          placeholder="e.g. Zomato, Deloitte, ElevanceSkills, Design Studio, Startup"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.roleTitle')}</label>
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => handleInternshipChange(idx, 'role', e.target.value)}
                          placeholder="e.g. Marketing Intern, Software Intern, Graphic Designer, Analyst"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.duration')}</label>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => handleInternshipChange(idx, 'duration', e.target.value)}
                          placeholder="e.g. Mar 2025 – May 2025"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.internDesc')}</label>
                        <textarea
                          rows={2}
                          value={item.description}
                          onChange={(e) => handleInternshipChange(idx, 'description', e.target.value)}
                          placeholder={"• Collaborated across cross-functional departments to streamline key workflows\n• Prepared performance reports, analyzed datasets, and delivered presentation decks\n• Executed daily operational tasks resulting in improved team turnaround time"}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('resumeBuilder.certLink')}</label>
                        <input
                          type="text"
                          value={item.certificateLink}
                          onChange={(e) => handleInternshipChange(idx, 'certificateLink', e.target.value)}
                          placeholder="e.g. https://coursera.org/verify/... or Google Drive link"
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-850 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION 7: Certifications */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">{t('resumeBuilder.secCertifications')}</h2>
                  <button
                    type="button"
                    onClick={handleAddCertification}
                    className="btn-animate text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> {t('resumeBuilder.addCertification')}
                  </button>
                </div>

                {certifications.map((cert, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleCertificationChange(idx, 'name', e.target.value)}
                      placeholder="e.g. Digital Marketing Masterclass / Google Data Analytics / UI/UX Specialization"
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white"
                    />
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleCertificationChange(idx, 'issuer', e.target.value)}
                      placeholder={t('resumeBuilder.issuer')}
                      className="w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white"
                    />
                    {certifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* SECTION 8: Key Achievements & Honors */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">{t('resumeBuilder.secAchievements')}</h2>
                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    className="btn-animate text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> {t('resumeBuilder.addAchievement')}
                  </button>
                </div>

                {achievements.map((ach, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={ach}
                      onChange={(e) => handleAchievementChange(idx, e.target.value)}
                      placeholder="e.g. Increased social media engagement by 45% / Ranked Top 5 in National Case Study / Solved 300+ DSA problems"
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white"
                    />
                    {achievements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(idx)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                {errorMsg && (
                  <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 mr-auto">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={sendingOtp}
                  className="btn-animate inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-8 py-3.5 text-xs font-extrabold text-white shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {sendingOtp ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t('resumeBuilder.sendingOtp')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t('resumeBuilder.proceedBtn')}
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      )}

      {/* UNIFIED PAYMENT & VERIFICATION MODAL */}
      {modalStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800 text-left max-h-[85vh] overflow-y-auto">
            
            {/* Modal Error Banner if any */}
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: OTP VERIFICATION */}
            {modalStep === 'otp' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 dark:bg-sky-950 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 dark:text-sky-300 mb-1">
                      <ShieldCheck className="h-3 w-3" /> Step 1 of 2: Security Verification
                    </span>
                    <h3 className="font-sans text-lg font-extrabold text-slate-850 dark:text-white">
                      {t('resumeBuilder.otpModalTitle') || 'Security Verification'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setModalStep(null); setErrorMsg(''); }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('resumeBuilder.otpModalMsg', { email }) || `We've sent a 6-digit verification code to ${email}.`}
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    {t('resumeBuilder.otpLabel') || 'Enter 6-Digit OTP Code'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-center font-mono text-lg font-bold tracking-widest text-slate-850 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  {resendTimer > 0 ? (
                    <span className="text-slate-400 text-[11px]">
                      {t('resumeBuilder.resendIn', { seconds: resendTimer }) || `Resend OTP in ${resendTimer}s`}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={sendingOtp}
                      className="text-sky-600 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw className={`h-3 w-3 ${sendingOtp ? 'animate-spin' : ''}`} />
                      {t('resumeBuilder.resendBtn') || 'Resend OTP'}
                    </button>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setModalStep(null); setErrorMsg(''); }}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp}
                    className="btn-animate inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-50 transition"
                  >
                    {verifyingOtp ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      t('resumeBuilder.verifyBtn') || 'Verify & Continue'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PAYMENT METHOD CHOICE */}
            {modalStep === 'choice' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                      <Sparkles className="h-3 w-3" /> Step 2 of 2: Select Payment Option
                    </span>
                    <h3 className="font-sans text-lg font-extrabold text-slate-850 dark:text-white">
                      Choose Payment Method
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setModalStep(null); setErrorMsg(''); }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Price Summary Badge */}
                <div className="rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 p-4 border border-sky-100 dark:border-sky-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Item: AI ATS Resume PDF</p>
                    <p className="text-sm font-extrabold text-slate-850 dark:text-white">One-time Generation Fee</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400">₹50.00</span>
                    <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">One-time</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select your preferred payment option below:
                </p>

                {/* Options List */}
                <div className="space-y-3">
                  {/* Option 1: Razorpay Checkout */}
                  <button
                    type="button"
                    onClick={handlePayWithRazorpay}
                    disabled={processingPayment}
                    className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-400 bg-white dark:bg-slate-900 hover:bg-sky-50/40 dark:hover:bg-sky-950/30 transition-all group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="h-11 w-11 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 group-hover:scale-105 transition-transform shrink-0">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-sans text-sm font-bold text-slate-850 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                              Pay with Razorpay
                            </h4>
                            <span className="text-[10px] font-extrabold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-2 py-0.5 rounded-full">
                              Official Gateway
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            Test Mode Cards, UPI, Net Banking & Wallets
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </button>

                  {/* Option 2: Mock Payment */}
                  <button
                    type="button"
                    onClick={() => { setModalStep('mock'); setUtrNumber(''); setErrorMsg(''); }}
                    disabled={processingPayment}
                    className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 bg-white dark:bg-slate-900 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="h-11 w-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
                          <QrCode className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-sans text-sm font-bold text-slate-850 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              Mock / Test Payment
                            </h4>
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                              Demo QR
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            Simulated QR code & manual Transaction ID (quick demo)
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setModalStep('otp')}
                    className="font-bold text-sky-600 hover:underline"
                  >
                    ← Back to Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => { setModalStep(null); setErrorMsg(''); }}
                    className="font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: MOCK PAYMENT MODAL (QR CODE + UTR) */}
            {modalStep === 'mock' && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white">
                      {t('resumeBuilder.paymentModalTitle') || 'Mock Payment — ₹50'}
                    </h3>
                    <p className="text-xs text-slate-500">Simulated Payment Portal</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setModalStep(null); setErrorMsg(''); }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 p-4 border border-sky-100 dark:border-sky-800 text-xs">
                  <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                    <span>{t('resumeBuilder.featureLabel') || 'Feature:'}</span>
                    <span>{t('resumeBuilder.featureValue') || 'PDF Resume Builder'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sky-600 dark:text-sky-400 mt-1 text-sm">
                    <span>{t('resumeBuilder.amountLabel') || 'Amount:'}</span>
                    <span>₹50.00</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {t('resumeBuilder.paymentMethod') || 'Payment Method'}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white"
                    >
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="NetBanking">Net Banking</option>
                    </select>
                  </div>

                  {paymentMethod === 'UPI' && <MockPaymentQR />}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      {t('resumeBuilder.utrLabel') || 'Transaction ID / UTR Number'}
                    </label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder={t('resumeBuilder.utrPlaceholder') || 'Enter test UTR number (e.g. 1234567890)'}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-850 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setModalStep('choice'); setErrorMsg(''); }}
                    className="text-xs font-bold text-sky-600 hover:underline"
                  >
                    ← Back to Choice
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setModalStep(null); setErrorMsg(''); }}
                      className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      {t('common.cancel') || 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={processingPayment}
                      className="btn-animate inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('resumeBuilder.generatingPdf') || 'Generating PDF...'}
                        </>
                      ) : (
                        t('resumeBuilder.yesPaid') || 'Yes, I\'ve Paid ₹50'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FALLBACK (if state is unexpected) */}
            {!['otp', 'choice', 'mock'].includes(modalStep) && (
              <div className="p-4 text-center space-y-3">
                <p className="text-sm font-bold text-rose-600">Unexpected modal state.</p>
                <button
                  type="button"
                  onClick={() => setModalStep(null)}
                  className="rounded-xl bg-slate-800 text-white px-4 py-2 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default ResumeBuilder;
