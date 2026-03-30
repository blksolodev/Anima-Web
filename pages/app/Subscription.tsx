import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Check, Star, Palette, Shield, Sparkles, ChevronRight, Crown, Ban } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { PlusBadge } from '../../components/PlusBadge';
import { useAuthStore } from '../../store/useAuthStore';

const PERKS = [
  { icon: Ban, label: 'Ad-free experience', description: 'Browse your feed without any sponsored posts or interruptions.' },
  { icon: Crown, label: 'Exclusive profile badges', description: 'Stand out with limited-edition badges only Plus members can wear.' },
  { icon: Palette, label: 'Custom aura colors', description: 'Personalize your aura ring with any color from the full spectrum.' },
  { icon: Star, label: 'Custom avatar frames', description: 'Choose from Fire, Neon, Sakura, and more animated frames.' },
  { icon: Sparkles, label: 'Early access', description: 'Try new features before they launch to everyone else.' },
  { icon: Shield, label: 'Priority support', description: 'Your reports and issues get reviewed first.' },
];

const FREE_FEATURES = [
  'Social feed',
  'Anime library & tracking',
  'Episode discussions',
  'Live rooms',
  'Discover',
  'Messaging',
];

const PLUS_FEATURES = [
  'Everything in Free',
  'Ad-free experience',
  'Exclusive profile badges',
  'Custom aura colors',
  'Custom avatar frames',
  'Early access to features',
  'Priority support',
];

export const Subscription: React.FC = () => {
  const { user } = useAuthStore();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const monthlyPrice = 4.99;
  const annualPrice = 39.99;
  const annualMonthly = (annualPrice / 12).toFixed(2);
  const savings = Math.round((1 - annualPrice / (monthlyPrice * 12)) * 100);

  const handleCheckout = () => {
    // Stripe checkout — wire up with your price IDs when ready
    // For now, open Stripe test checkout or show coming soon
    alert('Stripe checkout coming soon. Add your VITE_STRIPE_PUBLISHABLE_KEY and price IDs to enable payments.');
  };

  if (user?.isPlus) {
    return (
      <div className="w-full max-w-2xl mx-auto pb-20 px-4 pt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Current plan banner */}
          <GlassCard className="relative overflow-hidden mb-8 border-[#FF6B35]/30">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/10 to-transparent pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}>
                  <Zap size={28} fill="white" className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white">Anima Plus</h2>
                    <PlusBadge />
                  </div>
                  <p className="text-[#A0A0B0] text-sm">
                    {user.plusExpiry
                      ? `Active · Renews ${new Date(user.plusExpiry).toLocaleDateString()}`
                      : 'Active subscription'}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#A0A0B0]" />
            </div>
          </GlassCard>

          {/* Perks */}
          <h3 className="text-sm font-bold text-[#A0A0B0] uppercase tracking-wider mb-4">Your perks</h3>
          <div className="space-y-3">
            {PERKS.map((perk) => {
              const Icon = perk.icon;
              return (
                <GlassCard key={perk.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{perk.label}</p>
                    <p className="text-[#A0A0B0] text-xs mt-0.5">{perk.description}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-8 pb-6 text-center"
      >
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}>
          <Zap size={32} fill="white" className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Anima Plus</h1>
        <p className="text-[#A0A0B0] max-w-xs mx-auto text-sm leading-relaxed">
          Support the platform and stand out with exclusive perks that show off your status in the community.
        </p>
      </motion.div>

      {/* Billing toggle */}
      <div className="flex justify-center mb-6 px-4">
        <div className="inline-flex items-center bg-white/5 border border-white/10 rounded-full p-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billing === 'monthly'
                ? 'bg-white text-[#0D0D14]'
                : 'text-[#A0A0B0] hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              billing === 'annual'
                ? 'bg-white text-[#0D0D14]'
                : 'text-[#A0A0B0] hover:text-white'
            }`}
          >
            Annual
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)', color: '#fff' }}>
              -{savings}%
            </span>
          </button>
        </div>
      </div>

      {/* Price + CTA */}
      <motion.div
        key={billing}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="px-4 mb-8"
      >
        <GlassCard className="relative overflow-hidden border-[#FF6B35]/30 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/8 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="mb-4">
              {billing === 'monthly' ? (
                <div>
                  <span className="text-4xl font-bold text-white">${monthlyPrice}</span>
                  <span className="text-[#A0A0B0] ml-1">/month</span>
                </div>
              ) : (
                <div>
                  <span className="text-4xl font-bold text-white">${annualMonthly}</span>
                  <span className="text-[#A0A0B0] ml-1">/month</span>
                  <p className="text-sm text-[#FF6B35] mt-1">Billed as ${annualPrice}/year</p>
                </div>
              )}
            </div>
            <Button className="w-full" onClick={handleCheckout}>
              <Zap size={18} fill="currentColor" />
              Get Anima Plus
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Comparison */}
      <div className="px-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          {/* Free */}
          <GlassCard className="py-6">
            <h3 className="text-white font-bold text-base mb-1">Free</h3>
            <p className="text-[#FF6B35] font-bold text-lg mb-4">$0</p>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-[#A0A0B0]">
                  <Check size={13} className="text-[#4ECDC4] flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Plus */}
          <GlassCard className="py-6 relative overflow-hidden border-[#FF6B35]/30">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/8 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-white font-bold text-base">Plus</h3>
                <PlusBadge size="sm" />
              </div>
              <p className="text-[#FF6B35] font-bold text-lg mb-4">
                {billing === 'monthly' ? `$${monthlyPrice}/mo` : `$${annualMonthly}/mo`}
              </p>
              <ul className="space-y-2">
                {PLUS_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[#A0A0B0]">
                    <Check size={13} className="text-[#FF6B35] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Perks detail */}
      <div className="px-4">
        <h3 className="text-sm font-bold text-[#A0A0B0] uppercase tracking-wider mb-4">What you get</h3>
        <div className="space-y-3">
          {PERKS.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <motion.div
                key={perk.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{perk.label}</p>
                    <p className="text-[#A0A0B0] text-xs mt-0.5">{perk.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
