import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { fetchAniList, GET_ANIME_DETAILS } from '../../lib/anilist';
import { AnimeDetailsView } from '../../components/AnimeDetailsView';
import { Anime } from '../../types';

const mapMedia = (m: any): Anime => ({
  id: m.id.toString(),
  title: m.title.english || m.title.romaji,
  coverImage: m.coverImage.extraLarge || m.coverImage.large,
  bannerImage: m.bannerImage,
  episodes: m.episodes,
  score: m.averageScore ? m.averageScore / 10 : 0,
  status: m.status,
  genres: m.genres,
  description: m.description
    ? m.description.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim()
    : undefined,
  season: m.season,
  seasonYear: m.seasonYear,
  format: m.format,
  duration: m.duration,
  studio: m.studios?.nodes?.[0]?.name,
});

export const AnimeDetail: React.FC = () => {
  const { animeId } = useParams<{ animeId: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!animeId) return;
    const id = parseInt(animeId);
    if (isNaN(id)) { setError(true); setLoading(false); return; }

    setLoading(true);
    setError(false);
    fetchAniList(GET_ANIME_DETAILS, { id })
      .then((data) => {
        setAnime(mapMedia(data.Media));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [animeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-[#FF6B35]" size={36} />
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="flex flex-col items-center py-32 text-[#A0A0B0] gap-4">
        <AlertCircle size={40} className="opacity-40" />
        <p className="text-lg font-semibold">Anime not found</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#FF6B35] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return <AnimeDetailsView anime={anime} onBack={() => navigate(-1)} />;
};
