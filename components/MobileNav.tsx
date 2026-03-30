import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import { APP_NAV_LINKS } from '../constants';
import { useComposeStore } from '../store/useComposeStore';
import { useAuthStore } from '../store/useAuthStore';
import { subscribeNotifications } from '../services/notification.service';

export const MobileNav: React.FC = () => {
  const { open: openCompose } = useComposeStore();
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotifications(user.id, (notifs) => {
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });
    return () => unsub();
  }, [user?.id]);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0D0D14] border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center px-1 pt-2 pb-1">
        {APP_NAV_LINKS.map((link) => {
          const Icon = link.icon!;
          const isNotifications = link.name === 'Notifications';
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[44px] min-h-[44px] justify-center
                ${isActive ? 'text-[#FF6B35]' : 'text-[#6B6B7B]'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={24} strokeWidth={isActive ? 2.2 : 1.8} />
                    {isNotifications && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#FF6B35] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-[#FF6B35]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Compose */}
        <button
          onClick={() => openCompose()}
          className="flex flex-col items-center justify-center px-3 py-2 min-w-[44px] min-h-[44px] rounded-xl transition-colors text-[#6B6B7B] active:scale-95"
        >
          <PenSquare size={24} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};
