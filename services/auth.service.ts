import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { User } from '../types';

const DEFAULT_AURA_COLOR = '#7C3AED';

// Build a clean user document matching the mobile schema exactly
const buildUserDoc = (uid: string, username: string, email: string, displayName?: string, avatarUrl?: string) => ({
  id: uid,
  username: username.toLowerCase().replace(/\s+/g, '_'),
  displayName: displayName || username,
  email,
  avatarUrl: avatarUrl ?? null,
  bannerUrl: null,
  bio: '',
  powerLevel: 1,
  xp: 0,
  auraColor: DEFAULT_AURA_COLOR,
  onboardingComplete: false,
  favoriteGenres: [],
  stats: {
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
  },
  createdAt: serverTimestamp(),
});

export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (
  email: string,
  password: string,
  username: string
): Promise<void> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;
  await setDoc(doc(db, 'users', uid), buildUserDoc(uid, username, email));
};

export const loginWithGoogle = async (): Promise<void> => {
  const credential = await signInWithPopup(auth, googleProvider);
  const { uid, email, displayName, photoURL } = credential.user;

  // Create user doc only if it doesn't already exist
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    const username = (email?.split('@')[0] ?? `user_${uid.slice(0, 6)}`);
    await setDoc(userRef, buildUserDoc(uid, username, email ?? '', displayName ?? username, photoURL ?? undefined));
  }
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};
