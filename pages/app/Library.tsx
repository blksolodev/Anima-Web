import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Tv, Search, SortAsc, BookOpen, Star, PlayCircle } from 'lucide-react';
import { fetchAniList, GET_ANIME_BY_IDS } from '../../lib/anilist';
import { LibraryEntry } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { UpdateEntryModal } from '../../components/UpdateEntryModal';

const STATUS_TABS = [
  { label: 'All',       value: 'All' },
  { label: 'Watching',  value: 'WATCHING' },
  { label: 'Plan',      value: 'PLANNING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'On Hold',   value: 'PAUSED' },
  { label: 'Dropped',   value: 'DROPPED' },
];

type SortKey = 'updated' | 'title' | 'score' | 'progress';

const STATUS_COLOR: Record<string, string> = {
  WATCHING:  'bg-[#4ECDC4] text-[#0D0D14]',
  PLANNING:  'bg-[#F4D03F] text-[#0D0D14]',
  COMPLETED: 'bg-[#00D26A] text-[#0D0D14]',
  PAUSED:    'bg-[#A0A0B0] text-[#0D0D14]',
  DROPPED:   'bg-[#EF4444] text-white',
};

const STATUS_SHORT: Record<string, string> = {
  WATCHING:  'Watching',
  PLANNING:  'Plan',
  COMPLETED: 'Done',
  PAUSED:    'Hold',
  DROPPED:   'Drop',
};

/* Normalise a Firestore doc into a LibraryEntry */
const parseEntry = (data: any): LibraryEntry => {
  if ('a' in data) {
    return {
      docId: '',
      userId: data.userId || data.u,
      animeId: data.a,
      status: data.s,
      progress: data.p ?? 0,
      score: data.sc ?? 0,
      updatedAt: data.u,
      totalEpisodes: data.te,
      notes: data.n,
    } as LibraryEntry;
  }
  if ('animeData' in data) {
    return {
      docId: '',
      userId: data.userId,
      animeId: data.animeId,
      status: data.watchStatus || data.status,
      progress: data.progress ?? 0,
      score: data.score ?? 0,
      updatedAt: data.updatedAt,
      totalEpisodes: data.animeData?.episodes,
      notes: data.notes,
      anime: {
        id: data.animeId.toString(),
        title: data.animeData.title,
        coverImage: data.animeData.coverImage,
        bannerImage: data.animeData.bannerImage,
        episodes: data.animeData.episodes,
        status: data.animeData.status,
        genres: data.animeData.genres,
      },
    } as LibraryEntry;
  }
  return {
    docId: '',
    userId: data.userId,
    animeId: data.animeId || data.a,
    status: data.status || data.s,
    progress: data.progress ?? data.p ?? 0,
    score: data.score ?? data.sc ?? 0,
    updatedAt: data.updatedAt ?? data.u,
    totalEpisodes: data.totalEpisodes ?? data.te ?? 0,
    notes: data.notes ?? data.n,
  } as LibraryEntry;
};

export const Library: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('updated');
  const [selectedEntry, setSelectedEntry] = useState<LibraryEntry | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, 'anime_library'), where('userId', '==', user.id));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const libData = snapshot.docs.map((d) => ({ ...parseEntry(d.data()), docId: d.id }));

      libData.sort((a, b) => {
        const ta = typeof a.updatedAt === 'number' ? a.updatedAt : (a.updatedAt?.seconds ?? 0);
        const tb = typeof b.updatedAt === 'number' ? b.updatedAt : (b.updatedAt?.seconds ?? 0);
        return tb - ta;
      });

      if (libData.length === 0) { setEntries([]); setLoading(false); return; }

      // Hydrate entries that lack anime metadata via AniList
      const toHydrate = libData.filter((e) => !e.anime);
      const ids = toHydrate
        .map((e) => parseInt(e.animeId.toString()))
        .filter((id) => !isNaN(id));

      if (ids.length > 0) {
        try {
          const aniData = await fetchAniList(GET_ANIME_BY_IDS, { ids });
          const merged = libData.map((entry) => {
            if (entry.anime) return entry;
            const m = aniData.Page.media.find(
              (x: any) => x.id.toString() === entry.animeId.toString()
            );
            if (!m) return entry;
            return {
              ...entry,
              anime: {
                id: m.id.toString(),
                title: m.title.english || m.title.romaji,
                coverImage: m.coverImage.large,
                episodes: m.episodes,
                score: m.averageScore ? m.averageScore / 10 : 0,
                status: m.status,
                genres: m.genres,
              },
            };
          });
          setEntries(merged);
        } catch {
          setEntries(libData);
        }
      } else {
        setEntries(libData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  /* Stats */
  const stats = useMemo(() => {
    const totalEps = entries.reduce((s, e) => s + (e.progress ?? 0), 0);
    const scored = entries.filter((e) => (e.score ?? 0) > 0);
    const meanScore = scored.length
      ? (scored.reduce((s, e) => s + (e.score ?? 0), 0) / scored.length).toFixed(1)
      : '—';
    const watching = entries.filter((e) => e.status === 'WATCHING').length;
    return { totalEps, meanScore, watching, total: entries.length };
  }, [entries]);

  /* Filtered + sorted list */
  const displayed = useMemo(() => {
    let list = statusFilter === 'All' ? entries : entries.filter((e) => e.status === statusFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => (e.anime?.title ?? '').toLowerCase().includes(q));
    }

    return [...list].sort((a, b) => {
      if (sort === 'title') {
        return (a.anime?.title ?? '').localeCompare(b.anime?.title ?? '');
      }
      if (sort === 'score') return (b.score ?? 0) - (a.score ?? 0);
      if (sort === 'progress') return (b.progress ?? 0) - (a.progress ?? 0);
      // 'updated' (default)
      const ta = typeof a.updatedAt === 'number' ? a.updatedAt : (a.updatedAt?.seconds ?? 0);
      const tb = typeof b.updatedAt === 'number' ? b.updatedAt : (b.updatedAt?.seconds ?? 0);
      return tb - ta;
    });
  }, [entries, statusFilter, search, sort]);

  /* Per-tab counts */
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { All: entries.length };
    entries.forEach((e) => { counts[e.status] = (counts[e.status] ?? 0) + 1; });
    return counts;
  }, [entries]);

  return (
    <div className="w-full max-w-3xl mx-auto pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#0D0D14] sm:bg-[#0D0D14]/90 backdrop-blur-xl border-b border-white/10 px-4 pt-4 pb-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Library</h1>
          <button
            onClick={() => navigate('/discover')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6B35] hover:text-[#FF8A50] transition-colors"
          >
            <Plus size={15} /> Add Anime
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 gap-1 pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium relative transition-colors
                ${statusFilter === tab.value ? 'text-white' : 'text-[#A0A0B0] hover:text-white'}`}
            >
              {tab.label}
              {tabCounts[tab.value] != null && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${statusFilter === tab.value ? 'bg-[#FF6B35] text-white' : 'bg-white/10 text-[#A0A0B0]'}`}>
                  {tabCounts[tab.value] ?? 0}
                </span>
              )}
              {statusFilter === tab.value && (
                <motion.div
                  layoutId="library-tab-indicator"
                  className="absolute bottom-0 left-[calc(50%-7px)] -translate-x-1/2 h-0.5 w-8 bg-[#FF6B35] rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Stats bar */}
        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { icon: BookOpen,    label: 'Total',     value: stats.total },
              { icon: PlayCircle,  label: 'Watching',  value: stats.watching },
              { icon: Tv,          label: 'Episodes',  value: stats.totalEps },
              { icon: Star,        label: 'Mean Score',value: stats.meanScore },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-[#1A1A2E] border border-white/5 rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#FF6B35]" />
                </div>
                <div>
                  <p className="text-xs text-[#A0A0B0]">{label}</p>
                  <p className="font-bold text-white text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search + Sort */}
        {!loading && entries.length > 0 && (
          <div className="flex gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B7B]" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your library..."
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#6B6B7B] focus:outline-none focus:border-[#FF6B35] transition-colors"
              />
            </div>
            <div className="relative">
              <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B7B]" size={15} />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="bg-[#1A1A2E] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-[#FF6B35] transition-colors cursor-pointer"
              >
                <option value="updated">Last Updated</option>
                <option value="title">Title A–Z</option>
                <option value="score">Score</option>
                <option value="progress">Progress</option>
              </select>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-[#FF6B35]" size={36} />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-[#A0A0B0] gap-4">
            <div className="w-20 h-20 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
              <Tv size={36} className="text-[#FF6B35]" />
            </div>
            <h3 className="text-lg font-bold text-white">Your library is empty</h3>
            <p className="text-sm text-center max-w-xs">
              Start tracking anime you watch. Head to Discover to add your first title.
            </p>
            <button
              onClick={() => navigate('/discover')}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B35] hover:bg-[#FF8A50] text-white font-bold rounded-full text-sm transition-colors"
            >
              <Plus size={16} /> Browse Anime
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-[#A0A0B0]">
            <p className="text-sm">No anime match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence>
              {displayed.map((entry) => {
                const total = entry.totalEpisodes || entry.anime?.episodes || 0;
                const pct = total > 0 ? Math.min(100, ((entry.progress ?? 0) / total) * 100) : 0;
                const statusBadge = STATUS_COLOR[entry.status] ?? 'bg-white/10 text-white';
                const statusLabel = STATUS_SHORT[entry.status] ?? entry.status;

                return (
                  <motion.div
                    key={`${entry.animeId}-${entry.status}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative cursor-pointer"
                    onClick={() => navigate(`/anime/${entry.animeId}`)}
                  >
                    {/* Poster */}
                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-2.5 relative bg-[#1A1A2E]">
                      {entry.anime ? (
                        <img
                          src={entry.anime.coverImage}
                          alt={entry.anime.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#A0A0B0]">
                          <Tv size={28} className="mb-2 opacity-40" />
                          <span className="text-xs opacity-60">No image</span>
                        </div>
                      )}

                      {/* Score badge */}
                      {(entry.score ?? 0) > 0 && (
                        <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold text-[#F4D03F]">
                          <Star size={10} fill="currentColor" />
                          {entry.score}
                        </div>
                      )}

                      {/* Status badge */}
                      <div className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${statusBadge}`}>
                        {statusLabel}
                      </div>

                      {/* Hover overlay — Update button */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedEntry(entry); }}
                          className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full font-bold text-sm border border-white/20 hover:bg-[#FF6B35] hover:border-[#FF6B35] transition-all"
                        >
                          Update
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-sm truncate group-hover:text-[#FF6B35] transition-colors leading-tight">
                      {entry.anime?.title || 'Unknown Title'}
                    </h3>

                    {/* Progress */}
                    <p className="text-xs text-[#A0A0B0] mt-0.5">
                      {entry.progress ?? 0} / {total || '?'} eps
                    </p>

                    {/* Progress bar */}
                    <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-[#FF6B35] h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Update modal */}
      {selectedEntry && (
        <UpdateEntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};
