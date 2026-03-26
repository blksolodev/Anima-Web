import { Swords, Tv, MessagesSquare, Trophy, Flame, Users, Zap, Home, Search, Bell, Mail, Library, User } from "lucide-react";
import { NavLink, FeatureItem, StatItem, TeamMember, Post, Anime, User as UserType, Notification, Conversation, Message, TrendingTag } from "./types";

export const COLORS = {
  bgPrimary: "#0D0D14",
  bgSecondary: "#1A1A2E",
  bgTertiary: "#16213E",
  accentPrimary: "#FF6B35",
  accentSecondary: "#4ECDC4",
  accentSuccess: "#00D26A",
  accentError: "#EF4444",
  accentWarning: "#F4D03F",
  textPrimary: "#FFFFFF",
  textSecondary: "#A0A0B0",
  textTertiary: "#6B6B7B",
};

// Marketing Navigation
export const NAV_LINKS: NavLink[] = [
  { name: "Overview", path: "/download" },
  { name: "Features", path: "/features" },
  { name: "About", path: "/about" },
];

// App Navigation
export const APP_NAV_LINKS: NavLink[] = [
  { name: "Home", path: "/", icon: Home },
  { name: "Discover", path: "/discover", icon: Search },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Messages", path: "/messages", icon: Mail },
  { name: "Library", path: "/library", icon: Library },
  { name: "Profile", path: "/profile", icon: User },
];

export const FEATURES: FeatureItem[] = [
  {
    id: "guilds",
    title: "Guild Chats",
    description: "Join episode-specific discussion rooms and form permanent guilds with fans who share your taste.",
    icon: MessagesSquare,
    image: "https://picsum.photos/id/122/800/600"
  },
  {
    id: "arena",
    title: "Power Level Arena",
    description: "Debate hot takes and vote on character matchups. Climb the leaderboard by winning arguments.",
    icon: Swords,
    image: "https://picsum.photos/id/133/800/600"
  },
  {
    id: "library",
    title: "Anime Library",
    description: "Track your watching progress, rate episodes, and get AI-powered recommendations based on your guild activity.",
    icon: Tv,
    image: "https://picsum.photos/id/234/800/600"
  },
  {
    id: "quests",
    title: "Daily Quests",
    description: "Complete daily viewing challenges to earn XP and unlock exclusive profile frames and badges.",
    icon: Trophy,
    image: "https://picsum.photos/id/452/800/600"
  }
];

export const STATS: StatItem[] = [
  { label: "Active Users", value: "150K+" },
  { label: "Anime Tracked", value: "2.5M+" },
  { label: "Guilds Created", value: "12K+" },
  { label: "Daily Debates", value: "45K+" },
];

export const TEAM: TeamMember[] = [
  { name: "Kai", role: "Founder & Lead Dev", avatar: "https://picsum.photos/id/1005/200/200" },
  { name: "Yuki", role: "Head of Design", avatar: "https://picsum.photos/id/1011/200/200" },
  { name: "Ren", role: "Community Manager", avatar: "https://picsum.photos/id/1025/200/200" },
];

// Mock App Data
export const MOCK_USER: UserType = {
  id: "u1",
  username: "otaku_king",
  displayName: "ShadowSlayer",
  email: "otaku_king@example.com",
  avatarUrl: "https://picsum.photos/id/1012/200/200",
  bannerUrl: "https://picsum.photos/id/1018/1000/300",
  bio: "Just a humble fan waiting for the next arc. 🗡️ | Lvl 42 Paladin",
  powerLevel: 42,
  xp: 8500,
  stats: {
    followersCount: 1240,
    followingCount: 85,
    postsCount: 312,
  },
};

const mockAuthor = (id: string, username: string, displayName: string, avatarUrl: string) => ({
  id, username, displayName, avatarUrl,
  powerLevel: 1, auraColor: '#7C3AED',
});

