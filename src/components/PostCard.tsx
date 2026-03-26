import React, { useState } from 'react';
import { MessageCircle, Heart, Repeat2, Share2, MoreHorizontal } from 'lucide-react';
import { Quest } from '../types';
import { GlassCard } from './GlassCard';

interface PostCardProps {
  quest: Quest;
}

export const PostCard: React.FC<PostCardProps> = ({ quest }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(quest.likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const formattedDate = typeof quest.createdAt === 'string' 
    ? quest.createdAt 
    : quest.createdAt?.seconds 
      ? new Date(quest.createdAt.seconds * 1000).toLocaleDateString()
      : 'Just now';

  return (
    <GlassCard className="!p-5 mb-4 hover:bg-white/[0.07] transition-colors cursor-pointer border-transparent">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img 
            src={quest.author.avatarUrl || `https://ui-avatars.com/api/?name=${quest.author.username}`} 
            alt={quest.author.username} 
            className="w-12 h-12 rounded-full border border-white/10 object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-bold text-white truncate">{quest.author.displayName}</span>
              <span className="text-[#A0A0B0] text-sm truncate">@{quest.author.username}</span>
              <span className="text-[#6B6B7B] text-sm">• {formattedDate}</span>
            </div>
            <button className="text-[#6B6B7B] hover:text-white">
              <MoreHorizontal size={18} />
            </button>
          </div>

          <p className="text-white/90 mb-3 whitespace-pre-wrap leading-relaxed">
            {quest.content}
          </p>

          {quest.mediaAttachment && (
            <div className="mb-3 rounded-xl overflow-hidden border border-white/10">
              {quest.mediaAttachment.type === 'video' ? (
                <video src={quest.mediaAttachment.url} controls className="w-full h-auto" />
              ) : (
                <img src={quest.mediaAttachment.url} alt="Quest attachment" className="w-full h-auto object-cover" />
              )}
            </div>
          )}

          {quest.animeReference && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-medium mb-3">
              <span>📺</span>
              {quest.animeReference.title}
              {quest.animeReference.episode && <span className="opacity-70"> • EP {quest.animeReference.episode}</span>}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-2 text-[#A0A0B0]">
            <button className="flex items-center gap-2 hover:text-[#4ECDC4] group transition-colors">
              <div className="p-2 rounded-full group-hover:bg-[#4ECDC4]/10">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm">{quest.replies}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-[#00D26A] group transition-colors">
              <div className="p-2 rounded-full group-hover:bg-[#00D26A]/10">
                <Repeat2 size={18} />
              </div>
              <span className="text-sm">{quest.reposts}</span>
            </button>

            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 group transition-colors ${liked ? 'text-[#EF4444]' : 'hover:text-[#EF4444]'}`}
            >
              <div className="p-2 rounded-full group-hover:bg-[#EF4444]/10">
                <Heart size={18} fill={liked ? "currentColor" : "none"} />
              </div>
              <span className="text-sm">{likeCount}</span>
            </button>

            <button className="flex items-center gap-2 hover:text-[#FF6B35] group transition-colors">
              <div className="p-2 rounded-full group-hover:bg-[#FF6B35]/10">
                <Share2 size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};