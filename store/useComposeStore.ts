import { create } from 'zustand';

interface ComposeState {
  isOpen: boolean;
  replyTo: { postId: string; authorUsername: string } | null;
  open: (replyTo?: { postId: string; authorUsername: string }) => void;
  close: () => void;
}

export const useComposeStore = create<ComposeState>((set) => ({
  isOpen: false,
  replyTo: null,
  open: (replyTo) => set({ isOpen: true, replyTo: replyTo ?? null }),
  close: () => set({ isOpen: false, replyTo: null }),
}));
