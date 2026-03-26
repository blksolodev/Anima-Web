import React, { useState } from 'react';
import {
  ChevronLeft, Star, Clock, Calendar, Play,
  Plus, Check, X, Info, ExternalLink, Tv,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anime } from '../types';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AnimeDetailsViewProps {
  anime: Anime;
  onBack: () => void;
}

const STATUS_OPTIONS = [
  { label: 'Watching',      value: 'WATCHING',  icon: Play },
  { label: 'Completed',     value: 'COMPLETED', icon: Check },
  { label: 'Plan to Watch', value: 'PLANNING',  icon: Clock },
  { label: 'On Hold',       value: 'PAUSED',    icon: Info },
  { label: 'Dropped',       value: 'DROPPED',   icon: X },
];

const STREAMING_SERVICES = [
  { name: 'Crunchyroll',  url: 'https://www.crunchyroll.com',          color: '#F47521' },
  { name: 'Netflix',      url: 'https://www.netflix.com',              color: '#E50914' },
  { name: 'Funimation',   url: 'https://www.funimation.com',           color: '#5b0bb5' },
  { name: 'Hulu',         url: 'https://www.hulu.com',                 color: '#1CE783' },
  { name: 'Prime Video',  url: 'https://www.amazon.com/Prime-Video',   color: '#00A8E1' },
];

const formatSeason = (season?: string, year?: number) => {
  if (!season && !year) return null;
  const s = season ? season.charAt(0) + season.slice(1).toLowerCase() : '';
  return [s, year].filter(Boolean).join(' ');
};

