import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Code, Briefcase, Building2, Sparkles, ArrowRight, Layers } from 'lucide-react';

const ExploreOpportunities = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const internshipsByLocation = [
    { label: 'Bangalore', query: { type: 'internship', location: 'Bangalore' } },
    { label: 'Hyderabad', query: { type: 'internship', location: 'Hyderabad' } },
    { label: 'Pune', query: { type: 'internship', location: 'Pune' } },
    { label: 'Mumbai', query: { type: 'internship', location: 'Mumbai' } },
    { label: 'Delhi', query: { type: 'internship', location: 'Delhi' } },
    { label: 'Noida', query: { type: 'internship', location: 'Noida' } },
    { label: 'Gurgaon', query: { type: 'internship', location: 'Gurgaon' } },
    { label: 'Chennai', query: { type: 'internship', location: 'Chennai' } },
    { label: 'Kolkata', query: { type: 'internship', location: 'Kolkata' } },
    { label: 'Jaipur', query: { type: 'internship', location: 'Jaipur' } },
    { label: 'Ahmedabad', query: { type: 'internship', location: 'Ahmedabad' } },
    { label: 'Indore', query: { type: 'internship', location: 'Indore' } },
    { label: 'Lucknow', query: { type: 'internship', location: 'Lucknow' } },
    { label: 'Kochi', query: { type: 'internship', location: 'Kochi' } },
    { label: 'Chandigarh', query: { type: 'internship', location: 'Chandigarh' } },
    { label: 'Work From Home Internships', query: { type: 'internship', workMode: 'remote' } },
  ];

  const internshipsByCategory = [
    { label: 'Computer Science', query: { type: 'internship', q: 'Computer Science' } },
    { label: 'Web Development', query: { type: 'internship', q: 'Web Development' } },
    { label: 'Java', query: { type: 'internship', q: 'Java' } },
    { label: 'Python', query: { type: 'internship', q: 'Python' } },
    { label: 'React', query: { type: 'internship', q: 'React' } },
    { label: 'Node.js', query: { type: 'internship', q: 'Node.js' } },
    { label: 'Data Science', query: { type: 'internship', q: 'Data Science' } },
    { label: 'Artificial Intelligence', query: { type: 'internship', q: 'AI' } },
    { label: 'Machine Learning', query: { type: 'internship', q: 'Machine Learning' } },
    { label: 'UI/UX', query: { type: 'internship', q: 'UI UX' } },
    { label: 'Graphic Design', query: { type: 'internship', q: 'Graphic Design' } },
    { label: 'Digital Marketing', query: { type: 'internship', q: 'Marketing' } },
    { label: 'Finance', query: { type: 'internship', q: 'Finance' } },
    { label: 'HR', query: { type: 'internship', q: 'HR' } },
    { label: 'Content Writing', query: { type: 'internship', q: 'Content Writing' } },
    { label: 'Sales', query: { type: 'internship', q: 'Sales' } },
    { label: 'Business Analyst', query: { type: 'internship', q: 'Business Analyst' } },
    { label: 'Cyber Security', query: { type: 'internship', q: 'Cyber Security' } },
    { label: 'DevOps', query: { type: 'internship', q: 'DevOps' } },
  ];

  const jobsByLocation = [
    { label: 'Bangalore', query: { type: 'job', location: 'Bangalore' } },
    { label: 'Hyderabad', query: { type: 'job', location: 'Hyderabad' } },
    { label: 'Pune', query: { type: 'job', location: 'Pune' } },
    { label: 'Mumbai', query: { type: 'job', location: 'Mumbai' } },
    { label: 'Delhi', query: { type: 'job', location: 'Delhi' } },
    { label: 'Noida', query: { type: 'job', location: 'Noida' } },
    { label: 'Gurgaon', query: { type: 'job', location: 'Gurgaon' } },
    { label: 'Chennai', query: { type: 'job', location: 'Chennai' } },
    { label: 'Kolkata', query: { type: 'job', location: 'Kolkata' } },
    { label: 'Jaipur', query: { type: 'job', location: 'Jaipur' } },
    { label: 'Ahmedabad', query: { type: 'job', location: 'Ahmedabad' } },
    { label: 'Kochi', query: { type: 'job', location: 'Kochi' } },
    { label: 'Chandigarh', query: { type: 'job', location: 'Chandigarh' } },
    { label: 'Remote Jobs', query: { type: 'job', workMode: 'remote' } },
  ];

  const jobsByCategory = [
    { label: 'Software Engineer', query: { type: 'job', q: 'Software' } },
    { label: 'Java Developer', query: { type: 'job', q: 'Java' } },
    { label: 'Python Developer', query: { type: 'job', q: 'Python' } },
    { label: 'React Developer', query: { type: 'job', q: 'React' } },
    { label: 'Full Stack Developer', query: { type: 'job', q: 'Full Stack' } },
    { label: 'Frontend Developer', query: { type: 'job', q: 'Frontend' } },
    { label: 'Backend Developer', query: { type: 'job', q: 'Backend' } },
    { label: 'Data Analyst', query: { type: 'job', q: 'Data Analyst' } },
    { label: 'Data Scientist', query: { type: 'job', q: 'Data Scientist' } },
    { label: 'DevOps Engineer', query: { type: 'job', q: 'DevOps' } },
    { label: 'Cloud Engineer', query: { type: 'job', q: 'Cloud' } },
    { label: 'UI Designer', query: { type: 'job', q: 'UI' } },
    { label: 'Product Manager', query: { type: 'job', q: 'Product' } },
    { label: 'Marketing', query: { type: 'job', q: 'Marketing' } },
    { label: 'HR', query: { type: 'job', q: 'HR' } },
    { label: 'Finance', query: { type: 'job', q: 'Finance' } },
    { label: 'Sales', query: { type: 'job', q: 'Sales' } },
    { label: 'Customer Support', query: { type: 'job', q: 'Customer Support' } },
  ];

  const topCompanies = [
    'Google', 'Microsoft', 'Amazon', 'Adobe', 'Oracle', 'IBM', 'Intel', 
    'Accenture', 'Deloitte', 'Infosys', 'TCS', 'Wipro', 'HCL', 'Capgemini', 
    'Cognizant', 'Razorpay', 'CRED', 'Meesho', 'Zepto', 'Groww', 'PhonePe', 
    'Swiggy', 'Zomato', 'Flipkart', 'Paytm'
  ];

  const trendingSkills = [
    'Java', 'Spring Boot', 'Python', 'React', 'Node.js', 'MongoDB', 'SQL', 
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'JavaScript', 
    'TypeScript', 'HTML', 'CSS', 'Flutter', 'Android', 'Machine Learning', 
    'Data Science', 'Cyber Security', 'DevOps'
  ];

  const handleNavigate = (paramsObj) => {
    const searchString = new URLSearchParams(paramsObj).toString();
    navigate(`/browse?${searchString}`);
  };

  return (
    <section className="w-full bg-gradient-to-b from-slate-50 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-t border-slate-200/80 dark:border-slate-800 py-16 px-4 sm:px-6 lg:px-8 fade-in text-left transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 px-3 py-1 text-[11px] font-bold text-sky-700 dark:text-sky-400 ring-1 ring-sky-200/60 dark:ring-sky-800 uppercase tracking-wider mb-2">
              <Layers className="h-3.5 w-3.5" />
              {t('exploreOpportunities.seoBadge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('exploreOpportunities.title')}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('exploreOpportunities.subtitle')}
            </p>
          </div>

          {/* Quick Filter Switcher */}
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'all' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('exploreOpportunities.allSections')}
            </button>
            <button
              onClick={() => setActiveTab('internships')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'internships' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('exploreOpportunities.internshipsTab')}
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'jobs' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('exploreOpportunities.jobsTab')}
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === 'companies' ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('exploreOpportunities.companiesSkillsTab')}
            </button>
          </div>
        </div>

        {/* 6 Responsive Opportunity Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1. Internships by Location */}
          {(activeTab === 'all' || activeTab === 'internships') && (
            <div className="card-hover rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" />
                    {t('exploreOpportunities.byLocationTitle')}
                  </h3>
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-full">
                    {t('exploreOpportunities.citiesCount', { count: internshipsByLocation.length })}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {internshipsByLocation.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNavigate(item.query)}
                      className="btn-animate rounded-lg border border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-700 dark:hover:text-sky-400 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                <Link
                  to="/browse?type=internship"
                  className="btn-animate inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline group"
                >
                  {t('exploreOpportunities.viewAllInternships')}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* 2. Internships by Category */}
          {(activeTab === 'all' || activeTab === 'internships') && (
            <div className="card-hover rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    <Code className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400" />
                    {t('exploreOpportunities.byCategoryTitle')}
                  </h3>
                  <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full">
                    {t('exploreOpportunities.rolesCount', { count: internshipsByCategory.length })}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {internshipsByCategory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNavigate(item.query)}
                      className="btn-animate rounded-lg border border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-cyan-300 dark:hover:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-slate-800 hover:text-cyan-700 dark:hover:text-cyan-400 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                <Link
                  to="/browse?type=internship"
                  className="btn-animate inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline group"
                >
                  {t('exploreOpportunities.viewAllInternships')}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* 3. Jobs by Location */}
          {(activeTab === 'all' || activeTab === 'jobs') && (
            <div className="card-hover rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    <Briefcase className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                    {t('exploreOpportunities.jobsByLocTitle')}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    {t('exploreOpportunities.citiesCount', { count: jobsByLocation.length })}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {jobsByLocation.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNavigate(item.query)}
                      className="btn-animate rounded-lg border border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                <Link
                  to="/browse?type=job"
                  className="btn-animate inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline group"
                >
                  {t('exploreOpportunities.viewAllJobs')}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* 4. Jobs by Category */}
          {(activeTab === 'all' || activeTab === 'jobs') && (
            <div className="card-hover rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    <Layers className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                    {t('exploreOpportunities.jobsByCatTitle')}
                  </h3>
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                    {t('exploreOpportunities.domainsCount', { count: jobsByCategory.length })}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {jobsByCategory.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNavigate(item.query)}
                      className="btn-animate rounded-lg border border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                <Link
                  to="/browse?type=job"
                  className="btn-animate inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline group"
                >
                  {t('exploreOpportunities.viewAllJobs')}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* 5. Top Companies */}
          {(activeTab === 'all' || activeTab === 'companies') && (
            <div className="card-hover rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    <Building2 className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                    {t('exploreOpportunities.topCompaniesTitle')}
                  </h3>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                    {t('exploreOpportunities.brandsCount', { count: topCompanies.length })}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {topCompanies.map((company, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNavigate({ q: company })}
                      className="btn-animate rounded-lg border border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-700 dark:hover:text-purple-400 cursor-pointer"
                    >
                      {company}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                <Link
                  to="/browse"
                  className="btn-animate inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline group"
                >
                  {t('exploreOpportunities.browseCompanyPostings')}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

          {/* 6. Trending Skills */}
          {(activeTab === 'all' || activeTab === 'companies') && (
            <div className="card-hover rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-sans text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                    {t('exploreOpportunities.trendingSkillsTitle')}
                  </h3>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    {t('exploreOpportunities.skillsCount', { count: trendingSkills.length })}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {trendingSkills.map((skill, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNavigate({ skills: skill })}
                      className="btn-animate rounded-lg border border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-right">
                <Link
                  to="/browse"
                  className="btn-animate inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline group"
                >
                  {t('exploreOpportunities.filterBySkill')}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default ExploreOpportunities;
