import { Swords, Tv, MessagesSquare, Trophy, Flame, Users, Zap, Home, Search, Bell, Mail, Library, User } from "lucide-react";
import { NavLink, FeatureItem, StatItem, TeamMember, Quest, Anime, User as UserType, Notification, Conversation, Message, TrendingTag } from "./types";

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
  avatarUrl: "https://picsum.photos/id/1012/200/200",
  bannerUrl: "https://picsum.photos/id/1018/1000/300",
  bio: "Just a humble fan waiting for the next arc. 🗡️ | Lvl 42 Paladin",
  powerLevel: 42,
  xp: 8500,
  joinedAt: "2024-01-01",
  badges: [],
  pledgedCharacter: null,
  favoriteAnime: [],
  stats: {
      postsCount: 142,
      followersCount: 1240,
      followingCount: 85,
      completedAnime: 50,
      watchingAnime: 12,
      totalEpisodesWatched: 1200,
      critsGiven: 10,
      critsReceived: 5,
  },
  settings: {
      theme: 'default',
      notifications: {
        newEpisodes: true,
        mentions: true,
        replies: true,
        likes: true,
        reposts: true,
        guildActivity: true,
        recommendations: true,
      },
      privacy: {
        showWatchlist: true,
        showActivity: true,
        allowDMs: true,
      },
      spoilerProtection: true,
  }
};

// No MOCK_POSTS constant needed in strict mode, but preserved for compile safety if referenced elsewhere
export const MOCK_POSTS: Quest[] = [];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "like",
    recipientId: "u1",
    user: { id: "u2", username: "anime_girl_99", displayName: "Sakura", avatarUrl: "https://picsum.photos/id/1027/200/200" },
    createdAt: "10m ago",
    isRead: false,
    content: "liked your post about JJK"
  },
  {
    id: "n2",
    type: "comment",
    recipientId: "u1",
    user: { id: "u3", username: "retro_fan", displayName: "Spike", avatarUrl: "https://picsum.photos/id/1005/200/200" },
    createdAt: "1h ago",
    isRead: true,
    content: "replied: 'Absolutely agree!'"
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    participantIds: [MOCK_USER.id, "u2"],
    participants: [
        MOCK_USER,
        { ...MOCK_USER, id: "u2", username: "anime_girl_99", displayName: "Sakura", avatarUrl: "https://picsum.photos/id/1027/200/200" }
    ],
    lastMessage: "Did you see the new trailer?",
    updatedAt: "5m ago",
    unreadCount: 2
  }
];

export const MOCK_MESSAGES: Message[] = [
  { id: "m1", senderId: "other", content: "Hey! Are you watching the new season of Demon Slayer?", sentAt: "10:00 AM" },
  { id: "m2", senderId: MOCK_USER.id, content: "Yeah! The animation is top tier as always.", sentAt: "10:02 AM" },
];

export const TRENDING_TAGS: TrendingTag[] = [
  { tag: "JujutsuKaisen", posts: "125K posts" },
  { tag: "OnePiece", posts: "98K posts" },
  { tag: "SoloLeveling", posts: "85K posts" },
  { tag: "AnimeAwards", posts: "54K posts" },
  { tag: "Manga", posts: "42K posts" },
];