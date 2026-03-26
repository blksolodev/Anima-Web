import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Image as ImageIcon, Tv, EyeOff, AlertTriangle, Loader2,
  Search, ChevronDown, CheckCircle2, MessagesSquare,
} from 'lucide-react';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useComposeStore } from '../store/useComposeStore';
import { useFeedStore } from '../store/useFeedStore';
import { uploadPostMedia, getImageDimensions, isVideoFile } from '../services/media.service';
import { fetchAniList, SEARCH_ANIME } from '../lib/anilist';
import { AnimeReference, MediaAttachment } from '../types';

const GIPHY_KEY = (import.meta as any).env?.VITE_GIPHY_API_KEY ?? '';
const GIPHY_BASE = 'https://api.giphy.com/v1/gifs';
const MAX_CHARS = 280;

type Panel = 'none' | 'gif' | 'anime' | 'discussion';

interface GiphyGif {
  id: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
}

interface DiscussionSelection {
  type: 'episode' | 'live';
  discussionId: string;
  discussionTitle: string;
  animeId?: number;
  animeName?: string;
  animeCover?: string;
  season?: number;
  episode?: number;
}

const parseGiphy = (results: any[]): GiphyGif[] =>
  results.map((r) => ({
    id: r.id,
    url: r.images?.downsized?.url ?? r.images?.original?.url ?? '',
    previewUrl: r.images?.fixed_width_small?.url ?? r.images?.fixed_width?.url ?? '',
    width: parseInt(r.images?.fixed_width?.width ?? '320', 10),
    height: parseInt(r.images?.fixed_width?.height ?? '180', 10),
  }));

// ─── GIF Picker Panel ──────────────────────────────────────────────────────────
const GifPanel: React.FC<{ onSelect: (gif: GiphyGif) => void }> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (q: string) => {
    if (!GIPHY_KEY) return;
    setLoading(true);
    try {
      const endpoint = q
        ? `${GIPHY_BASE}/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=24&rating=pg-13`
        : `${GIPHY_BASE}/trending?api_key=${GIPHY_KEY}&limit=24&rating=pg-13`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setGifs(parseGiphy(data.data ?? []));
    } catch {
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(''); }, [load]);

  const handleSearch = (v: string) => {
    setQuery(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => load(v), 400);
  };

  if (!GIPHY_KEY) {
    return (
      <div className="p-4 text-center text-[#A0A0B0] text-sm">
        Add <code className="text-[#FF6B35]">VITE_GIPHY_API_KEY</code> to your <code>.env</code> to enable GIF search.
      </div>
    );
  }

  return (
    <div className="border-t border-white/10">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-2 border border-white/10">
          <Search size={14} className="text-[#A0A0B0] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search GIFs..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6B6B7B] focus:outline-none"
          />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-[#FF6B35]" size={24} /></div>
      ) : (
        <div className="grid grid-cols-3 gap-1 px-2 pb-3 max-h-56 overflow-y-auto">
          {gifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => onSelect(gif)}
              className="rounded-lg overflow-hidden hover:opacity-80 transition-opacity aspect-video"
            >
              <img src={gif.previewUrl} alt="gif" className="w-full h-full object-cover" />
            </button>
          ))}
          {gifs.length === 0 && !loading && (
            <p className="col-span-3 text-center text-[#A0A0B0] text-xs py-4">No GIFs found</p>
          )}
        </div>
      )}
      <p className="text-center text-[#6B6B7B] text-[10px] pb-2">Powered by GIPHY</p>
    </div>
  );
};

// ─── Anime Search Panel ────────────────────────────────────────────────────────
const AnimePanel: React.FC<{ onSelect: (ref: AnimeReference) => void }> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await fetchAniList(SEARCH_ANIME, { search: q, page: 1, perPage: 8 });
      setResults(data.Page.media ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (v: string) => {
    setQuery(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(v), 350);
  };

  return (
    <div className="border-t border-white/10">
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-2 border border-white/10">
          <Search size={14} className="text-[#A0A0B0] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search anime..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6B6B7B] focus:outline-none"
            autoFocus
          />
        </div>
      </div>
      <div className="max-h-52 overflow-y-auto px-2 pb-2">
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="animate-spin text-[#FF6B35]" size={20} /></div>
        ) : results.length > 0 ? (
          results.map((item: any) => {
            const title = item.title.english || item.title.romaji;
            return (
              <button
                key={item.id}
                onClick={() => onSelect({ animeId: item.id, title, coverImage: item.coverImage.large })}
                className="flex items-center gap-3 w-full px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <img src={item.coverImage.large} alt={title} className="w-8 h-11 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{title}</p>
                  <p className="text-xs text-[#A0A0B0]">{item.format} · {item.episodes ?? '?'} eps</p>
                </div>
              </button>
            );
          })
        ) : query.length > 1 ? (
          <p className="text-center text-[#A0A0B0] text-xs py-4">No results for "{query}"</p>
        ) : (
          <p className="text-center text-[#A0A0B0] text-xs py-4">Type to search anime</p>
        )}
      </div>
    </div>
  );
};

