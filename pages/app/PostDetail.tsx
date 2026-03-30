import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Post } from '../../types';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { PostCard } from '../../components/PostCard';
import { PostReplies } from '../../components/PostReplies';

export const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Live subscription so reply count in header stays up to date
  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, 'quests', postId),
      (snap) => {
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data() } as Post);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      },
      () => {
        setNotFound(true);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [postId]);

  const replyCount = post?.replies ?? 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#0D0D14] sm:bg-[#0D0D14]/90 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold">Post</h1>
          {replyCount > 0 && (
            <p className="text-xs text-[#A0A0B0]">
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#FF6B35]" size={32} />
        </div>
      ) : notFound ? (
        <div className="text-center py-20 text-[#A0A0B0]">
          <p className="text-lg font-semibold">Post not found</p>
          <p className="text-sm mt-2">It may have been deleted.</p>
        </div>
      ) : post ? (
        <>
          <PostCard post={post} showRepliesInline={false} />
          <div className="px-4 py-2">
            <PostReplies post={post} showCompose />
          </div>
        </>
      ) : null}
    </div>
  );
};
