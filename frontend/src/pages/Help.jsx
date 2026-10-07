import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  ChevronDown,
  Mail,
  Compass,
  Briefcase,
  Sparkles,
  CreditCard,
  UserCheck,
  Globe,
  HelpCircle,
  X,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Send,
  PlusCircle,
  Users,
  Building2,
  Award,
  ShieldCheck
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: Compass,
    color: 'from-sky-500 to-blue-600',
    description: 'Account creation, roles, and platform basics'
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: Briefcase,
    color: 'from-blue-500 to-indigo-600',
    description: 'Applying, tracking status, and recruiter reviews'
  },
  {
    id: 'resume-builder',
    label: 'Resume Builder',
    icon: Sparkles,
    color: 'from-indigo-500 to-purple-600',
    description: 'AI templates, PDF generation, and OTP checkout'
  },
  {
    id: 'subscriptions',
    label: 'Subscription & Payments',
    icon: CreditCard,
    color: 'from-emerald-500 to-teal-600',
    description: 'Candidate plans, payment windows, and invoices'
  },
  {
    id: 'account-profile',
    label: 'Account & Profile',
    icon: UserCheck,
    color: 'from-amber-500 to-orange-600',
    description: 'Password reset, 2FA OTP, and login history'
  },
  {
    id: 'public-space',
    label: 'Public Space',
    icon: Globe,
    color: 'from-pink-500 to-rose-600',
    description: 'Networking, daily post limits, and comments'
  }
];

