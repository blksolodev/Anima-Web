import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Loader2, Tv } from 'lucide-react';
import { LibraryEntry } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';

const TABS = [
  { label: 'All', value: 'All' },
  { label: 'Watching', value: 'WATCHING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Plan to Watch', value: 'PLANNING' },
  { label: 'Dropped', value: 'DROPPED' },
];

export const Library: React.FC = () => {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Query 'anime_library' where odcuserId matches
    const q = query(collection(db, 'anime_library'), where('odcuserId', '==', user.id));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const libData = snapshot.docs.map(doc => {
        return doc.data() as LibraryEntry;
      });

      // Sort client-side by updated at
      libData.sort((a, b) => {
        const timeA = a.updatedAt?.seconds || 0;
        const timeB = b.updatedAt?.seconds || 0;
        return timeB - timeA;
      });

      setEntries(libData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredEntries = filter === 'All' 
    ? entries 
    : entries.filter(e => e.status === filter);

  return (
    <div className="w-full max-w-5xl mx-auto pt-6 pb-20 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold">Your Library</h1>
        </div>
        <div className="flex gap-2 bg-[#1A1A2E] p-1 rounded-lg overflow-x-auto max-w-full">
           {TABS.map((tab) => (
             <button 
                key={tab.value} 
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${filter === tab.value ? 'bg-[#FF6B35] text-white' : 'text-[#A0A0B0] hover:text-white'}`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#FF6B35]" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Link to="/discover" className="aspect-[2/3] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition-all group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#FF6B35] group-hover:text-white transition-colors">
              <Plus size={24} />
            </div>
            <span className="font-medium text-[#A0A0B0] group-hover:text-white">Add Anime</span>
          </Link>

          {filteredEntries.map((entry) => (
            <div key={entry.animeId} className="group relative">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-3 relative bg-[#1A1A2E]">
                {entry.anime ? (
                    <img 
                    src={entry.anime.coverImage.large} 
                    alt={entry.anime.title.english || entry.anime.title.romaji} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A1A2E] text-[#A0A0B0] p-4 text-center">
                        <Tv size={24} className="mb-2" />
                        <span className="text-xs">Data unavailable</span>
                    </div>
                )}
                
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs font-bold text-[#FF6B35]">
                  {entry.score ? entry.score : '-'}
                </div>
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full font-bold text-sm border border-white/20 hover:bg-[#FF6B35] hover:border-[#FF6B35] transition-all">
                     Update
                   </button>
                </div>
              </div>
              <h3 className="font-bold truncate pr-2 group-hover:text-[#FF6B35] transition-colors">{entry.anime?.title.english || entry.anime?.title.romaji || 'Unknown'}</h3>
              <p className="text-sm text-[#A0A0B0]">{entry.progress} / {entry.anime?.episodes || '?'} EPS</p>
              <div className="w-full bg-white/10 h-1 rounded-full mt-2 overflow-hidden">
                 <div 
                    className="bg-[#FF6B35] h-full rounded-full" 
                    style={{ width: `${(entry.progress || 0) / (entry.anime?.episodes || 1) * 100}%` }} 
                 />
              </div>
            </div>
          ))}
          
          {filteredEntries.length === 0 && (
             <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center py-10 text-[#A0A0B0]">
               <p>No anime found in this category.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};