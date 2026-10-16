import type { ReactNode } from 'react';
import { AD_SLOTS } from '../lib/ads';
import { AdSlot } from './AdSlot';

function SideAd({ side }: { side: 'left' | 'right' }) {
  return (
    <aside
      id={`ad-slot-${side}`}
      data-ad-placement={`${side}-rail`}
      aria-label="Advertisement"
      className="hidden min-[1440px]:block"
    >
      {/*
        A real AdSense unit when VITE_ADSENSE_SLOT_RAIL is set. Without one the column
        stays reserved but empty: a dashed ADVERTISEMENT box with nothing in it made a
        finished page look like a wireframe.
      */}
      <div className="sticky top-28">
        <AdSlot slot={AD_SLOTS.rail} style={{ width: '100%', height: 600 }} />
      </div>
    </aside>
  );
}

/** Desktop ad rails either side of the game. */
export function AdLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-[105rem] grid-cols-1 gap-4 px-0 min-[1440px]:grid-cols-[160px_minmax(0,1fr)_160px] min-[1440px]:px-4">
      <SideAd side="left" />
      <div className="min-w-0">{children}</div>
      <SideAd side="right" />
    </div>
  );
}

/**
 * The one ad a phone sees, under the game rather than inside it. Rails are desktop
 * only, and an ad wedged between the spin button and the pool is an ad somebody taps by
 * accident, which AdSense counts against the site.
 */
export function InlineAd() {
  if (!AD_SLOTS.inline) return null;
  return (
    <div className="mx-auto mt-8 max-w-2xl px-4 min-[1440px]:hidden" aria-label="Advertisement">
      <div className="mb-1 text-center font-mono text-[10px] tracking-[0.2em] text-white/30">ADVERTISEMENT</div>
      <AdSlot slot={AD_SLOTS.inline} format="auto" />
    </div>
  );
}
