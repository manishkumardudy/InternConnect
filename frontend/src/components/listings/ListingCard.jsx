import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bookmark, Building2, Calendar, MapPin, Wallet } from 'lucide-react';
import { getMediaUrl } from '../../services/api';

// ---------- Chhote helper functions ----------

// 6000, 7000 -> "₹6,000 - 7,000 /month"  (t = translation function)
function formatStipend(min, max, t) {
  if (!max && !min) return t('browseListings.unpaid');
  const fmt = (n) => Number(n).toLocaleString('en-IN');
  const perMonth = t('browseListings.perMonth');
  if (min && max && min !== max) return `₹${fmt(min)} - ${fmt(max)} ${perMonth}`;
  return `₹${fmt(max || min)} ${perMonth}`;
}

// Date -> "3 weeks ago"
function timeAgo(dateString, t) {
  const days = Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000);
  if (days < 1) return t('browseListings.today');
  if (days === 1) return t('browseListings.oneDayAgo');
  if (days < 7) return t('browseListings.daysAgo', { count: days });
  if (days < 30) return t('browseListings.weeksAgo', { count: Math.floor(days / 7) });
  return t('browseListings.monthsAgo', { count: Math.floor(days / 30) });
}

// remote -> "Work from home", hybrid -> "Delhi (Hybrid)", onsite -> "Delhi"
function formatLocation(workMode, location, t) {
  if (workMode === 'remote') return t('browseListings.workFromHome');
  if (workMode === 'hybrid') return `${location} (${t('browseListings.hybrid')})`;
  return location;
}

// Icon + text ki ek line (location, stipend, duration ke liye)
function InfoItem({ icon: Icon, text }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      {text}
    </span>
  );
}

// ---------- Main card ----------

export default function ListingCard({ listing, isSaved, isApplied, onToggleSave }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const company = listing.companyId || {}; // backend company ki details yahin bhejta hai
  const logo = company.logoUrl ? getMediaUrl(company.logoUrl) : '';

  return (
    <article
      onClick={() => navigate(`/listings/${listing._id}`)}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      {/* Title + company + logo */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-gray-900">{listing.title}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{company.companyName || 'Company'}</p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
          {logo ? (
            <img src={logo} alt="" className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-6 w-6 text-gray-400" />
          )}
        </div>
      </div>

      {/* Location, stipend, duration */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
        <InfoItem icon={MapPin} text={formatLocation(listing.workMode, listing.location, t)} />
        <InfoItem icon={Wallet} text={formatStipend(listing.stipendMin, listing.stipendMax, t)} />
        <InfoItem icon={Calendar} text={`${listing.durationMonths} ${t('browseListings.months')}`} />
      </div>

      {/* Short description */}
      <p className="mt-3 line-clamp-2 text-sm text-gray-600">{listing.description}</p>

      {/* Skills (max 4) */}
      {listing.skillsRequired?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {listing.skillsRequired.slice(0, 4).map((skill) => (
            <span key={skill} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer: badges (left) + actions (right) */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{timeAgo(listing.createdAt, t)}</span>
          {listing.applicantCount < 20 && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{t('browseListings.earlyApplicant')}</span>
          )}
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-primary">
            {listing.type === 'job' ? t('browseListings.job') : t('browseListings.internship')}
          </span>
          {isApplied && (
            <span className="rounded-full bg-green-50 px-2.5 py-1 font-medium text-green-700">
              {t('browseListings.applied')}
            </span>
          )}
        </div>

        <button
          onClick={(e) => onToggleSave(e, listing._id)}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-primary"
          aria-label={t('browseListings.saveListing')}
        >
          <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
        </button>
      </div>
    </article>
  );
}
