import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, PenSquare } from 'lucide-react';
import { PostCard } from '../../components/PostCard';
import { EditProfileModal } from '../../components/EditProfileModal';
import { useAuthStore } from '../../store/useAuthStore';
import { useComposeStore } from '../../store/useComposeStore';
import { getUserPosts, getUserLikedPosts } from '../../services/user.service';
import { Post } from '../../types';

type ProfileTab = 'posts' | 'replies' | 'media' | 'likes';

const TABS: { key: ProfileTab; label: string }[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'replies', label: 'Replies' },
  { key: 'media', label: 'Media' },
  { key: 'likes', label: 'Likes' },
];

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const { open: openCompose } = useComposeStore();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserPosts(user.id).then((posts) => {
      setAllPosts(posts);
      setLoading(false);
    });
  }, [user?.id]);

  // Lazy-load likes only when that tab is first selected
  useEffect(() => {
    if (activeTab !== 'likes' || !user || likedPosts.length > 0) return;
    setLoadingLikes(true);
    getUserLikedPosts(user.id).then((posts) => {
      setLikedPosts(posts);
      setLoadingLikes(false);
    });
  }, [activeTab, user?.id]);

  if (!user) return null;

  const displayedPosts: Post[] =
    activeTab === 'posts'   ? allPosts.filter((p) => !p.parentId)
    : activeTab === 'replies' ? allPosts.filter((p) => !!p.parentId)
    : activeTab === 'media'   ? allPosts.filter((p) => !!p.mediaAttachment)
    : likedPosts;

  const isLoading = activeTab === 'likes' ? loadingLikes : loading;

  return (
    <div className="min-h-screen pb-20">
      {/* Banner */}
      <div className="h-48 md:h-60 w-full relative">
        <img
          src={user.bannerUrl || 'https://picsum.photos/id/1018/1000/300'}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D14] to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-4 relative z-10">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-14 mb-4">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-[#0D0D14] overflow-hidden bg-[#1A1A2E] flex-shrink-0">
            <img
              src={
                user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=112`
              }
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => openCompose()}
              className="p-2 rounded-full border border-white/20 hover:bg-white/5 transition-colors text-[#A0A0B0] hover:text-white"
            >
              <PenSquare size={18} />
            </button>
            <button
              onClick={() => setEditOpen(true)}
              className="px-4 py-1.5 rounded-full border border-white/20 text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Edit profile
            </button>
          </div>
        </div>

        {/* Name / handle / bio */}
        <h1 className="text-xl font-bold flex items-center gap-2 flex-wrap">
          {user.displayName}
          <span className="px-2 py-0.5 rounded bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-mono border border-[#FF6B35]/20">
            LVL {user.powerLevel ?? 1}
          </span>
        </h1>
        <p className="text-[#A0A0B0] text-sm mb-2">@{user.username}</p>
        {user.bio && (
          <p className="text-sm text-white/80 leading-relaxed mb-3 max-w-md">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-5 text-sm">
          <span>
            <strong className="text-white">{user.stats?.followingCount ?? 0}</strong>
            <span className="text-[#A0A0B0] ml-1">Following</span>
          </span>
          <span>
            <strong className="text-white">{user.stats?.followersCount ?? 0}</strong>
            <span className="text-[#A0A0B0] ml-1">Followers</span>
          </span>
          <span>
            <strong className="text-white">{user.stats?.postsCount ?? 0}</strong>
            <span className="text-[#A0A0B0] ml-1">Posts</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto mt-4">
        <div className="flex border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium relative transition-colors
                ${activeTab === t.key ? 'text-white' : 'text-[#A0A0B0] hover:text-white'}`}
            >
              {t.label}
              {activeTab === t.key && (
                <motion.div
                  layoutId="profile-tab-indicator"
                  className="absolute bottom-0 left-[calc(50%-7px)] -translate-x-1/2 h-0.5 w-10 bg-[#FF6B35] rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-[#FF6B35]" size={28} />
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="text-center py-16 text-[#A0A0B0]">
            <p className="text-sm">Nothing here yet.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
};
