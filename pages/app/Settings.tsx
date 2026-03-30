import React, { useState, KeyboardEvent } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  Lock,
  Eye,
  User,
  ShieldOff,
  LogOut,
  ChevronRight,
  X,
  Plus,
  Loader2,
  Check,
  Zap,
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { PlusBadge } from '../../components/PlusBadge';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';

/* ── Shared primitives ────────────────────────────────── */

const Toggle: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200
      ${checked ? 'bg-[#FF6B35]' : 'bg-white/10'}
      ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    role="switch"
    aria-checked={checked}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
        ${checked ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
);

const SettingRow: React.FC<{
  label: string;
  description?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}> = ({ label, description, right, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between py-4 border-b border-white/5 last:border-none
      ${onClick ? 'cursor-pointer hover:bg-white/[0.03] -mx-5 px-5 transition-colors' : ''}`}
  >
    <div className="flex-1 mr-4">
      <p className="text-sm font-medium text-white">{label}</p>
      {description && <p className="text-xs text-[#A0A0B0] mt-0.5">{description}</p>}
    </div>
    {right}
  </div>
);

const SubPageHeader: React.FC<{ title: string }> = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-30 bg-[#0D0D14] sm:bg-[#0D0D14]/90 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center gap-4">
      <button
        onClick={() => navigate('/settings')}
        className="p-2 rounded-full hover:bg-white/5 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>
      <h1 className="text-lg font-bold">{title}</h1>
    </div>
  );
};

/* ── Settings Home ────────────────────────────────────── */

const SettingsHome: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout();
    navigate('/login');
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Account Info', description: 'Username, email, password', icon: User, path: '/settings/account' },
        { label: 'Notifications', description: 'What you get alerted about', icon: Bell, path: '/settings/notifications' },
        { label: 'Privacy & Safety', description: 'Account visibility and interactions', icon: Lock, path: '/settings/privacy' },
      ],
    },
    {
      title: 'App',
      items: [
        { label: 'Content Preferences', description: 'Spoilers, mature content, data saver', icon: Eye, path: '/settings/content' },
        { label: 'Blocked Users', description: "Manage accounts you've blocked", icon: ShieldOff, path: '/settings/blocked' },
      ],
    },
  ];

  const isPlusUser = user?.isPlus;

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0D0D14] sm:bg-[#0D0D14]/90 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <h1 className="text-lg font-bold">Settings</h1>
      </div>

      {/* User card */}
      {user && (
        <div
          className="flex items-center gap-4 px-4 py-5 border-b border-white/10 cursor-pointer hover:bg-white/[0.03] transition-colors"
          onClick={() => navigate('/profile')}
        >
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff&size=56`}
            alt={user.username}
            className="w-14 h-14 rounded-full object-cover border border-white/10"
          />
          <div className="flex-1">
            <p className="font-bold text-white">{user.displayName}</p>
            <p className="text-sm text-[#A0A0B0]">@{user.username}</p>
          </div>
          <ChevronRight size={18} className="text-[#A0A0B0]" />
        </div>
      )}

      {/* Anima Plus card */}
      <div className="px-4 pt-4 mb-2">
        <div
          onClick={() => navigate('/subscription')}
          className="relative overflow-hidden rounded-2xl border border-[#FF6B35]/30 cursor-pointer hover:border-[#FF6B35]/60 transition-colors"
          style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,179,71,0.06))' }}
        >
          <div className="flex items-center gap-4 p-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FFB347)' }}
            >
              <Zap size={22} fill="white" className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold text-white">Anima Plus</p>
                {isPlusUser && <PlusBadge size="sm" />}
              </div>
              <p className="text-xs text-[#A0A0B0]">
                {isPlusUser ? 'Manage your subscription' : 'Badges, frames, aura colors & more'}
              </p>
            </div>
            <ChevronRight size={16} className="text-[#FF6B35] flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 pt-2">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="text-xs font-bold text-[#A0A0B0] uppercase tracking-wider py-3">
              {section.title}
            </p>
            <GlassCard className="!p-0 overflow-hidden">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors
                      ${idx < section.items.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#A0A0B0]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-[#A0A0B0]">{item.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-[#6B6B7B]" />
                  </div>
                );
              })}
            </GlassCard>
          </div>
        ))}

        {/* Danger zone */}
        <div className="mb-6">
          <p className="text-xs font-bold text-[#EF4444] uppercase tracking-wider py-3">
            Danger Zone
          </p>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 hover:bg-[#EF4444]/15 transition-colors text-[#EF4444]"
          >
            {signingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Account Settings ─────────────────────────────────── */

const AccountSettings: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      <SubPageHeader title="Account Info" />
      <div className="px-4 pt-4 space-y-4">
        <GlassCard className="!p-5 space-y-0">
          <SettingRow
            label="Display Name"
            description={user?.displayName}
            right={<ChevronRight size={16} className="text-[#6B6B7B]" />}
            onClick={() => navigate('/profile')}
          />
          <SettingRow
            label="Username"
            description={`@${user?.username}`}
            right={<span className="text-xs text-[#A0A0B0]">Can't change</span>}
          />
          <SettingRow
            label="Email"
            description={user?.email || 'Not set'}
            right={<ChevronRight size={16} className="text-[#6B6B7B]" />}
          />
        </GlassCard>

        <GlassCard className="!p-5 space-y-0">
          <SettingRow
            label="Edit Profile"
            description="Photo, bio, display name"
            right={<ChevronRight size={16} className="text-[#6B6B7B]" />}
            onClick={() => navigate('/profile')}
          />
        </GlassCard>

        <GlassCard className="!p-5 space-y-0">
          <SettingRow
            label="Power Level"
            description={`LVL ${user?.powerLevel ?? 1}`}
            right={
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/20">
                {user?.xp ?? 0} XP
              </span>
            }
          />
        </GlassCard>

        <GlassCard className="!p-5 space-y-0">
          <SettingRow
            label="Delete Account"
            description="Permanently remove your account and data"
            right={<span className="text-xs text-[#EF4444]">Permanent</span>}
          />
        </GlassCard>
      </div>
    </div>
  );
};

/* ── Notification Settings ────────────────────────────── */

const NotificationSettings: React.FC = () => {
  const { notifications, setNotifPref } = useSettingsStore();

  const rows: { key: keyof typeof notifications; label: string; description: string }[] = [
    { key: 'likes',       label: 'Likes',         description: 'When someone likes your post' },
    { key: 'replies',     label: 'Replies',        description: 'When someone replies to your post' },
    { key: 'follows',     label: 'New Followers',  description: 'When someone follows you' },
    { key: 'mentions',    label: 'Mentions',       description: 'When someone @mentions you' },
    { key: 'newEpisodes', label: 'New Episodes',   description: 'Updates for anime you track' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      <SubPageHeader title="Notifications" />
      <div className="px-4 pt-4">
        <GlassCard className="!p-5 space-y-0">
          {rows.map((row) => (
            <SettingRow
              key={row.key}
              label={row.label}
              description={row.description}
              right={
                <Toggle
                  checked={notifications[row.key]}
                  onChange={(v) => setNotifPref(row.key, v)}
                />
              }
            />
          ))}
        </GlassCard>
      </div>
    </div>
  );
};

/* ── Privacy Settings ─────────────────────────────────── */

const PrivacySettings: React.FC = () => {
  const { privacy, setPrivacyPref } = useSettingsStore();

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      <SubPageHeader title="Privacy & Safety" />
      <div className="px-4 pt-4 space-y-4">
        <GlassCard className="!p-5 space-y-0">
          <SettingRow
            label="Private Account"
            description="Only approved followers can see your posts"
            right={
              <Toggle
                checked={privacy.privateAccount}
                onChange={(v) => setPrivacyPref('privateAccount', v)}
              />
            }
          />
        </GlassCard>

        <div>
          <p className="text-xs font-bold text-[#A0A0B0] uppercase tracking-wider mb-3">
            Who can reply to your posts
          </p>
          <GlassCard className="!p-5 space-y-0">
            {(['everyone', 'followers', 'none'] as const).map((opt) => (
              <SettingRow
                key={opt}
                label={opt === 'everyone' ? 'Everyone' : opt === 'followers' ? 'Followers only' : 'No one'}
                description={
                  opt === 'everyone'
                    ? 'Anyone can reply to your posts'
                    : opt === 'followers'
                      ? 'Only people you follow back can reply'
                      : 'Disable replies on all posts'
                }
                right={
                  privacy.whoCanReply === opt ? (
                    <Check size={18} className="text-[#FF6B35]" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-white/20" />
                  )
                }
                onClick={() => setPrivacyPref('whoCanReply', opt)}
              />
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

/* ── Content Preferences ──────────────────────────────── */

const ContentSettings: React.FC = () => {
  const { content, setContentPref, mutedWords, addMutedWord, removeMutedWord } = useSettingsStore();
  const [wordInput, setWordInput] = useState('');

  const handleAddWord = () => {
    const w = wordInput.trim();
    if (!w) return;
    addMutedWord(w);
    setWordInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAddWord();
  };

  const contentRows: { key: keyof typeof content; label: string; description: string }[] = [
    { key: 'matureContent',  label: 'Mature Content',   description: 'Show 18+ posts in your feed' },
    { key: 'showSpoilers',   label: 'Show Spoilers',    description: 'Reveal spoiler posts automatically' },
    { key: 'dataSaver',      label: 'Data Saver',       description: 'Load lower quality media' },
    { key: 'autoplayVideos', label: 'Autoplay Videos',  description: 'GIFs and clips play automatically' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      <SubPageHeader title="Content Preferences" />
      <div className="px-4 pt-4 space-y-6">
        {/* Toggles */}
        <GlassCard className="!p-5 space-y-0">
          {contentRows.map((row) => (
            <SettingRow
              key={row.key}
              label={row.label}
              description={row.description}
              right={
                <Toggle
                  checked={content[row.key]}
                  onChange={(v) => setContentPref(row.key, v)}
                />
              }
            />
          ))}
        </GlassCard>

        {/* Muted Words */}
        <div>
          <p className="text-xs font-bold text-[#A0A0B0] uppercase tracking-wider mb-3">
            Muted Words
          </p>
          <p className="text-xs text-[#6B6B7B] mb-3">
            Posts containing these words won't appear in your feed.
          </p>

          {/* Add word input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a word or phrase..."
              className="flex-1 bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#6B6B7B] focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
            <button
              onClick={handleAddWord}
              disabled={!wordInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FF6B35] hover:bg-[#FF8A50] disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          {mutedWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {mutedWords.map((word) => (
                  <motion.div
                    key={word}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-sm"
                  >
                    <span className="text-white/80">{word}</span>
                    <button
                      onClick={() => removeMutedWord(word)}
                      className="text-[#A0A0B0] hover:text-[#EF4444] transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <p className="text-sm text-[#6B6B7B] italic">No muted words yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Blocked Users ────────────────────────────────────── */

const BlockedUsers: React.FC = () => {
  const { blockedUserIds, removeBlockedUser } = useSettingsStore();

  return (
    <div className="w-full max-w-2xl mx-auto pb-20">
      <SubPageHeader title="Blocked Users" />
      <div className="px-4 pt-4">
        {blockedUserIds.length === 0 ? (
          <div className="text-center py-20 text-[#A0A0B0]">
            <ShieldOff size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold">No blocked users</p>
            <p className="text-sm mt-1 text-[#6B6B7B]">
              Accounts you block won't be able to interact with you.
            </p>
          </div>
        ) : (
          <GlassCard className="!p-0 overflow-hidden">
            <AnimatePresence>
              {blockedUserIds.map((id, idx) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center justify-between p-4
                    ${idx < blockedUserIds.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${id}&background=random&color=fff`}
                      alt="Blocked user"
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <p className="text-sm font-medium text-white/70 font-mono">{id}</p>
                      <p className="text-xs text-[#6B6B7B]">Blocked</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBlockedUser(id)}
                    className="px-3 py-1.5 rounded-full border border-white/20 text-xs font-medium hover:bg-white/5 transition-colors text-[#A0A0B0] hover:text-white"
                  >
                    Unblock
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

/* ── Root Settings Component ──────────────────────────── */

export const Settings: React.FC = () => {
  return (
    <Routes>
      <Route index element={<SettingsHome />} />
      <Route path="account" element={<AccountSettings />} />
      <Route path="notifications" element={<NotificationSettings />} />
      <Route path="privacy" element={<PrivacySettings />} />
      <Route path="content" element={<ContentSettings />} />
      <Route path="blocked" element={<BlockedUsers />} />
    </Routes>
  );
};
