import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Globe, Sparkles } from 'lucide-react';
import YourSpaceSidebar from '../components/publicSpace/YourSpaceSidebar';
import PostComposer from '../components/publicSpace/PostComposer';
import PostCard from '../components/publicSpace/PostCard';
import { UnfriendModal, DeleteCommentModal, DeletePostModal } from '../components/publicSpace/PublicSpaceModals';

export default function PublicSpace() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Feed & Stats State
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ friendCount: 0, postsToday: 0, maxPostsAllowed: 0, canPost: false });
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Post Form State
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState('image');
  const [publishing, setPublishing] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSuccess, setPostSuccess] = useState('');

  // Comment State
  const [commentInputs, setCommentInputs] = useState({});
  const [openCommentSections, setOpenCommentSections] = useState({});
  const [submittingComments, setSubmittingComments] = useState({});

  // Friends State
  const [friendsList, setFriendsList] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchUsers, setSearchUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [friendActionMsg, setFriendActionMsg] = useState('');
  const [unfriendConfirm, setUnfriendConfirm] = useState({ isOpen: false, friendUserId: null, friendName: '' });

  // Share & Notification State
  const [openShareMenuId, setOpenShareMenuId] = useState(null);
  const [deleteCommentConfirm, setDeleteCommentConfirm] = useState({ isOpen: false, postId: null, commentId: null });
  const [notificationToast, setNotificationToast] = useState('');

  // Refs for focusing & scrolling composer from sidebar
  const composerRef = useRef(null);
  const composerTextareaRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.share-menu-container')) setOpenShareMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(''), 4000);
  };

  // API Calls
  const fetchFeed = async () => {
    try {
      setLoadingFeed(true);
      const res = await api.get('/posts');
      setPosts(res.data.posts || []);
      if (res.data.stats) setStats(res.data.stats);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoadingFeed(false);
    }
  };

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
      console.error('Error fetching friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchFriendsData();
  }, []);

  // Debounced search for friends
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFriendsData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sidebar Trigger: Focus composer
  const handleTriggerCreatePost = () => {
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      composerTextareaRef.current?.focus();
    }, 200);
  };

  // Sidebar Trigger: Media selection (Photo, Video, Graph)
  const handleFileSelectFromSidebar = (file, type, defaultTag = '') => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setPostError('File size exceeds maximum limit of 20MB.');
      showToast('File size exceeds maximum limit of 20MB.');
      return;
    }
    setPostError('');
    setSelectedFile(file);
    setPreviewType(type);
    setPreviewUrl(URL.createObjectURL(file));

    if (defaultTag && !caption.includes(defaultTag)) {
      setCaption(prev => (prev ? `${prev} ${defaultTag}` : defaultTag));
    }

    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      composerTextareaRef.current?.focus();
    }, 200);
  };

  const handleClearMedia = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // Handle Post Creation
  const handleCreatePost = async (e) => {
    e.preventDefault();
    const trimmedCaption = caption.trim();
    if (!selectedFile && !trimmedCaption) {
      setPostError('Please enter some text or select a photo/video to share.');
      return;
    }
    try {
      setPublishing(true);
      setPostError('');
      setPostSuccess('');
      if (selectedFile) {
        const formData = new FormData();
        formData.append('media', selectedFile);
        formData.append('caption', trimmedCaption);
        await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/posts', { caption: trimmedCaption });
      }
      setPostSuccess('Post published successfully!');
      showToast('🎉 Your post is now live in Public Feed!');
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchFeed();
    } catch (err) {
      setPostError(err.response?.data?.message || 'Failed to publish post.');
    } finally {
      setPublishing(false);
    }
  };

  // Post Actions (Like, Comment, Pin, Delete)
  const handleLikeToggle = async (postId) => {
    try {
      const res = await api.put(`/posts/${postId}/like`);
      const { isLiked, likesCount } = res.data;
      setPosts(prev => prev.map(p => (p._id === postId ? { ...p, isLiked, likesCount } : p)));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleAddComment = async (postId) => {
    if (submittingComments[postId]) return;
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    try {
      setSubmittingComments(prev => ({ ...prev, [postId]: true }));
      const res = await api.post(`/posts/${postId}/comment`, { text: text.trim() });
      setPosts(prev => prev.map(p => (p._id === postId ? { ...p, comments: [...(p.comments || []), res.data.comment] } : p)));
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error('Comment error:', err);
      showToast('Failed to add comment.');
    } finally {
      setSubmittingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await api.delete(`/posts/${postId}/comment/${commentId}`);
      setPosts(prev => prev.map(p => (p._id === postId ? { ...p, comments: (p.comments || []).filter(c => c._id !== commentId) } : p)));
      showToast('Comment deleted successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const handlePinComment = async (postId, commentId) => {
    try {
      const res = await api.put(`/posts/${postId}/comment/${commentId}/pin`);
      const isPinned = res.data.pinned;
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        const updated = (p.comments || []).map(c => (c._id === commentId ? { ...c, pinned: isPinned } : c));
        updated.sort((a, b) => (a.pinned && !b.pinned ? -1 : !a.pinned && b.pinned ? 1 : new Date(a.createdAt) - new Date(b.createdAt)));
        return { ...p, comments: updated };
      }));
      showToast(isPinned ? '📌 Comment pinned to top.' : 'Comment unpinned.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle pin.');
    }
  };

  // Share Platform
  const handleSharePlatform = async (post, platform) => {
    const postId = post._id;
    setOpenShareMenuId(null);
    try {
      const res = await api.post(`/posts/${postId}/share`);
      const shareUrl = res.data.shareUrl || `${window.location.origin}/public-space#post-${postId}`;
      const newShareCount = res.data.shareCount || (post.shareCount || 0) + 1;
      setPosts(prev => prev.map(p => (p._id === postId ? { ...p, shareCount: newShareCount } : p)));
      const captionText = post.caption || 'Check out this post on InternConnect!';

      if (platform === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(`${captionText}\n${shareUrl}`)}`, '_blank', 'noopener,noreferrer');
      else if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
      else if (platform === 'gmail') window.open(`mailto:?subject=${encodeURIComponent('Check out this post')}&body=${encodeURIComponent(`${captionText}\n\n${shareUrl}`)}`, '_self');
      else if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(captionText)}`, '_blank', 'noopener,noreferrer');
      else if (platform === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
      else {
        if (navigator.clipboard) await navigator.clipboard.writeText(shareUrl);
        showToast('🚀 Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  // Friend Actions
  const handleSendFriendRequest = async (recipientId) => {
    try {
      await api.post('/friends/request', { recipientId });
      setFriendActionMsg('Friend request sent!');
      setTimeout(() => setFriendActionMsg(''), 3000);
      fetchFriendsData();
      fetchFeed();
    } catch (err) {
      setFriendActionMsg(err.response?.data?.message || 'Failed to send request.');
      setTimeout(() => setFriendActionMsg(''), 3000);
    }
  };

  const handleRespondRequest = async (requestId, action) => {
    try {
      await api.put(`/friends/respond/${requestId}`, { action });
      showToast(`Friend request ${action}ed!`);
      fetchFriendsData();
      fetchFeed();
    } catch (err) {
      console.error('Respond error:', err);
      showToast('Failed to respond to request.');
    }
  };

  const handleUnfriend = async (friendUserId) => {
    try {
      await api.delete(`/friends/${friendUserId}`);
      showToast('Unfriended successfully.');
      fetchFriendsData();
      fetchFeed();
    } catch (err) {
      console.error('Unfriend error:', err);
      showToast('Failed to remove friend.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/60 animate-fadeIn">
          <Sparkles className="h-4 w-4 text-[#008BDC] shrink-0" />
          <span className="text-xs font-semibold">{notificationToast}</span>
        </div>
      )}

      {/* Modals */}
      <UnfriendModal
        unfriendConfirm={unfriendConfirm}
        setUnfriendConfirm={setUnfriendConfirm}
        handleUnfriend={handleUnfriend}
      />
      <DeleteCommentModal
        deleteCommentConfirm={deleteCommentConfirm}
        setDeleteCommentConfirm={setDeleteCommentConfirm}
        handleDeleteComment={handleDeleteComment}
      />

      {/* Main 2-Column Container */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6 items-start">
          {/* LEFT SIDEBAR — Your Space (~320px fixed) */}
          <aside className="hidden lg:block w-80 shrink-0 sticky top-20">
            <YourSpaceSidebar
              user={user}
              onTriggerCreatePost={handleTriggerCreatePost}
              onFileSelect={handleFileSelectFromSidebar}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchUsers={searchUsers}
              loadingFriends={loadingFriends}
              onSendFriendRequest={handleSendFriendRequest}
              onRespondFriendRequest={handleRespondRequest}
              friendActionMsg={friendActionMsg}
              friendsList={friendsList}
              setUnfriendConfirm={setUnfriendConfirm}
            />
          </aside>

          {/* CENTER — Public Feed (fills all remaining space) */}
          <main className="flex-1 min-w-0 space-y-5">
            {/* Full-width post count row */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/70 dark:border-slate-800">
              <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>
            </div>

            {/* Post Composer */}
            <div ref={composerRef}>
              <PostComposer
                user={user}
                caption={caption}
                setCaption={setCaption}
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                previewType={previewType}
                onClearMedia={handleClearMedia}
                handleCreatePost={handleCreatePost}
                publishing={publishing}
                postError={postError}
                postSuccess={postSuccess}
                stats={stats}
                textareaRef={composerTextareaRef}
              />
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {loadingFeed ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xs border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                          <div className="h-2.5 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                      <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-2xl bg-white dark:bg-slate-900 p-12 text-center border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
                  <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-[#008BDC] flex items-center justify-center mx-auto">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No posts in the Public Feed yet
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Be the first to share an internship achievement, coding project, or career update!
                  </p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUser={user}
                    handleLikeToggle={handleLikeToggle}
                    openCommentSections={openCommentSections}
                    setOpenCommentSections={setOpenCommentSections}
                    commentInputs={commentInputs}
                    setCommentInputs={setCommentInputs}
                    submittingComments={submittingComments}
                    handleAddComment={handleAddComment}
                    handlePinComment={handlePinComment}
                    setDeleteCommentConfirm={setDeleteCommentConfirm}
                    openShareMenuId={openShareMenuId}
                    setOpenShareMenuId={setOpenShareMenuId}
                    handleSharePlatform={handleSharePlatform}
                  />
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
