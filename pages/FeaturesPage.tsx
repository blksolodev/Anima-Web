import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { FEATURES, COLORS } from '../constants';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Features</h1>
          <p className="text-[#A0A0B0] max-w-2xl mx-auto text-lg">
            Everything Anima offers to make your anime experience more social, more organized, and more fun.
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
                  <ul className="space-y-3 mt-4">
                    {[
                      "Built for fans who want real conversation, not just a list",
                      "Works across mobile and web — always in sync",
                      "Clean, fast, and ad-free"
                    ].map((point, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-[#A0A0B0]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual Content */}
                <div className="flex-1 w-full max-w-md lg:max-w-full">
                  <GlassCard className="p-0 !overflow-hidden group">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                    />
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