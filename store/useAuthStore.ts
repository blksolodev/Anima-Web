import { create } from 'zustand';
import { User } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  logoutUser,
  resetPassword,
} from '../services/auth.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;

  initialize: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: () => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        unsubscribeDoc = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              set({ user: { id: firebaseUser.uid, ...snap.data() } as User, loading: false });
            } else {
              set({ user: null, loading: false });
            }
          },
          (err) => {
            console.error('[Auth] Profile listener error:', err);
            set({ user: null, loading: false });
          }
        );
      } else {
        set({ user: null, loading: false });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      const msg = friendlyAuthError(err.code);
      set({ error: msg });
      throw new Error(msg);
    }
  },

  register: async (email, password, username) => {
    set({ error: null });
    try {
      await registerWithEmail(email, password, username);
    } catch (err: any) {
      const msg = friendlyAuthError(err.code);
      set({ error: msg });
      throw new Error(msg);
    }
  },

  loginGoogle: async () => {
    set({ error: null });
    try {
      await loginWithGoogle();
    } catch (err: any) {
      const msg = friendlyAuthError(err.code);
      set({ error: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    await logoutUser();
    set({ user: null });
  },

  sendPasswordReset: async (email) => {
    await resetPassword(email);
  },

  clearError: () => set({ error: null }),
}));

const friendlyAuthError = (code: string): string => {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/popup-closed-by-user':
      return '';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
};
