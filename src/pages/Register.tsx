import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = userCredential.user;

      // Create User Document with Full Schema
      await setDoc(doc(db, 'users', authUser.uid), {
        id: authUser.uid,
        username: username.toLowerCase(),
        displayName: username,
        avatarUrl: `https://ui-avatars.com/api/?name=${username}&background=random`,
        bannerUrl: "https://picsum.photos/id/1018/1000/300",
        bio: "I am new here!",
        powerLevel: 1,
        xp: 0,
        joinedAt: serverTimestamp(),
        badges: [],
        pledgedCharacter: null,
        favoriteAnime: [],
        stats: {
          postsCount: 0,
          followersCount: 0,
          followingCount: 0,
          completedAnime: 0,
          watchingAnime: 0,
          totalEpisodesWatched: 0,
          critsGiven: 0,
          critsReceived: 0,
        },
        settings: {
          theme: 'default',
          notifications: {
            newEpisodes: true,
            mentions: true,
            replies: true,
            likes: true,
            reposts: true,
            guildActivity: true,
            recommendations: true,
          },
          privacy: {
            showWatchlist: true,
            showActivity: true,
            allowDMs: true,
          },
          spoilerProtection: true,
        }
      });

    } catch (err: any) {
      setError(err.message || 'Failed to register');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF6B35] opacity-[0.05] blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#4ECDC4] opacity-[0.05] blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/download" className="inline-flex items-center gap-2 text-[#A0A0B0] hover:text-white mb-8 transition-colors">
          <ChevronLeft size={20} /> Back to Home
        </Link>
        
        <GlassCard className="!p-8 md:!p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Join the Guild</h1>
            <p className="text-[#A0A0B0]">Start your journey today</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
             {error && <div className="p-3 rounded bg-[#EF4444]/20 text-[#EF4444] text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="otaku_king"
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF6B35] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shinji@nerv.org"
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF6B35] transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF6B35] transition-colors"
                required
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-[#A0A0B0]">
               <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-[#FF6B35] focus:ring-[#FF6B35]" required />
               <span>I accept the Terms of Service & Privacy Policy</span>
            </div>

            <Button className="w-full !rounded-xl" type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[#A0A0B0] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#FF6B35] font-bold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};