import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, UserPlus, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Post } from '../../types';
import { getUserById, getUserPosts, isFollowing, followUser, unfollowUser } from '../../services/user.service';
import { useAuthStore } from '../../store/useAuthStore';
import { PostCard } from '../../components/PostCard';

type UserProfileTab = 'posts' | 'media';

export const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<UserProfileTab>('posts');

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      getUserById(userId),
      currentUser && !isOwnProfile ? isFollowing(currentUser.id, userId) : Promise.resolve(false),
    ]).then(([p, isF]) => {
      setProfile(p);
      setFollowing(isF);
      setLoading(false);
    });
  }, [userId, currentUser?.id, isOwnProfile]);

  useEffect(() => {
    if (!userId) return;
    setLoadingPosts(true);
    getUserPosts(userId).then((p) => {
      setPosts(p);
      setLoadingPosts(false);
    });
  }, [userId]);

  const handleFollow = async () => {
    if (!currentUser || !userId || isOwnProfile) return;
    setFollowLoading(true);
    try {
      if (following) {
        await unfollowUser(currentUser.id, userId);
        setFollowing(false);
        setProfile((p) =>
          p ? { ...p, stats: { ...p.stats, followersCount: p.stats.followersCount - 1 } } : p
        );
      } else {
        await followUser(currentUser.id, userId);
        setFollowing(true);
        setProfile((p) =>
          p ? { ...p, stats: { ...p.stats, followersCount: p.stats.followersCount + 1 } } : p
        );
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const displayedPosts =
    activeTab === 'posts'
      ? posts.filter((p) => !p.parentId)
      : posts.filter((p) => !!p.mediaAttachment);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#FF6B35]" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-[#A0A0B0]">
        <p className="text-lg font-semibold">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#0D0D14]/90 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">{profile.displayName}</h1>
          <p className="text-xs text-[#A0A0B0]">{profile.stats?.postsCount ?? 0} posts</p>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-36 bg-gradient-to-br from-[#FF6B35]/20 to-[#4ECDC4]/20">
        {profile.bannerUrl && (
          <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile info block */}
      <div className="px-4 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-end justify-between -mt-10 mb-3">
          <img
            src={
              profile.avatarUrl ||
              `https://ui-avatars.com/api/?name=${profile.username}&background=random&color=fff&size=80`
            }
            alt={profile.username}
            className="w-20 h-20 rounded-full border-4 border-[#0D0D14] object-cover"
          />
          {isOwnProfile ? (
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-1.5 rounded-full border border-white/20 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-colors
                ${
                  following
                    ? 'border border-white/20 hover:border-[#EF4444] hover:text-[#EF4444]'
                    : 'bg-white text-black hover:bg-white/90'
                }`}
            >
              {followLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : following ? (
                <><UserCheck size={14} /> Following</>
              ) : (
                <><UserPlus size={14} /> Follow</>
              )}
            </button>
          )}
        </div>

        <h2 className="text-xl font-bold">{profile.displayName}</h2>
        <p className="text-[#A0A0B0] text-sm">@{profile.username}</p>
        {profile.bio && (
          <p className="text-sm mt-2 leading-relaxed text-white/80">{profile.bio}</p>
        )}

        <div className="flex gap-5 mt-3 text-sm">
          <span>
            <strong className="text-white">{profile.stats?.followingCount ?? 0}</strong>
            <span className="text-[#A0A0B0] ml-1">Following</span>
          </span>
          <span>
            <strong className="text-white">{profile.stats?.followersCount ?? 0}</strong>
            <span className="text-[#A0A0B0] ml-1">Followers</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {(['posts', 'media'] as UserProfileTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-3 text-sm font-medium relative transition-colors capitalize
              ${activeTab === t ? 'text-white' : 'text-[#A0A0B0] hover:text-white'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {activeTab === t && (
              <motion.div
                layoutId="user-profile-tab-indicator"
                className="absolute bottom-0 left-[calc(50%-7px)] -translate-x-1/2 h-0.5 w-10 bg-[#FF6B35] rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loadingPosts ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[#FF6B35]" size={28} />
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className="text-center py-16 text-[#A0A0B0]">
          <p className="text-sm">No {activeTab} yet.</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {displayedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};
