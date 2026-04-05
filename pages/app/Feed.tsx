import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw, AlertCircle, Tv, Zap, PenSquare } from 'lucide-react';
import { PostCard } from '../../components/PostCard';
import { AdCard } from '../../components/AdCard';
import { useAuthStore } from '../../store/useAuthStore';
import { useFeedStore } from '../../store/useFeedStore';
import { useComposeStore } from '../../store/useComposeStore';
import { getFollowingIds } from '../../services/user.service';

type FeedTab = 'foryou' | 'following' | 'trending' | 'new';

export const Feed: React.FC = () => {
  const { user } = useAuthStore();
  const { posts, loading, error, subscribe, unsubscribe } = useFeedStore();
  const { open: openCompose } = useComposeStore();
  const [tab, setTab] = useState<FeedTab>('foryou');
  const [headerVisible, setHeaderVisible] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Fetch following IDs once when user is available
  useEffect(() => {
    if (!user?.id) return;
    getFollowingIds(user.id).then((ids) => setFollowingIds(new Set(ids)));
  }, [user?.id]);

  const visiblePosts = useMemo(() => {
    if (tab === 'following') {
      return posts.filter((p) => followingIds.has(p.authorId));
    }
    if (tab === 'trending') {
      return [...posts].sort((a, b) => (b.likes + b.reposts + b.replies) - (a.likes + a.reposts + a.replies));
    }
    if (tab === 'new') {
      return [...posts].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? new Date(a.createdAt).getTime();
        const bTime = b.createdAt?.toMillis?.() ?? new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
    }
    return posts; // foryou — default feed order
  }, [tab, posts, followingIds]);

  // Subscribe to real-time feed — works for guests too (no like/repost hydration)
  useEffect(() => {
    subscribe(user?.id ?? '');
    return () => unsubscribe();
  }, [user?.id, subscribe, unsubscribe]);

  // Infinite scroll + header hide/show on mobile
  const handleScroll = useCallback(() => {
    const y = window.scrollY;

    // Hide header after 60px scrolled down, show when scrolling back up
    if (y > 60) {
      setHeaderVisible(y < lastScrollY.current);
    } else {
      setHeaderVisible(true);
    }
    lastScrollY.current = y;

    const { loadMore, hasMore, loading } = useFeedStore.getState();
    if (!bottomRef.current || !hasMore || loading) return;
    const rect = bottomRef.current.getBoundingClientRect();
    if (rect.top <= window.innerHeight + 200) loadMore();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Sticky header — hides on mobile when scrolled past 60px */}
      <motion.div
        className="sticky top-0 z-30 bg-[#0D0D14] sm:bg-[#0D0D14]/90 backdrop-blur-xl border-b border-white/10"
        animate={{ y: headerVisible ? 0 : '-100%', opacity: headerVisible ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          <h1 className="text-xl font-bold">Home</h1>
          <button
            onClick={() => openCompose()}
            className="lg:hidden p-2 rounded-full hover:bg-white/5 transition-colors text-[#FF6B35]"
          >
            <PenSquare size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mt-1">
          {([
            ['foryou', 'For You'],
            ['following', 'Following'],
            ['trending', 'Trending'],
            ['new', 'New'],
          ] as [FeedTab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium relative transition-colors
                ${tab === t ? 'text-white' : 'text-[#A0A0B0] hover:text-white'}`}
            >
              {label}
              {tab === t && (
                <motion.div
                  layoutId="feed-tab-indicator"
                  className="absolute bottom-0 left-[calc(50%-7px)] -translate-x-1/2 h-0.5 w-12 bg-[#FF6B35] rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Inline quick-compose strip */}
      <button
        onClick={() => openCompose()}
        className="hidden lg:flex items-center gap-3 w-full px-4 py-4 border-b border-white/10 hover:bg-white/[0.02] transition-colors text-left"
      >
        <img
          src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=random&color=fff`}
          alt="me"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <span className="text-[#6B6B7B] text-base flex-1">What are you watching?</span>
        <span className="text-xs text-[#FF6B35] font-semibold px-3 py-1.5 rounded-full border border-[#FF6B35]/30 hover:bg-[#FF6B35]/10 transition-colors">
          Post
        </span>
      </button>

      {/* Feed content */}
      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[#FF6B35]" size={32} />
        </div>
      ) : error ? (
        <div className="m-4 p-6 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex flex-col items-center gap-3 text-[#EF4444]">
          <AlertCircle size={28} />
          <p className="text-sm font-medium">{error}</p>
          <button
            onClick={() => user && subscribe(user.id)}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-[#EF4444]/30 hover:bg-[#EF4444]/10 transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : visiblePosts.length === 0 && tab === 'following' && !loading ? (
        <div className="flex flex-col items-center py-20 px-6 text-center">
          <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mb-4">
            <Tv className="text-[#FF6B35]" size={28} />
          </div>
          <h3 className="text-lg font-bold mb-1">No posts from people you follow</h3>
          <p className="text-[#A0A0B0] text-sm max-w-xs">
            Follow other anime fans to see their posts here.
          </p>
        </div>
      ) : visiblePosts.length === 0 ? (
        <EmptyFeed onCompose={() => openCompose()} />
      ) : (
        <AnimatePresence initial={false}>
          {visiblePosts.map((post, index) => (
            <React.Fragment key={post.id}>
              <PostCard post={post} />
              {!user?.isPlus && (index + 1) % 5 === 0 && (
                <AdCard key={`ad-${index}`} />
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>
      )}

      {/* Load-more spinner */}
      {loading && posts.length > 0 && (
        <div className="flex justify-center py-6">
          <Loader2 className="animate-spin text-[#FF6B35]" size={24} />
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
};

const EmptyFeed: React.FC<{ onCompose: () => void }> = ({ onCompose }) => (
  <div className="flex flex-col items-center py-20 px-6 text-center">
    <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mb-4">
      <Zap className="text-[#FF6B35]" size={28} />
    </div>
    <h3 className="text-lg font-bold mb-1">Your feed is empty</h3>
    <p className="text-[#A0A0B0] text-sm mb-6 max-w-xs">
      Be the first to post or follow other anime fans to fill your feed.
    </p>
    <button
      onClick={onCompose}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B35] hover:bg-[#FF8A50] text-white font-bold rounded-full transition-colors text-sm"
    >
      <PenSquare size={16} /> Create your first post
    </button>
  </div>
);
