import React, { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useDebounce from '../../hooks/useDebounce';

// value = backend ko jo bhejna hai (English hi rahegi), key = translation ka naam
const CATEGORIES = [
  { value: 'Engineering & Technology', key: 'engineering' },
  { value: 'Business & Management', key: 'business' },
  { value: 'Design & Creative', key: 'design' },
  { value: 'Marketing & Sales', key: 'marketing' },
  { value: 'Data & Analytics', key: 'data' },
  { value: 'Finance & Commerce', key: 'finance' },
  { value: 'Content & Writing', key: 'content' },
  { value: 'Human Resources', key: 'hr' },
  { value: 'Operations', key: 'operations' },
  { value: 'Other', key: 'other' },
];

const inputClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm';
const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700';

// filters  : abhi ke saare filter values (URL se aate hain)
// onChange : filter badalne par call hota hai, e.g. onChange({ type: 'job' })
// onClear  : "Clear all" button
export default function FilterSidebar({ filters, onChange, onClear }) {
  const { t } = useTranslation();
  // Location box ko live search banane ke liye: 500ms ruk kar hi URL update hoga
  const [location, setLocation] = useState(filters.location);
  const debouncedLocation = useDebounce(location, 500);

  useEffect(() => {
    if (debouncedLocation !== filters.location) {
      onChange({ location: debouncedLocation });
    }
  }, [debouncedLocation]);

  // "Clear all" dabane par box bhi khali ho jaye
  useEffect(() => {
    setLocation(filters.location);
  }, [filters.location]);

  const isRemote = filters.workMode === 'remote';

  return (
    <div className="space-y-5 rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-gray-900">
          <Filter className="h-4 w-4 text-primary" />
          {t('browseListings.filters')}
        </h2>
        <button onClick={onClear} className="text-sm text-primary hover:underline">
          {t('browseListings.reset')}
        </button>
      </div>

      {/* Internship ya Job */}
      <div>
        <label className={labelClass}>{t('browseListings.type')}</label>
        <select value={filters.type} onChange={(e) => onChange({ type: e.target.value })} className={inputClass}>
          <option value="">{t('browseListings.allTypes')}</option>
          <option value="internship">{t('browseListings.internship')}</option>
          <option value="job">{t('browseListings.job')}</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className={labelClass}>{t('browseListings.category')}</label>
        <select value={filters.category} onChange={(e) => onChange({ category: e.target.value })} className={inputClass}>
          <option value="">{t('browseListings.allCategories')}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {t(`browseListings.categories.${cat.key}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className={labelClass}>{t('browseListings.cityLocation')}</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t('browseListings.locationPlaceholder')}
          className={inputClass}
        />
      </div>

      {/* Work from home */}
      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isRemote}
          onChange={(e) => onChange({ workMode: e.target.checked ? 'remote' : '' })}
          className="h-4 w-4 accent-primary"
        />
        {t('browseListings.workFromHome')}
      </label>

      {/* Minimum stipend slider */}
      <div>
        <label className={labelClass}>
          {t('browseListings.minMonthlyStipend')}: <span className="text-primary">₹{Number(filters.stipendMin || 0).toLocaleString('en-IN')}</span>
        </label>
        <input
          type="range"
          min="0"
          max="10000"
          step="2000"
          value={filters.stipendMin || 0}
          onChange={(e) => onChange({ stipendMin: e.target.value === '0' ? '' : e.target.value })}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0</span><span>2K</span><span>4K</span><span>6K</span><span>8K</span><span>10K</span>
        </div>
      </div>
    </div>
  );
}
