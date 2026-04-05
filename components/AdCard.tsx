import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: object[];
  }
}

// Replace these with your actual AdSense Publisher ID and Slot IDs from
// https://adsense.google.com → Ads → By ad unit → Display ads
const PUBLISHER_ID = 'ca-pub-8858368631096924';
const FEED_SLOT_ID = '3589536075';

export const AdCard: React.FC = () => {
  const pushed = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  const [filled, setFilled] = useState(true);

  useEffect(() => {
    // Guard against React StrictMode double-invoke and hot-reload re-runs
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script hasn't loaded yet — safe to ignore
    }

    // Watch for AdSense setting data-ad-status on the <ins> element
    const el = insRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      if (el.getAttribute('data-ad-status') === 'unfilled') {
        setFilled(false);
      }
    });
    observer.observe(el, { attributes: true, attributeFilter: ['data-ad-status'] });

    return () => observer.disconnect();
  }, []);

  if (!filled) return null;

  return (
    <div className="border-b border-white/10 px-4 py-3 overflow-hidden">
      <span className="text-[10px] text-[#6B6B7B] border border-white/10 rounded px-1 py-0.5 mb-2 inline-block leading-none">
        Sponsored
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={FEED_SLOT_ID}
        data-ad-format="fluid"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
        data-full-width-responsive="true"
      />
    </div>
  );
};
