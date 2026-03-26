import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/GlassCard';
import { TEAM, COLORS } from '../constants';
import { Heart, Globe, Zap } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6">
        
        {/* Mission */}
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-8"
          >
            Built by fans, for fans.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[#A0A0B0] leading-relaxed"
          >
            Anima was born from a simple frustration: discussion threads were scattered, 
            lists were boring, and watching anime felt like a solitary experience. 
            We set out to create a universe where your fandom has real value, 
            connecting you with your guild in a world that rewards your passion.
          </motion.p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            { icon: Heart, title: "Passion First", text: "We build features we want to use ourselves." },
            { icon: Globe, title: "Global Community", text: "Bridging the gap between fans worldwide." },
            { icon: Zap, title: "Innovation", text: "Pushing the boundaries of social interaction." }
          ].map((item, idx) => (
            <GlassCard key={idx} className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-6 text-[#FF6B35]">
                <item.icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-[#A0A0B0]">{item.text}</p>
            </GlassCard>
          ))}
        </div>

        {/* Team */}
        <div>
          <h2 className="text-3xl font-bold mb-12 text-center">Meet the Party</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TEAM.map((member, index) => (
              <GlassCard key={index} hoverEffect className="text-center group">
                <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden border-2 border-white/10 group-hover:border-[#FF6B35] transition-colors">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-[#FF6B35] text-sm font-medium mb-4">{member.role}</p>
              </GlassCard>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};