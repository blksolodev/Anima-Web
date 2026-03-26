import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "", 
  hoverEffect = false,
  ...props 
}) => {
  return (
    <motion.div
      className={`
        relative overflow-hidden
        bg-white/5 
        backdrop-blur-[20px] 
        border border-white/10 
        rounded-3xl 
        p-6 
        shadow-[0_0_40px_rgba(0,0,0,0.3)]
        ${className}
      `}
      whileHover={hoverEffect ? { 
        y: -5, 
        boxShadow: "0 0 40px rgba(255, 107, 53, 0.2)",
        borderColor: "rgba(255, 107, 53, 0.3)" 
      } : {}}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Internal subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};