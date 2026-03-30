import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  AtSign,
  Tv,
  BellOff,
  Loader2,
  CheckCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import {
  subscribeNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notification.service';
import { Notification } from '../../types';

type NotifTab = 'all' | 'likes' | 'reposts' | 'replies' | 'follows' | 'mentions';

const TABS: { key: NotifTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'likes', label: 'Likes' },
  { key: 'reposts', label: 'Reposts' },
  { key: 'replies', label: 'Replies' },
  { key: 'follows', label: 'Follows' },
  { key: 'mentions', label: 'Mentions' },
];

const TAB_TYPES: Record<NotifTab, string[]> = {
  all: ['like', 'repost', 'reply', 'follow', 'mention', 'new_episode'],
  likes: ['like'],
  reposts: ['repost'],
  replies: ['reply'],
  follows: ['follow'],
  mentions: ['mention'],
};

const typeIcon = (type: string) => {
  switch (type) {
    case 'like':        return <Heart size={18} className="text-[#EF4444] fill-[#EF4444]" />;
    case 'repost':      return <Repeat2 size={18} className="text-[#10B981]" />;
    case 'reply':       return <MessageCircle size={18} className="text-[#4ECDC4]" />;
    case 'follow':      return <UserPlus size={18} className="text-[#FF6B35]" />;
    case 'mention':     return <AtSign size={18} className="text-[#F4D03F]" />;
    case 'new_episode': return <Tv size={18} className="text-[#9B59B6]" />;
    default:            return <AtSign size={18} className="text-[#A0A0B0]" />;
  }
};

const typeBg = (type: string) => {
  switch (type) {
    case 'like':        return 'bg-[#EF4444]/10';
    case 'repost':      return 'bg-[#10B981]/10';
    case 'reply':       return 'bg-[#4ECDC4]/10';
    case 'follow':      return 'bg-[#FF6B35]/10';
    case 'mention':     return 'bg-[#F4D03F]/10';
    case 'new_episode': return 'bg-[#9B59B6]/10';
    default:            return 'bg-white/10';
  }
};

const formatTime = (ts: any): string => {
  if (!ts) return '';
  const date = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const defaultMessage = (type: string, name: string) => {
  switch (type) {
    case 'like':        return `${name} liked your post`;
    case 'reply':       return `${name} replied to your post`;
    case 'follow':      return `${name} started following you`;
    case 'mention':     return `${name} mentioned you`;
    case 'new_episode': return 'New episode available';
    default:            return `${name} interacted with you`;
  }
};

export const Notifications: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NotifTab>('all');
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotifications(user.id, (data) => {
      setNotifs(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.id]);

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.read) markNotificationRead(notif.id).catch(() => {});
    if (notif.relatedPostId) navigate(`/post/${notif.relatedPostId}`);
    else if (notif.fromUserId) navigate(`/user/${notif.fromUserId}`);
  };

  const handleMarkAll = async () => {
    if (!user) return;
    setMarkingAll(true);
    await markAllNotificationsRead(user.id).catch(() => {});
    setMarkingAll(false);
  };

  const displayed = notifs.filter((n) => TAB_TYPES[activeTab].includes(n.type));
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#0D0D14]/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          <h1 className="text-xl font-bold">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs font-normal bg-[#FF6B35] text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs text-[#FF6B35] hover:text-[#FF8A50] transition-colors font-medium"
            >
              {markingAll
                ? <Loader2 size={13} className="animate-spin" />
                : <CheckCheck size={13} />}
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex mt-1 overflow-x-auto scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium relative transition-colors
                ${activeTab === t.key ? 'text-white' : 'text-[#A0A0B0] hover:text-white'}`}
            >
              {t.label}
              {activeTab === t.key && (
                <motion.div
                  layoutId="notif-tab-indicator"
                  className="absolute bottom-0 left-[calc(50%-7px)] -translate-x-1/2 h-0.5 w-8 bg-[#FF6B35] rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#FF6B35]" size={32} />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-[#A0A0B0]">
          <BellOff size={40} className="mb-4 opacity-30" />
          <p className="font-semibold">No notifications here</p>
          <p className="text-sm mt-1 text-[#6B6B7B]">
            {activeTab === 'all' ? "You're all caught up." : `No ${activeTab} yet.`}
          </p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {displayed.map((notif) => {
            const name = notif.fromUser?.displayName || notif.fromUserId;
            const avatar = notif.fromUser?.avatarUrl;
            const message = notif.content || defaultMessage(notif.type, name);

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={() => handleNotifClick(notif)}
                className={`flex items-start gap-4 px-4 py-4 border-b border-white/5 cursor-pointer transition-colors
                  ${notif.read ? 'hover:bg-white/[0.03]' : 'bg-white/[0.04] hover:bg-white/[0.07]'}`}
              >
                {/* Icon ring + avatar */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <div className={`w-10 h-10 rounded-full overflow-hidden border border-white/10`}>
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${typeBg(notif.type)} border border-[#0D0D14]`}>
                    {typeIcon(notif.type)}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${notif.read ? 'text-white/70' : 'text-white'}`}>
                    <span className="font-bold">{name}</span>{' '}
                    {notif.content
                      ? notif.content
                      : notif.type === 'follow'
                        ? 'started following you'
                        : notif.type === 'like'
                          ? 'liked your post'
                          : notif.type === 'repost'
                            ? 'reposted your post'
                            : notif.type === 'reply'
                              ? 'replied to your post'
                              : notif.type === 'mention'
                                ? 'mentioned you'
                                : 'interacted with you'}
                  </p>
                  <p className="text-xs text-[#6B6B7B] mt-1">{formatTime(notif.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-[#FF6B35] flex-shrink-0 mt-2" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
};
