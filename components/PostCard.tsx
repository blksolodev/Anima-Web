import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Repeat2, Share2, MoreHorizontal, EyeOff, Tv2, Radio, Trash2, Flag, XCircle } from 'lucide-react';
import { reportPost } from '../services/feed.service';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { useFeedStore } from '../store/useFeedStore';
import { PostReplies } from './PostReplies';

interface PostCardProps {
  post: Post;
  showRepliesInline?: boolean;
}

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n > 0 ? n.toString() : '';
};

const formatTime = (ts: any): string => {
  if (!ts) return '';
  const date = ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const PostCard: React.FC<PostCardProps> = ({ post, showRepliesInline = false }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { likePost, repostPost, deletePost, removePost } = useFeedStore();
  const [showReplies, setShowReplies] = useState(showRepliesInline);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === post.author?.id;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setShowReportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    await deletePost(post.id, post.author.id);
  };

  const handleNotInterested = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    removePost(post.id);
  };

  const handleReport = async (e: React.MouseEvent, reason: string) => {
    e.stopPropagation();
    setMenuOpen(false);
    setShowReportMenu(false);
    if (!user) return;
    await reportPost(post.id, user.id, reason).catch(() => {});
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    likePost(post.id, user.id);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    repostPost(post.id, user.id, user, post);
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowReplies((v) => !v);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/#/post/${post.id}`;
    if (navigator.share) {
      navigator.share({ title: `Post by ${post.author?.displayName}`, text: post.content, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleCardClick = () => {
    navigate(`/post/${post.id}`);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/user/${post.author?.id}`);
  };

  const showSpoilerOverlay = post.isSpoiler && !spoilerRevealed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="px-5 py-4 mb-0 bg-[#12121A] hover:bg-[#161620] transition-colors cursor-pointer border-b border-white/10"
        onClick={handleCardClick}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <button onClick={handleAuthorClick} className="flex-shrink-0 mt-0.5">
            <img
              src={post.author?.avatarUrl || `https://ui-avatars.com/api/?name=${post.author?.username ?? 'U'}&background=random&color=fff`}
              alt={post.author?.username}
              className="w-10 h-10 rounded-full border border-white/10 object-cover hover:ring-2 hover:ring-[#FF6B35] transition-all"
            />
          </button>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <button onClick={handleAuthorClick} className="font-bold text-white hover:underline truncate max-w-[140px]">
                  {post.author?.displayName || 'Anonymous'}
                </button>
                <span className="text-[#A0A0B0] text-sm truncate">@{post.author?.username || 'anon'}</span>
                <span className="text-[#6B6B7B] text-sm flex-shrink-0">· {formatTime(post.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                {post.isMature && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30">18+</span>
                )}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); setShowReportMenu(false); }}
                    className="text-[#6B6B7B] hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-7 z-50 w-48 bg-[#1A1A2E] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                      >
                        {!showReportMenu ? (
                          <>
                            <button
                              onClick={handleNotInterested}
                              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[#A0A0B0] hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <XCircle size={15} />
                              Not Interested
                            </button>
                            {!isOwner && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowReportMenu(true); }}
                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                              >
                                <Flag size={15} />
                                Report Post
                              </button>
                            )}
                            {isOwner && (
                              <button
                                onClick={handleDelete}
                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                              >
                                <Trash2 size={15} />
                                Delete Post
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="px-4 py-2 text-[10px] text-[#6B6B7B] uppercase tracking-wider font-semibold border-b border-white/10">
                              Report reason
                            </p>
                            {['Spam', 'Hate speech', 'Harassment', 'Misinformation', 'Inappropriate content'].map((reason) => (
                              <button
                                key={reason}
                                onClick={(e) => handleReport(e, reason)}
                                className="flex w-full px-4 py-2.5 text-sm text-[#A0A0B0] hover:bg-white/5 hover:text-white transition-colors"
                              >
                                {reason}
                              </button>
                            ))}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Content */}
            {showSpoilerOverlay ? (
              <button
                onClick={(e) => { e.stopPropagation(); setSpoilerRevealed(true); }}
                className="flex items-center gap-2 text-sm text-[#A0A0B0] italic bg-white/5 rounded-lg px-3 py-2 mb-3 hover:bg-white/10 transition-colors"
              >
                <EyeOff size={14} />
                Spoiler — tap to reveal
              </button>
            ) : (
              <p className="text-white/90 mb-3 whitespace-pre-wrap leading-relaxed text-sm">{post.content}</p>
            )}

            {/* Anime tag */}
            {post.animeReference && (
              <div className="inline-flex items-center gap-2.5 pr-3 mb-3 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {post.animeReference.coverImage && (
                  <img
                    src={post.animeReference.coverImage}
                    alt={post.animeReference.title}
                    className="w-8 h-11 object-cover flex-shrink-0"
                  />
                )}
                <div className="py-1.5 min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-tight">{post.animeReference.title}</p>
                  {post.animeReference.episode && (
                    <p className="text-[11px] text-[#06B6D4] mt-0.5 leading-tight">Episode {post.animeReference.episode}</p>
                  )}
                </div>
              </div>
            )}

            {/* Discussion tag */}
            {post.discussionTitle && post.discussionId && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/discussion/${post.discussionId}`, { state: { discussionTitle: post.discussionTitle } }); }}
                className={`inline-flex items-center gap-0 mb-3 border rounded-xl overflow-hidden hover:brightness-110 transition-all max-w-full text-left ${
                  post.discussionType === 'live'
                    ? 'bg-[#FF6B35]/10 border-[#FF6B35]/25 hover:border-[#FF6B35]/50'
                    : 'bg-[#06B6D4]/10 border-[#06B6D4]/25 hover:border-[#06B6D4]/50'
                }`}
              >
                {post.discussionAnimeCover && (
                  <img
                    src={post.discussionAnimeCover}
                    alt=""
                    className="w-8 h-11 object-cover flex-shrink-0"
                  />
                )}
                <div className="px-3 py-2 flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {post.discussionType === 'live' ? (
                      <Radio size={12} className="text-[#FF6B35] flex-shrink-0" />
                    ) : (
                      <Tv2 size={12} className="text-[#06B6D4] flex-shrink-0" />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${post.discussionType === 'live' ? 'text-[#FF6B35]' : 'text-[#06B6D4]'}`}>
                      {post.discussionType === 'live' ? 'Live Discussion' : 'Episode Discussion'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-white truncate">{post.discussionTitle}</span>
                  <span className="text-[10px] text-[#A0A0B0]">Join the room →</span>
                </div>
              </button>
            )}

            {/* Media */}
            {post.mediaAttachment && !showSpoilerOverlay && (
              <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
                {post.mediaAttachment.type === 'image' || post.mediaAttachment.type === 'gif' ? (
                  <img
                    src={post.mediaAttachment.url}
                    alt="Post media"
                    className="w-full h-auto object-cover max-h-[500px]"
                    style={post.mediaAttachment.aspectRatio ? { aspectRatio: post.mediaAttachment.aspectRatio } : {}}
                  />
                ) : (
                  <video
                    src={post.mediaAttachment.url}
                    controls
                    className="w-full max-h-[500px]"
                    poster={post.mediaAttachment.thumbnailUrl}
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-0 mt-2 text-[#A0A0B0] -ml-2">
              <button
                onClick={handleComment}
                className="flex items-center gap-1.5 hover:text-[#06B6D4] group transition-colors px-3 py-2.5 rounded-full hover:bg-[#06B6D4]/10 active:scale-95"
              >
                <MessageCircle size={18} />
                <span className="text-xs">{formatCount(post.replies || 0)}</span>
              </button>

              <button
                onClick={handleRepost}
                className={`flex items-center gap-1.5 group transition-colors px-3 py-2.5 rounded-full active:scale-95
                  ${post.isReposted ? 'text-[#10B981]' : 'hover:text-[#10B981] hover:bg-[#10B981]/10'}`}
              >
                <Repeat2 size={18} />
                <span className="text-xs">{formatCount(post.reposts || 0)}</span>
              </button>

              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 group transition-colors px-3 py-2.5 rounded-full active:scale-95
                  ${post.isLiked ? 'text-[#F43F5E]' : 'hover:text-[#F43F5E] hover:bg-[#F43F5E]/10'}`}
              >
                <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
                <span className="text-xs">{formatCount(post.likes || 0)}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-[#FF6B2C] transition-colors px-3 py-2.5 rounded-full hover:bg-[#FF6B2C]/10 ml-auto active:scale-95"
              >
                <Share2 size={18} />
              </button>
            </div>

            {showReplies && (
              <div className="mt-3 pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                <PostReplies post={post} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
