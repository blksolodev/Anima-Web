import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Users, PlayCircle, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { GlassCard } from '../components/GlassCard';
import { FEATURES, COLORS, STATS } from '../constants';

export const Home: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Decorative Circles */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#FF6B35] opacity-[0.08] blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-[#4ECDC4] opacity-[0.06] blur-[120px]" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <span className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-[#FF6B35] backdrop-blur-md">
                v2.0 is now live on iOS & Android
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
              Your anime <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                social universe
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#A0A0B0] max-w-2xl mx-auto mb-10 leading-relaxed">
              Join guilds, track your watchlist, and connect with fellow anime fans in an 
              immersive RPG-inspired social network.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/download">
                <Button variant="primary" icon={<ChevronRight size={20} />}>
                  Download App
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating UI Elements (Mock) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute top-1/2 left-10 hidden lg:block"
          >
             <GlassCard className="w-64 !p-4 transform -rotate-6">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
                    <Star size={18} className="text-white fill-current" />
                 </div>
                 <div>
                   <p className="text-sm font-bold">New Achievement</p>
                   <p className="text-xs text-gray-400">Level 5 Otaku Reached</p>
                 </div>
               </div>
             </GlassCard>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="absolute bottom-20 right-10 hidden lg:block"
          >
             <GlassCard className="w-64 !p-4 transform rotate-3">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-red-500 flex items-center justify-center">
                    <Zap size={18} className="text-white fill-current" />
                 </div>
                 <div>
                   <p className="text-sm font-bold">Arena Victory</p>
                   <p className="text-xs text-gray-400">+150 Reputation Earned</p>
                 </div>
               </div>
             </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-[#6B6B7B] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Level up your fandom</h2>
            <p className="text-[#A0A0B0] max-w-xl mx-auto">
              More than just a tracking list. Anima gamifies your watching experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((feature, index) => (
              <GlassCard 
                key={feature.id}
                hoverEffect
                className="group"
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="p-3 rounded-xl bg-white/5 text-[#FF6B35] group-hover:text-white group-hover:bg-[#FF6B35] transition-colors"
                  >
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-[#A0A0B0] leading-relaxed mb-4">
                      {feature.description}
                    </p>
                  </div>
                </div>
                {/* Mock UI snippet inside card */}
                <div className="mt-4 rounded-xl overflow-hidden h-48 w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D14] to-transparent z-10" />
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <GlassCard className="text-center py-16 px-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FF8A50] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to start your journey?</h2>
              <p className="text-[#A0A0B0] mb-8 max-w-lg mx-auto">
                Join thousands of anime fans who have already found their guild. 
                Available for free on iOS and Android.
              </p>
              <Link to="/download">
                <Button variant="primary">
                  Download Now
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>
    </>
  );
};