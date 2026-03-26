import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { ChevronLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { user, register, loginGoogle, error, clearError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setLocalError('You must accept the Terms of Service.'); return; }
    if (username.length < 3) { setLocalError('Username must be at least 3 characters.'); return; }
    setLocalError('');
    clearError();
    setLoading(true);
    try {
      await register(email, password, username);
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!agreed) { setLocalError('You must accept the Terms of Service.'); return; }
    setLocalError('');
    clearError();
    setGoogleLoading(true);
    try {
      await loginGoogle();
    } catch (err: any) {
      if (err.message) setLocalError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
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

          {/* Google Sign-Up */}
          <button
            onClick={handleGoogleRegister}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 mb-6"
          >
            {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[#6B6B7B] text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {localError && (
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
                {localError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="otaku_king"
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF6B35] transition-colors"
                required
                minLength={3}
                maxLength={20}
              />
              <p className="text-[#6B6B7B] text-xs mt-1">Letters, numbers, underscores only</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A0A0B0] mb-2">Email</label>
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-3 pr-11 text-white focus:outline-none focus:border-[#FF6B35] transition-colors"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0B0] hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-[#A0A0B0] cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 rounded border-white/20 bg-white/5 text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <span>
                I agree to the{' '}
                <a href="#" className="text-[#FF6B35] hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#FF6B35] hover:underline">Privacy Policy</a>
              </span>
            </label>

            <Button className="w-full !rounded-xl" type="submit" disabled={loading || googleLoading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
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
