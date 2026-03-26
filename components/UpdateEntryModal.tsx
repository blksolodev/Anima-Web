import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Star, Check } from 'lucide-react';
import { LibraryEntry } from '../types';
import { Button } from './Button';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';

interface UpdateEntryModalProps {
  entry: LibraryEntry;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { label: 'Watching', value: 'WATCHING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Plan to Watch', value: 'PLANNING' },
  { label: 'On Hold', value: 'PAUSED' },
  { label: 'Dropped', value: 'DROPPED' },
];

export const UpdateEntryModal: React.FC<UpdateEntryModalProps> = ({ entry, onClose }) => {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState(entry.progress || 0);
  const [score, setScore] = useState(entry.score || 0);
  const [status, setStatus] = useState(entry.status);
  const [updating, setUpdating] = useState(false);

  const totalEpisodes = entry.totalEpisodes || entry.anime?.episodes || 0;

  const handleUpdate = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      const docId = entry.docId || `${user.id}_${entry.animeId}`;
      const docRef = doc(db, 'anime_library', docId);

      // Prepare updates (support both minimal and legacy fields)
      const updates: any = {
        progress: progress,
        p: progress,
        score: score,
        sc: score,
        status: status,
        s: status,
        updatedAt: serverTimestamp(),
        u: serverTimestamp() // Phone app uses 'u' for updatedAt timestamp number, but serverTimestamp works
      };

      // Auto-complete logic
      if (totalEpisodes > 0 && progress >= totalEpisodes && status !== 'COMPLETED') {
         updates.status = 'COMPLETED';
         updates.s = 'COMPLETED';
         setStatus('COMPLETED');
      }

      await updateDoc(docRef, updates);
      onClose();
    } catch (error) {
      console.error("Failed to update entry:", error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-[#1A1A2E] rounded-2xl border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Update Progress</h3>
            <p className="text-[#A0A0B0] text-sm">{entry.anime?.title || 'Anime Title'}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-[#A0A0B0] mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    status === opt.value 
                      ? 'bg-[#FF6B35] text-white' 
                      : 'bg-white/5 text-[#A0A0B0] hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[#A0A0B0]">Episode Progress</label>
              <span className="text-white font-bold">
                {progress} <span className="text-[#6B6B7B]">/ {totalEpisodes || '?'}</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setProgress(Math.max(0, progress - 1))}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white"
              >
                <Minus size={18} />
              </button>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden relative">
                 <div 
                   className="absolute left-0 top-0 h-full bg-[#FF6B35] transition-all"
                   style={{ width: `${Math.min(100, (progress / (totalEpisodes || 24)) * 100)}%` }}
                 />
                 <input 
                   type="range" 
                   min="0" 
                   max={totalEpisodes || 24} 
                   value={progress}
                   onChange={(e) => setProgress(parseInt(e.target.value))}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
              </div>
              <button 
                onClick={() => setProgress(Math.min(totalEpisodes || 999, progress + 1))}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-[#A0A0B0]">Score</label>
              <span className="text-[#F4D03F] font-bold">{score > 0 ? score : '-'}</span>
            </div>
            <div className="flex justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setScore(num)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-all ${
                    score >= num 
                      ? 'bg-[#F4D03F] text-black scale-110' 
                      : 'bg-white/5 text-[#6B6B7B] hover:bg-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button 
            onClick={handleUpdate} 
            disabled={updating}
            className="w-full !rounded-xl !py-3"
          >
            {updating ? 'Updating...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
