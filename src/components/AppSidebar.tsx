import React from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { APP_NAV_LINKS, COLORS } from '../constants';
import { LogOut, Settings, PenSquare, User as UserIcon } from 'lucide-react';
import { Button } from './Button';
import { useAuthStore } from '../store/useAuthStore';

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/10 bg-[#0D0D14] z-50">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-1 group mb-8">
          <span className="text-2xl font-bold tracking-tight text-white group-hover:text-white/90 transition-colors">
            anima
          </span>
          <span 
            className="w-2 h-2 rounded-full mt-2" 
            style={{ backgroundColor: COLORS.accentPrimary, boxShadow: `0 0 10px ${COLORS.accentPrimary}` }}
          />
        </Link>

        <nav className="flex flex-col gap-2">
          {APP_NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            const Icon = link.icon!;
            
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-[#A0A0B0] hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Icon size={24} className={isActive ? 'text-[#FF6B35]' : ''} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <Button className="w-full mt-8 !rounded-xl" icon={<PenSquare size={18} />}>
          Quest
        </Button>
      </div>

      <div className="mt-auto p-6 border-t border-white/10">
        <Link to="/profile" className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
          <img 
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
            alt={user.username} 
            className="w-10 h-10 rounded-full border border-white/10 object-cover" 
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate">{user.displayName}</p>
            <p className="text-xs text-[#A0A0B0] truncate">@{user.username}</p>
          </div>
          <Settings size={18} className="text-[#A0A0B0]" />
        </Link>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-2 text-[#EF4444] text-sm hover:text-[#EF4444]/80 transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};