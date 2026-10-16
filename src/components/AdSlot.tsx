import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT } from '../lib/ads';

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

/**
 * One AdSense unit. It asks for an ad once, when it mounts, which is what AdSense
 * expects from a page that never reloads. With no unit id it renders nothing, so an
 * unconfigured build never shows an empty box.
 */
export function AdSlot({ slot, className, style, format }: {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
}) {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    if (!slot || !ref.current || ref.current.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // A blocked or missing ad script must never take the game down with it.
    }
  }, [slot]);
  if (!slot) return null;
  return (
    <ins
      ref={ref}
      className={`adsbygoogle ${className ?? ''}`}
      style={{ display: 'block', ...style }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      {...(format ? { 'data-ad-format': format, 'data-full-width-responsive': 'true' } : {})}
    />
  );
}
