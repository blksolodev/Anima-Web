import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
  getDocs,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notification } from '../types';

const NOTIFS = 'notifications';

const sortByDate = (a: Notification, b: Notification) => {
  const ta = (a.createdAt as any)?.seconds ?? 0;
  const tb = (b.createdAt as any)?.seconds ?? 0;
  return tb - ta;
};

export const subscribeNotifications = (
  userId: string,
  onUpdate: (notifs: Notification[]) => void
): Unsubscribe => {
  const q = query(collection(db, NOTIFS), where('targetUserId', '==', userId), limit(50));
  return onSnapshot(
    q,
    (snap) => {
      const notifs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Notification))
        .sort(sortByDate);
      onUpdate(notifs);
    },
    () => onUpdate([])
  );
};

export const markNotificationRead = async (notifId: string): Promise<void> => {
  await updateDoc(doc(db, NOTIFS, notifId), { read: true });
};

export const markAllNotificationsRead = async (userId: string): Promise<void> => {
  const q = query(
    collection(db, NOTIFS),
    where('targetUserId', '==', userId),
    where('read', '==', false)
  );
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
};
