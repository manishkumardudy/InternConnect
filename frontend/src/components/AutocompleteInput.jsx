import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AutocompleteInput = ({
  value,
  onChange,
  onSelect,
  type = 'all', // 'city', 'skill', 'search', 'all'
  placeholder = 'Type to search...',
  className = '',
  icon: IconComponent
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef(null);

  // Fetch suggestions when query value changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      const q = value ? value.trim() : '';
      if (!q || q.length < 1) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      try {
        const res = await api.get('/listings/suggestions', {
          params: { q, type }
        });
        const list = res.data.suggestions || [];
        setSuggestions(list);
        setOpen(list.length > 0);
        setHighlightIndex(-1);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 150); // 150ms debounce
    return () => clearTimeout(timer);
  }, [value, type]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        e.preventDefault();
        selectItem(suggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const selectItem = (item) => {
    onSelect(item);
    setOpen(false);
  };

  // Helper to highlight matching characters seamlessly without awkward spaces
  const renderHighlightedText = (text, query) => {
    if (!query || !query.trim()) return text;
    const trimmed = query.trim();
    const escaped = trimmed.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <span className="inline">
        {parts.map((part, i) =>
          part.toLowerCase() === trimmed.toLowerCase() ? (
            <span key={i} className="inline font-bold text-sky-600 dark:text-sky-400">
              {part}
            </span>
          ) : (
            <span key={i} className="inline">
              {part}
            </span>
          )
        )}
      </span>
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        {IconComponent && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <IconComponent className="h-4 w-4 text-slate-400" />
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all ${
            IconComponent ? 'pl-9 pr-3' : 'px-3'
          } ${className}`}
        />
      </div>

      {/* Autocomplete Dropdown List */}
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1 shadow-xl text-left fade-in divide-y divide-slate-50 dark:divide-slate-800 overscroll-contain">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onClick={() => selectItem(item)}
              className={`cursor-pointer px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                index === highlightIndex ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 font-bold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="inline-block truncate leading-normal">{renderHighlightedText(item, value)}</div>
              <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0 ml-2">Suggest</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteInput;
