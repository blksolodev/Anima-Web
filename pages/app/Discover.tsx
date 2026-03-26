import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [userResults, setUserResults] = useState<User[]>([]);
  const [addingToLib, setAddingToLib] = useState<string | null>(null);
  
  // View Mode: 'default' | 'all_trending'
  const [viewMode, setViewMode] = useState<'default' | 'all_trending'>('default');
  const [trendingPage, setTrendingPage] = useState(1);
  const [hasMoreTrending, setHasMoreTrending] = useState(true);
  

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Trending on Load
  useEffect(() => {
    const loadTrending = async () => {
      if (viewMode === 'all_trending' && trendingPage > 1) return; // Handled by loadMore

      setLoading(true);
      try {
        const perPage = viewMode === 'all_trending' ? 20 : 6;
        const data = await fetchAniList(GET_TRENDING_ANIME, { page: 1, perPage });
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
    
    // Only load trending if we aren't searching
    if (!debouncedQuery) {
        loadTrending();
    }
  }, [debouncedQuery, viewMode]);

  const loadMoreTrending = async () => {
    if (loading || !hasMoreTrending) return;
    setLoading(true);
    try {
        const nextPage = trendingPage + 1;
        const data = await fetchAniList(GET_TRENDING_ANIME, { page: nextPage, perPage: 20 });
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
        
        if (mapped.length === 0) {
            setHasMoreTrending(false);
        } else {
            setTrendingAnime(prev => [...prev, ...mapped]);
            setTrendingPage(nextPage);
        }
    } catch (error) {
        console.error("Failed to load more trending:", error);
    } finally {
        setLoading(false);
    }
  };

  // Handle Search
  useEffect(() => {
    const doSearch = async () => {
      if (!debouncedQuery) {
        setSearchResults([]);
        setUserResults([]);
        return;
      }
      setLoading(true);
      try {
        // Search Anime
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

        // Search Users (Simple contains query via Firestore)
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef, 
          where('username', '>=', debouncedQuery.toLowerCase()),
          where('username', '<=', debouncedQuery.toLowerCase() + '\uf8ff')
        );
        const userSnaps = await getDocs(q);
        const fetchedUsers = userSnaps.docs.map(d => d.data() as User);
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
      // Use new root collection 'anime_library' with composite key {userId}_{animeId}
      // and short field names
      const docId = `${user.id}_${anime.id}`;
      await setDoc(doc(db, 'anime_library', docId), {
        userId: user.id,
        animeId: anime.id,
        status: 'PLANNING',
        progress: 0,
        score: 0,
        notes: '',
        totalEpisodes: anime.episodes || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (e) {
      console.error(e);
    } finally {
      setAddingToLib(null);
    }
  };

  const isSearching = debouncedQuery.length > 0;
  const hasResults = searchResults.length > 0 || userResults.length > 0;

  if (viewMode === 'all_trending' && !isSearching) {
      return (
        <div className="w-full max-w-3xl mx-auto pt-6 px-4 md:px-6 pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => setViewMode('default')} className="!p-2 !rounded-full">
                    <TrendingUp className="rotate-180" size={20} />
                </Button>
                <h1 className="text-2xl font-bold">Trending Anime</h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {trendingAnime.map((anime) => (
                    <GlassCard
                        key={anime.id}
                        className="!p-0 overflow-hidden cursor-pointer group hover:border-[#FF6B35] transition-colors relative"
                        onClick={() => navigate(`/anime/${anime.id}`)}
                    >
                        <div className="aspect-[2/3] relative">
                            <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-[#FF6B35]">
                                {anime.score}
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToLibrary(anime);
                                    }}
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
            
            {hasMoreTrending && (
                <div className="flex justify-center mt-8">
                    <Button 
                        variant="secondary" 
                        onClick={loadMoreTrending} 
                        disabled={loading}
                        className="!px-8"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Load More'}
                    </Button>
                </div>
            )}
        </div>
      );
  }

  return (
    <div className="w-full max-w-3xl mx-auto pt-6 px-4 md:px-6 pb-20">
      {!isSearching && <h1 className="text-2xl font-bold mb-6">Discover</h1>}

      {/* Main Search */}
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
         // SEARCH RESULTS VIEW
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
                    <GlassCard
                      key={u.id}
                      className="!p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => navigate(`/user/${u.id}`)}
                    >
                        <img
                        src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.username}&background=random&color=fff`}
                        alt={u.username}
                        className="w-12 h-12 rounded-full object-cover border border-white/10"
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
                    <GlassCard
                      key={anime.id}
                      className="!p-0 overflow-hidden cursor-pointer group hover:border-[#FF6B35] transition-colors relative"
                      onClick={() => navigate(`/anime/${anime.id}`)}
                    >
                        <div className="aspect-[2/3] relative">
                        <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-[#FF6B35]">
                            {anime.score}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                            onClick={(e) => { e.stopPropagation(); addToLibrary(anime); }}
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
         // DEFAULT VIEW (Trending)
        <>
          {/* Trending Anime (AniList) */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={20} className="text-[#FF6B35]" /> Trending Now
                </h2>
                <button 
                    onClick={() => setViewMode('all_trending')}
                    className="text-sm text-[#FF6B35] hover:text-white transition-colors font-medium"
                >
                    See All
                </button>
            </div>
            {loading && trendingAnime.length === 0 ? (
                 <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#FF6B35]" /></div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {trendingAnime.map((anime) => (
                    <GlassCard
                        key={anime.id}
                        className="!p-0 overflow-hidden cursor-pointer group hover:border-[#FF6B35] transition-colors"
                        onClick={() => navigate(`/anime/${anime.id}`)}
                    >
                    <div className="aspect-[2/3] relative">
                        <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-[#FF6B35]">
                        {anime.score}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                            onClick={(e) => {
                                e.stopPropagation();
                                addToLibrary(anime);
                            }}
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

          {/* Trending Hashtags */}
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