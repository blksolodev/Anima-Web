import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { Smartphone, QrCode, ChevronRight, Star, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { FEATURES, STATS } from '../constants';
import { Link } from 'react-router-dom';

export const DownloadPage: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero / Download Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Decorative Circles */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#FF6B35] opacity-[0.08] blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-[#4ECDC4] opacity-[0.06] blur-[120px]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 text-center lg:text-left"
            >
               <div className="flex justify-center lg:justify-start mb-6">
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
              <p className="text-xl text-[#A0A0B0] mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Join guilds, track your watchlist, and connect with fellow anime fans in an 
                immersive RPG-inspired social network.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button className="w-full sm:w-auto">
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-xs opacity-70 mb-1">Download on the</span>
                    <span className="font-bold text-lg">App Store</span>
                  </span>
                </Button>
                <Button variant="ghost" className="w-full sm:w-auto">
                  <span className="flex flex-col items-start leading-none">
                    <span className="text-xs opacity-70 mb-1">Get it on</span>
                    <span className="font-bold text-lg">Google Play</span>
                  </span>
                </Button>
              </div>

               {/* Stats Row */}
              <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
                {STATS.map((stat, index) => (
                  <div key={index}>
                    <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                    <p className="text-xs text-[#6B6B7B] uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Visual (QR Code) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 flex justify-center relative"
            >
               {/* Floating Badges */}
               <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-4 z-20 hidden md:block"
              >
                 <GlassCard className="!p-3 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
                      <Star size={14} className="text-white fill-current" />
                   </div>
                   <div>
                     <p className="text-xs font-bold">New Achievement</p>
                     <p className="text-[10px] text-gray-400">Level 5 Otaku</p>
                   </div>
                 </GlassCard>
              </motion.div>

              <GlassCard className="p-8 md:p-12 text-center max-w-sm w-full relative z-10 bg-black/40">
                <div className="mb-8 relative">
                  <div className="absolute inset-0 bg-[#FF6B35] blur-[40px] opacity-20" />
                  <div className="relative bg-white p-4 rounded-xl">
                    {/* Mock QR Code */}
                     <div className="w-full aspect-square bg-gray-900 rounded flex items-center justify-center overflow-hidden">
                        <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full p-2">
                          {Array.from({ length: 36 }).map((_, i) => (
                             <div 
                                key={i} 
                                className={`bg-black rounded-sm ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`} 
                             />
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                           <QrCode size={48} className="text-white bg-black p-2 rounded-lg" />
                        </div>
                     </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">Scan to Download</h3>
                <p className="text-sm text-[#A0A0B0]">
                  Use your camera to instantly jump into the store.
                </p>
              </GlassCard>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-24 border-t border-white/5 bg-white/[0.02]">
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
              </GlassCard>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/features">
              <Button variant="ghost">View All Features</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};