const FAQ_DATA = [
  // Getting Started
  {
    id: 'gs-1',
    category: 'getting-started',
    question: 'How do I create an account on InternConnect?',
    answer: 'Click the "Sign In" or "Register" button in the top navigation bar. Select whether you are registering as a Student Candidate or an Employer/Recruiter, provide your full name, email address, and secure password, then click "Register Account" to get instant access.'
  },
  {
    id: 'gs-2',
    category: 'getting-started',
    question: 'How do I switch between candidate and recruiter roles?',
    answer: 'Account roles (Student Candidate vs. Recruiter) are assigned upon registration to tailor dashboard metrics and permissions. If you need to access both candidate hiring and student application features, you can create separate accounts with distinct emails.'
  },
  {
    id: 'gs-3',
    category: 'getting-started',
    question: 'Which browsers are supported?',
    answer: 'InternConnect is fully optimized for all modern desktop and mobile browsers, including Google Chrome, Mozilla Firefox, Microsoft Edge, and Apple Safari. For enhanced security, Google Chrome logins include dual-factor email OTP verification.'
  },
  {
    id: 'gs-4',
    category: 'getting-started',
    question: 'Is InternConnect free to use for students?',
    answer: 'Yes! Searching opportunities, applying to internships and jobs, connecting with friends in the Public Space, and managing your applications on the candidate dashboard is completely free. Optional premium upgrades (like the AI PDF Resume Builder and Pro Subscriptions) are also available.'
  },
  {
    id: 'gs-5',
    category: 'getting-started',
    question: 'Why is mobile browser login restricted to certain hours?',
    answer: 'In accordance with our platform security and access schedule rules, mobile browser logins are permitted between 10:00 AM and 1:00 PM IST. Desktop access remains unrestricted 24/7.'
  },

  // Applications
  {
    id: 'app-1',
    category: 'applications',
    question: 'How do I apply for an internship or job listing?',
    answer: 'Navigate to "Browse Opportunities", click on any listing card that matches your interests to open the Listing Detail page, review the stipend, duration, and requirements, and click "Apply Instantly". You can attach a customized cover note before submitting.'
  },
  {
    id: 'app-2',
    category: 'applications',
    question: 'How does the Smart Eligibility Matching score work?',
    answer: 'Our algorithm automatically compares your profile skills, degree, graduation year, and preferred fields against the requirements of each listing. You will see a match badge (High Eligibility, Low Eligibility, or Not Eligible) along with an explanation score on the detail page.'
  },
  {
    id: 'app-3',
    category: 'applications',
    question: 'How do I track the status of my submitted applications?',
    answer: 'Click on "My Applications" in the navigation bar or from your Candidate Dashboard. You can monitor your application state in real-time as employers transition candidates through Applied, Shortlisted, Hired, or Rejected stages.'
  },
  {
    id: 'app-4',
    category: 'applications',
    question: 'Can I bookmark or save listings to apply later?',
    answer: 'Yes! Click the Bookmark icon in the top right of any listing card on the browse page or detail page. Bookmarked opportunities are saved to your profile and tracked in the "Bookmarks" counter on your Candidate Dashboard.'
  },
  {
    id: 'app-5',
    category: 'applications',
    question: 'How do recruiters review and manage applicants?',
    answer: 'Recruiters have access to the interactive Applicant Tracker Kanban Suite. They can drag applicant cards between stages, view uploaded PDF resumes directly, and update candidate hiring statuses.'
  },

  // Resume Builder
  {
    id: 'rb-1',
    category: 'resume-builder',
    question: 'How much does the AI PDF Resume Builder cost?',
    answer: 'The AI-Powered PDF Resume Builder is available for a one-time fee of ₹49 per generated PDF resume. It provides ATS-optimized templates, customizable sections, and high-resolution PDF download.'
  },
  {
    id: 'rb-2',
    category: 'resume-builder',
    question: 'Is OTP verification required before making a resume payment?',
    answer: 'Yes. To protect candidate data and comply with verification standards, a 6-digit verification code is sent to your registered email before initiating the payment step.'
  },
  {
    id: 'rb-3',
    category: 'resume-builder',
    question: 'What templates and customization options are available?',
    answer: 'You can choose between multiple professional layouts (Modern Clean, Tech Minimal, and Executive). You can populate your education, experience, achievements, technical skills, and hobbies, and preview the live PDF document in real time.'
  },
  {
    id: 'rb-4',
    category: 'resume-builder',
    question: 'Can I edit my resume after creating it?',
    answer: 'Yes, your profile information can be updated anytime in "My Profile & Resume". You can re-enter the Resume Builder to adjust layout sections or generate fresh tailored versions for specific job roles.'
  },
  {
    id: 'rb-5',
    category: 'resume-builder',
    question: 'Where can I access my uploaded resume PDF for applications?',
    answer: 'Your active resume is linked to your student profile under "My Profile & Resume". Whenever you apply to an internship or job on InternConnect, employers can view your attached PDF directly.'
  },

  // Subscription & Payments
  {
    id: 'sub-1',
    category: 'subscriptions',
    question: 'What subscription plans are available on InternConnect?',
    answer: 'We offer flexible plans including Starter (₹199/month), Pro Career (₹499/month), and Annual Enterprise (₹1,499/year). Premium plans unlock verified badge recognition, priority candidate ranking in employer searches, and unlimited application submissions.'
  },
  {
    id: 'sub-2',
    category: 'subscriptions',
    question: 'When can I make subscription payments?',
    answer: 'Subscription payments are scheduled and processed during the daily payment window from 10:00 AM to 11:00 AM IST. During development/testing mode, mock payment simulation allows instant upgrades at any time.'
  },
  {
    id: 'sub-3',
    category: 'subscriptions',
    question: 'What payment methods are accepted?',
    answer: 'We support all major payment options via Razorpay including UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), and Net Banking.'
  },
  {
    id: 'sub-4',
    category: 'subscriptions',
    question: 'How do I receive an invoice for my transaction?',
    answer: 'Upon successful checkout, an official transaction receipt containing your Payment ID, Plan Tier, and Timestamp is generated and emailed to your registered address.'
  },
  {
    id: 'sub-5',
    category: 'subscriptions',
    question: 'How do I check my active plan status and renewal date?',
    answer: 'Navigate to "Plans & Pricing" in the navigation bar. If you have an active subscription, your current plan tier, status badge, and validity period will be displayed at the top of the page.'
  },

  // Account & Profile
  {
    id: 'acc-1',
    category: 'account-profile',
    question: 'How do I reset my password if I forget it?',
    answer: 'On the Sign In page, click "Forgot Password?". Enter your registered email address to receive a 6-digit security OTP code, verify it, and securely create a new password.'
  },
  {
    id: 'acc-2',
    category: 'account-profile',
    question: 'Why did I receive an OTP when logging in on Google Chrome?',
    answer: 'To prevent unauthorized account takeovers and ensure device authentication, all logins initiated from Google Chrome require an instant 6-digit email OTP confirmation.'
  },
  {
    id: 'acc-3',
    category: 'account-profile',
    question: 'How do I update my profile details and completeness score?',
    answer: 'Go to your Candidate Dashboard and open "My Profile & Resume". Filling out your college, degree, graduation year, location, skills, bio, and resume will boost your Profile Completeness up to 100%.'
  },
  {
    id: 'acc-4',
    category: 'account-profile',
    question: 'Where can I inspect my recent login history and active sessions?',
    answer: 'Click on your profile avatar in the navigation bar and select "Login History" to view recorded session timestamps, IP addresses, operating systems, and browser clients.'
  },
  {
    id: 'acc-5',
    category: 'account-profile',
    question: 'How do I switch the website language?',
    answer: 'Use the Language Selector dropdown in the top navbar to choose between English, Spanish, Hindi, Portuguese, Chinese, or French. Selecting French requires a one-time OTP verification.'
  },

  // Public Space
  {
    id: 'ps-1',
    category: 'public-space',
    question: 'What is the Public Space and who can access it?',
    answer: 'Public Space is InternConnect’s community social feed where registered students and recruiters can post career updates, project milestones, photos, and videos to network with peers.'
  },
  {
    id: 'ps-2',
    category: 'public-space',
    question: 'How do daily post limit rules work?',
    answer: 'Daily post limits are tied to your friendship network: users with 0 friends cannot publish posts, users with 1–10 friends can publish up to their friend count per day, and users with more than 10 friends unlock unlimited daily posting.'
  },
  {
    id: 'ps-3',
    category: 'public-space',
    question: 'How do I add friends in the Public Space?',
    answer: 'In Public Space, switch to the "My Friends" tab. Use the search bar to find candidates or recruiters by name and click "Add Friend" to send a connection request.'
  },
  {
    id: 'ps-4',
    category: 'public-space',
    question: 'How do I share a post with others?',
    answer: 'Click the "Share" button beneath any post to open the social sharing popover. You can share directly to WhatsApp, Facebook, Gmail, Twitter/X, LinkedIn, or copy the direct link.'
  },
  {
    id: 'ps-5',
    category: 'public-space',
    question: 'Can I delete comments or moderate discussions on my posts?',
    answer: 'Yes! You can delete any comment you have authored. If you are the author of the post, you can delete any comment on your post and pin helpful comments to the top.'
  }
];

