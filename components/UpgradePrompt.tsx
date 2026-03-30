import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './Button';

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ open, onClose, feature }) => {
  const navigate = useNavigate();

  const featureLabels: Record<string, string> = {
    custom_frames: 'Custom avatar frames',
    exclusive_badges: 'Exclusive profile badges',
    aura_colors: 'Custom aura colors',
    early_access: 'Early access to new features',
    priority_support: 'Priority support',
  };

  const label = feature ? featureLabels[feature] ?? feature : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-auto"
          >
            <div className="bg-[#13131F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Gradient accent */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #FF6B35, #FFB347)' }} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}>
                    <Zap size={24} fill="white" className="text-white" />
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-white/5 text-[#A0A0B0] hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Anima Plus</h2>
                {label ? (
                  <p className="text-[#A0A0B0] text-sm mb-5">
                    <span className="text-white font-medium">{label}</span> is an Anima Plus exclusive.
                    Upgrade to unlock this and more.
                  </p>
                ) : (
                  <p className="text-[#A0A0B0] text-sm mb-5">
                    This feature is exclusive to Anima Plus members. Upgrade to unlock the full experience.
                  </p>
                )}

                <ul className="space-y-2 mb-6">
                  {[
                    'Ad-free experience',
                    'Exclusive profile badges',
                    'Custom aura colors',
                    'Custom avatar frames',
                    'Early access to features',
                    'Priority support',
                  ].map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-[#A0A0B0]">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#FF6B35' }} />
                      {perk}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full"
                    onClick={() => { onClose(); navigate('/subscription'); }}
                  >
                    <Zap size={16} fill="currentColor" />
                    Get Anima Plus
                  </Button>
                  <button
                    onClick={onClose}
                    className="w-full py-2 text-sm text-[#A0A0B0] hover:text-white transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
