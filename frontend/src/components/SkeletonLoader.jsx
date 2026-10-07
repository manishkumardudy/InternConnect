import React from 'react';

export const ListingCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 animate-pulse"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-24 rounded bg-slate-150 dark:bg-slate-850" />
              </div>
            </div>
            <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="h-3 w-20 rounded bg-slate-150 dark:bg-slate-800" />
            <div className="h-3 w-24 rounded bg-slate-150 dark:bg-slate-800" />
            <div className="h-3 w-16 rounded bg-slate-150 dark:bg-slate-800" />
          </div>

          <div className="flex gap-1.5 pt-2">
            <div className="h-5 w-12 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-5 w-14 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-5 w-10 rounded bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="h-3 w-20 rounded bg-slate-150 dark:bg-slate-800" />
            <div className="h-3 w-16 rounded bg-sky-100 dark:bg-sky-950" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6 animate-pulse text-left">
      <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 rounded bg-slate-150 dark:bg-slate-850" />
            <div className="grid grid-cols-4 gap-4 pt-4">
              <div className="h-10 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-10 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-10 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-10 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-32 rounded bg-slate-100 dark:bg-slate-800 mt-4" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6" />
          <div className="h-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6" />
        </div>
      </div>
    </div>
  );
};

export default {
  ListingCardSkeleton,
  DetailSkeleton
};