const formatStatus = (s?: string) => {
  if (!s) return 'Unknown';
  return s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatFormat = (f?: string) => {
  if (!f) return 'TV';
  const map: Record<string, string> = {
    TV: 'TV', TV_SHORT: 'TV Short', MOVIE: 'Movie', SPECIAL: 'Special',
    OVA: 'OVA', ONA: 'ONA', MUSIC: 'Music',
  };
  return map[f] ?? f;
};

export const AnimeDetailsView: React.FC<AnimeDetailsViewProps> = ({ anime, onBack }) => {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addedStatus, setAddedStatus] = useState<string | null>(null);

  const handleAddToLibrary = async (status: string) => {
    if (!user) return;
    setAdding(true);
    try {
      const docId = `${user.id}_${anime.id}`;
      await setDoc(doc(db, 'anime_library', docId), {
        userId: user.id,
        u: user.id,
        animeId: anime.id,
        a: parseInt(anime.id),
        status,
        s: status,
        progress: 0, p: 0,
        score: 0,    sc: 0,
        notes: '',   n: '',
        totalEpisodes: anime.episodes || 0,
        te: anime.episodes || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        animeData: {
          title: anime.title,
          coverImage: anime.coverImage,
          bannerImage: anime.bannerImage,
          episodes: anime.episodes,
          status: anime.status,
          genres: anime.genres || [],
        },
      }, { merge: true });
      setAddedStatus(status);
      setTimeout(() => setAddedStatus(null), 3000);
      setShowModal(false);
    } catch (e) {
      console.error('Error adding to library', e);
    } finally {
      setAdding(false);
    }
  };

  const seasonLabel = formatSeason(anime.season, anime.seasonYear);

  return (
    <div className="relative min-h-screen pb-20">
      {/* Blurred banner background */}
      <div className="absolute top-0 left-0 w-full h-[420px] overflow-hidden z-0">
        <img
          src={anime.bannerImage || anime.coverImage}
          alt="Banner"
          className="w-full h-full object-cover opacity-25 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D14]/50 via-[#0D0D14]/80 to-[#0D0D14]" />
      </div>

      {/* All content — single centered column */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-4">

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors mb-4"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Hero */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="w-36 md:w-52 aspect-[2/3] rounded-xl shadow-2xl border border-white/10 object-cover"
            />
          </div>

          {/* Title + actions */}
          <div className="flex-1 text-center md:text-left pt-2">
            <h1 className="text-2xl md:text-4xl font-bold mb-1 leading-tight">{anime.title}</h1>
            {anime.studio && (
              <p className="text-[#A0A0B0] text-sm mb-3">{anime.studio}</p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
              {(anime.score ?? 0) > 0 && (
                <div className="flex items-center gap-1 bg-[#F4D03F]/10 px-2.5 py-1 rounded-lg text-[#F4D03F] font-bold text-sm">
                  <Star size={13} fill="currentColor" />
                  <span>{anime.score?.toFixed(1)}</span>
                </div>
              )}
              <div className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-medium">
                {formatFormat(anime.format)}
              </div>
              {anime.episodes && (
                <div className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-medium">
                  {anime.episodes} eps
                </div>
              )}
              {anime.duration && (
                <div className="bg-white/10 px-2.5 py-1 rounded-lg text-xs font-medium">
                  {anime.duration} min
                </div>
              )}
              <div className="bg-[#FF6B35]/10 px-2.5 py-1 rounded-lg text-[#FF6B35] text-xs font-medium">
                {formatStatus(anime.status)}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Button
                className="!rounded-full !px-7 !py-3 shadow-lg shadow-[#FF6B35]/20"
                onClick={() => setShowModal(true)}
              >
                <Plus size={16} />
                Add to Library
              </Button>
            </div>

            {/* Success toast */}
            <AnimatePresence>
              {addedStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-[#00D26A] bg-[#00D26A]/10 border border-[#00D26A]/20 px-4 py-2 rounded-full"
                >
                  <Check size={14} />
                  Added to {STATUS_OPTIONS.find(o => o.value === addedStatus)?.label ?? addedStatus}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Body */}
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          <div className="md:col-span-2 space-y-8">
            {/* Synopsis */}
            <section>
              <h3 className="text-lg font-bold mb-3">Synopsis</h3>
              {anime.description ? (
                <p className="text-[#A0A0B0] leading-relaxed text-sm whitespace-pre-line">
                  {anime.description}
                </p>
              ) : (
                <p className="text-[#6B6B7B] italic text-sm">No synopsis available.</p>
              )}
            </section>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <section>
                <h3 className="text-lg font-bold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((g) => (
                    <span
                      key={g}
                      className="px-4 py-1.5 rounded-full border border-white/10 text-sm text-[#A0A0B0] hover:text-white hover:border-[#FF6B35] transition-colors cursor-default"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Where to Watch */}
            <section>
              <h3 className="text-lg font-bold mb-3">Where to Watch</h3>
              <div className="space-y-2">
                {STREAMING_SERVICES.map((service) => (
                  <a
                    key={service.name}
                    href={service.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#1A1A2E] border border-white/5 hover:border-white/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: service.color }}
                      >
                        <Play size={13} fill="currentColor" />
                      </div>
                      <span className="font-medium text-sm group-hover:text-white transition-colors">
                        {service.name}
                      </span>
                    </div>
                    <ExternalLink size={15} className="text-[#6B6B7B]" />
                  </a>
                ))}
              </div>
            </section>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-bold mb-3">Information</h3>
              <GlassCard className="!p-0 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {[
                    ['Format',   formatFormat(anime.format)],
                    ['Status',   formatStatus(anime.status)],
                    ['Season',   seasonLabel || '—'],
                    ['Episodes', anime.episodes?.toString() || '—'],
                    ['Duration', anime.duration ? `${anime.duration} min` : '—'],
                    ['Studio',   anime.studio || '—'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between px-4 py-3">
                      <span className="text-[#A0A0B0] text-sm">{label}</span>
                      <span className="font-medium text-sm text-right max-w-[55%]">{value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </section>
          </div>
        </div>
      </div>

      {/* Add to Library sheet */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-sm bg-[#1A1A2E] rounded-2xl p-6 border border-white/10 shadow-2xl pointer-events-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold">Add to Library</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-[#A0A0B0] mb-5 truncate">{anime.title}</p>

              <div className="space-y-1">
                {STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAddToLibrary(option.value)}
                    disabled={adding}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/5 transition-colors text-left group disabled:opacity-50"
                  >
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#FF6B35] group-hover:text-white transition-colors flex-shrink-0">
                      <option.icon size={16} />
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
