import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import {
  MessagesSquare, Tv, Search, Bell, Radio, Users,
  ChevronRight, Zap, BookOpen, Shield,
} from 'lucide-react';

const highlights = [
  {
    icon: Radio,
    title: 'Live Discussions',
    desc: 'Start or join real-time discussion rooms the moment an episode drops. React, theorize, and experience the episode together.',
    accent: '#FF6B35',
    tag: 'Fan favorite',
    image: '/socialfeed.png',
  },
  {
    icon: MessagesSquare,
    title: 'Episode Threads',
    desc: 'Every episode gets its own spoiler-safe discussion thread. Dive into post-episode breakdowns without ruining anything for others.',
    accent: '#4ECDC4',
    tag: 'Core feature',
    image: '/socialfeed.png',
  },
  {
    icon: Tv,
    title: 'Anime Library',
    desc: 'Track everything you\'re watching, have watched, or plan to watch. Rate shows, log episodes, and see your stats grow.',
    accent: '#FF6B35',
    tag: 'Tracker',
    image: '/library.png',
  },
  {
    icon: Users,
    title: 'Social Feed',
    desc: 'Post reactions, share opinions, and see what the community is talking about. A timeline built entirely for anime fans.',
    accent: '#4ECDC4',
    tag: 'Social',
    image: '/socialfeed.png',
  },
  {
    icon: Search,
    title: 'Discover',
    desc: 'Find new shows through community picks, trending titles, and genre-based browsing — all surfaced by real fans.',
    accent: '#FF6B35',
    tag: 'Discovery',
    image: '/explore.png',
  },
  {
    icon: Bell,
    title: 'Notifications',
    desc: 'Get notified when someone replies to your discussion, reacts to your post, or starts a live discussion thread you care about.',
    accent: '#4ECDC4',
    tag: 'Alerts',
    image: null,
  },
];

const comparisonRows = [
  { feature: 'Anime tracking', anima: true, mal: true, anilist: true },
  { feature: 'Episode discussions', anima: true, mal: false, anilist: false },
  { feature: 'Live discussion rooms', anima: true, mal: false, anilist: false },
  { feature: 'Social feed', anima: true, mal: false, anilist: false },
  { feature: 'Spoiler-safe threads', anima: true, mal: false, anilist: false },
  { feature: 'Free on all platforms', anima: true, mal: true, anilist: true },
];

const Check = () => <span className="text-[#00D26A] font-bold text-lg">✓</span>;
const Cross = () => <span className="text-[#6B6B7B] font-bold text-lg">–</span>;

export const FeaturesPage: React.FC = () => {
  return (
    <div className="overflow-hidden">

      {/* Hero */}
      <section className="relative pt-36 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#FF6B35] opacity-[0.05] blur-[120px] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="text-xs font-mono text-[#4ECDC4] uppercase tracking-widest mb-4 block">
              What's inside
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Built for the moments<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#FF8A50]">
                right after an episode ends.
              </span>
            </h1>
            <p className="text-[#A0A0B0] max-w-2xl mx-auto text-lg leading-relaxed">
              Anima is a social platform built around the anime experience —
              from tracking your list to dissecting the latest episode with thousands of fans in real time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="pb-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.07 }}
              >
                <GlassCard hoverEffect className="h-full group">
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${f.accent}15`, color: f.accent }}
                    >
                      <f.icon size={22} />
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                      style={{ color: f.accent, borderColor: `${f.accent}30`, backgroundColor: `${f.accent}10` }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3">{f.title}</h3>
                  <p className="text-[#A0A0B0] leading-relaxed text-sm">{f.desc}</p>
                  {f.image && (
                    <div className="mt-5 flex justify-center">
                      <img
                        src={f.image}
                        alt={f.title}
                        className="w-[65%] rounded-2xl object-contain group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deep dive — Discussions */}
      <section className="py-24 border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <span className="text-xs font-mono text-[#FF6B35] uppercase tracking-widest mb-4 block">Discussions</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-snug">
                The conversation starts when the episode ends.
              </h2>
              <p className="text-[#A0A0B0] text-lg leading-relaxed mb-8">
                Anima's discussion system is built around the anime airing schedule. Each episode gets
                its own thread — tied to a specific show, season, and episode number — so conversations
                stay organized and spoiler-safe.
              </p>
              <div className="space-y-4">
                {[
                  { icon: MessagesSquare, text: 'Episode threads auto-organize by show and episode number' },
                  { icon: Radio, text: 'Live rooms let you watch alongside the community in real time' },
                  { icon: Shield, text: 'Spoiler tags protect fans who aren\'t caught up yet' },
                  { icon: Zap, text: 'Posts link directly to discussions so context is never lost' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] flex-shrink-0">
                      <item.icon size={17} />
                    </div>
                    <p className="text-[#A0A0B0] leading-relaxed pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <GlassCard className="space-y-3">
                {[
                  { label: 'Episode Discussion', show: 'Solo Leveling · S2E8', count: '1.2K posts', live: false },
                  { label: 'Live Discussion', show: 'Frieren · S1E16 — Airing now', count: '320 active', live: true },
                  { label: 'Episode Discussion', show: 'Dandadan · S1E10', count: '845 posts', live: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.live ? 'bg-[#00D26A] shadow-[0_0_8px_#00D26A]' : 'bg-[#FF6B35]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#6B6B7B] uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-white text-sm font-medium truncate">{item.show}</p>
                    </div>
                    <span className="text-xs text-[#A0A0B0] flex-shrink-0">{item.count}</span>
                  </div>
                ))}
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How Anima compares</h2>
            <p className="text-[#A0A0B0] max-w-lg mx-auto">
              Tracking apps are great. Anima adds the social layer they're missing.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <GlassCard className="!p-0 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-4 border-b border-white/10 px-6 py-4">
                <div className="col-span-1" />
                <div className="text-center">
                  <p className="text-[#FF6B35] font-bold text-sm">Anima</p>
                </div>
                <div className="text-center">
                  <p className="text-[#A0A0B0] text-sm">MAL</p>
                </div>
                <div className="text-center">
                  <p className="text-[#A0A0B0] text-sm">AniList</p>
                </div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-4 px-6 py-4 ${i < comparisonRows.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <p className="col-span-1 text-[#A0A0B0] text-sm">{row.feature}</p>
                  <div className="text-center">{row.anima ? <Check /> : <Cross />}</div>
                  <div className="text-center">{row.mal ? <Check /> : <Cross />}</div>
                  <div className="text-center">{row.anilist ? <Check /> : <Cross />}</div>
                </div>
              ))}
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to try it?
            </h2>
            <p className="text-[#A0A0B0] max-w-md mx-auto mb-8">
              Free on iOS, Android, and the web. No credit card, no premium tier.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/download">
                <Button icon={<ChevronRight size={18} />}>Download Anima</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost">Open Web App</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};
