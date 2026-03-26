import React from 'react';
import { NavLink } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import { APP_NAV_LINKS } from '../constants';
import { useComposeStore } from '../store/useComposeStore';

export const MobileNav: React.FC = () => {
  const { open: openCompose } = useComposeStore();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0D0D14]/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center px-2 py-3">
        {APP_NAV_LINKS.map((link) => {
          const Icon = link.icon!;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => `
                flex flex-col items-center gap-1 p-2 rounded-lg transition-colors
                ${isActive ? 'text-[#FF6B35]' : 'text-[#A0A0B0]'}
              `}
            >
              <Icon size={24} />
            </NavLink>
          );
        })}
        <button
          onClick={() => openCompose()}
          className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-[#FF6B35]"
        >
          <PenSquare size={24} />
        </button>
      </div>
    </div>
  );
};