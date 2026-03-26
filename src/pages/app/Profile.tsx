import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { PostCard } from '../../components/PostCard';
import { MapPin, Link as LinkIcon, Calendar, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Quest } from '../../types';

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'quests'), 
          where('authorId', '==', user.id)
        );
        const snapshot = await getDocs(q);
        const userQuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Quest[];
        
        userQuests.sort((a, b) => {
             const timeA = a.createdAt?.seconds || 0;
             const timeB = b.createdAt?.seconds || 0;
             return timeB - timeA;
        });

        setQuests(userQuests);
      } catch (error: any) {
        console.error("Error fetching user quests:", error);
        setError("Could not load quests.");
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20">
      {/* Banner */}
      <div className="h-64 md:h-80 w-full relative">
        <img 
           src={user.bannerUrl || "https://picsum.photos/id/1018/1000/300"} 
           alt="Banner" 
           className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D14] to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative -mt-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-4">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#0D0D14] overflow-hidden relative group cursor-pointer">
               <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}`} alt="Avatar" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-xs font-bold">Edit</span>
               </div>
             </div>
             <div>
               <h1 className="text-3xl font-bold flex items-center gap-2">
                 {user.displayName}
                 <span className="px-2 py-0.5 rounded bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-mono border border-[#FF6B35]/20">
                    LVL {user.powerLevel}
                 </span>
               </h1>
               <p className="text-[#A0A0B0]">@{user.username}</p>
             </div>
          </div>
          <Button variant="ghost" className="!rounded-xl !px-6">Edit Profile</Button>
        </div>

        {/* Bio & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2 space-y-4">
            <p className="text-lg leading-relaxed text-white/90">
              {user.bio || "No bio yet."}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-[#A0A0B0]">
              <span className="flex items-center gap-1"><MapPin size={16} /> Tokyo-3</span>
              <span className="flex items-center gap-1"><LinkIcon size={16} className="text-[#4ECDC4]" /> myanimelist.net</span>
              <span className="flex items-center gap-1"><Calendar size={16} /> Joined recently</span>
            </div>
            <div className="flex gap-6">
              <div className="flex gap-1">
                <span className="font-bold text-white">{user.stats?.followingCount || 0}</span>
                <span className="text-[#A0A0B0]">Following</span>
              </div>
              <div className="flex gap-1">
                <span className="font-bold text-white">{user.stats?.followersCount || 0}</span>
                <span className="text-[#A0A0B0]">Followers</span>
              </div>
            </div>
          </div>

          <GlassCard className="!p-4 bg-gradient-to-br from-[#1A1A2E] to-[#16213E]">
             <h3 className="text-sm font-bold text-[#A0A0B0] uppercase mb-4">Current Stats</h3>
             <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span>XP Progress</span>
                   <span className="text-[#FF6B35]">{user.xp % 1000 / 10}%</span>
                 </div>
                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                   <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8A50] w-[85%] h-full rounded-full" />
                 </div>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-white/5">
                 <span className="text-sm">Episodes Watched</span>
                 <span className="font-mono text-[#4ECDC4]">{user.stats?.totalEpisodesWatched || 0}</span>
               </div>
             </div>
          </GlassCard>
        </div>

        {/* Content Tabs */}
        <div className="border-b border-white/10 mb-6">
          <div className="flex gap-8">
            <button className="pb-4 border-b-2 border-[#FF6B35] text-[#FF6B35] font-bold">Quests</button>
            <button className="pb-4 border-b-2 border-transparent text-[#A0A0B0] hover:text-white transition-colors">Replies</button>
            <button className="pb-4 border-b-2 border-transparent text-[#A0A0B0] hover:text-white transition-colors">Media</button>
            <button className="pb-4 border-b-2 border-transparent text-[#A0A0B0] hover:text-white transition-colors">Likes</button>
          </div>
        </div>

        {/* User Quests */}
        <div className="space-y-4">
          {loadingPosts ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
          ) : error ? (
            <div className="text-center text-[#EF4444] py-10 bg-[#EF4444]/10 rounded-xl">
               <p>{error}</p>
            </div>
          ) : quests.length > 0 ? (
            quests.map((quest) => (
             <PostCard key={quest.id} quest={quest} />
          ))
          ) : (
             <div className="text-center text-[#A0A0B0]">No quests yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};