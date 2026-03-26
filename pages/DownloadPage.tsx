import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { STATS } from '../constants';
import { Link } from 'react-router-dom';
import { Smartphone, Monitor, ChevronRight, Star, Download, Sparkles } from 'lucide-react';

const steps = [
  { n: '01', title: 'Create your account', desc: 'Sign up with email or Google in under a minute.' },
  { n: '02', title: 'Build your library', desc: 'Search any anime and add it to your watchlist instantly.' },
  { n: '03', title: 'Join the conversation', desc: 'Post reactions, join episode discussions, and find your people.' },
];

export const DownloadPage: React.FC = () => {
  return (
    <div className="overflow-hidden">

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-[#FF6B35] opacity-[0.07] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] rounded-full bg-[#4ECDC4] opacity-[0.05] blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">

            {/* Left */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="flex justify-center lg:justify-start mb-6">
                <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-[#FF6B35] backdrop-blur-md">
                  Available now — iOS, Android & Web
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
                Download Anima.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                  Your anime social hub.
                </span>
              </h1>
              <p className="text-xl text-[#A0A0B0] mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Track what you're watching, share your reactions,
                and connect with fans in real-time episode discussions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button className="w-full sm:w-auto">
                  <Smartphone size={18} />
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-xs opacity-70 mb-0.5">Download on the</span>
                    <span className="font-bold">App Store</span>
                  </span>
                </Button>
                <Button variant="ghost" className="w-full sm:w-auto">
                  <Smartphone size={18} />
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-xs opacity-70 mb-0.5">Get it on</span>
                    <span className="font-bold">Google Play</span>
                  </span>
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full sm:w-auto">
                    <Monitor size={18} />
                    <span className="flex flex-col items-start leading-none">
                      <span className="text-xs opacity-70 mb-0.5">Open in</span>
                      <span className="font-bold">Browser</span>
                    </span>
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10">
                {STATS.map((stat, i) => (
                  <div key={i}>
                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-xs text-[#6B6B7B] uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — platform cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex-1 w-full max-w-sm mx-auto lg:max-w-full"
            >
              <div className="space-y-4">
                {[
                  { platform: 'iOS', store: 'App Store', badge: '4.9 ★', sub: 'iPhone & iPad', icon: Smartphone },
                  { platform: 'Android', store: 'Google Play', badge: '4.8 ★', sub: 'All Android devices', icon: Smartphone },
                  { platform: 'Web App', store: 'No install needed', badge: 'Free', sub: 'Any modern browser', icon: Monitor },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <GlassCard hoverEffect className="flex items-center gap-5 !p-5">
                      <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] flex-shrink-0">
                        <item.icon size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold">{item.platform}</p>
                        <p className="text-[#A0A0B0] text-sm">{item.sub}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#FF6B35] font-bold text-sm">{item.badge}</p>
                        <p className="text-[#6B6B7B] text-xs">{item.store}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Up and running in minutes</h2>
            <p className="text-[#A0A0B0] max-w-xl mx-auto">
              No tutorials, no complicated setup. Anima is built to feel intuitive from the first tap.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="text-center h-full">
                  <div className="text-4xl font-bold text-white/10 mb-4 font-mono">{step.n}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-[#A0A0B0] text-sm leading-relaxed">{step.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Free tier */}
            <GlassCard className="flex flex-col justify-between py-10 px-8">
              <div>
                <h3 className="text-white font-bold text-xl mb-2">Free</h3>
                <p className="text-[#A0A0B0] text-sm leading-relaxed mb-6">
                  Everything you need to track anime, post reactions, and join episode discussions — at no cost.
                </p>
                <ul className="space-y-2 mb-8">
                  {['Social feed', 'Anime library', 'Episode & live discussions', 'Discover'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#A0A0B0]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button variant="ghost" className="w-full">
                <Download size={16} />
                Download
              </Button>
            </GlassCard>

            {/* Paid tier */}
            <GlassCard className="flex flex-col justify-between py-10 px-8 relative overflow-hidden border-[#FF6B35]/30">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/10 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-bold text-xl">Anima+</h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B35]/15 border border-[#FF6B35]/30 text-[#FF6B35] text-xs font-semibold">
                    <Sparkles size={12} />
                    Premium
                  </div>
                </div>
                <p className="text-[#A0A0B0] text-sm leading-relaxed mb-6">
                  Support the platform and stand out with exclusive perks that show off your status in the community.
                </p>
                <ul className="space-y-2 mb-8">
                  {['Exclusive profile badges', 'Custom aura colors', 'Early access to new features', 'Priority support', 'Everything in Free'].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#A0A0B0]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative z-10">
                <Button className="w-full">
                  <Sparkles size={16} />
                  Get Anima+
                </Button>
              </div>
            </GlassCard>

          </div>
        </div>
      </section>

    </div>
  );
};
