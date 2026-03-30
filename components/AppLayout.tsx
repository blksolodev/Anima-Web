import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { MobileNav } from './MobileNav';
import { ComposeModal } from './ComposeModal';
import { GlassCard } from './GlassCard';
import { Search, Loader2 } from 'lucide-react';
import { fetchAniList, GET_TRENDING_ANIME } from '../lib/anilist';
import { Anime } from '../types';

export const AppLayout: React.FC = () => {
  const [trending, setTrending] = useState<Anime[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const data = await fetchAniList(GET_TRENDING_ANIME, { page: 1, perPage: 5 });
        const mapped = data.Page.media.map((item: any) => ({
          id: item.id.toString(),
          title: item.title.english || item.title.romaji,
          coverImage: item.coverImage.large,
          bannerImage: item.bannerImage,
          episodes: item.episodes,
          score: item.averageScore ? item.averageScore / 10 : 0,
          status: item.status,
          genres: item.genres,
        }));
        setTrending(mapped);
      } catch (error) {
        console.error("Failed to load sidebar trending:", error);
      } finally {
        setLoadingTrending(false);
      }
    };
    loadTrending();
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D14] flex text-white pb-20 lg:pb-0">
      {/* Desktop Sidebar */}
      <AppSidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen border-r border-white/10 relative">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* Compose Modal — global, opened from Sidebar/MobileNav/Feed */}
      <ComposeModal />

      {/* Right Sidebar (Trending/Ads) - Desktop Only */}
      <aside className="hidden xl:block w-80 sticky top-0 h-screen overflow-y-auto p-6 border-l border-white/10 bg-[#0D0D14] z-40">
        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0B0]" size={18} />
          <input
            type="text"
            placeholder="Search anime, users..."
            className="w-full bg-[#1A1A2E] border border-white/10 rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
          />
        </div>

        {/* Trending Anime */}
        <div>
          <h3 className="font-bold text-lg mb-4">Trending This Season</h3>
          <div className="space-y-4">
            {loadingTrending ? (
               <div className="flex justify-center py-4">
                 <Loader2 className="animate-spin text-[#FF6B35]" size={24} />
               </div>
            ) : (
              trending.map((anime) => (
                <GlassCard key={anime.id} className="!p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
                  <img src={anime.coverImage} alt={anime.title} className="w-12 h-16 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate" title={anime.title}>{anime.title}</h4>
                    <p className="text-xs text-[#A0A0B0] truncate">{anime.genres?.slice(0, 2).join(", ")}</p>
                    <p className="text-xs text-[#FF6B35] mt-1">⭐ {anime.score}</p>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};