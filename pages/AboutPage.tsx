import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import { TEAM } from '../constants';
import { Heart, Globe, Zap, ArrowRight, MessageSquare, Tv } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Community first',
    text: 'Every feature is designed to bring fans closer together — not to optimize for engagement metrics.',
  },
  {
    icon: Globe,
    title: 'Open to everyone',
    text: 'Anime fans exist everywhere. Anima is free, accessible, and built for the global community.',
  },
  {
    icon: Zap,
    title: 'Fast and intentional',
    text: 'We ship features that solve real problems. No bloat, no gamification for its own sake.',
  },
];

const timeline = [
  { year: '2023', event: 'Started as a personal project — a simple watchlist with a comments section.' },
  { year: '2024', event: 'Rebuilt from scratch with live discussions and a real social feed after the community outgrew the first version.' },
  { year: '2025', event: 'Launched v2.0 across iOS, Android, and web. Episode discussions, live rooms, and full social features.' },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="overflow-hidden">

      {/* Hero */}
      <section className="relative pt-36 pb-24">
        <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full bg-[#4ECDC4] opacity-[0.04] blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="text-xs font-mono text-[#4ECDC4] uppercase tracking-widest mb-4 block">Our story</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Built by fans,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8A50]">
                  for that 15-minute window.
                </span>
              </h1>
              <p className="text-xl text-[#A0A0B0] leading-relaxed max-w-2xl">
                You know the feeling — an episode ends, something insane just happened, and you have
                nowhere to go. Reddit is a mess, Discord servers are too scattered, and your group chat
                is full of people who haven't watched yet. Anima was built to fix that.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <span className="text-xs font-mono text-[#FF6B35] uppercase tracking-widest mb-4 block">Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-snug">
                Give every episode its own moment.
              </h2>
              <p className="text-[#A0A0B0] text-lg leading-relaxed mb-6">
                Watching anime is a shared experience that's weirdly been treated as a solo one.
                We're changing that. Every show, every episode, every season — deserves a place where
                fans can react, discuss, and share the moment it happens.
              </p>
              <p className="text-[#A0A0B0] text-lg leading-relaxed">
                We're not trying to build the next big social network. We're building the best possible
                home for anime fans — and keeping it focused on that.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full space-y-4"
            >
              <GlassCard className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] flex-shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Episode-first discussions</h3>
                  <p className="text-[#A0A0B0] text-sm leading-relaxed">
                    Every thread is tied to a specific episode. No spoilers, no confusion about what arc people are on.
                  </p>
                </div>
              </GlassCard>
              <GlassCard className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#4ECDC4]/10 flex items-center justify-center text-[#4ECDC4] flex-shrink-0">
                  <Tv size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Track without friction</h3>
                  <p className="text-[#A0A0B0] text-sm leading-relaxed">
                    Your library doesn't need to be a spreadsheet. Add, rate, and track in a few taps.
                  </p>
                </div>
              </GlassCard>
              <GlassCard className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] flex-shrink-0">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">A global fanbase, one platform</h3>
                  <p className="text-[#A0A0B0] text-sm leading-relaxed">
                    Fans across time zones, watching schedules, and taste preferences — all in one place.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How we got here</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-6">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6"
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#FF6B35] font-bold text-xs">{item.year.slice(2)}</span>
                  </div>
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-white/5 mt-3" />}
                </div>
                <div className="pb-8">
                  <p className="text-[#FF6B35] font-bold text-sm mb-1">{item.year}</p>
                  <p className="text-[#A0A0B0] leading-relaxed">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What we believe in</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="text-center h-full py-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF6B35]/10 mx-auto flex items-center justify-center mb-6 text-[#FF6B35]">
                    <v.icon size={28} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">{v.title}</h3>
                  <p className="text-[#A0A0B0] text-sm leading-relaxed">{v.text}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Meet the team</h2>
            <p className="text-[#A0A0B0] max-w-md mx-auto">
              Small team, big backlog. We're fans first, builders second.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard hoverEffect className="text-center group">
                  <div className="w-20 h-20 rounded-full mx-auto mb-5 overflow-hidden border-2 border-white/10 group-hover:border-[#FF6B35]/50 transition-colors">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-white font-bold text-lg">{member.name}</h3>
                  <p className="text-[#FF6B35] text-sm font-medium mt-1">{member.role}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Come be part of it.
            </h2>
            <p className="text-[#A0A0B0] max-w-md mx-auto mb-8">
              Anima is still growing. The best features are being shaped by the community right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button icon={<ArrowRight size={18} />}>Join Anima</Button>
              </Link>
              <Link to="/features">
                <Button variant="ghost">See what's inside</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};