// Recruiter Categories & FAQs
const RECRUITER_CATEGORIES = [
  {
    id: 'posting-opportunity',
    label: 'Posting an Opportunity',
    icon: PlusCircle,
    color: 'from-sky-500 to-blue-600',
    description: 'Creating roles, setting deadlines, skills, and editing listings'
  },
  {
    id: 'tracking-applicants',
    label: 'Tracking Applicants',
    icon: Users,
    color: 'from-blue-500 to-indigo-600',
    description: 'Kanban pipelines, reviewing resume PDFs, and hiring status'
  },
  {
    id: 'managing-company',
    label: 'Managing Company Profile',
    icon: Building2,
    color: 'from-indigo-500 to-purple-600',
    description: 'Company details, logos, verified badges, and public pages'
  },
  {
    id: 'employer-plans',
    label: 'Employer Plans',
    icon: CreditCard,
    color: 'from-emerald-500 to-teal-600',
    description: 'Recruiter subscription tiers, payment windows, and invoices'
  },
  {
    id: 'account-security',
    label: 'Account & Security',
    icon: UserCheck,
    color: 'from-amber-500 to-orange-600',
    description: 'Chrome login OTP, password resets, and session audit logs'
  }
];

const RECRUITER_FAQ_DATA = [
  // Posting an Opportunity
  {
    id: 'rec-post-1',
    category: 'posting-opportunity',
    question: 'How do I post a new internship or job opportunity?',
    answer: 'Navigate to the Recruiter Dashboard and click "Post Opportunity" or "Create New Posting". Fill out the job title, domain category, work mode (onsite, hybrid, or remote), location, duration, stipend range, application deadline, and job description, then click "Publish Opportunity".'
  },
  {
    id: 'rec-post-2',
    category: 'posting-opportunity',
    question: 'How do I set and manage application deadlines and start dates?',
    answer: 'When posting or editing a role, specify the "Application Deadline" and "Estimated Start Date" using the calendar date pickers. The deadline is prominently displayed on the listing card and in candidate search results.'
  },
  {
    id: 'rec-post-3',
    category: 'posting-opportunity',
    question: 'How do skill tags influence candidate matching?',
    answer: 'Required skills are matched in real-time against candidate profile skills. Our Smart Eligibility Matching score automatically calculates compatibility (High Eligibility, Low Eligibility) and ranks matching candidates higher in your applicant view.'
  },
  {
    id: 'rec-post-4',
    category: 'posting-opportunity',
    question: 'How do I edit or delete an active opportunity posting?',
    answer: 'On your Recruiter Dashboard, locate the role in the "Your Opportunity Postings" table. Under the ACTIONS column, click "Edit" to modify details in the edit modal, or click "Delete" to permanently remove the listing and its associated applications.'
  },
  {
    id: 'rec-post-5',
    category: 'posting-opportunity',
    question: 'Can I temporarily close a posting without deleting it?',
    answer: 'Yes. In the Edit Opportunity modal on your Recruiter Dashboard, switch the Status dropdown from "Active" to "Closed" and save. Closed postings will no longer accept new candidate submissions.'
  },

  // Tracking Applicants
  {
    id: 'rec-track-1',
    category: 'tracking-applicants',
    question: 'How do I access the interactive Applicant Tracker Kanban board?',
    answer: 'From your Recruiter Dashboard, click the "Track" button next to any opportunity in your postings table, or navigate directly to the Applicant Tracker to view candidates organized by pipeline columns (Applied, Shortlisted, Hired, Rejected).'
  },
  {
    id: 'rec-track-2',
    category: 'tracking-applicants',
    question: 'How do I view and download candidate resume PDFs?',
    answer: 'Inside the Applicant Tracker, click on any candidate card to view their profile overview, cover note, and attached resume PDF. You can preview the resume directly in the browser or download it for offline review.'
  },
  {
    id: 'rec-track-3',
    category: 'tracking-applicants',
    question: 'How do I update an applicant’s hiring stage?',
    answer: 'You can drag and drop applicant cards between Kanban columns, or select a new status from the candidate details modal. The candidate’s application status will update instantly across the platform.'
  },
  {
    id: 'rec-track-4',
    category: 'tracking-applicants',
    question: 'Do candidates receive notifications when their application status changes?',
    answer: 'Yes! When you shortlist, hire, or reject an applicant, a real-time notification is delivered to the candidate via WebSocket and updated on their "My Applications" tracking dashboard.'
  },
  {
    id: 'rec-track-5',
    category: 'tracking-applicants',
    question: 'How do I filter and search through applicants?',
    answer: 'The Applicant Tracker includes real-time search and filtering options by candidate name, college, skills match percentage, and application submission date.'
  },

  // Managing Company Profile
  {
    id: 'rec-comp-1',
    category: 'managing-company',
    question: 'How do I create or update my company profile?',
    answer: 'Click "Edit Company Profile" on your Recruiter Dashboard or navigate to "/company-profile" from your profile avatar menu. You can provide your company name, logo image, website URL, industry domain, team size, and company overview.'
  },
  {
    id: 'rec-comp-2',
    category: 'managing-company',
    question: 'How does the company logo appear across listings?',
    answer: 'Your uploaded company logo is displayed on the Recruiter Dashboard header, in listing cards on the Browse Opportunities page, and on individual listing detail pages to give candidates brand familiarity.'
  },
  {
    id: 'rec-comp-3',
    category: 'managing-company',
    question: 'How do I obtain a "Verified Employer" badge?',
    answer: 'Once you complete your company profile details (including website, industry domain, and official email verification), your company receives the "Verified Employer" trust badge across all opportunity postings.'
  },
  {
    id: 'rec-comp-4',
    category: 'managing-company',
    question: 'Can candidates view all open roles by my company in one place?',
    answer: 'Yes. Candidates can click your company name on any listing detail page to view your Public Company Space and see all active openings hosted by your organization.'
  },

  // Employer Plans
  {
    id: 'rec-plan-1',
    category: 'employer-plans',
    question: 'What employer hiring plans are available on InternConnect?',
    answer: 'We provide Standard Employer (free posting up to active limit), Growth Recruiter, and Enterprise Hiring packages. Growth and Enterprise plans include unlimited job postings, highlighted featured listings, and priority candidate indexing.'
  },
  {
    id: 'rec-plan-2',
    category: 'employer-plans',
    question: 'When and how can recruiter plan payments be processed?',
    answer: 'Subscription payments can be processed through our secure Razorpay gateway supporting UPI, Corporate Cards, and Net Banking during regular platform billing windows.'
  },
  {
    id: 'rec-plan-3',
    category: 'employer-plans',
    question: 'Where can I access employer payment invoices and GST receipts?',
    answer: 'Official payment receipts and invoices are generated automatically after each transaction and dispatched directly to your registered employer email.'
  },
  {
    id: 'rec-plan-4',
    category: 'employer-plans',
    question: 'Can multiple recruiters collaborate under the same company account?',
    answer: 'Enterprise accounts can link multiple recruiter email credentials under a unified company profile to share applicant Kanban boards and manage hiring pipelines collaboratively.'
  },

  // Account & Security
  {
    id: 'rec-sec-1',
    category: 'recruiter-account',
    question: 'Why is Chrome OTP verification required during recruiter login?',
    answer: 'To protect proprietary company job postings and confidential applicant resume data, logins initiated on Google Chrome require a 6-digit email OTP verification step.'
  },
  {
    id: 'rec-sec-2',
    category: 'recruiter-account',
    question: 'How do I monitor recruiter account access and login history?',
    answer: 'Click on your profile avatar in the navigation bar and select "Login History" to view recorded session audit logs, including login timestamps, browser clients, operating systems, and IP addresses.'
  },
  {
    id: 'rec-sec-3',
    category: 'recruiter-account',
    question: 'How do I reset my recruiter account password?',
    answer: 'On the Sign In page, click "Forgot Password?". Enter your registered employer email to receive a secure OTP code and create a new password.'
  },
  {
    id: 'rec-sec-4',
    category: 'recruiter-account',
    question: 'How do I change the display language for the recruiter portal?',
    answer: 'Select your preferred language (English, Spanish, Hindi, Portuguese, Chinese, or French) from the Language Selector dropdown in the top navbar.'
  }
];

