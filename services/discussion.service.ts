import {
  doc, getDoc, collection, query, orderBy, limit,
  onSnapshot, addDoc, updateDoc, increment, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DiscussionRoom, DiscussionMessage, PostAuthor } from '../types';

export const getDiscussion = async (id: string): Promise<DiscussionRoom | null> => {
  const snap = await getDoc(doc(db, 'discussions', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as DiscussionRoom;
};

export const subscribeMessages = (
  discussionId: string,
  callback: (msgs: DiscussionMessage[]) => void,
): (() => void) => {
  const q = query(
    collection(db, 'discussions', discussionId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(100),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as DiscussionMessage)));
  });
};

export const sendMessage = async (
  discussionId: string,
  author: PostAuthor,
  content: string,
): Promise<void> => {
  await addDoc(collection(db, 'discussions', discussionId, 'messages'), {
    authorId: author.id,
    author,
    content,
    timestamp: serverTimestamp(),
  });
  await updateDoc(doc(db, 'discussions', discussionId), {
    messageCount: increment(1),
  });
};

export const checkSpoilerVerified = async (
  discussionId: string,
  userId: string,
): Promise<boolean> => {
  const snap = await getDoc(
    doc(db, 'users', userId, 'spoiler_verifications', discussionId),
  );
  return snap.exists();
};

export const markSpoilerVerified = async (
  discussionId: string,
  userId: string,
): Promise<void> => {
  await setDoc(
    doc(db, 'users', userId, 'spoiler_verifications', discussionId),
    { verifiedAt: serverTimestamp() },
  );
};
