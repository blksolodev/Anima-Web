import React from 'react';
import { motion } from 'framer-motion';

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

const Bullets: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-2 mt-3">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] mt-[7px] flex-shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export const TermsOfService: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <span className="text-xs font-mono text-[#4ECDC4] uppercase tracking-widest mb-3 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-[#A0A0B0] text-lg max-w-xl">
            By using Anima, you agree to these terms. We've written them to be
            straightforward — no legalese walls, no hidden clauses.
          </p>
          <p className="text-[#6B6B7B] text-sm mt-4">Last updated: January 1, 2025</p>
        </motion.div>

        <div className="border-t border-white/10 pt-12">

          <Section title="1. Acceptance of Terms" index={0}>
            <p>
              By creating an account or using Anima (the "Service"), you agree to be bound by these Terms of Service.
              If you don't agree, please don't use the Service. These terms apply to all users, including visitors,
              registered users, and contributors.
            </p>
          </Section>

          <Section title="2. Eligibility" index={1}>
            <p>You must be at least 13 years old to use Anima. By using the Service, you confirm that:</p>
            <Bullets items={[
              "You are at least 13 years of age",
              "You have the legal capacity to enter into a binding agreement",
              "Your use does not violate any applicable laws or regulations",
            ]} />
          </Section>

          <Section title="3. Your Account" index={2}>
            <p>You are responsible for maintaining the security of your account. This includes:</p>
            <Bullets items={[
              "Keeping your password confidential and not sharing it with others",
              "All activity that occurs under your account",
              "Immediately notifying us of any unauthorized use",
              "Ensuring the information you provide is accurate and up to date",
            ]} />
            <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </Section>

          <Section title="4. User Content" index={3}>
            <p>
              You retain ownership of the content you post on Anima. By posting content, you grant Anima
              a non-exclusive, royalty-free, worldwide license to display, distribute, and promote that
              content within the platform.
            </p>
            <p>You agree not to post content that:</p>
            <Bullets items={[
              "Is illegal, harmful, threatening, abusive, or defamatory",
              "Infringes on the intellectual property rights of others",
              "Contains malware, spam, or unauthorized commercial solicitation",
              "Violates anyone's privacy or impersonates another person",
              "Sexualizes minors in any way",
            ]} />
          </Section>

          <Section title="5. Prohibited Conduct" index={4}>
            <p>When using Anima, you agree not to:</p>
            <Bullets items={[
              "Attempt to gain unauthorized access to any part of the platform",
              "Scrape, crawl, or extract data without explicit written permission",
              "Use the Service to harass, stalk, or threaten other users",
              "Create multiple accounts to evade a suspension or ban",
              "Interfere with or disrupt the integrity of the platform or its servers",
              "Use automated bots or scripts without prior approval",
            ]} />
          </Section>

          <Section title="6. Intellectual Property" index={5}>
            <p>
              All trademarks, logos, and proprietary content on Anima (excluding user-generated content)
              are the property of Anima Inc. You may not use, reproduce, or distribute our intellectual
              property without our express written permission.
            </p>
          </Section>

          <Section title="7. Termination" index={6}>
            <p>
              You may delete your account at any time via your account settings. We may suspend or terminate
              your access at our discretion if you violate these terms, engage in abusive behavior, or
              if required by law. Upon termination, your right to use the Service ceases immediately.
            </p>
          </Section>

          <Section title="8. Disclaimers & Limitation of Liability" index={7}>
            <p>
              Anima is provided "as is" without warranties of any kind. We do not guarantee uninterrupted
              access or that the Service will be error-free. To the maximum extent permitted by law, Anima
              Inc. shall not be liable for indirect, incidental, or consequential damages arising from your
              use of the Service.
            </p>
          </Section>

          <Section title="9. Changes to These Terms" index={8}>
            <p>
              We may update these terms periodically. When we make significant changes, we'll notify you
              via email or in-app notification at least 14 days before the new terms take effect.
              Continued use of the Service after that date means you accept the updated terms.
            </p>
          </Section>

          <Section title="10. Governing Law" index={9}>
            <p>
              These terms are governed by the laws of the State of Delaware, United States, without
              regard to conflict of law principles. Any disputes shall be resolved in the courts of
              Delaware, unless applicable law requires otherwise.
            </p>
          </Section>

          <Section title="11. Contact" index={10}>
            <p>Questions about these terms? Reach out to us at:</p>
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-white font-medium">Anima Inc.</p>
              <p><span className="text-[#FF6B35]">legal@animaapp.co</span></p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
};
