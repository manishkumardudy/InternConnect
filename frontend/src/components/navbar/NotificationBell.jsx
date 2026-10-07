import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import useClickOutside from '../../hooks/useClickOutside';

export default function NotificationBell() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useSocket();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setOpen(false));

  // Notification par click: use read mark karo aur sahi page par bhejo
  const handleClick = (notif) => {
    setOpen(false);
    if (!notif.read && markAsRead) markAsRead(notif._id);

    if (notif.type === 'friend_request' || notif.type === 'friend_accepted') {
      navigate('/public-space?tab=friends');
    } else if (notif.type === 'new_application' || user?.role === 'recruiter') {
      const listingId = notif.listingId || notif.relatedId;
      if (listingId) {
        const query = notif.applicantUserId ? `?applicantId=${notif.applicantUserId}` : '';
        navigate(`/listing/${listingId}/applicants${query}`);
      } else {
        navigate('/recruiter-dashboard');
      }
    } else {
      navigate('/my-applications');
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-primary"
        aria-label={t('nav.notifications')}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold text-gray-800">{t('nav.notifications')}</span>
            <span className="text-xs text-gray-400">{t('nav.unread', { count: unreadCount })}</span>
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">{t('nav.noNotifications')}</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleClick(notif)}
                className={`cursor-pointer border-b border-gray-100 px-4 py-3 hover:bg-gray-50 ${
                  !notif.read ? 'bg-primary-50' : ''
                }`}
              >
                <p className="line-clamp-2 text-sm text-gray-700">{notif.message}</p>
                <span className="mt-1 block text-xs text-gray-400">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
