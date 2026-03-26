import React from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = "", 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-200 text-sm md:text-base";
  
  // Linear gradient from #FF6B35 to #FF8A50
  const primaryStyles = `text-white shadow-lg shadow-[${COLORS.accentPrimary}]/20`;
  const ghostStyles = "bg-white/5 border border-white/10 text-[#A0A0B0] hover:text-white hover:bg-white/10";

  return (
    <motion.button
      className={`${baseStyles} ${variant === 'primary' ? '' : ghostStyles} ${className}`}
      style={variant === 'primary' ? { 
        background: `linear-gradient(90deg, ${COLORS.accentPrimary}, #FF8A50)` 
      } : {}}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
      {icon && <span className="ml-1">{icon}</span>}
    </motion.button>
  );
};