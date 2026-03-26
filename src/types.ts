import { LucideIcon } from "lucide-react";

// --- Navigation & Marketing ---
export interface NavLink {
  name: string;
  path: string;
  icon?: LucideIcon;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
}

// --- App Data (Firebase Schema) ---

export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  completedAnime: number;
  watchingAnime: number;
  totalEpisodesWatched: number;
  critsGiven: number;
  critsReceived: number;
}

export interface UserSettings {
  theme: 'default' | 'dark' | 'light';
  notifications: {
    newEpisodes: boolean;
    mentions: boolean;
    replies: boolean;
    likes: boolean;
    reposts: boolean;
    guildActivity: boolean;
    recommendations: boolean;
  };
  privacy: {
    showWatchlist: boolean;
    showActivity: boolean;
    allowDMs: boolean;
  };
  spoilerProtection: boolean;
}

export interface User {
  id: string; // uid
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  powerLevel: number;
  xp: number;
  joinedAt: any;
  badges: string[];
  pledgedCharacter: string | null;
  favoriteAnime: string[];
  stats: UserStats;
  settings: UserSettings;
}

export interface MediaAttachment {
  type: 'image' | 'video';
  url: string;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export interface AnimeReference {
  id: number;
  title: string;
  coverImage: string;
  episode?: number;
}

export interface Quest {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    powerLevel: number;
    auraColor?: string;
  };
  content: string;
  mediaAttachment: MediaAttachment | null;
  animeReference: AnimeReference | null;
  likes: number;
  reposts: number;
  replies: number;
  isHotTake: boolean;
  parentId: string | null;
  createdAt: any;
}

export interface Anime {
  id: string; // AniList ID
  title: string;
  coverImage: string;
  bannerImage?: string;
  episodes?: number;
  score?: number;
  status?: string;
  genres?: string[];
  format?: string;
  season?: string;
  seasonYear?: number;
}

export interface LibraryEntry {
  odcId: string;
  odcuserId: string;
  animeId: number;
  status: 'WATCHING' | 'COMPLETED' | 'PAUSED' | 'DROPPED' | 'PLANNING';
  progress: number;
  score: number | null;
  notes: string | null;
  startedAt: any | null;
  completedAt: any | null;
  updatedAt: any;
  createdAt: any;
  anime: {
    id: number;
    title: { romaji: string; english: string; native: string };
    coverImage: { large: string; medium: string };
    bannerImage: string | null;
    episodes: number | null;
    format: string;
    status: string;
    genres: string[];
    averageScore: number;
    season: string;
    seasonYear: number;
  };
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'repost' | 'episode_release' | 'new_season' | 'anime_airing';
  recipientId: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  content?: string;
  postId?: string;
  postPreview?: string;
  animeId?: number;
  animeName?: string;
  createdAt: any;
  isRead: boolean;
}

// Keep legacy Message types for existing UI components until refactored
export interface Message {
  id: string;
  senderId: string;
  content: string;
  sentAt: any;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participants?: any[]; 
  lastMessage: string;
  updatedAt: any;
  unreadCount?: number;
}

export interface TrendingTag {
  tag: string;
  posts: string;
}