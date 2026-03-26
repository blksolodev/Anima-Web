import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Check, Upload, Loader2, Search, X,
  BookOpen, Eye, Clock, Star, Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { fetchAniList, GET_TRENDING_ANIME, SEARCH_ANIME } from '../lib/anilist';
import { db, storage } from '../lib/firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AniItem {
  id: number;
  title: string;
  coverImage: string;
  episodes: number;
  genres: string[];
}

type LibraryStatus = 'WATCHING' | 'COMPLETED' | 'PLANNING';

interface LibrarySelection {
  anime: AniItem;
  status: LibraryStatus;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const GENRES = [
  { label: 'Action',       color: '#EF4444' },
  { label: 'Adventure',    color: '#F97316' },
  { label: 'Comedy',       color: '#EAB308' },
  { label: 'Drama',        color: '#8B5CF6' },
  { label: 'Fantasy',      color: '#6366F1' },
  { label: 'Horror',       color: '#DC2626' },
  { label: 'Mecha',        color: '#64748B' },
  { label: 'Mystery',      color: '#7C3AED' },
  { label: 'Romance',      color: '#EC4899' },
  { label: 'Sci-Fi',       color: '#06B6D4' },
  { label: 'Slice of Life',color: '#10B981' },
  { label: 'Sports',       color: '#F59E0B' },
  { label: 'Supernatural', color: '#A855F7' },
  { label: 'Psychological',color: '#4F46E5' },
  { label: 'Isekai',       color: '#059669' },
  { label: 'Shounen',      color: '#FF6B35' },
  { label: 'Shoujo',       color: '#F472B6' },
  { label: 'Seinen',       color: '#374151' },
];

const PRESET_BANNERS = [
  'https://picsum.photos/id/1018/1200/400',
  'https://picsum.photos/id/1033/1200/400',
  'https://picsum.photos/id/1043/1200/400',
  'https://picsum.photos/id/119/1200/400',
  'https://picsum.photos/id/137/1200/400',
  'https://picsum.photos/id/175/1200/400',
];

const STEPS = [
  'Profile',
  'Favorites',
  'Genres',
  'Library',
  'Done',
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const parseAniListItem = (m: any): AniItem => ({
  id: m.id,
  title: m.title?.english || m.title?.romaji || 'Unknown',
  coverImage: m.coverImage?.extraLarge || m.coverImage?.large || '',
  episodes: m.episodes || 0,
  genres: m.genres || [],
});

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#FF6B35', '#4ECDC4', '#F59E0B', '#EC4899', '#6366F1', '#10B981'];

const ConfettiPiece: React.FC<{ delay: number; x: number; color: string }> = ({ delay, x, color }) => (
  <motion.div
    initial={{ y: -20, x, opacity: 1, rotate: 0, scale: 1 }}
    animate={{ y: '110vh', rotate: 720, opacity: [1, 1, 0], scale: [1, 1, 0.5] }}
    transition={{ duration: 3 + Math.random() * 2, delay, ease: 'easeIn' }}
    className="fixed top-0 w-2.5 h-2.5 rounded-sm pointer-events-none z-50"
    style={{ left: x, backgroundColor: color }}
  />
);

const Confetti: React.FC = () => (
  <>
    {Array.from({ length: 40 }).map((_, i) => (
      <ConfettiPiece
        key={i}
        delay={i * 0.08}
        x={Math.random() * window.innerWidth}
        color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
      />
    ))}
  </>
);

// ─── Status Button ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: LibraryStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'WATCHING',  label: 'Watching',  icon: <Eye size={13} />,      color: '#06B6D4' },
  { value: 'COMPLETED', label: 'Completed', icon: <Check size={13} />,    color: '#10B981' },
  { value: 'PLANNING',  label: 'Planning',  icon: <Clock size={13} />,    color: '#A0A0B0' },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // ── Step state ──
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [saving, setSaving] = useState(false);

  // ── Step 1: Profile ──
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(user?.bannerUrl || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step 2: Anime Picks ──
  const [trending, setTrending] = useState<AniItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [picks, setPicks] = useState<AniItem[]>([]);

  // ── Step 3: Genres ──
  const [genres, setGenres] = useState<string[]>([]);

  // ── Step 4: Library ──
  const [library, setLibrary] = useState<LibrarySelection[]>([]);
  const [libSearch, setLibSearch] = useState('');
  const [libResults, setLibResults] = useState<AniItem[]>([]);
  const [libSearching, setLibSearching] = useState(false);
  const libSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Fetch trending on mount ───────────────────────────────────────────────
  useEffect(() => {
    setTrendingLoading(true);
    fetchAniList(GET_TRENDING_ANIME, { page: 1, perPage: 30 })
      .then((data) => {
        const items: AniItem[] = (data?.Page?.media || []).map(parseAniListItem);
        setTrending(items);
      })
      .catch(console.error)
      .finally(() => setTrendingLoading(false));
  }, []);

  // ─── Sync picks → library when entering step 4 ────────────────────────────
  useEffect(() => {
    if (step === 3) {
      setLibrary((prev) => {
        const existingIds = new Set(prev.map((e) => e.anime.id));
        const newEntries: LibrarySelection[] = picks
          .filter((p) => !existingIds.has(p.id))
          .map((p) => ({ anime: p, status: 'COMPLETED' }));
        return [...prev, ...newEntries];
      });
    }
  }, [step]);

  // ─── Library search debounce ───────────────────────────────────────────────
  const handleLibSearch = useCallback((q: string) => {
    setLibSearch(q);
    if (libSearchTimer.current) clearTimeout(libSearchTimer.current);
    if (!q.trim()) { setLibResults([]); return; }
    libSearchTimer.current = setTimeout(async () => {
      setLibSearching(true);
      try {
        const data = await fetchAniList(SEARCH_ANIME, { search: q, page: 1, perPage: 10 });
        setLibResults((data?.Page?.media || []).map(parseAniListItem));
      } catch { /* ignore */ }
      finally { setLibSearching(false); }
    }, 350);
  }, []);

  // ─── Avatar upload ─────────────────────────────────────────────────────────
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.id}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setAvatarUrl(url);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setAvatarUploading(false);
    }
  };

  // ─── Navigation ────────────────────────────────────────────────────────────
  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };
  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  // ─── Anime pick toggle ─────────────────────────────────────────────────────
  const togglePick = (anime: AniItem) => {
    setPicks((prev) =>
      prev.find((p) => p.id === anime.id)
        ? prev.filter((p) => p.id !== anime.id)
        : [...prev, anime]
    );
  };

  // ─── Genre toggle ──────────────────────────────────────────────────────────
  const toggleGenre = (g: string) => {
    setGenres((prev) =>
      prev.includes(g)
        ? prev.filter((x) => x !== g)
        : prev.length >= 5 ? prev : [...prev, g]
    );
  };

  // ─── Library status toggle ─────────────────────────────────────────────────
  const setLibStatus = (animeId: number, status: LibraryStatus) => {
    setLibrary((prev) =>
      prev.map((e) => e.anime.id === animeId ? { ...e, status } : e)
    );
  };

  const addToLibrary = (anime: AniItem) => {
    if (library.find((e) => e.anime.id === anime.id)) return;
    setLibrary((prev) => [...prev, { anime, status: 'PLANNING' }]);
    setLibSearch('');
    setLibResults([]);
  };

  const removeFromLibrary = (animeId: number) => {
    setLibrary((prev) => prev.filter((e) => e.anime.id !== animeId));
  };

  // ─── Final save ────────────────────────────────────────────────────────────
  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update user profile
      await updateDoc(doc(db, 'users', user.id), {
        displayName: displayName.trim() || user.displayName,
        bio: bio.trim(),
        avatarUrl,
        bannerUrl,
        favoriteGenres: genres,
        onboardingComplete: true,
      });

      // Write library entries
      await Promise.all(
        library.map((entry) =>
          setDoc(doc(db, 'anime_library', `${user.id}_${entry.anime.id}`), {
            userId: user.id,
            animeId: String(entry.anime.id),
            status: entry.status,
            s: entry.status,
            progress: 0,
            p: 0,
            score: 0,
            sc: 0,
            totalEpisodes: entry.anime.episodes,
            anime: {
              id: String(entry.anime.id),
              title: entry.anime.title,
              coverImage: entry.anime.coverImage,
              episodes: entry.anime.episodes,
            },
            updatedAt: serverTimestamp(),
            u: serverTimestamp(),
          })
        )
      );

      navigate('/');
    } catch (err) {
      console.error('Onboarding save failed:', err);
      setSaving(false);
    }
  };

  // ─── Validation ────────────────────────────────────────────────────────────
  const canContinue = [
    true,                     // step 0: profile (always ok to skip)
    picks.length >= 3,        // step 1: need 3+ picks
    genres.length >= 1,       // step 2: need 1+ genre
    true,                     // step 3: library always ok
    true,                     // step 4: done
  ][step];

  // ─── Slide variants ────────────────────────────────────────────────────────
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0D0D14] text-white flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#FF6B35] opacity-[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#4ECDC4] opacity-[0.04] blur-[120px]" />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <div className="h-1 bg-white/5">
          <motion.div
            className="h-full bg-[#FF6B35]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        {/* Step labels */}
        <div className="flex justify-between px-6 py-2 max-w-3xl mx-auto">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={`text-xs font-medium transition-colors ${
                i <= step ? 'text-[#FF6B35]' : 'text-[#3A3A4A]'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col items-center pt-20 pb-28 px-4 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-3xl"
          >
            {/* ── Step 0: Profile Setup ── */}
            {step === 0 && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">Set up your profile</h1>
                  <p className="text-[#A0A0B0]">
                    Welcome, <span className="text-white font-semibold">@{user?.username}</span>! Let's make your profile look great.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left: avatar + banner */}
                  <div>
                    {/* Banner */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-[#A0A0B0] mb-2">Banner</p>
                      <div className="h-28 rounded-xl overflow-hidden bg-white/5 border border-white/10 relative">
                        {bannerUrl && (
                          <img src={bannerUrl} alt="banner" className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {PRESET_BANNERS.map((b) => (
                          <button
                            key={b}
                            onClick={() => setBannerUrl(b)}
                            className={`w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                              bannerUrl === b ? 'border-[#FF6B35] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={b} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Avatar */}
                    <div>
                      <p className="text-sm font-medium text-[#A0A0B0] mb-2">Avatar</p>
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex-shrink-0">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#FF6B35]">
                              {(displayName || user?.username || '?')[0].toUpperCase()}
                            </div>
                          )}
                          {avatarUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 size={20} className="animate-spin text-[#FF6B35]" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <Upload size={14} /> Upload photo
                          </button>
                          {avatarUrl && (
                            <button
                              onClick={() => setAvatarUrl(null)}
                              className="text-xs text-[#A0A0B0] hover:text-white transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: name + bio */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#A0A0B0] mb-2">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={user?.username || 'Your name'}
                        maxLength={30}
                        className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF6B35] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A0A0B0] mb-2">
                        Bio <span className="text-[#6B6B7B]">({bio.length}/160)</span>
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 160))}
                        placeholder="Tell the guild about yourself..."
                        rows={4}
                        className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white resize-none focus:outline-none focus:border-[#FF6B35] transition-colors"
                      />
                    </div>
                    <p className="text-xs text-[#6B6B7B]">You can always update this later in your profile settings.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: Anime Picks ── */}
            {step === 1 && (
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">Pick your favorites</h1>
                  <p className="text-[#A0A0B0]">
                    Select at least 3 anime you love. We'll use these to personalize your experience.
                  </p>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#FF6B35] rounded-full"
                      animate={{ width: `${Math.min(100, (picks.length / 3) * 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${picks.length >= 3 ? 'text-[#10B981]' : 'text-[#A0A0B0]'}`}>
                    {picks.length} / 3+ selected
                  </span>
                </div>

                {trendingLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="animate-spin text-[#FF6B35]" size={32} />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {trending.map((anime) => {
                      const selected = !!picks.find((p) => p.id === anime.id);
                      return (
                        <motion.button
                          key={anime.id}
                          onClick={() => togglePick(anime)}
                          whileTap={{ scale: 0.94 }}
                          className={`relative rounded-xl overflow-hidden aspect-[2/3] border-2 transition-all ${
                            selected ? 'border-[#FF6B35] shadow-lg shadow-[#FF6B35]/20' : 'border-transparent hover:border-white/20'
                          }`}
                        >
                          <img
                            src={anime.coverImage}
                            alt={anime.title}
                            className="w-full h-full object-cover"
                          />
                          <div className={`absolute inset-0 transition-all ${
                            selected ? 'bg-[#FF6B35]/20' : 'bg-black/10 hover:bg-black/0'
                          }`} />
                          {selected && (
                            <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center shadow">
                              <Check size={13} strokeWidth={3} />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-white text-[10px] font-medium leading-tight line-clamp-2">{anime.title}</p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Genre Preferences ── */}
            {step === 2 && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">What genres are you into?</h1>
                  <p className="text-[#A0A0B0]">Pick up to 5 genres. We'll tailor your feed around them.</p>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#FF6B35] rounded-full"
                      animate={{ width: `${(genres.length / 5) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${genres.length >= 1 ? 'text-[#10B981]' : 'text-[#A0A0B0]'}`}>
                    {genres.length} / 5
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {GENRES.map(({ label, color }) => {
                    const selected = genres.includes(label);
                    const maxed = genres.length >= 5 && !selected;
                    return (
                      <motion.button
                        key={label}
                        onClick={() => !maxed && toggleGenre(label)}
                        whileTap={!maxed ? { scale: 0.93 } : {}}
                        className={`px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-all ${
                          selected
                            ? 'text-white border-transparent'
                            : maxed
                            ? 'border-white/5 text-[#4A4A5A] cursor-not-allowed'
                            : 'border-white/10 text-[#A0A0B0] hover:border-white/30 hover:text-white'
                        }`}
                        style={selected ? { backgroundColor: color + '33', borderColor: color, color } : {}}
                      >
                        {selected && <Check size={13} className="inline mr-1.5 -mt-0.5" />}
                        {label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Step 3: Library ── */}
            {step === 3 && (
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">Build your library</h1>
                  <p className="text-[#A0A0B0]">
                    Your favorites were added automatically. Set their status or search for more.
                  </p>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B7B]" />
                  <input
                    type="text"
                    value={libSearch}
                    onChange={(e) => handleLibSearch(e.target.value)}
                    placeholder="Search for more anime..."
                    className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#FF6B35] transition-colors"
                  />
                  {libSearching && (
                    <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#A0A0B0]" />
                  )}
                </div>

                {/* Search results dropdown */}
                <AnimatePresence>
                  {libResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-4 bg-[#1A1A2E] border border-white/10 rounded-xl overflow-hidden"
                    >
                      {libResults.map((anime) => {
                        const inLib = !!library.find((e) => e.anime.id === anime.id);
                        return (
                          <button
                            key={anime.id}
                            onClick={() => !inLib && addToLibrary(anime)}
                            disabled={inLib}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors disabled:opacity-50 text-left"
                          >
                            <img src={anime.coverImage} alt={anime.title} className="w-8 h-11 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{anime.title}</p>
                              <p className="text-xs text-[#A0A0B0]">{anime.episodes ? `${anime.episodes} eps` : 'Episodes TBA'}</p>
                            </div>
                            {inLib ? (
                              <span className="text-xs text-[#10B981] font-medium">Added</span>
                            ) : (
                              <span className="text-xs text-[#FF6B35] font-medium">+ Add</span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Library list */}
                {library.length === 0 ? (
                  <div className="text-center py-12 text-[#A0A0B0]">
                    <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Your library is empty. Go back and pick some favorites!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {library.map((entry) => (
                      <div
                        key={entry.anime.id}
                        className="flex items-center gap-3 p-3 bg-[#12121A] border border-white/5 rounded-xl"
                      >
                        <img
                          src={entry.anime.coverImage}
                          alt={entry.anime.title}
                          className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{entry.anime.title}</p>
                          <p className="text-xs text-[#6B6B7B]">
                            {entry.anime.episodes ? `${entry.anime.episodes} eps` : 'Episodes TBA'}
                          </p>
                          {/* Status selector */}
                          <div className="flex gap-1.5 mt-2">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => setLibStatus(entry.anime.id, opt.value)}
                                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full transition-all ${
                                  entry.status === opt.value
                                    ? 'text-white'
                                    : 'bg-white/5 text-[#6B6B7B] hover:text-white hover:bg-white/10'
                                }`}
                                style={entry.status === opt.value ? { backgroundColor: opt.color + '33', color: opt.color } : {}}
                              >
                                {opt.icon} {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromLibrary(entry.anime.id)}
                          className="p-1.5 text-[#6B6B7B] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Step 4: Complete ── */}
            {step === 4 && (
              <div className="text-center">
                <Confetti />
                <motion.div
                  initial={{ scale: 0.5, rotate: -15, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#F59E0B] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#FF6B35]/30"
                >
                  <Sparkles size={42} className="text-white" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-4xl font-bold mb-3">You're all set!</h1>
                  <p className="text-[#A0A0B0] text-lg mb-10">
                    Welcome to the guild, <span className="text-white font-bold">@{user?.username}</span>.
                  </p>
                </motion.div>

                {/* Summary cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10 text-left"
                >
                  {displayName && (
                    <div className="bg-[#12121A] border border-white/10 rounded-2xl p-4">
                      <p className="text-[#A0A0B0] text-xs mb-1">Profile</p>
                      <div className="flex items-center gap-2">
                        {avatarUrl && (
                          <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <p className="font-semibold text-sm text-white truncate">{displayName}</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-[#12121A] border border-white/10 rounded-2xl p-4">
                    <p className="text-[#A0A0B0] text-xs mb-1">Favorites</p>
                    <div className="flex -space-x-2">
                      {picks.slice(0, 4).map((p) => (
                        <img key={p.id} src={p.coverImage} alt={p.title} className="w-8 h-11 rounded object-cover border-2 border-[#12121A]" />
                      ))}
                    </div>
                    <p className="text-white font-semibold text-sm mt-1">{picks.length} anime</p>
                  </div>
                  <div className="bg-[#12121A] border border-white/10 rounded-2xl p-4">
                    <p className="text-[#A0A0B0] text-xs mb-2">Genres</p>
                    <div className="flex flex-wrap gap-1">
                      {genres.map((g) => {
                        const color = GENRES.find((x) => x.label === g)?.color || '#FF6B35';
                        return (
                          <span key={g} className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '33', color }}>
                            {g}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-[#12121A] border border-white/10 rounded-2xl p-4 md:col-span-3">
                    <p className="text-[#A0A0B0] text-xs mb-2">Library</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span><strong className="text-[#06B6D4]">{library.filter(e => e.status === 'WATCHING').length}</strong> <span className="text-[#A0A0B0]">Watching</span></span>
                      <span><strong className="text-[#10B981]">{library.filter(e => e.status === 'COMPLETED').length}</strong> <span className="text-[#A0A0B0]">Completed</span></span>
                      <span><strong className="text-[#A0A0B0]">{library.filter(e => e.status === 'PLANNING').length}</strong> <span className="text-[#A0A0B0]">Planning</span></span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D14]/95 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Back */}
          <button
            onClick={goBack}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#A0A0B0] hover:text-white hover:bg-white/5 transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Step dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i === step ? 'w-5 h-2 bg-[#FF6B35]' : i < step ? 'w-2 h-2 bg-[#FF6B35]/50' : 'w-2 h-2 bg-white/10'
                }`}
              />
            ))}
          </div>

          {/* Next / Finish */}
          {step < 4 ? (
            <motion.button
              onClick={goNext}
              disabled={!canContinue}
              whileTap={canContinue ? { scale: 0.96 } : {}}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#FF6B35] hover:bg-[#FF8A50] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
            >
              {step === 0 ? 'Get Started' : 'Continue'} <ArrowRight size={16} />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleFinish}
              disabled={saving}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#FF6B35] hover:bg-[#FF8A50] transition-colors text-white disabled:opacity-60"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : (
                <>Start Exploring <Sparkles size={16} /></>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
