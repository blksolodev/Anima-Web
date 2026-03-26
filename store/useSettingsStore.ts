import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationPrefs {
  likes: boolean;
  replies: boolean;
  follows: boolean;
  mentions: boolean;
  newEpisodes: boolean;
}

interface ContentPrefs {
  matureContent: boolean;
  showSpoilers: boolean;
  dataSaver: boolean;
  autoplayVideos: boolean;
}

interface PrivacyPrefs {
  privateAccount: boolean;
  whoCanReply: 'everyone' | 'followers' | 'none';
}

interface SettingsState {
  notifications: NotificationPrefs;
  content: ContentPrefs;
  privacy: PrivacyPrefs;
  mutedWords: string[];
  blockedUserIds: string[];

  setNotifPref: (key: keyof NotificationPrefs, value: boolean) => void;
  setContentPref: (key: keyof ContentPrefs, value: boolean) => void;
  setPrivacyPref: <K extends keyof PrivacyPrefs>(key: K, value: PrivacyPrefs[K]) => void;
  addMutedWord: (word: string) => void;
  removeMutedWord: (word: string) => void;
  addBlockedUser: (userId: string) => void;
  removeBlockedUser: (userId: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: {
        likes: true,
        replies: true,
        follows: true,
        mentions: true,
        newEpisodes: true,
      },
      content: {
        matureContent: false,
        showSpoilers: false,
        dataSaver: false,
        autoplayVideos: true,
      },
      privacy: {
        privateAccount: false,
        whoCanReply: 'everyone',
      },
      mutedWords: [],
      blockedUserIds: [],

      setNotifPref: (key, value) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
      setContentPref: (key, value) =>
        set((s) => ({ content: { ...s.content, [key]: value } })),
      setPrivacyPref: (key, value) =>
        set((s) => ({ privacy: { ...s.privacy, [key]: value } })),
      addMutedWord: (word) =>
        set((s) => {
          const w = word.toLowerCase().trim();
          return s.mutedWords.includes(w) ? s : { mutedWords: [...s.mutedWords, w] };
        }),
      removeMutedWord: (word) =>
        set((s) => ({ mutedWords: s.mutedWords.filter((w) => w !== word) })),
      addBlockedUser: (userId) =>
        set((s) =>
          s.blockedUserIds.includes(userId)
            ? s
            : { blockedUserIds: [...s.blockedUserIds, userId] }
        ),
      removeBlockedUser: (userId) =>
        set((s) => ({ blockedUserIds: s.blockedUserIds.filter((id) => id !== userId) })),
    }),
    { name: 'anima-web-settings' }
  )
);