const Help = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isRecruiter = user?.role === 'recruiter';

  const categories = isRecruiter ? RECRUITER_CATEGORIES : CATEGORIES;
  const rawFaqData = isRecruiter ? RECRUITER_FAQ_DATA : FAQ_DATA;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openAccordions, setOpenAccordions] = useState({});

  const toggleAccordion = (id) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    if (catId !== 'all') {
      const el = document.getElementById(`category-${catId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Filter FAQs based on search and active category
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return rawFaqData.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchesQuery =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [rawFaqData, searchQuery, activeCategory]);

  // Group filtered FAQs by category
  const groupedFaqs = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id] = [];
    });
    filteredFaqs.forEach((faq) => {
      if (map[faq.category]) {
        map[faq.category].push(faq);
      }
    });
    return map;
  }, [categories, filteredFaqs]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-indigo-700 dark:from-slate-900 dark:via-sky-950 dark:to-slate-950 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 shadow-lg">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 dark:bg-sky-900/60 px-4 py-1.5 text-xs font-bold text-sky-100 backdrop-blur-md border border-white/20">
            <HelpCircle className="h-4 w-4 text-sky-200" />
            <span>Help Center & Knowledge Base</span>
          </div>

          <h1 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            How can we help? 🙋
          </h1>

          <p className="text-sm sm:text-base text-sky-100 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isRecruiter
              ? 'Search our recruiter help topics or browse categories below for guidance on posting opportunities, managing applicant pipelines, and company profile settings.'
              : 'Search our help topics or browse by category below to find answers about internships, applications, resume generation, and account settings.'}
          </p>

          {/* Search Bar */}
          <div className="pt-2 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRecruiter ? "Type a question or keyword (e.g., post, pipeline, deadline, applicant, plan)..." : "Type a question or keyword (e.g., resume, subscription, apply, otp)..."}
                className="w-full rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white pl-12 pr-10 py-4 text-sm font-medium shadow-2xl border border-white/20 dark:border-slate-800 outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-xs text-sky-100 dark:text-slate-400 text-left pl-2">
                Found {filteredFaqs.length} matching {filteredFaqs.length === 1 ? 'answer' : 'answers'} for "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
        
        {/* Category Pills Row */}
        <section className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                activeCategory === 'all'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400'
              }`}
            >
              All Topics
            </button>

            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Category Feature Cards (When showing all topics) */}
        {!searchQuery && activeCategory === 'all' && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-sky-500/40 dark:hover:border-sky-500/40 transition-all cursor-pointer group text-left"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {cat.label}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Accordion FAQ Sections Grouped by Category */}
        <section className="space-y-10 text-left">
          {categories.map((cat) => {
            const faqs = groupedFaqs[cat.id] || [];
            if (faqs.length === 0) return null;

            const Icon = cat.icon;

            return (
              <div
                key={cat.id}
                id={`category-${cat.id}`}
                className="scroll-mt-24 space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-center gap-2.5 border-b border-slate-200/80 dark:border-slate-800 pb-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-xs`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {cat.label}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* FAQ List for this Category */}
                <div className="space-y-3">
                  {faqs.map((faq) => {
                    const isOpen = Boolean(openAccordions[faq.id] || (searchQuery && faqs.length <= 3));

                    return (
                      <div
                        key={faq.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isOpen
                            ? 'border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-900 shadow-sm'
                            : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleAccordion(faq.id)}
                          className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left font-bold text-sm text-slate-900 dark:text-white cursor-pointer focus:outline-none"
                        >
                          <span className="leading-snug">{faq.question}</span>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                              isOpen ? 'transform rotate-180 text-sky-600 dark:text-sky-400' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-5 sm:px-5 text-xs text-slate-650 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3 animate-in fade-in duration-200">
                            <p className="whitespace-pre-line">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
              <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">No matching help articles found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                We couldn't find any FAQs matching "{searchQuery}". Try using different keywords or contact our team below.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 text-xs font-bold transition cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </section>

        {/* PART 2 — Single Contact Option: Send Email Card */}
        <section className="pt-4">
          <div className="rounded-3xl border border-sky-200/80 dark:border-sky-900/60 bg-gradient-to-br from-sky-50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/40 p-8 sm:p-10 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <div className="flex items-start gap-4 max-w-xl">
              <div className="p-3.5 rounded-2xl bg-sky-600 text-white shadow-md shrink-0">
                <Mail className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                  Still need help?
                </span>
                <h3 className="font-sans text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Can't find your answer?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isRecruiter
                    ? 'Our employer support team is ready to assist you with job postings, applicant pipelines, company verification, or recruiter plans.'
                    : 'Our support team is always ready to assist you with any questions regarding internships, applications, resume builder, or account access.'}
                </p>
              </div>
            </div>

            <a
              href="mailto:support@internconnect.com?subject=Support%20Request%20-%20InternConnect"
              className="btn-animate inline-flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white px-6 py-3.5 text-xs sm:text-sm font-bold shadow-lg shadow-sky-600/25 transition-all shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>Send Email</span>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Help;
