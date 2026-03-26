import React, { useState, useEffect } from 'react';
import { Search, Hash, UserPlus, Loader2, TrendingUp, Check, AlertCircle } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { TRENDING_TAGS } from '../../constants';
import { Button } from '../../components/Button';
import { fetchAniList, GET_TRENDING_ANIME, SEARCH_ANIME } from '../../lib/anilist';
import { Anime, User } from '../../types';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';

export const Discover: React.FC = () => {
  const { user } = useAuthStore();
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [userResults, setUserResults] = useState<User[]>([]);
  const [addingToLib, setAddingToLib] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const loadTrending = async () => {
      setLoading(true);
      try {
        const data = await fetchAniList(GET_TRENDING_ANIME, { page: 1, perPage: 6 });
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
        setTrendingAnime(mapped);
      } catch (error) {
        console.error("Failed to load trending:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!debouncedQuery) {
        loadTrending();
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const doSearch = async () => {
      if (!debouncedQuery) {
        setSearchResults([]);
        setUserResults([]);
        return;
      }
      setLoading(true);
      try {
        const animeData = await fetchAniList(SEARCH_ANIME, { search: debouncedQuery, page: 1, perPage: 8 });
        const mappedAnime = animeData.Page.media.map((item: any) => ({
          id: item.id.toString(),
          title: item.title.english || item.title.romaji,
          coverImage: item.coverImage.large,
          bannerImage: item.bannerImage,
          episodes: item.episodes,
          score: item.averageScore ? item.averageScore / 10 : 0,
          status: item.status,
          genres: item.genres,
        }));
        setSearchResults(mappedAnime);

        const usersRef = collection(db, 'users');
        const q = query(
          usersRef, 
          where('username', '>=', debouncedQuery.toLowerCase()),
          where('username', '<=', debouncedQuery.toLowerCase() + '\uf8ff')
        );
        const userSnaps = await getDocs(q);
        const fetchedUsers = userSnaps.docs.map(d => ({ id: d.id, ...d.data() }) as User);
        setUserResults(fetchedUsers);

      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };
    doSearch();
  }, [debouncedQuery]);

  const addToLibrary = async (anime: Anime) => {
    if (!user) return;
    setAddingToLib(anime.id);
    try {
      const docId = `${user.id}_${anime.id}`;
      // Full Schema as per documentation
      await setDoc(doc(db, 'anime_library', docId), {
        odcId: docId,
        odcuserId: user.id,
        animeId: parseInt(anime.id),
        status: 'PLANNING',
        progress: 0,
        score: null,
        notes: null,
        startedAt: null,
        completedAt: null,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        anime: {
           id: parseInt(anime.id),
           title: { 
               romaji: anime.title || '', 
               english: anime.title || '', 
               native: '' 
           },
           coverImage: { 
               large: anime.coverImage, 
               medium: anime.coverImage 
           },
           bannerImage: anime.bannerImage || null,
           episodes: anime.episodes || null,
           format: 'TV', // Default fallback
           status: anime.status || 'UNKNOWN',
           genres: anime.genres || [],
           averageScore: anime.score ? anime.score * 10 : 0,
           season: 'UNKNOWN',
           seasonYear: new Date().getFullYear()
        }
      }, { merge: true });

    } catch (e) {
      console.error(e);
    } finally {
      setAddingToLib(null);
    }
  };

  const isSearching = debouncedQuery.length > 0;
  const hasResults = searchResults.length > 0 || userResults.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto pt-6 px-4 md:px-6 pb-20">
      <h1 className="text-2xl font-bold mb-6">Discover</h1>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0B0]" size={20} />
        <input 
          type="text" 
          placeholder="Search for anime or users..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#FF6B35] transition-colors shadow-lg"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-[#FF6B35]" size={20} />
          </div>
        )}
      </div>

      {isSearching ? (
         <>
            {!loading && !hasResults && (
                <div className="text-center py-20 text-[#A0A0B0]">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <p className="text-white font-bold mb-1">No results found</p>
                    <p>We couldn't find anything for "{debouncedQuery}"</p>
                </div>
            )}

            {userResults.length > 0 && (
                <section className="mb-8">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <UserPlus size={20} className="text-[#F4D03F]" /> Users
                </h2>
                <div className="space-y-3">
                    {userResults.map((u) => (
                    <GlassCard key={u.id} className="!p-4 flex items-center gap-4">
                        <img 
                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}`} 
                        alt={u.username} 
                        className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                        <p className="font-bold">{u.displayName}</p>
                        <p className="text-sm text-[#A0A0B0]">@{u.username}</p>
                        </div>
                        <Button className="!px-4 !py-2 !rounded-lg !text-sm">View</Button>
                    </GlassCard>
                    ))}
                </div>
                </section>
            )}

            {searchResults.length > 0 && (
                <section className="mb-8">
                <h2 className="text-lg font-bold mb-4">Anime Results</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {searchResults.map((anime) => (
                    <GlassCard key={anime.id} className="!p-0 overflow-hidden cursor-pointer group hover:border-[#FF6B35] transition-colors relative">
                        <div className="aspect-[2/3] relative">
                        <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-[#FF6B35]">
                            {anime.score}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                            onClick={() => addToLibrary(anime)}
                            className="!p-2 !rounded-full !h-10 !w-10 flex items-center justify-center"
                            disabled={addingToLib === anime.id}
                            >
                            {addingToLib === anime.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                            </Button>
                        </div>
                        </div>
                        <div className="p-3">
                        <h3 className="font-bold text-sm truncate">{anime.title}</h3>
                        <p className="text-xs text-[#A0A0B0]">{anime.genres?.[0] || 'Anime'}</p>
                        </div>
                    </GlassCard>
                    ))}
                </div>
                </section>
            )}
         </>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#FF6B35]" /> Trending Now
            </h2>
            {loading && trendingAnime.length === 0 ? (
                 <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#FF6B35]" /></div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {trendingAnime.map((anime) => (
                    <GlassCard key={anime.id} className="!p-0 overflow-hidden cursor-pointer group hover:border-[#FF6B35] transition-colors">
                    <div className="aspect-[2/3] relative">
                        <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-[#FF6B35]">
                        {anime.score}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                            onClick={() => addToLibrary(anime)}
                            className="!px-4 !py-2 !rounded-full text-xs"
                            disabled={addingToLib === anime.id}
                            >
                            {addingToLib === anime.id ? 'Adding...' : '+ Library'}
                            </Button>
                        </div>
                    </div>
                    <div className="p-3">
                        <h3 className="font-bold text-sm truncate">{anime.title}</h3>
                        <p className="text-xs text-[#A0A0B0]">{anime.genres?.[0] || 'Anime'}</p>
                    </div>
                    </GlassCard>
                ))}
                </div>
            )}
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Hash size={20} className="text-[#4ECDC4]" /> Trending Topics
            </h2>
            <div className="grid gap-3">
              {TRENDING_TAGS.map((item, idx) => (
                <GlassCard key={idx} className="!p-4 flex justify-between items-center hover:bg-white/5 cursor-pointer transition-colors">
                  <div>
                    <p className="font-bold text-white">#{item.tag}</p>
                    <p className="text-sm text-[#A0A0B0]">{item.posts}</p>
                  </div>
                  <Button variant="ghost" className="!px-4 !py-2 !rounded-lg !text-xs">View</Button>
                </GlassCard>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};