// ─── Discussion Panel ──────────────────────────────────────────────────────────
const DiscussionPanel: React.FC<{ onSelect: (d: DiscussionSelection) => void }> = ({ onSelect }) => {
  const [tab, setTab] = useState<'episode' | 'live'>('episode');

  // Episode tab
  const [animeQuery, setAnimeQuery] = useState('');
  const [animeResults, setAnimeResults] = useState<any[]>([]);
  const [animeLoading, setAnimeLoading] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);
  const [season, setSeason] = useState('1');
  const [episode, setEpisode] = useState('');

  // Live tab
  const [liveTitle, setLiveTitle] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchAnime = useCallback(async (q: string) => {
    if (q.length < 2) { setAnimeResults([]); return; }
    setAnimeLoading(true);
    try {
      const data = await fetchAniList(SEARCH_ANIME, { search: q, page: 1, perPage: 6 });
      setAnimeResults(data.Page.media ?? []);
    } catch {
      setAnimeResults([]);
    } finally {
      setAnimeLoading(false);
    }
  }, []);

  const handleAnimeSearch = (v: string) => {
    setAnimeQuery(v);
    setSelectedAnime(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => searchAnime(v), 350);
  };

  const canConfirmEpisode = selectedAnime && episode.trim() && parseInt(episode) > 0;
  const canConfirmLive = liveTitle.trim().length >= 3 && liveTitle.trim().length <= 80;

  const handleConfirmEpisode = () => {
    if (!canConfirmEpisode) return;
    const s = season.trim() || '1';
    const e = episode.trim();
    const animeName = selectedAnime.title.english || selectedAnime.title.romaji;
    const displayTitle = `${animeName} · S${s}E${e}`;
    onSelect({
      type: 'episode',
      discussionId: `ep_${selectedAnime.id}_s${s}_e${e}`,
      discussionTitle: displayTitle,
      animeId: selectedAnime.id,
      animeName,
      animeCover: selectedAnime.coverImage.large,
      season: parseInt(s),
      episode: parseInt(e),
    });
  };

  const handleConfirmLive = () => {
    if (!canConfirmLive) return;
    const rand = Math.random().toString(36).slice(2, 7);
    onSelect({
      type: 'live',
      discussionId: `live_${Date.now()}_${rand}`,
      discussionTitle: liveTitle.trim(),
    });
  };

  return (
    <div className="border-t border-white/10">
      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-3">
        <button
          onClick={() => setTab('episode')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === 'episode' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'text-[#A0A0B0] hover:bg-white/5'}`}
        >
          Episode Discussion
        </button>
        <button
          onClick={() => setTab('live')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === 'live' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'text-[#A0A0B0] hover:bg-white/5'}`}
        >
          Live Discussion
        </button>
      </div>

      {tab === 'episode' ? (
        <div className="px-4 pb-4 pt-2 space-y-3">
          {!selectedAnime ? (
            <>
              <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-2 border border-white/10">
                <Search size={14} className="text-[#A0A0B0] flex-shrink-0" />
                <input
                  type="text"
                  value={animeQuery}
                  onChange={(e) => handleAnimeSearch(e.target.value)}
                  placeholder="Search anime..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-[#6B6B7B] focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="max-h-36 overflow-y-auto space-y-0.5">
                {animeLoading ? (
                  <div className="flex justify-center py-3">
                    <Loader2 className="animate-spin text-[#FF6B35]" size={18} />
                  </div>
                ) : animeResults.map((item: any) => {
                  const title = item.title.english || item.title.romaji;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setSelectedAnime(item); setAnimeQuery(''); }}
                      className="flex items-center gap-3 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <img src={item.coverImage.large} alt={title} className="w-7 h-10 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{title}</p>
                        <p className="text-xs text-[#A0A0B0]">{item.format} · {item.episodes ?? '?'} eps</p>
                      </div>
                    </button>
                  );
                })}
                {!animeLoading && animeResults.length === 0 && animeQuery.length > 1 && (
                  <p className="text-center text-[#A0A0B0] text-xs py-3">No results</p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Selected anime chip */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
                <img src={selectedAnime.coverImage.large} alt="" className="w-7 h-10 object-cover rounded flex-shrink-0" />
                <p className="text-sm font-medium text-white flex-1 truncate">
                  {selectedAnime.title.english || selectedAnime.title.romaji}
                </p>
                <button onClick={() => setSelectedAnime(null)} className="text-[#A0A0B0] hover:text-white flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
              {/* Season + Episode inputs */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-[#6B6B7B] uppercase tracking-wider mb-1 block">Season</label>
                  <input
                    type="number"
                    min="1"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="1"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B6B7B] focus:outline-none focus:border-[#FF6B35]/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-[#6B6B7B] uppercase tracking-wider mb-1 block">Episode *</label>
                  <input
                    type="number"
                    min="1"
                    value={episode}
                    onChange={(e) => setEpisode(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B6B7B] focus:outline-none focus:border-[#FF6B35]/50"
                    autoFocus
                  />
                </div>
              </div>
              <button
                onClick={handleConfirmEpisode}
                disabled={!canConfirmEpisode}
                className="w-full py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8A50] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
              >
                Start Discussion
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="px-4 pb-4 pt-2 space-y-3">
          <div>
            <label className="text-[10px] text-[#6B6B7B] uppercase tracking-wider mb-1 block">Discussion Title</label>
            <input
              type="text"
              value={liveTitle}
              onChange={(e) => setLiveTitle(e.target.value.slice(0, 80))}
              placeholder="e.g. Watch party for tonight's drop"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B6B7B] focus:outline-none focus:border-[#FF6B35]/50"
              autoFocus
            />
            <p className="text-[10px] text-[#6B6B7B] mt-1 text-right">{liveTitle.length}/80</p>
          </div>
          <button
            onClick={handleConfirmLive}
            disabled={!canConfirmLive}
            className="w-full py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8A50] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
          >
            Start Live Discussion
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main ComposeModal ─────────────────────────────────────────────────────────
export const ComposeModal: React.FC = () => {
  const { isOpen, replyTo, close } = useComposeStore();
  const { user } = useAuthStore();
  const { createPost } = useFeedStore();

  const [content, setContent] = useState('');
  const [activePanel, setActivePanel] = useState<Panel>('none');
  const [media, setMedia] = useState<{ file?: File; url: string; type: 'image' | 'gif' | 'video'; width?: number; height?: number } | null>(null);
  const [animeRef, setAnimeRef] = useState<AnimeReference | null>(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionSelection | null>(null);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isMature, setIsMature] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [posting, setPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const canPost = (content.trim().length > 0 || !!media) && !isOverLimit && !posting && !uploading;

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 80);
    } else {
      // Reset state on close
      setContent('');
      setMedia(null);
      setAnimeRef(null);
      setSelectedDiscussion(null);
      setIsSpoiler(false);
      setIsMature(false);
      setActivePanel('none');
      setUploadProgress(0);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  const togglePanel = (panel: Panel) => setActivePanel((p) => p === panel ? 'none' : panel);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = '';

    const isVideo = isVideoFile(file);
    const type = isVideo ? 'video' : 'image';
    const previewUrl = URL.createObjectURL(file);

    let width: number | undefined;
    let height: number | undefined;
    if (!isVideo) {
      const dims = await getImageDimensions(file);
      width = dims.width;
      height = dims.height;
    }

    setMedia({ file, url: previewUrl, type, width, height });
    setActivePanel('none');
  };

  const handleGifSelect = (gif: GiphyGif) => {
    setMedia({ url: gif.url, type: 'gif', width: gif.width, height: gif.height });
    setActivePanel('none');
  };

  const handleAnimeSelect = (ref: AnimeReference) => {
    setAnimeRef(ref);
    setActivePanel('none');
  };

  const handleDiscussionSelect = (d: DiscussionSelection) => {
    setSelectedDiscussion(d);
    setActivePanel('none');
  };

  const handlePost = async () => {
    if (!user || !canPost) return;
    setPosting(true);

    try {
      let mediaAttachment: MediaAttachment | undefined;

      if (media) {
        if (media.type === 'gif') {
          mediaAttachment = {
            type: 'gif',
            url: media.url,
            width: media.width,
            height: media.height,
            aspectRatio: media.width && media.height ? media.width / media.height : undefined,
          };
        } else if (media.file) {
          setUploading(true);
          const uploadedUrl = await uploadPostMedia(user.id, media.file, setUploadProgress);
          setUploading(false);
          mediaAttachment = {
            type: media.type,
            url: uploadedUrl,
            width: media.width,
            height: media.height,
            aspectRatio: media.width && media.height ? media.width / media.height : undefined,
          };
        }
      }

      const author = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        powerLevel: user.powerLevel ?? 1,
        auraColor: '#7C3AED',
      };

      const postId = await createPost(content.trim(), author, {
        mediaAttachment,
        animeReference: animeRef ?? undefined,
        isSpoiler,
        isMature,
        parentId: replyTo?.postId,
      });

      // Discussion: write discussion doc + patch post with discussion fields
      if (selectedDiscussion) {
        const discussionDoc: Record<string, any> = {
          type: selectedDiscussion.type,
          title: selectedDiscussion.discussionTitle,
          createdBy: user.id,
          createdAt: serverTimestamp(),
          postCount: increment(1),
        };
        if (selectedDiscussion.animeId != null) discussionDoc.animeId = selectedDiscussion.animeId;
        if (selectedDiscussion.animeName) discussionDoc.animeName = selectedDiscussion.animeName;
        if (selectedDiscussion.animeCover) discussionDoc.animeCover = selectedDiscussion.animeCover;
        if (selectedDiscussion.season != null) discussionDoc.season = selectedDiscussion.season;
        if (selectedDiscussion.episode != null) discussionDoc.episode = selectedDiscussion.episode;

        await Promise.all([
          setDoc(doc(db, 'discussions', selectedDiscussion.discussionId), discussionDoc, { merge: true }),
          updateDoc(doc(db, 'quests', postId), {
            discussionType: selectedDiscussion.type,
            discussionId: selectedDiscussion.discussionId,
            discussionTitle: selectedDiscussion.discussionTitle,
          }),
        ]);
      }

      close();
    } catch (err) {
      console.error('[Compose] post failed:', err);
    } finally {
      setPosting(false);
      setUploading(false);
    }
  };

  const charRatio = Math.min(content.length / MAX_CHARS, 1);
  const circumference = 2 * Math.PI * 10;
  const dashOffset = circumference * (1 - charRatio);
  const charColor = remaining <= 0 ? '#EF4444' : remaining <= 20 ? '#F59E0B' : '#FF6B35';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] pointer-events-none">
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-xl bg-[#12121F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <button onClick={close} className="p-1.5 rounded-full hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
              <span className="text-sm font-semibold text-[#A0A0B0]">
                {replyTo ? `Replying to @${replyTo.authorUsername}` : 'New Post'}
              </span>
              <button
                onClick={handlePost}
                disabled={!canPost}
                className="px-4 py-1.5 bg-[#FF6B35] hover:bg-[#FF8A50] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-full transition-colors flex items-center gap-2"
              >
                {(posting || uploading) ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {uploading ? `${uploadProgress}%` : 'Posting…'}
                  </>
                ) : 'Post'}
              </button>
            </div>

            {/* Body */}
            <div className="px-4 pt-4">
              <div className="flex gap-3">
                {/* Avatar */}
                <img
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=random&color=fff`}
                  alt="me"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  {/* Tags row */}
                  {(isSpoiler || isMature) && (
                    <div className="flex gap-2 mb-2">
                      {isSpoiler && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]">
                          <EyeOff size={11} /> Spoiler
                        </span>
                      )}
                      {isMature && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]">
                          <AlertTriangle size={11} /> 18+
                        </span>
                      )}
                    </div>
                  )}

                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={replyTo ? 'Post your reply...' : 'What are you watching?'}
                    rows={4}
                    className="w-full bg-transparent resize-none text-white placeholder-[#6B6B7B] focus:outline-none text-base leading-relaxed"
                  />

                  {/* Discussion badge */}
                  {selectedDiscussion && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#4ECDC4]/10 border border-[#4ECDC4]/20 rounded-xl mb-3">
                      <MessagesSquare size={14} className="text-[#4ECDC4] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-[#4ECDC4] uppercase tracking-wider font-semibold">
                          {selectedDiscussion.type === 'episode' ? 'Episode Discussion' : 'Live Discussion'}
                        </p>
                        <p className="text-sm text-white truncate">{selectedDiscussion.discussionTitle}</p>
                      </div>
                      <button onClick={() => setSelectedDiscussion(null)} className="text-[#A0A0B0] hover:text-white flex-shrink-0">
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Anime tag */}
                  {animeRef && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-xl mb-3">
                      <img src={animeRef.coverImage} alt={animeRef.title} className="w-8 h-11 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#FF6B35] truncate">{animeRef.title}</p>
                      </div>
                      <button onClick={() => setAnimeRef(null)} className="text-[#A0A0B0] hover:text-white">
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Media preview */}
                  {media && (
                    <div className="relative mb-3 rounded-xl overflow-hidden border border-white/10">
                      {media.type === 'video' ? (
                        <video src={media.url} controls className="w-full max-h-64 object-contain bg-black" />
                      ) : (
                        <img
                          src={media.url}
                          alt="media preview"
                          className="w-full max-h-64 object-contain bg-black/30"
                        />
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-[#FF6B35]" size={28} />
                          <span className="text-sm text-white">{uploadProgress}%</span>
                        </div>
                      )}
                      <button
                        onClick={() => setMedia(null)}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GIF / Anime / Discussion panels */}
            <AnimatePresence>
              {activePanel === 'gif' && (
                <motion.div key="gif" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                  <GifPanel onSelect={handleGifSelect} />
                </motion.div>
              )}
              {activePanel === 'anime' && (
                <motion.div key="anime" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                  <AnimePanel onSelect={handleAnimeSelect} />
                </motion.div>
              )}
              {activePanel === 'discussion' && (
                <motion.div key="discussion" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                  <DiscussionPanel onSelect={handleDiscussionSelect} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
              <div className="flex items-center gap-1">
                {/* Image */}
                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                <button
                  onClick={() => { fileInputRef.current?.click(); setActivePanel('none'); }}
                  disabled={!!media}
                  title="Add image or video"
                  className="p-2 rounded-full hover:bg-[#FF6B35]/10 text-[#FF6B35] disabled:opacity-30 transition-colors"
                >
                  <ImageIcon size={20} />
                </button>

                {/* GIF */}
                <button
                  onClick={() => togglePanel('gif')}
                  disabled={!!media}
                  title="Add GIF"
                  className={`p-2 rounded-full transition-colors disabled:opacity-30 font-bold text-xs px-2.5 ${activePanel === 'gif' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'text-[#FF6B35] hover:bg-[#FF6B35]/10'}`}
                >
                  GIF
                </button>

                {/* Anime tag */}
                <button
                  onClick={() => togglePanel('anime')}
                  title="Tag anime"
                  className={`p-2 rounded-full transition-colors ${activePanel === 'anime' ? 'bg-[#4ECDC4]/20 text-[#4ECDC4]' : 'text-[#4ECDC4] hover:bg-[#4ECDC4]/10'}`}
                >
                  <Tv size={20} />
                </button>

                {/* Discussion */}
                <button
                  onClick={() => togglePanel('discussion')}
                  title="Start a discussion"
                  className={`p-2 rounded-full transition-colors ${activePanel === 'discussion' || selectedDiscussion ? 'bg-[#4ECDC4]/20 text-[#4ECDC4]' : 'text-[#A0A0B0] hover:bg-white/5 hover:text-[#4ECDC4]'}`}
                >
                  <MessagesSquare size={20} />
                </button>

                {/* Spoiler */}
                <button
                  onClick={() => setIsSpoiler((v) => !v)}
                  title="Mark as spoiler"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors text-xs font-semibold ${isSpoiler ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'text-[#A0A0B0] hover:bg-white/5 hover:text-[#F59E0B]'}`}
                >
                  <EyeOff size={15} />
                  Spoiler
                </button>

                {/* Mature */}
                <button
                  onClick={() => setIsMature((v) => !v)}
                  title="Mark as 18+"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-colors text-xs font-semibold ${isMature ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'text-[#A0A0B0] hover:bg-white/5 hover:text-[#EF4444]'}`}
                >
                  <AlertTriangle size={15} />
                  18+
                </button>
              </div>

              {/* Char count ring */}
              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <svg width="28" height="28" viewBox="0 0 28 28">
                    <circle cx="14" cy="14" r="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
                    <circle
                      cx="14" cy="14" r="10"
                      fill="none"
                      stroke={charColor}
                      strokeWidth="2.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                      transform="rotate(-90 14 14)"
                      style={{ transition: 'stroke-dashoffset 0.1s, stroke 0.2s' }}
                    />
                    {remaining <= 20 && (
                      <text x="14" y="18" textAnchor="middle" fontSize="8" fill={charColor} fontWeight="bold">
                        {remaining}
                      </text>
                    )}
                  </svg>
                )}
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
