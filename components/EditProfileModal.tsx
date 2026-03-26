import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { updateUserProfile } from '../services/user.service';
import { uploadPostMedia } from '../services/media.service';
import { Button } from './Button';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when user updates (Firestore live listener)
  React.useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName ?? '');
    setBio(user.bio ?? '');
    setAvatarUrl(user.avatarUrl ?? '');
    setBannerUrl(user.bannerUrl ?? '');
  }, [isOpen]); // reset on open

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadPostMedia(user.id, file);
      setAvatarUrl(url);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingBanner(true);
    try {
      const url = await uploadPostMedia(user.id, file);
      setBannerUrl(url);
    } catch (err) {
      console.error('Banner upload failed:', err);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateUserProfile(user.id, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl || null,
        bannerUrl: bannerUrl || null,
      });
      // useAuthStore has onSnapshot listener on Firestore user doc — auto-updates
      onClose();
    } catch (err) {
      console.error('Profile save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold">Edit Profile</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto max-h-[65vh]">
              {/* Banner */}
              <div>
                <label className="text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider mb-2 block">
                  Banner Image
                </label>
                <div
                  className="relative h-32 bg-gradient-to-br from-[#FF6B35]/20 to-[#4ECDC4]/20 rounded-xl overflow-hidden cursor-pointer group"
                  onClick={() => bannerInputRef.current?.click()}
                >
                  {bannerUrl && (
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    {uploadingBanner ? (
                      <Loader2 className="animate-spin text-white" size={24} />
                    ) : (
                      <Camera className="text-white" size={24} />
                    )}
                  </div>
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
              </div>

              {/* Avatar */}
              <div>
                <label className="text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider mb-2 block">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group border-2 border-white/10"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <img
                      src={
                        avatarUrl ||
                        `https://ui-avatars.com/api/?name=${user?.username ?? 'U'}&background=random&color=fff&size=80`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      {uploadingAvatar ? (
                        <Loader2 className="animate-spin text-white" size={18} />
                      ) : (
                        <Camera className="text-white" size={18} />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#A0A0B0]">Click the circle to upload a new photo</p>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider mb-2 block">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-[#0D0D14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
                />
                <p className="text-xs text-[#6B6B7B] text-right mt-1">{displayName.length}/50</p>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-semibold text-[#A0A0B0] uppercase tracking-wider mb-2 block">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="Tell people about yourself..."
                  className="w-full bg-[#0D0D14] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#6B6B7B] focus:outline-none focus:border-[#FF6B35] transition-colors resize-none text-sm"
                />
                <p className="text-xs text-[#6B6B7B] text-right mt-1">{bio.length}/200</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="!py-2.5 !px-5 !text-sm !rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !displayName.trim()}
                className="!py-2.5 !px-5 !text-sm !rounded-xl"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
