import React, { useState, useEffect } from 'react';
import { PostCard } from '../../components/PostCard';
import { ImageIcon, Mic, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../lib/firebase';
import { collection, addDoc, query, onSnapshot, serverTimestamp, limit } from 'firebase/firestore';
import { Quest } from '../../types';

export const Feed: React.FC = () => {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    // Switch to 'quests' collection as per spec
    const q = query(collection(db, 'quests'), limit(50));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedQuests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Quest[];

        // Client-side sort
        fetchedQuests.sort((a, b) => {
          const timeA = a.createdAt?.seconds || (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime()/1000 : 0);
          const timeB = b.createdAt?.seconds || (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime()/1000 : 0);
          return timeB - timeA;
        });

        setQuests(fetchedQuests);
        setLoading(false);
        setError('');
      },
      (err) => {
        console.error("Feed error:", err);
        if (err.code === 'permission-denied') {
             setError("Access denied. Please check your permissions.");
        } else {
             setError("Unable to load quests.");
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    setSubmitting(true);
    try {
      // Create Quest with new schema
      await addDoc(collection(db, 'quests'), {
        authorId: user.id,
        author: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          powerLevel: user.powerLevel,
          auraColor: '#FF6B35' // Default
        },
        content: content,
        mediaAttachment: null, // Placeholder for future media logic
        animeReference: null, // Placeholder
        likes: 0,
        reposts: 0,
        replies: 0,
        isHotTake: false,
        parentId: null,
        createdAt: serverTimestamp()
      });
      setContent('');
    } catch (error) {
      console.error("Error creating quest", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pt-4 pb-20 px-4 md:px-6">
      <div className="sticky top-0 z-30 bg-[#0D0D14]/80 backdrop-blur-xl border-b border-white/10 -mx-6 px-6 py-4 flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Home</h1>
        <div className="flex gap-4 text-sm font-medium text-[#A0A0B0]">
          <button className="text-white relative after:content-[''] after:absolute after:-bottom-5 after:left-0 after:w-full after:h-1 after:bg-[#FF6B35] after:rounded-t-full">
            For You
          </button>
          <button className="hover:text-white transition-colors">Following</button>
        </div>
      </div>

      {/* Composer */}
      <div className="mb-8 flex gap-4 p-4 border-b border-white/10 pb-6">
        <img 
          src={user?.avatarUrl || "https://ui-avatars.com/api/?name=Guest"} 
          alt="Me" 
          className="w-10 h-10 rounded-full object-cover" 
        />
        <div className="flex-1">
          <textarea 
            placeholder="What are you watching?" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-[#6B6B7B] resize-none h-20 text-lg"
          />
          <div className="flex justify-between items-center mt-2">
            <div className="flex gap-2 text-[#FF6B35]">
              <button className="p-2 hover:bg-[#FF6B35]/10 rounded-full transition-colors">
                <ImageIcon size={20} />
              </button>
              <button className="p-2 hover:bg-[#FF6B35]/10 rounded-full transition-colors">
                <Mic size={20} />
              </button>
            </div>
            <Button 
              className="!px-6 !py-2 !rounded-full !text-sm" 
              onClick={handlePost}
              disabled={submitting || !content.trim()}
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Post Quest'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quests (Posts) */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#FF6B35]" size={32} />
          </div>
        ) : error ? (
           <div className="text-center py-10 px-4 text-[#EF4444] bg-[#EF4444]/10 rounded-xl flex flex-col items-center gap-3">
              <AlertCircle size={32} />
              <p>{error}</p>
              <Button 
                variant="ghost" 
                className="!text-[#EF4444] !border-[#EF4444]/20 hover:!bg-[#EF4444]/20 !py-2 !h-auto !px-4 text-sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={14} className="mr-2" /> Retry
              </Button>
           </div>
        ) : quests.length > 0 ? (
          quests.map((quest) => (
            <PostCard key={quest.id} quest={quest} />
          ))
        ) : (
          <div className="text-center py-10">
             <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
               <ImageIcon className="text-[#A0A0B0]" size={32} />
             </div>
             <p className="text-white font-medium mb-1">No quests yet</p>
             <p className="text-[#A0A0B0] text-sm">Be the first to start a quest!</p>
          </div>
        )}
      </div>
    </div>
  );
};