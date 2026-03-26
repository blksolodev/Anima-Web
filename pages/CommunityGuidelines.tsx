import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, MessageSquare, EyeOff, Ban, Flag } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const Section: React.FC<{ title: string; children: React.ReactNode; index: number }> = ({ title, children, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
    className="mb-12 pb-12 border-b border-white/5 last:border-0 last:mb-0 last:pb-0"
  >
    <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
    <div className="text-[#A0A0B0] leading-relaxed space-y-3">{children}</div>
  </motion.div>
);

const Bullets: React.FC<{ items: string[]; accent?: string }> = ({ items, accent = '#FF6B35' }) => (
  <ul className="space-y-2 mt-3">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0" style={{ backgroundColor: accent }} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const principles = [
  { icon: Heart, title: "Be Respectful", desc: "Treat every fan the way you'd want to be treated. Disagreements are fine — disrespect isn't." },
  { icon: MessageSquare, title: "Discuss Freely", desc: "Share your opinions, hot takes, and reactions. Healthy debate makes the community stronger." },
  { icon: EyeOff, title: "Mark Spoilers", desc: "Use the spoiler tag. Not everyone watches at the same pace — protect their experience." },
  { icon: ShieldCheck, title: "Stay Safe", desc: "Don't share personal information about yourself or others without consent." },
  { icon: Flag, title: "Report Issues", desc: "If you see something that breaks these guidelines, use the report button — don't engage." },
  { icon: Ban, title: "No Hate Here", desc: "Discrimination, hate speech, and harassment have no place in this community." },
];

export const CommunityGuidelines: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <span className="text-xs font-mono text-[#4ECDC4] uppercase tracking-widest mb-3 block">Community</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Community Guidelines</h1>
          <p className="text-[#A0A0B0] text-lg max-w-xl">
            Anima exists because anime fans deserve a better place to connect.
            These guidelines protect that space for everyone.
          </p>
          <p className="text-[#6B6B7B] text-sm mt-4">Last updated: January 1, 2025</p>
        </motion.div>

        {/* Core principles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {principles.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassCard className="h-full">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-[#FF6B35]/10 text-[#FF6B35] flex-shrink-0">
                    <p.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{p.title}</h3>
                    <p className="text-[#A0A0B0] text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-12">

          <Section title="1. Respectful Interaction" index={0}>
            <p>
              Anima brings together fans with different tastes, opinions, and backgrounds. We expect all
              members to engage with each other respectfully. This means:
            </p>
            <Bullets items={[
              "Criticize ideas, not people",
              "Avoid personal attacks, name-calling, and insults",
              "Acknowledge that others may have different interpretations — that's what makes discussion interesting",
              "Don't deliberately try to provoke or derail conversations",
            ]} />
          </Section>

          <Section title="2. Spoilers" index={1}>
            <p>
              One of the most important rules on Anima. Spoilers ruin experiences — always use the
              spoiler tag when discussing content that hasn't aired globally or when discussing plot
              points beyond the current episode in live discussion threads.
            </p>
            <Bullets items={[
              "Tag all spoilers in posts and replies",
              "In episode discussion threads, only discuss up to that episode",
              "In profile posts, assume not everyone is caught up",
              "Manga readers: tag anything beyond the anime adaptation",
            ]} />
          </Section>

          <Section title="3. Prohibited Content" index={2}>
            <p>The following content is not allowed on Anima under any circumstances:</p>
            <Bullets items={[
              "Hate speech targeting race, ethnicity, religion, gender, sexuality, disability, or nationality",
              "Harassment, stalking, or targeted abuse of any user",
              "Sexual content involving minors — zero tolerance, immediate permanent ban",
              "Doxxing — sharing private personal information about others without consent",
              "Threats of violence, self-harm encouragement, or content glorifying real-world violence",
              "Misinformation presented as fact with the intent to deceive",
            ]} accent="#EF4444" />
          </Section>

          <Section title="4. Spam & Self-Promotion" index={3}>
            <p>Keep the feed clean and relevant:</p>
            <Bullets items={[
              "Don't post the same content multiple times across threads",
              "Don't use Anima to advertise unrelated products or services",
              "External links are allowed but must be relevant and disclosed if affiliated",
              "Bots and automated posting require explicit permission from the Anima team",
            ]} />
          </Section>

          <Section title="5. Mature & Sensitive Content" index={4}>
            <p>
              Anime covers a wide spectrum of themes. When posting mature or sensitive content,
              always use the 18+ tag available in the compose toolbar. Content that sexualizes minors
              will result in an immediate permanent ban and may be reported to authorities.
            </p>
          </Section>

          <Section title="6. Discussion Threads" index={5}>
            <p>Episode and live discussion threads have specific expectations:</p>
            <Bullets items={[
              "Stay on-topic for the episode or thread subject",
              "Be mindful of time zones — not everyone watches the moment it airs",
              "Keep live discussions lively but civil — healthy debate is encouraged",
              "Don't brigade or coordinate attacks on specific users or shows",
            ]} />
          </Section>

          <Section title="7. Reporting & Enforcement" index={6}>
            <p>
              If you see content that breaks these guidelines, use the in-app report button. Don't
              engage or escalate — let the moderation team handle it.
            </p>
            <p>Enforcement actions may include:</p>
            <Bullets items={[
              "Content removal — individual posts or replies taken down",
              "Warning — a notice that your behavior violates the guidelines",
              "Temporary suspension — account access restricted for a set period",
              "Permanent ban — for severe or repeated violations",
            ]} accent="#F59E0B" />
            <p className="mt-3">
              You may appeal moderation decisions by emailing{' '}
              <span className="text-[#FF6B35]">moderation@animaapp.co</span>.
            </p>
          </Section>

          <Section title="8. Contact" index={7}>
            <p>Questions or concerns about the community? Reach us at:</p>
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-white font-medium">Anima Moderation Team</p>
              <p><span className="text-[#FF6B35]">moderation@animaapp.co</span></p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
};
