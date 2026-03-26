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

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <span className="text-xs font-mono text-[#4ECDC4] uppercase tracking-widest mb-3 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-[#A0A0B0] text-lg max-w-xl">
            We built Anima to connect anime fans, not to harvest your data.
            Here's exactly what we collect, why, and how it's protected.
          </p>
          <p className="text-[#6B6B7B] text-sm mt-4">Last updated: January 1, 2025</p>
        </motion.div>

        <div className="border-t border-white/10 pt-12">

          <Section title="1. Information We Collect" index={0}>
            <p>We only collect what's necessary to run the platform and improve your experience.</p>
            <Bullets items={[
              "Account info — email address, username, display name, profile photo",
              "Content you create — posts, replies, reactions, anime library entries",
              "Usage data — pages visited, features used, session length",
              "Device data — browser type, operating system, IP address",
              "Authentication data — login method (email or Google OAuth)",
            ]} />
          </Section>

          <Section title="2. How We Use Your Information" index={1}>
            <p>Your data is used to run Anima, not to profit from it.</p>
            <Bullets items={[
              "Authenticate your account and keep it secure",
              "Show you a relevant feed and personalized recommendations",
              "Enable discussions, replies, and community features",
              "Send important service notifications (not marketing spam)",
              "Detect and prevent abuse, fraud, and unauthorized access",
              "Understand how users interact with the app to improve it",
            ]} />
          </Section>

          <Section title="3. Data Sharing" index={2}>
            <p>We do not sell your personal data — ever. Sharing is limited to:</p>
            <Bullets items={[
              "Infrastructure providers (Firebase/Google) who host and process data on our behalf",
              "Legal authorities when required by law or valid legal process",
              "Successor entities in the event of a merger or acquisition (you'll be notified)",
            ]} />
            <p className="mt-3">All third-party providers are contractually bound to handle your data with the same level of care we apply.</p>
          </Section>

          <Section title="4. Data Retention" index={3}>
            <p>
              We retain your data for as long as your account is active. If you delete your account, your
              personal data is removed within 30 days. Some anonymized usage data may be retained longer for
              analytics. Certain records may be kept for legal compliance as required.
            </p>
          </Section>

          <Section title="5. Security" index={4}>
            <p>
              All data in transit is encrypted via HTTPS. Your password is never stored in plain text.
              We use Firebase Authentication, which is SOC 2 and ISO 27001 certified. We conduct regular
              security reviews and act promptly on any reported vulnerabilities.
            </p>
            <p>
              No system is completely immune. We strongly encourage using a strong, unique password and
              enabling any available second-factor authentication.
            </p>
          </Section>

          <Section title="6. Your Rights" index={5}>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <Bullets items={[
              "Access — request a copy of the data we hold about you",
              "Correction — update inaccurate or incomplete information",
              "Deletion — permanently remove your account and associated data",
              "Portability — receive your data in a structured, machine-readable format",
              "Objection — object to certain types of processing, such as profiling",
            ]} />
            <p className="mt-3">To exercise any of these rights, email us at <span className="text-[#FF6B35]">privacy@animaapp.co</span>.</p>
          </Section>

          <Section title="7. Cookies" index={6}>
            <p>
              We use session cookies to keep you logged in and functional cookies to remember preferences.
              We do not use third-party advertising cookies or cross-site tracking. You can manage cookie
              preferences through your browser settings.
            </p>
          </Section>

          <Section title="8. Children's Privacy" index={7}>
            <p>
              Anima is intended for users aged 13 and older. We do not knowingly collect data from children
              under 13. If you believe a child has created an account, contact us at{' '}
              <span className="text-[#FF6B35]">privacy@animaapp.co</span> and we will remove the data promptly.
            </p>
          </Section>

          <Section title="9. Changes to This Policy" index={8}>
            <p>
              If we make material changes to this policy, we'll notify you via email or an in-app notice
              at least 14 days before the changes take effect. Continued use of Anima after that date
              constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact" index={9}>
            <p>Questions about this policy or your data? Reach us at:</p>
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <p className="text-white font-medium">Anima Inc.</p>
              <p><span className="text-[#FF6B35]">privacy@animaapp.co</span></p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
};
