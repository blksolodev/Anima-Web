import React from 'react';
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom';
import { APP_NAV_LINKS, COLORS } from '../constants';
import { LogOut, Settings, PenSquare, User as UserIcon } from 'lucide-react';
import { Button } from './Button';
import { useAuthStore } from '../store/useAuthStore';
import { useComposeStore } from '../store/useComposeStore';
import { useEffect, useState } from 'react';
import { subscribeNotifications } from '../services/notification.service';

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { open: openCompose } = useComposeStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotifications(user.id, (notifs) => {
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });
    return () => unsub();
  }, [user?.id]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/10 bg-[#0D0D14] z-50">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-1 group mb-8">
          <img src="/logo.png" alt="Anima Logo" className="h-8 w-auto" />
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
                <div className="relative">
                  <Icon size={24} className={isActive ? 'text-[#FF6B35]' : ''} />
                  {link.name === 'Notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <Button onClick={() => openCompose()} className="w-full mt-8 !rounded-xl" icon={<PenSquare size={18} />}>
          Post
        </Button>
      </div>

      <div className="mt-auto p-6 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/profile" className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
            <img
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
              alt={user.username}
              className="w-10 h-10 rounded-full border border-white/10 object-cover flex-shrink-0"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user.displayName}</p>
              <p className="text-xs text-[#A0A0B0] truncate">@{user.username}</p>
            </div>
          </Link>
          <Link to="/settings" className="p-2 rounded-xl hover:bg-white/5 transition-colors text-[#A0A0B0] hover:text-white flex-shrink-0">
            <Settings size={18} />
          </Link>
        </div>
        
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