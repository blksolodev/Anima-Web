import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, PenSquare, Menu, X, Search, Bell, Mail, Library, User, LogOut, UserPlus } from 'lucide-react';
import { APP_NAV_LINKS } from '../constants';
import { useComposeStore } from '../store/useComposeStore';
import { useAuthStore } from '../store/useAuthStore';
import { subscribeNotifications } from '../services/notification.service';
import { AnimatePresence, motion } from 'framer-motion';

export const MobileNav: React.FC = () => {
  const { open: openCompose } = useComposeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeNotifications(user.id, (notifs) => {
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });
    return () => unsub();
  }, [user?.id]);

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Bottom bar — Home, Compose, Hamburger */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0D0D14]/95 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
        <div className="flex justify-around items-center px-6 pt-3 pb-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[44px] min-h-[44px] transition-colors ${isActive ? 'text-[#FF6B35]' : 'text-[#6B6B7B]'}`
            }
          >
            <Home size={24} strokeWidth={1.8} />
          </NavLink>

          <button
            onClick={() => openCompose()}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FF6B35] hover:bg-[#FF8A50] text-white transition-colors active:scale-95 shadow-lg"
          >
            <PenSquare size={20} />
          </button>

          <button
            onClick={() => setDrawerOpen(true)}
            className="relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] text-[#6B6B7B] transition-colors"
          >
            <Menu size={24} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[8px] h-2 w-2 bg-[#FF6B35] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Drawer overlay + sheet */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-[60]"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-[70] bg-[#0D0D14] rounded-t-2xl border-t border-white/10 pb-safe"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Close button */}
              <div className="flex justify-end px-4 pb-2">
                <button onClick={() => setDrawerOpen(false)} className="p-2 text-[#6B6B7B]">
                  <X size={20} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="px-4 pb-2">
                {APP_NAV_LINKS.map((link) => {
                  const Icon = link.icon!;
                  const isNotifications = link.name === 'Notifications';
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${
                          isActive ? 'bg-white/10 text-white' : 'text-[#A0A0B0]'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="relative">
                            <Icon size={22} className={isActive ? 'text-[#FF6B35]' : ''} />
                            {isNotifications && unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-[#FF6B35] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </div>
                          <span className="font-medium">{link.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Divider + user/auth section */}
              <div className="border-t border-white/10 mx-4 mt-2 pt-4 pb-6 px-4">
                {user ? (
                  <div className="flex items-center justify-between">
                    <NavLink
                      to="/profile"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{user.displayName}</p>
                        <p className="text-xs text-[#A0A0B0] truncate">@{user.username}</p>
                      </div>
                    </NavLink>
                    <button onClick={handleLogout} className="p-2 text-[#EF4444] flex-shrink-0">
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => { setDrawerOpen(false); navigate('/register'); }}
                      className="w-full py-3 rounded-xl bg-[#FF6B35] hover:bg-[#FF8A50] text-white font-bold text-sm transition-colors"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => { setDrawerOpen(false); navigate('/login'); }}
                      className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <User size={16} /> Sign In
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
