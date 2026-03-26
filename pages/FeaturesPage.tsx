import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { FEATURES, COLORS } from '../constants';
import { Play } from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">System Features</h1>
          <p className="text-[#A0A0B0] max-w-2xl mx-auto text-lg">
            Explore the tools and mechanics that make Anima the ultimate social RPG for anime fans.
          </p>
        </motion.div>

        <div className="space-y-32">
          {FEATURES.map((feature, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div 
                key={feature.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
              >
                {/* Text Content */}
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-[#4ECDC4]">
                    FEATURE_0{index + 1}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                    {feature.title}
                  </h2>
                  <p className="text-[#A0A0B0] text-lg leading-relaxed">
                    {feature.description}
                  </p>
                  <p className="text-[#6B6B7B]">
                    Detailed description goes here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Enhance your anime experience with social layers designed for engagement.
                  </p>
                  
                  <ul className="space-y-3 mt-4">
                    {[1, 2, 3].map((i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-[#A0A0B0]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                        Sub-feature benefit or mechanic explanation {i}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Content */}
                <div className="flex-1 w-full max-w-md lg:max-w-full">
                  <GlassCard className="relative aspect-[4/3] flex items-center justify-center p-0 !overflow-hidden group">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D14] via-transparent to-transparent opacity-90" />
                    
                    {/* Floating UI Mockup */}
                    <div className="relative z-10 w-3/4 p-4 bg-[#1A1A2E]/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transform group-hover:-translate-y-2 transition-transform duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <div className="h-2 w-24 bg-white/10 rounded-full" />
                      </div>
                      <div className="h-24 bg-white/5 rounded-xl mb-3 flex items-center justify-center">
                        <Play className="text-white/20 fill-current" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-white/10 rounded-full" />
                        <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};