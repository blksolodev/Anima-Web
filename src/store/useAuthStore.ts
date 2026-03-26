import { create } from 'zustand';
import { User } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialize: () => () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialize: () => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), 
          (docSnap) => {
            if (docSnap.exists()) {
              set({ 
                user: { id: firebaseUser.uid, ...docSnap.data() } as User, 
                loading: false 
              });
            } else {
              console.log("Auth valid but profile document missing");
              set({ user: null, loading: false });
            }
          }, 
          (error) => {
            console.error('Error listening to user profile:', error);
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
  logout: async () => {
    await signOut(auth);
    set({ user: null });
  }
}));