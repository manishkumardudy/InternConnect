import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Image,
  Video,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  UserCheck,
  UserX,
  Send,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  Upload,
  Globe,
  Mail,
  Copy,
  Pin,
  Trash2
} from 'lucide-react';

const PublicSpace = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'friends' ? 'friends' : 'feed';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'friends') {
      setActiveTab('friends');
    } else if (tabParam === 'feed') {
      setActiveTab('feed');
    }
  }, [searchParams]);

  // Feed State
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ friendCount: 0, postsToday: 0, maxPostsAllowed: 0, canPost: false });
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Post Form State
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState('image'); // 'image' | 'video'
  const [publishing, setPublishing] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  // Comment State
  const [commentInputs, setCommentInputs] = useState({}); // postId -> string
  const [openCommentSections, setOpenCommentSections] = useState({}); // postId -> boolean
  const [submittingComments, setSubmittingComments] = useState({}); // postId -> boolean

  // Friends State
  const [friendsList, setFriendsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendActionMsg, setFriendActionMsg] = useState('');
  const [unfriendConfirm, setUnfriendConfirm] = useState({ isOpen: false, friendUserId: null, friendName: '' });

  // Share menu state
  const [openShareMenuId, setOpenShareMenuId] = useState(null);

  // Comment delete confirmation state
  const [deleteCommentConfirm, setDeleteCommentConfirm] = useState({ isOpen: false, postId: null, commentId: null });

  // Toast / Share notification
  const [notificationToast, setNotificationToast] = useState('');

  // Outside click listener for Share menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.share-menu-container')) {
        setOpenShareMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to trigger toast
  const showToast = (msg) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(''), 4000);
  };

  // Fetch Feed
  const fetchFeed = async () => {
    try {
      setLoadingFeed(true);
      const res = await api.get('/posts');
      setPosts(res.data.posts || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoadingFeed(false);
    }
  };

  // Fetch Friends Data
  const fetchFriendsData = async () => {
    try {
      setLoadingFriends(true);
      const [friendsRes, requestsRes, usersRes] = await Promise.all([
        api.get('/friends'),
        api.get('/friends/requests'),
        api.get(`/friends/users${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)
      ]);
      setFriendsList(friendsRes.data.friends || []);
      setPendingRequests(requestsRes.data.requests || []);
      setSearchUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Error fetching friends data:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    if (activeTab === 'friends' || searchQuery) {
      fetchFriendsData();
    }
  }, [activeTab, searchQuery]);

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (20MB)
    if (file.size > 20 * 1024 * 1024) {
      setPostError('File size exceeds maximum limit of 20MB.');
      return;
    }

    setPostError('');
    setSelectedFile(file);

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|avi|mkv)$/i.test(file.name);
    setPreviewType(isVideo ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Handle Create Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setPostError('Please select an image or video file to share.');
      return;
    }

    try {
      setPublishing(true);
      setPostError('');
      setPostSuccess('');

      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('caption', caption);

      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPostSuccess(t('publicSpace.postSuccessMsg'));
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchFeed(); // Refresh feed and stats
    } catch (err) {
      setPostError(err.response?.data?.message || 'Failed to publish post.');
    } finally {
      setPublishing(false);
    }
  };

  // Handle Like Toggle
  const handleLikeToggle = async (postId) => {
    try {
      const res = await api.put(`/posts/${postId}/like`);
      const { isLiked, likesCount } = res.data;

      setPosts(prev =>
        prev.map(p =>
          p._id === postId ? { ...p, isLiked, likesCount } : p
        )
      );
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (postId) => {
    if (submittingComments[postId]) return;

    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      setSubmittingComments(prev => ({ ...prev, [postId]: true }));
      const res = await api.post(`/posts/${postId}/comment`, { text: text.trim() });
      const newComment = res.data.comment;

      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), newComment] }
            : p
        )
      );
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Comment error:', err);
      showToast('Failed to add comment.');
    } finally {
      setSubmittingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (postId, commentId) => {
    try {
      await api.delete(`/posts/${postId}/comment/${commentId}`);
      setPosts(prev =>
        prev.map(p =>
          p._id === postId
            ? { ...p, comments: (p.comments || []).filter(c => c._id !== commentId) }
            : p
        )
      );
      showToast('Comment deleted successfully.');
    } catch (err) {
      console.error('Delete comment error:', err);
      showToast(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  // Handle Pin / Unpin Comment (Post Owner Only)
  const handlePinComment = async (postId, commentId) => {
    try {
      const res = await api.put(`/posts/${postId}/comment/${commentId}/pin`);
      const isPinned = res.data.pinned;

      setPosts(prev =>
        prev.map(p => {
          if (p._id !== postId) return p;
          const updatedComments = (p.comments || []).map(c =>
            c._id === commentId ? { ...c, pinned: isPinned } : c
          );
          // Sort pinned comments first, then chronological
          updatedComments.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
          return { ...p, comments: updatedComments };
        })
      );
      showToast(isPinned ? '📌 Comment pinned to top.' : 'Comment unpinned.');
    } catch (err) {
      console.error('Pin comment error:', err);
      showToast(err.response?.data?.message || 'Failed to toggle pin.');
    }
  };

  // Handle Share Post via Specific Platform
  const handleSharePlatform = async (post, platform) => {
    const postId = post._id;
    setOpenShareMenuId(null);

    try {
      const res = await api.post(`/posts/${postId}/share`);
      const shareUrl = res.data.shareUrl || `${window.location.origin}/public-space#post-${postId}`;
      const newShareCount = res.data.shareCount || (post.shareCount || 0) + 1;

      setPosts(prev =>
        prev.map(p => (p._id === postId ? { ...p, shareCount: newShareCount } : p))
      );

      const captionText = post.caption || 'Check out this post on InternConnect!';

      switch (platform) {
        case 'whatsapp': {
          const text = `${captionText}\n${shareUrl}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
          showToast('Opening WhatsApp...');
          break;
        }
        case 'facebook': {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
          showToast('Opening Facebook...');
          break;
        }
        case 'gmail': {
          const subject = encodeURIComponent('Check out this post on InternConnect');
          const body = encodeURIComponent(`${captionText}\n\n${shareUrl}`);
          window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
          showToast('Opening email client...');
          break;
        }
        case 'twitter': {
          const text = encodeURIComponent(captionText.length > 100 ? captionText.slice(0, 97) + '...' : captionText);
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank', 'noopener,noreferrer');
          showToast('Opening Twitter / X...');
          break;
        }
        case 'linkedin': {
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
          showToast('Opening LinkedIn...');
          break;
        }
        case 'copy':
        default: {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareUrl);
            showToast('🚀 Link copied to clipboard! Share it anywhere.');
          } else {
            showToast(`Shared! Link: ${shareUrl}`);
          }
          break;
        }
      }
    } catch (err) {
      console.error('Share error:', err);
      showToast('Failed to process share.');
    }
  };

  // Friend Actions
  const handleSendFriendRequest = async (recipientId) => {
    try {
      await api.post('/friends/request', { recipientId });
      setFriendActionMsg('Friend request sent!');
      fetchFriendsData();
      fetchFeed();
    } catch (err) {
      setFriendActionMsg(err.response?.data?.message || 'Failed to send request.');
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      await api.put(`/friends/respond/${requestId}`, { action });
      setFriendActionMsg(`Request ${action}ed!`);
      fetchFriendsData();
      fetchFeed();
    } catch (err) {
      setFriendActionMsg('Failed to respond to request.');
    }
  };

  const handleUnfriend = async (friendUserId) => {
    try {
      await api.delete(`/friends/${friendUserId}`);
      setFriendActionMsg('Unfriended successfully.');
      fetchFriendsData();
      fetchFeed();
    } catch (err) {
      setFriendActionMsg('Failed to remove friend.');
    }
  };

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (unfriendConfirm.isOpen || deleteCommentConfirm.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [unfriendConfirm.isOpen, deleteCommentConfirm.isOpen]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Unfriend Confirmation Modal */}
      {unfriendConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/60">
                <UserX className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unfriend Confirmation</h3>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to unfriend <span className="font-bold text-slate-900 dark:text-white">{unfriendConfirm.friendName}</span>? You'll need to send a new friend request to reconnect.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUnfriendConfirm({ isOpen: false, friendUserId: null, friendName: '' })}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = unfriendConfirm.friendUserId;
                  setUnfriendConfirm({ isOpen: false, friendUserId: null, friendName: '' });
                  if (targetId) handleUnfriend(targetId);
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold transition shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Unfriend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Comment Confirmation Modal */}
      {deleteCommentConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60">
                <Trash2 className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Comment?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCommentConfirm({ isOpen: false, postId: null, commentId: null })}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const { postId, commentId } = deleteCommentConfirm;
                  setDeleteCommentConfirm({ isOpen: false, postId: null, commentId: null });
                  if (postId && commentId) handleDeleteComment(postId, commentId);
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 dark:bg-sky-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-sky-500/30 animate-bounce">
          <Sparkles className="h-5 w-5 text-sky-400" />
          <span className="text-sm font-semibold">{notificationToast}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-2">
                <Globe className="h-3.5 w-3.5" /> {t('publicSpace.badge')}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('publicSpace.title')}
              </h1>
              <p className="text-sky-100 text-sm mt-1 max-w-xl">
                {t('publicSpace.subtitle')}
              </p>
            </div>

            {/* Friend & Post Stats Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white/20 text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-sky-100 font-medium">{t('publicSpace.friendsCount')}</div>
                  <div className="text-lg font-bold">{stats.friendCount} {stats.friendCount === 1 ? t('publicSpace.friendSingle') : t('publicSpace.friendPlural')}</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white/20 text-white">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-sky-100 font-medium">{t('publicSpace.todaysPosts')}</div>
                  <div className="text-lg font-bold">
                    {stats.friendCount === 0 ? (
                      <span className="text-amber-200">{t('publicSpace.zeroAllowed')}</span>
                    ) : stats.maxPostsAllowed === 'unlimited' ? (
                      <span className="text-emerald-200">{t('publicSpace.unlimited')}</span>
                    ) : (
                      <span>{stats.postsToday} / {stats.maxPostsAllowed}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-3.5 sm:px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'feed'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Globe className="h-4 w-4" /> {t('publicSpace.publicFeedTab')}
          </button>

          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-1.5 sm:gap-2 py-3 px-3.5 sm:px-6 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'friends'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" /> {t('publicSpace.friendsNetworkTab')}
            {pendingRequests.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Public Feed & Create Post */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Feed (2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Create Post Form Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-sky-600 dark:text-sky-400" /> {t('publicSpace.sharePostHeading')}
                </h2>

                {/* Status / Restriction Alerts */}
                {stats.friendCount === 0 && (
                  <div className="mb-4 flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      {t('publicSpace.postLockedMsg')}
                    </div>
                  </div>
                )}

                {stats.friendCount > 0 && !stats.canPost && stats.maxPostsAllowed !== 'unlimited' && (
                  <div className="mb-4 flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <div>
                      {t('publicSpace.limitReachedMsg', { current: stats.postsToday, max: stats.maxPostsAllowed })}
                    </div>
                  </div>
                )}

                {postError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-sm font-medium border border-rose-200 dark:border-rose-800">
                    {postError}
                  </div>
                )}

                {postSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> {postSuccess}
                  </div>
                )}

                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <textarea
                      rows={3}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      disabled={!stats.canPost}
                      placeholder={
                        stats.canPost
                          ? t('publicSpace.postPlaceholderActive')
                          : t('publicSpace.postPlaceholderLocked')
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Media File Input & Preview */}
                  <div>
                    {previewUrl ? (
                      <div className="relative rounded-xl overflow-hidden bg-slate-950 max-h-80 flex items-center justify-center border border-slate-700 group">
                        {previewType === 'video' ? (
                          <video src={previewUrl} controls className="max-h-80 w-auto" />
                        ) : (
                          <img src={previewUrl} alt="Upload Preview" className="max-h-80 w-auto object-contain" />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="absolute top-2 right-2 rounded-full bg-slate-900/80 text-white p-1.5 hover:bg-rose-600 transition"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${
                          stats.canPost
                            ? 'border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 bg-slate-50/50 dark:bg-slate-800/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                          <Image className="h-6 w-6 text-sky-500" />
                          <Video className="h-6 w-6 text-indigo-500" />
                          <span className="text-sm font-semibold">{t('publicSpace.chooseMediaLabel')}</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          disabled={!stats.canPost}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {stats.maxPostsAllowed === 'unlimited'
                        ? t('publicSpace.unlimitedDailyPosts')
                        : t('publicSpace.postsRemainingToday', { count: Math.max(0, (typeof stats.maxPostsAllowed === 'number' ? stats.maxPostsAllowed : 0) - stats.postsToday) })}
                    </span>

                    <button
                      type="submit"
                      disabled={!stats.canPost || publishing || !selectedFile}
                      className="btn-animate inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 text-sm font-bold shadow-md shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {publishing ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t('publicSpace.publishing')}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" /> {t('publicSpace.publishPost')}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Feed Posts List */}
              {loadingFeed ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow border border-slate-200 dark:border-slate-800 animate-pulse space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                      </div>
                      <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
                  <Globe className="h-12 w-12 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('publicSpace.noPostsTitle')}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('publicSpace.noPostsSub')}</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post._id}
                    id={`post-${post._id}`}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200/80 dark:border-slate-800 overflow-hidden transition hover:shadow-lg"
                  >
                    {/* Post Header */}
                    <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                          {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {post.author?.name || 'Unknown User'}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              post.author?.role === 'recruiter'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                            }`}>
                              {post.author?.role || 'student'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Post Caption */}
                    {post.caption && (
                      <div className="px-5 py-3 text-slate-800 dark:text-slate-200 text-sm whitespace-pre-line leading-relaxed">
                        {post.caption}
                      </div>
                    )}

                    {/* Post Media Display */}
                    <div className="bg-slate-950 flex items-center justify-center max-h-[450px]">
                      {post.mediaType === 'video' ? (
                        <video src={getMediaUrl(post.mediaUrl)} controls className="w-full max-h-[450px] object-contain" />
                      ) : (
                        <img src={getMediaUrl(post.mediaUrl)} alt="Post media" className="w-full max-h-[450px] object-contain" />
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="px-5 py-3.5 flex items-center justify-between border-t border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLikeToggle(post._id)}
                          className={`flex items-center gap-1.5 text-sm font-semibold transition cursor-pointer ${
                            post.isLiked
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likesCount}</span>
                        </button>

                        {/* Comment Toggle Button */}
                        <button
                          onClick={() =>
                            setOpenCommentSections(prev => ({
                              ...prev,
                              [post._id]: !prev[post._id]
                            }))
                          }
                          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 transition cursor-pointer"
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span>{post.comments ? post.comments.length : 0}</span>
                        </button>
                      </div>

                      {/* Share Button & Popover Menu */}
                      <div className="relative share-menu-container">
                        <button
                          onClick={() => setOpenShareMenuId(prev => (prev === post._id ? null : post._id))}
                          className={`flex items-center gap-1.5 text-sm font-semibold transition cursor-pointer ${
                            openShareMenuId === post._id
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                          }`}
                        >
                          <Share2 className="h-5 w-5" />
                          <span>{t('publicSpace.sharesCount', { count: post.shareCount || 0 })}</span>
                        </button>

                        {openShareMenuId === post._id && (
                          <div className="absolute right-0 bottom-full mb-2 w-52 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-30 space-y-1 animate-in fade-in">
                            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                              Share via
                            </div>
                            <button
                              onClick={() => handleSharePlatform(post, 'whatsapp')}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition text-left cursor-pointer"
                            >
                              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <MessageCircle className="w-3 h-3" />
                              </div>
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleSharePlatform(post, 'facebook')}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition text-left cursor-pointer"
                            >
                              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                                f
                              </div>
                              Facebook
                            </button>
                            <button
                              onClick={() => handleSharePlatform(post, 'gmail')}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition text-left cursor-pointer"
                            >
                              <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                                <Mail className="w-3 h-3" />
                              </div>
                              Gmail / Email
                            </button>
                            <button
                              onClick={() => handleSharePlatform(post, 'twitter')}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition text-left cursor-pointer"
                            >
                              <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shrink-0 font-bold text-[9px]">
                                𝕏
                              </div>
                              Twitter / X
                            </button>
                            <button
                              onClick={() => handleSharePlatform(post, 'linkedin')}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400 transition text-left cursor-pointer"
                            >
                              <div className="w-5 h-5 rounded-full bg-sky-700 text-white flex items-center justify-center shrink-0 font-bold text-[10px]">
                                in
                              </div>
                              LinkedIn
                            </button>
                            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                            <button
                              onClick={() => handleSharePlatform(post, 'copy')}
                              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-left cursor-pointer"
                            >
                              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                <Copy className="w-3 h-3" />
                              </div>
                              Copy Link
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comments Section */}
                    {openCommentSections[post._id] && (
                      <div className="p-5 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        {/* Comments List */}
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment, idx) => {
                              const currentUserId = String(user?._id || user?.id || user?.userId || '');
                              const commentAuthorId = String(comment.user?._id || comment.user?.id || comment.userId || '');
                              const postOwnerId = String(post.author?._id || post.author?.id || post.userId || '');
                              const isCommentAuthor = Boolean(currentUserId && commentAuthorId && currentUserId === commentAuthorId);
                              const isPostOwner = Boolean(currentUserId && postOwnerId && currentUserId === postOwnerId);
                              const canDelete = isCommentAuthor || isPostOwner;
                              const canPin = isPostOwner;

                              return (
                                <div
                                  key={comment._id || idx}
                                  className={`flex items-start justify-between gap-2 text-xs p-3 rounded-xl border transition ${
                                    comment.pinned
                                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60 shadow-xs'
                                      : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800'
                                  }`}
                                >
                                  <div className="flex gap-2.5 min-w-0">
                                    <div className="h-7 w-7 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px] shadow-sm">
                                      {comment.user?.name ? comment.user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-slate-900 dark:text-white">
                                          {comment.user?.name || 'User'}
                                        </span>
                                        {comment.pinned && (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 text-[9px] font-extrabold border border-amber-200 dark:border-amber-700">
                                            <Pin className="h-2.5 w-2.5 fill-current" />
                                            Pinned
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
                                    </div>
                                  </div>

                                  {/* Comment Actions (Pin & Delete) */}
                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    {canPin && (
                                      <button
                                        type="button"
                                        onClick={() => handlePinComment(post._id, comment._id)}
                                        title={comment.pinned ? 'Unpin comment' : 'Pin comment to top'}
                                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                                          comment.pinned
                                            ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900'
                                            : 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                      >
                                        <Pin className={`h-3.5 w-3.5 ${comment.pinned ? 'fill-current' : ''}`} />
                                      </button>
                                    )}
                                    {canDelete && (
                                      <button
                                        type="button"
                                        onClick={() => setDeleteCommentConfirm({ isOpen: true, postId: post._id, commentId: comment._id })}
                                        title="Delete comment"
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-xs text-slate-400 text-center py-2">{t('publicSpace.noCommentsYet')}</p>
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex gap-2 items-end">
                          <textarea
                            rows={2}
                            value={commentInputs[post._id] || ''}
                            disabled={!!submittingComments[post._id]}
                            onChange={(e) =>
                              setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (!submittingComments[post._id]) {
                                  handleAddComment(post._id);
                                }
                              }
                            }}
                            placeholder={t('publicSpace.commentPlaceholder')}
                            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 resize-none whitespace-pre-wrap leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post._id)}
                            disabled={!!submittingComments[post._id] || !(commentInputs[post._id] && commentInputs[post._id].trim())}
                            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm"
                          >
                            {submittingComments[post._id] ? (
                              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            <span>{t('publicSpace.sendComment')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Sidebar (Friends Status Summary & Quick Actions) */}
            <div className="space-y-6">
              
              {/* Daily Limit Info Box */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-500" /> {t('publicSpace.dailyRulesHeading')}
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{t('publicSpace.rule1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{t('publicSpace.rule2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{t('publicSpace.rule3')}</span>
                  </li>
                </ul>

                <button
                  onClick={() => setActiveTab('friends')}
                  className="w-full btn-animate rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 py-2.5 text-xs font-bold text-center transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" /> {t('publicSpace.manageFriends', { count: stats.friendCount })}
                </button>
              </div>

              {/* Pending Requests Preview */}
              {pendingRequests.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-sky-200 dark:border-sky-900/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-sky-500" /> {t('publicSpace.pendingRequestsHeading')}
                    </h3>
                    <span className="bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 text-xs px-2 py-0.5 rounded-full font-bold">
                      {pendingRequests.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {pendingRequests.slice(0, 3).map((req) => (
                      <div key={req._id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {req.requester?.name || 'User'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleRespondRequest(req._id, 'accept')}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                            title="Accept"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleRespondRequest(req._id, 'reject')}
                            className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                            title="Reject"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Friends Network Panel */}
        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Friends & Requests List (2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              
              {friendActionMsg && (
                <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> {friendActionMsg}
                </div>
              )}

              {/* Pending Requests Section */}
              {pendingRequests.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-sky-200 dark:border-sky-900/60 space-y-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-sky-500" /> {t('publicSpace.incomingRequestsHeading', { count: pendingRequests.length })}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pendingRequests.map((req) => (
                      <div key={req._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{req.requester?.name || 'User'}</div>
                          <div className="text-xs text-slate-400 capitalize">{req.requester?.role || 'student'}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRespondRequest(req._id, 'accept')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <UserCheck className="h-3.5 w-3.5" /> {t('publicSpace.acceptBtn')}
                          </button>
                          <button
                            onClick={() => handleRespondRequest(req._id, 'reject')}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <UserX className="h-3.5 w-3.5" /> {t('publicSpace.rejectBtn')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Friends List */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-500" /> {t('publicSpace.myFriendsHeading', { count: friendsList.length })}
                </h2>

                {friendsList.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">{t('publicSpace.noFriendsYet')}</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {friendsList.map((item) => (
                      <div key={item.friendshipId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                            {item.user?.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{item.user?.name}</div>
                            <div className="text-xs text-slate-400 capitalize">{item.user?.role}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => setUnfriendConfirm({
                            isOpen: true,
                            friendUserId: item.user?._id,
                            friendName: item.user?.name || 'this user'
                          })}
                          className="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          {t('publicSpace.unfriend')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Find Users Sidebar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-md border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search className="h-4 w-4 text-sky-500" /> {t('publicSpace.findPeople')}
              </h2>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('publicSpace.searchPlaceholder')}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {loadingFriends ? (
                  <p className="text-xs text-slate-400 text-center py-4">{t('publicSpace.loadingUsers')}</p>
                ) : searchUsers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">{t('publicSpace.noUsersFound')}</p>
                ) : (
                  searchUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs border border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{u.role}</div>
                      </div>

                      {u.friendStatus === 'accepted' ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          {t('publicSpace.friendsBadge')}
                        </span>
                      ) : u.friendStatus === 'pending_sent' ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                          {t('publicSpace.pendingBadge')}
                        </span>
                      ) : u.friendStatus === 'pending_received' ? (
                        <button
                          onClick={() => handleRespondRequest(u.requestId, 'accept')}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                        >
                          {t('publicSpace.acceptBtn')}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendFriendRequest(u._id)}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <UserPlus className="h-3 w-3" /> {t('publicSpace.addFriendBtn')}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PublicSpace;
