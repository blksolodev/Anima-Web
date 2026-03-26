import React, { useEffect, useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Heart, MessageCircle, UserPlus, AtSign, Loader2, BellOff, Tv } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Notification } from '../../types';

export const Notifications: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      if (!user) return;
      try {
        const q = query(
            collection(db, 'notifications'), 
            where('recipientId', '==', user.id)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[];
        
        data.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        setNotifications(data);
      } catch (e: any) {
        console.error("Notifications error:", e);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart size={20} className="text-[#EF4444] fill-current" />;
      case 'comment': return <MessageCircle size={20} className="text-[#4ECDC4]" />;
      case 'reply': return <MessageCircle size={20} className="text-[#4ECDC4]" />;
      case 'follow': return <UserPlus size={20} className="text-[#FF6B35]" />;
      case 'episode_release': return <Tv size={20} className="text-[#F4D03F]" />;
      default: return <AtSign size={20} className="text-[#A0A0B0]" />;
    }
  };

  const getMessage = (notif: Notification) => {
    if (notif.content) return notif.content;
    switch(notif.type) {
        case 'like': return 'liked your quest';
        case 'comment': return 'commented on your quest';
        case 'follow': return 'followed you';
        case 'repost': return 'reposted your quest';
        case 'episode_release': return `New episode of ${notif.animeName || 'anime'} is out!`;
        default: return 'interacted with you';
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto pt-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button className="text-sm text-[#FF6B35] hover:underline">Mark all read</button>
      </div>

      <div className="space-y-3">
        {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
        ) : notifications.length === 0 ? (
            <div className="text-center text-[#A0A0B0] py-10">
                <BellOff size={32} className="mx-auto mb-3 opacity-50" />
                <p>No new notifications.</p>
            </div>
        ) : (
            notifications.map((notif) => (
            <GlassCard 
                key={notif.id} 
                className={`!p-4 flex gap-4 transition-colors ${notif.isRead ? 'opacity-70' : 'bg-white/10'}`}
            >
                <div className="mt-1">
                {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    {notif.user ? (
                        <>
                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                             <img src={notif.user.avatarUrl || `https://ui-avatars.com/api/?name=${notif.user.username}`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold">{notif.user.displayName}</span> 
                        </>
                    ) : (
                        <span className="font-bold">System</span>
                    )}
                    <span className="text-[#A0A0B0] text-sm">
                        {typeof notif.createdAt === 'string' ? notif.createdAt : (notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleTimeString() : 'Just now')}
                    </span>
                </div>
                <p className="text-white/90">
                    {getMessage(notif)}
                </p>
                </div>
                {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-[#FF6B35] self-center" />
                )}
            </GlassCard>
            ))
        )}
      </div>
    </div>
  );
};