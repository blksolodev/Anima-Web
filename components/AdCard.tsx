import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: object[];
  }
}

// Replace these with your actual AdSense Publisher ID and Slot IDs from
// https://adsense.google.com → Ads → By ad unit → Display ads
const PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX';
const FEED_SLOT_ID = 'XXXXXXXXXX'; // "Feed inline" ad unit slot ID

export const AdCard: React.FC = () => {
  const pushed = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invoke and hot-reload re-runs
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script hasn't loaded yet — safe to ignore
    }
  }, []);

  return (
    <div className="border-b border-white/10 px-4 py-3 overflow-hidden">
      <span className="text-[10px] text-[#6B6B7B] border border-white/10 rounded px-1 py-0.5 mb-2 inline-block leading-none">
        Sponsored
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={FEED_SLOT_ID}
        data-ad-format="fluid"
        data-ad-layout="in-article"
        data-full-width-responsive="true"
      />
    </div>
  );
};
