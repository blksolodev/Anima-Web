import React from 'react';
import { Zap } from 'lucide-react';

interface PlusBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PlusBadge: React.FC<PlusBadgeProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { icon: 10, text: 'text-[9px]', px: 'px-1.5 py-0.5', gap: 'gap-0.5' },
    md: { icon: 12, text: 'text-[10px]', px: 'px-2 py-0.5', gap: 'gap-1' },
    lg: { icon: 14, text: 'text-xs', px: 'px-2.5 py-1', gap: 'gap-1' },
  };
  const s = sizes[size];

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.px} rounded-full font-bold ${s.text} ${className}`}
      style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)', color: '#fff' }}
    >
      <Zap size={s.icon} fill="currentColor" />
      PLUS
    </span>
  );
};
