import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthWallProps {
  title?: string;
  message?: string;
}

export const AuthWall: React.FC<AuthWallProps> = ({
  title = 'Sign in to continue',
  message = 'Create a free account to access this feature.',
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <img src="/logo.png" alt="Anima" className="h-12 w-auto mb-6 opacity-80" />
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-[#A0A0B0] text-sm mb-8 max-w-xs">{message}</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/register')}
          className="w-full py-3 rounded-2xl bg-[#FF6B35] hover:bg-[#FF8A50] text-white font-bold transition-colors"
        >
          Create Account
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