export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    authorId: "u1",
    author: mockAuthor("u1", "otaku_king", "ShadowSlayer", "https://picsum.photos/id/1012/200/200"),
    content: "Just finished the latest episode of JJK. The animation quality is absolutely insane! Mappa never misses. 🔥 #JJK #Anime",
    createdAt: new Date(Date.now() - 2 * 3600000),
    likes: 342, replies: 45, reposts: 12,
    animeReference: { animeId: 1, title: "Jujutsu Kaisen", coverImage: "" },
    mediaAttachment: { type: 'image', url: "https://picsum.photos/id/1035/800/400" },
  },
  {
    id: "p2",
    authorId: "u2",
    author: mockAuthor("u2", "anime_girl_99", "Sakura", "https://picsum.photos/id/1027/200/200"),
    content: "Unpopular opinion: The manga ending was actually perfect. You guys just don't get the symbolism.",
    createdAt: new Date(Date.now() - 4 * 3600000),
    likes: 89, replies: 124, reposts: 5,
  },
  {
    id: "p3",
    authorId: "u3",
    author: mockAuthor("u3", "retro_fan", "Spike", "https://picsum.photos/id/1005/200/200"),
    content: "Rewatching Cowboy Bebop for the 10th time. Still the best soundtrack in history. Change my mind.",
    createdAt: new Date(Date.now() - 6 * 3600000),
    likes: 567, replies: 32, reposts: 88,
    animeReference: { animeId: 2, title: "Cowboy Bebop", coverImage: "" },
  }
];

export const MOCK_LIBRARY: Anime[] = [
  {
    id: "a1",
    title: "Frieren: Beyond Journey's End",
    coverImage: "https://picsum.photos/id/1040/300/450",
    episodes: 28,
    score: 9.2,
    status: "Airing",
    genres: ["Fantasy", "Adventure"]
  },
  {
    id: "a2",
    title: "The Apothecary Diaries",
    coverImage: "https://picsum.photos/id/1050/300/450",
    episodes: 24,
    score: 8.8,
    status: "Airing",
    genres: ["Mystery", "Historical"]
  },
  {
    id: "a3",
    title: "Solo Leveling",
    coverImage: "https://picsum.photos/id/1060/300/450",
    episodes: 12,
    score: 8.5,
    status: "Finished",
    genres: ["Action", "Fantasy"]
  },
  {
    id: "a4",
    title: "One Piece",
    coverImage: "https://picsum.photos/id/1070/300/450",
    episodes: 1000,
    score: 9.0,
    status: "Airing",
    genres: ["Action", "Adventure"]
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "like",
    fromUserId: "u2",
    fromUser: { ...MOCK_USER, id: "u2", username: "anime_girl_99", displayName: "Sakura", avatarUrl: "https://picsum.photos/id/1027/200/200" },
    createdAt: "10m ago",
    read: false,
    content: "liked your post about JJK"
  },
  {
    id: "n2",
    type: "reply",
    fromUserId: "u3",
    fromUser: { ...MOCK_USER, id: "u3", username: "retro_fan", displayName: "Spike", avatarUrl: "https://picsum.photos/id/1005/200/200" },
    createdAt: "1h ago",
    read: true,
    content: "replied: 'Absolutely agree!'"
  },
  {
    id: "n3",
    type: "follow",
    fromUserId: "u4",
    fromUser: { ...MOCK_USER, id: "u4", username: "goku_stan", displayName: "Kakarot", avatarUrl: "https://picsum.photos/id/1001/200/200" },
    createdAt: "2h ago",
    read: true
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    participantIds: ["u1", "u2"],
    participants: [{ ...MOCK_USER }, { ...MOCK_USER, id: "u2", username: "anime_girl_99", displayName: "Sakura", avatarUrl: "https://picsum.photos/id/1027/200/200" }],
    lastMessage: "Did you see the new trailer?",
    updatedAt: "5m ago",
    unreadCount: 2
  },
  {
    id: "c2",
    participantIds: ["u1", "u3"],
    participants: [{ ...MOCK_USER }, { ...MOCK_USER, id: "u3", username: "retro_fan", displayName: "Spike", avatarUrl: "https://picsum.photos/id/1005/200/200" }],
    lastMessage: "See you space cowboy...",
    updatedAt: "1d ago",
    unreadCount: 0
  }
];

export const MOCK_MESSAGES: Message[] = [
  { id: "m1", senderId: "other", content: "Hey! Are you watching the new season of Demon Slayer?", sentAt: "10:00 AM" },
  { id: "m2", senderId: "me", content: "Yeah! The animation is top tier as always.", sentAt: "10:02 AM" },
  { id: "m3", senderId: "other", content: "I know right? Can't wait for the next arc.", sentAt: "10:03 AM" },
  { id: "m4", senderId: "other", content: "Did you see the new trailer?", sentAt: "10:05 AM" },
];

export const TRENDING_TAGS: TrendingTag[] = [
  { tag: "JujutsuKaisen", posts: "125K posts" },
  { tag: "OnePiece", posts: "98K posts" },
  { tag: "SoloLeveling", posts: "85K posts" },
  { tag: "AnimeAwards", posts: "54K posts" },
  { tag: "Manga", posts: "42K posts" },
];