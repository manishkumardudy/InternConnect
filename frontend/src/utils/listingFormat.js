// Helper function for formatting dates relative to now
export function timeAgo(dateString, t) {
  if (!dateString) return '';
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return t ? t('browseListings.today', 'Just now') : 'Just now';
  if (hours < 1) return `${minutes}m ago`;
  if (days < 1) return t ? t('browseListings.today', 'Today') : 'Today';
  if (days === 1) return t ? t('browseListings.oneDayAgo', '1 day ago') : '1 day ago';
  if (days < 7) return t ? t('browseListings.daysAgo', { count: days }) : `${days} days ago`;
  if (days < 30) return t ? t('browseListings.weeksAgo', { count: Math.floor(days / 7) }) : `${Math.floor(days / 7)}w ago`;
  return t ? t('browseListings.monthsAgo', { count: Math.floor(days / 30) }) : `${Math.floor(days / 30)}mo ago`;
}
