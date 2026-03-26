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

// --- App Data (Firestore Schema — matches mobile) ---

export interface UserStats {
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  avatarUrl: string | null;
  bannerUrl?: string | null;
  bio?: string;
  powerLevel: number;
  xp: number;
  stats: UserStats;
  isGuest?: boolean;
  createdAt?: any;
  onboardingComplete?: boolean;
  favoriteGenres?: string[];
}

// Matches mobile QuestAuthor
export interface PostAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  powerLevel: number;
  auraColor: string;
}

export interface MediaAttachment {
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

export interface AnimeReference {
  animeId: number;
  title: string;
  episode?: number;
  coverImage: string;
}

// Matches mobile Quest exactly
export interface Post {
  id: string;
  authorId: string;
  author: PostAuthor;
  content: string;
  createdAt: any; // Firestore Timestamp
  likes: number;
  reposts: number;
  replies: number;
  isLiked?: boolean;    // hydrated client-side
  isReposted?: boolean; // hydrated client-side
  isSaved?: boolean;
  isHotTake?: boolean;
  isSpoiler?: boolean;
  isMature?: boolean;
  mediaAttachment?: MediaAttachment;
  animeReference?: AnimeReference;
  parentId?: string;
}

export interface Anime {
  id: string;
  title: string;
  coverImage: string;
  bannerImage?: string;
  episodes?: number;
  score?: number;
  status?: string;
  genres?: string[];
  description?: string;
  season?: string;
  seasonYear?: number;
  format?: string;
  duration?: number;
  studio?: string;
}

export interface LibraryEntry {
  docId: string;        // actual Firestore document ID
  animeId: string;
  userId: string;
  status: 'WATCHING' | 'COMPLETED' | 'PLANNING' | 'DROPPED' | 'PAUSED';
  progress: number;
  score: number;
  updatedAt: any;
  totalEpisodes?: number;
  notes?: string;
  anime?: Anime; // hydrated from AniList
}

export interface Notification {
  id: string;
  type: 'like' | 'reply' | 'follow' | 'mention' | 'new_episode';
  fromUserId: string;
  fromUser?: Pick<User, 'id' | 'username' | 'displayName' | 'avatarUrl'>;
  targetUserId: string;
  content?: string;
  relatedPostId?: string;
  createdAt: any;
  read: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string | null;
  lastMessageAt: any;
  unreadCount?: number;
}

export interface TrendingTag {
  tag: string;
  posts: string;
}
