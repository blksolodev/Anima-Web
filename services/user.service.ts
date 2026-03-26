import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Post } from '../types';

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as User;
  } catch {
    return null;
  }
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as User;
  } catch {
    return null;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Pick<User, 'displayName' | 'bio' | 'avatarUrl' | 'bannerUrl'>>
): Promise<void> => {
  await updateDoc(doc(db, 'users', userId), updates);
};

export const isFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    const snap = await getDoc(doc(db, 'users', currentUserId, 'following', targetUserId));
    return snap.exists();
  } catch {
    return false;
  }
};

export const followUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  const followRef = doc(db, 'users', currentUserId, 'following', targetUserId);
  const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);

  await Promise.all([
    setDoc(followRef, { userId: targetUserId, createdAt: new Date() }),
    setDoc(followerRef, { userId: currentUserId, createdAt: new Date() }),
    updateDoc(doc(db, 'users', currentUserId), { 'stats.followingCount': increment(1) }),
    updateDoc(doc(db, 'users', targetUserId), { 'stats.followersCount': increment(1) }),
  ]);
};

export const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<void> => {
  const followRef = doc(db, 'users', currentUserId, 'following', targetUserId);
  const followerRef = doc(db, 'users', targetUserId, 'followers', currentUserId);

  await Promise.all([
    deleteDoc(followRef),
    deleteDoc(followerRef),
    updateDoc(doc(db, 'users', currentUserId), { 'stats.followingCount': increment(-1) }),
    updateDoc(doc(db, 'users', targetUserId), { 'stats.followersCount': increment(-1) }),
  ]);
};

export const getFollowingIds = async (userId: string): Promise<string[]> => {
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'following'));
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const q = query(collection(db, 'quests'), where('authorId', '==', userId), limit(100));
    const snap = await getDocs(q);
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
    return posts.sort((a, b) => {
      const ta = (a.createdAt as any)?.seconds ?? 0;
      const tb = (b.createdAt as any)?.seconds ?? 0;
      return tb - ta;
    });
  } catch {
    return [];
  }
};

export const getUserLikedPosts = async (userId: string): Promise<Post[]> => {
  try {
    const likeSnap = await getDocs(collection(db, 'users', userId, 'likes'));
    const postIds = likeSnap.docs.map((d) => d.id);
    if (postIds.length === 0) return [];
    const postDocs = await Promise.all(postIds.map((id) => getDoc(doc(db, 'quests', id))));
    return postDocs
      .filter((d) => d.exists())
      .map((d) => ({ id: d.id, ...d.data(), isLiked: true } as Post))
      .sort((a, b) => {
        const ta = (a.createdAt as any)?.seconds ?? 0;
        const tb = (b.createdAt as any)?.seconds ?? 0;
        return tb - ta;
      });
  } catch {
    return [];
  }
};
