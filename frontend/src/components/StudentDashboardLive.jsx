import React, { useState } from 'react';
import {
  Briefcase, CheckCircle, Clock, Bookmark, Search, Filter,
  MapPin, DollarSign, Calendar, ChevronDown, Award, Sparkles, RefreshCw, User
} from 'lucide-react';

export default function StudentDashboardLive({
  userName = 'Candidate',
  profileCompletion = 75,
  initialStats = { applied: 1, shortlisted: 1, hired: 1, saved: 3 },
  onExplore = () => {},
  onAction = () => {},
  applications = [],
  recommended = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [minStipend, setMinStipend] = useState(0);
  const [workFromHome, setWorkFromHome] = useState(false);
  const [activeTab, setActiveTab] = useState('Candidate Dashboard');

  const stats = [
    {
      label: 'Submitted Applications',
      count: initialStats.applied,
      tag: '+2 this week',
      tagColor: 'bg-indigo-50 text-indigo-600',
      icon: Briefcase,
      iconBg: 'bg-indigo-50 text-indigo-500',
      actionKey: 'view-applications'
    },
    {
      label: 'Shortlisted Rounds',
      count: initialStats.shortlisted,
      tag: 'Action Required',
      tagColor: 'bg-amber-50 text-amber-600 border border-amber-200',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-500',
      actionKey: 'view-shortlisted'
    },
    {
      label: 'Selected & Offers',
      count: initialStats.hired,
      tag: 'Direct Selection',
      tagColor: 'bg-emerald-50 text-emerald-600',
      icon: CheckCircle,
      iconBg: 'bg-emerald-50 text-emerald-500',
      actionKey: 'view-hired'
    },
    {
      label: 'Saved Opportunities',
      count: initialStats.saved,
      tag: 'Expiring soon',
      tagColor: 'bg-rose-50 text-rose-600',
      icon: Bookmark,
      iconBg: 'bg-rose-50 text-rose-500',
      actionKey: 'view-saved'
    }
  ];

  // Use live recommended listings if available, else use mockup
  const jobsData = recommended.length > 0
    ? recommended.map((listing, i) => ({
        id: listing._id || i,
        title: listing.title || 'Internship',
        company: listing.company || '',
        location: listing.location || 'India',
        stipend: listing.stipend ? `₹${listing.stipend}/month` : 'Unpaid',
        duration: listing.duration || '3 Months',
        skills: listing.skills || [],
        match: `${95 - i * 7}%`,
        posted: 'Recently',
        tags: ['Actively hiring', 'Internship'],
        realId: listing._id
      }))
    : [
        {
          id: 1,
          title: 'Backend Developer',
          company: 'CT',
          location: 'Bangalore, India',
          stipend: 'Unpaid',
          duration: '6 Months',
          skills: ['React', 'JavaScript', 'HTML', 'CSS'],
          match: '95%',
          posted: '1 month ago',
          tags: ['Be an early applicant', 'Internship', 'Applied']
        },
        {
          id: 2,
          title: 'Telecaller Executive',
          company: 'TeleCaller Corp',
          location: 'Delhi',
          stipend: '₹18,000 - 22,000 /month',
          duration: '6 Months',
          skills: ['English', 'Communication'],
          match: '88%',
          posted: 'Few hours ago',
          tags: ['Actively hiring', 'Internship']
        }
      ];

  const filteredJobs = jobsData.filter(job => {
    const matchSearch = !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = selectedType === 'All' || job.tags.some(t => t.toLowerCase().includes(selectedType.toLowerCase()));
    return matchSearch && matchType;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-800 font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-xl font-bold flex items-center justify-center h-10 w-10 text-lg shadow-md shadow-indigo-100">
              IC
            </div>
            <span className="text-xl font-extrabold text-indigo-900 tracking-tight">InternConnect</span>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            {['Browse Opportunities', 'Public Space', 'Candidate Dashboard', 'My Applications'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Browse Opportunities') onExplore();
                  if (tab === 'My Applications') onAction('view-applications');
                }}
                className={`text-sm font-semibold transition-all px-1 py-2 relative ${
                  activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-500'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onAction('resume-builder')}
            className="hidden md:flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-medium transition text-slate-600"
          >
            <span>📝 Resume Builder</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Pro</span>
          </button>

          <button
            onClick={onExplore}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            Explore Roles →
          </button>

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          <button
            onClick={() => onAction('complete-profile')}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-xl transition"
          >
            <div className="bg-blue-100 text-blue-700 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-bold text-slate-700 hidden sm:inline">{userName}</span>
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-[1440px] mx-auto px-6 py-6 space-y-8">

        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-100/30 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12"></div>

          <div className="space-y-4 max-w-2xl relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100/60 text-indigo-800 text-xs font-bold rounded-full">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              Verified Candidate Portal
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-indigo-950 tracking-tight leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{userName}!</span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Track your applications in real-time, get fast-tracked by verified recruiters, and expand your portfolio with custom action plans.
            </p>
          </div>

          <div className="flex items-center gap-6 relative z-10 w-full md:w-auto justify-center">
            <div className="hidden lg:flex relative h-32 w-32 bg-indigo-600/10 rounded-2xl border border-indigo-100 items-center justify-center overflow-visible">
              <span className="text-5xl animate-bounce">🚀</span>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xl shadow-indigo-100/40 border border-slate-100/80 w-full max-w-[240px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-extrabold text-slate-500 uppercase">Profile Strength</span>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              <button
                onClick={() => onAction('complete-profile')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition flex items-center justify-between w-full"
              >
                <span>Complete tasks to boost rank</span>
                <span>Boost Now →</span>
              </button>
            </div>
          </div>
        </section>

        {/* METRICS ROW */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <button
              key={i}
              onClick={() => onAction(stat.actionKey)}
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-36 group hover:border-indigo-100 text-left cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className={`${stat.iconBg} p-2.5 rounded-xl transition-all group-hover:scale-105`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] md:text-xs font-extrabold px-2.5 py-1 rounded-full ${stat.tagColor}`}>
                  {stat.tag}
                </span>
              </div>
              <div className="mt-auto">
                <h3 className="text-3xl font-black text-slate-900 leading-none mb-1">{stat.count}</h3>
                <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
              </div>
            </button>
          ))}
        </section>

        {/* COMBINED FILTER + LISTINGS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT FILTER PANE */}
          <aside className="lg:col-span-4 xl:col-span-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-extrabold text-slate-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" /> Filters
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('All');
                  setMinStipend(0);
                  setWorkFromHome(false);
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Type */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider block">Type</label>
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50/50 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                >
                  <option>All</option>
                  <option>Development</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Work from Home */}
            <div className="flex items-center justify-between bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
              <span className="text-xs font-bold text-slate-700">🛋️ Work from home</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={workFromHome}
                  onChange={(e) => setWorkFromHome(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Stipend Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Min monthly stipend</span>
                <span className="text-indigo-600 font-extrabold">₹{minStipend === 0 ? '0' : `${minStipend}K`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={minStipend}
                onChange={(e) => setMinStipend(Number(e.target.value))}
                className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>0</span>
                <span>2K</span>
                <span>4K</span>
                <span>6K</span>
                <span>8K</span>
                <span>10K</span>
              </div>
            </div>
          </aside>

          {/* MAIN OPPORTUNITIES LIST */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">

            {/* Search + Sort Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search job title, skills, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white rounded-xl placeholder-slate-400"
                />
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-4">
                <span className="text-xs font-extrabold text-slate-500 whitespace-nowrap">
                  {filteredJobs.length} Opportunities
                </span>
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1">
                  <span className="text-xs font-bold text-slate-500 px-1">Sort:</span>
                  <select className="border-0 focus:ring-0 focus:outline-none text-xs font-extrabold text-indigo-600 pr-4">
                    <option>Newest First</option>
                    <option>Most Relevant</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Resume Card */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-tr from-amber-400 to-orange-500 p-3 rounded-xl shadow-lg shadow-orange-500/20">
                  <Sparkles className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h4 className="font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Generate Custom Resume</h4>
                  <p className="text-xs text-slate-300">Auto-tailor ATS score specifically for target job description using Live AI matching.</p>
                </div>
              </div>
              <button
                onClick={() => onAction('tailor-resume')}
                className="bg-white hover:bg-slate-50 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs transition whitespace-nowrap"
              >
                Create with AI ✨
              </button>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recommended Opportunities</h2>

              {filteredJobs.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-slate-400">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="font-semibold">No results found. Try adjusting your search.</p>
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <article key={job.id} className="bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl p-5 hover:shadow-lg hover:shadow-indigo-50/20 transition-all space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-0.5 rounded-md">
                            MATCH {job.match}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">{job.posted}</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-950 capitalize">{job.title}</h3>
                        <p className="text-sm font-bold text-slate-500">{job.company}</p>
                      </div>

                      <button
                        onClick={() => onAction('view-saved')}
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition"
                      >
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-y border-slate-100/60 text-slate-500 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-indigo-500" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-indigo-500" />
                        <span>{job.stipend}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span>{job.duration}</span>
                      </div>
                    </div>

                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <span key={index} className="bg-slate-50 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider ${
                              tag === 'Applied' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              tag === 'Actively hiring' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => job.realId ? onAction(`apply-${job.realId}`) : onExplore()}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold px-5 py-2.5 rounded-xl text-xs transition"
                      >
                        Apply Now
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 mt-20 bg-white py-6 text-center text-xs font-bold text-slate-400">
        &copy; 2026 InternConnect. All rights reserved. Built with premium light standards.
      </footer>

    </div>
  );
}
