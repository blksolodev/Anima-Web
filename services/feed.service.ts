import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  doc,
  increment,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  startAfter,
  DocumentSnapshot,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post, PostAuthor, MediaAttachment, AnimeReference } from '../types';

const QUESTS_COLLECTION = 'quests';
const PAGE_SIZE = 20;

const toPost = (d: DocumentSnapshot): Post => ({ id: d.id, ...d.data() } as Post);

// Hydrate isLiked for a list of posts given the current user
export const hydrateIsLiked = async (userId: string, posts: Post[]): Promise<Post[]> => {
  const likeChecks = posts.map((p) =>
    getDoc(doc(db, 'users', userId, 'likes', p.id)).then((s) => s.exists())
  );
  const results = await Promise.all(likeChecks);
  return posts.map((p, i) => ({ ...p, isLiked: results[i] }));
};

// Hydrate isReposted — reads repostedQuests array from user doc (one read, matches mobile app)
export const hydrateIsReposted = async (userId: string, posts: Post[]): Promise<Post[]> => {
  const userSnap = await getDoc(doc(db, 'users', userId));
  const repostedQuests: string[] = userSnap.data()?.repostedQuests ?? [];
  const repostedSet = new Set(repostedQuests);
  return posts.map((p) => ({ ...p, isReposted: repostedSet.has(p.id) }));
};

// Subscribe to live feed (newest first)
export const subscribeFeed = (
  onUpdate: (posts: Post[]) => void,
  onError: (err: Error) => void
): Unsubscribe => {
  const q = query(collection(db, QUESTS_COLLECTION), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
  return onSnapshot(
    q,
    (snap) => onUpdate(snap.docs.map(toPost)),
    onError
  );
};

// Load more (pagination)
export const loadMorePosts = async (lastDoc: DocumentSnapshot): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> => {
  const q = query(
    collection(db, QUESTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    startAfter(lastDoc),
    limit(PAGE_SIZE)
  );
  const snap = await getDocs(q);
  return {
    posts: snap.docs.map(toPost),
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  };
};

// Get a single post by ID
export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const snap = await getDoc(doc(db, QUESTS_COLLECTION, postId));
    if (!snap.exists()) return null;
    return toPost(snap);
  } catch {
    return null;
  }
};

export interface CreatePostOptions {
  animeReference?: AnimeReference;
  mediaAttachment?: MediaAttachment;
  isHotTake?: boolean;
  isSpoiler?: boolean;
  isMature?: boolean;
  parentId?: string;
}

export const createPost = async (
  content: string,
  author: PostAuthor,
  options: CreatePostOptions = {}
): Promise<string> => {
  const data = {
    authorId: author.id,
    author,
    content,
    likes: 0,
    reposts: 0,
    replies: 0,
    isHotTake: options.isHotTake ?? false,
    isSpoiler: options.isSpoiler ?? false,
    isMature: options.isMature ?? false,
    mediaAttachment: options.mediaAttachment ?? null,
    animeReference: options.animeReference ?? null,
    parentId: options.parentId ?? null,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, QUESTS_COLLECTION), data);

  // Increment author's post count
  await updateDoc(doc(db, 'users', author.id), { 'stats.postsCount': increment(1) }).catch(() => {});

  return ref.id;
};

export const likePost = async (postId: string, userId: string): Promise<void> => {
  await Promise.all([
    updateDoc(doc(db, QUESTS_COLLECTION, postId), { likes: increment(1) }),
    setDoc(doc(db, 'users', userId, 'likes', postId), { postId, createdAt: serverTimestamp() }),
  ]);
};

export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  await Promise.all([
    updateDoc(doc(db, QUESTS_COLLECTION, postId), { likes: increment(-1) }),
    deleteDoc(doc(db, 'users', userId, 'likes', postId)),
  ]);
};

export const repostPost = async (postId: string, userId: string): Promise<void> => {
  await Promise.all([
    updateDoc(doc(db, QUESTS_COLLECTION, postId), { reposts: increment(1) }),
    updateDoc(doc(db, 'users', userId), { repostedQuests: arrayUnion(postId) }),
  ]);
};

export const unrepostPost = async (postId: string, userId: string): Promise<void> => {
  await Promise.all([
    updateDoc(doc(db, QUESTS_COLLECTION, postId), { reposts: increment(-1) }),
    updateDoc(doc(db, 'users', userId), { repostedQuests: arrayRemove(postId) }),
  ]);
};

export const deletePost = async (postId: string, authorId: string): Promise<void> => {
  await deleteDoc(doc(db, QUESTS_COLLECTION, postId));
  await updateDoc(doc(db, 'users', authorId), { 'stats.postsCount': increment(-1) }).catch(() => {});
};

export const reportPost = async (postId: string, reporterId: string, reason: string): Promise<void> => {
  await addDoc(collection(db, 'reports'), {
    postId,
    reporterId,
    reason,
    createdAt: serverTimestamp(),
  });
};

// Get replies for a post
export const subscribReplies = (
  postId: string,
  onUpdate: (replies: Post[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, QUESTS_COLLECTION),
    orderBy('createdAt', 'asc'),
    limit(50)
  );
  // Filter client-side since Firestore composite index may not exist yet
  return onSnapshot(q, (snap) => {
    const replies = snap.docs.map(toPost).filter((p) => p.parentId === postId);
    onUpdate(replies);
  });
};
