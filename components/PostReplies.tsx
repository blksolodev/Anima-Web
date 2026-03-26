import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Post } from '../types';
import { subscribReplies, createPost, likePost, unlikePost } from '../services/feed.service';
import { Button } from './Button';

interface PostRepliesProps {
  post: Post;
  showCompose?: boolean;
  onClose?: () => void;
}

const formatTime = (ts: any): string => {
  if (!ts) return '';
  const date = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const PostReplies: React.FC<PostRepliesProps> = ({ post, showCompose = true }) => {
  const { user } = useAuthStore();
  const [replies, setReplies] = useState<Post[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribReplies(post.id, (updatedReplies) => {
      setReplies(updatedReplies);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleSendReply = async () => {
    if (!newReply.trim() || !user) return;
    setSending(true);
    try {
      await createPost(
        newReply.trim(),
        {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          powerLevel: user.powerLevel ?? 1,
          auraColor: '#7C3AED',
        },
        { parentId: post.id }
      );
      setNewReply('');
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10">
      {/* Composer */}
      {showCompose && (
        <div className="flex gap-3 mb-6">
          <img
            src={
              user?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${user?.username ?? 'U'}&background=random&color=fff`
            }
            alt="Me"
            className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0"
          />
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSendReply();
                }}
                placeholder="Post your reply"
                className="w-full bg-[#0D0D14]/50 border border-white/10 rounded-xl p-3 pr-24 text-white placeholder-[#6B6B7B] focus:outline-none focus:border-[#FF6B35] transition-colors resize-none min-h-[80px] text-sm"
              />
              <div className="absolute bottom-3 right-3">
                <Button
                  onClick={handleSendReply}
                  disabled={!newReply.trim() || sending}
                  className="!py-1.5 !px-4 !text-xs !rounded-lg"
                >
                  {sending ? <Loader2 className="animate-spin" size={14} /> : 'Reply'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-[#6B6B7B] mt-1.5 pl-1">⌘ + Enter to post</p>
          </div>
        </div>
      )}

      {/* Reply list */}
      <div className="space-y-0">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-[#FF6B35]" size={20} />
          </div>
        ) : replies.length === 0 ? (
          <div className="text-center py-10 text-[#A0A0B0] text-sm">
            No replies yet. Start the conversation.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {replies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} currentUserId={user?.id} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

/* ── Individual reply card ── */
const ReplyCard: React.FC<{ reply: Post; currentUserId?: string }> = ({
  reply,
  currentUserId,
}) => {
  const [liked, setLiked] = useState(reply.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(reply.likes ?? 0);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await unlikePost(reply.id, currentUserId);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await likePost(reply.id, currentUserId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 group py-3 border-b border-white/5 last:border-none"
    >
      {/* Avatar + thread line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <img
          src={
            reply.author?.avatarUrl ||
            `https://ui-avatars.com/api/?name=${reply.author?.username ?? 'U'}&background=random&color=fff`
          }
          alt={reply.author?.username}
          className="w-9 h-9 rounded-full object-cover border border-white/10"
        />
        <div className="w-0.5 flex-1 bg-white/5 mt-2 group-last:hidden rounded-full" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="font-bold text-sm text-white">{reply.author?.displayName}</span>
          <span className="text-[#A0A0B0] text-xs">@{reply.author?.username}</span>
          <span className="text-[#6B6B7B] text-xs">· {formatTime(reply.createdAt)}</span>
        </div>

        <p className="text-white/90 text-sm mb-2 leading-relaxed whitespace-pre-wrap break-words">
          {reply.content}
        </p>

        {reply.mediaAttachment && (
          <div className="mb-2 rounded-xl overflow-hidden border border-white/10 max-w-xs">
            <img
              src={reply.mediaAttachment.url}
              alt="media"
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition-colors
            ${liked ? 'text-[#EF4444]' : 'text-[#A0A0B0] hover:text-[#EF4444]'}`}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
      </div>
    </motion.div>
  );
};
