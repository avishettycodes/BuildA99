import type { ReactNode } from 'react';

function SideAd({ side }: { side: 'left' | 'right' }) {
  return (
    <aside
      id={`ad-slot-${side}`}
      data-ad-placement={`${side}-rail`}
      aria-label={`${side} advertisement area`}
      className="hidden min-[1440px]:block"
    >
      {/*
        Empty until an ad provider mounts into it. A dashed ADVERTISEMENT box with nothing
        in it made a finished page look like a wireframe, so the space is reserved but
        drawn as nothing.
      */}
      <div className="sticky top-28 h-[600px]" />
    </aside>
  );
}

/** Reserved desktop rails. An ad provider can mount into either stable ad-slot id later. */
export function AdLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-[1680px] grid-cols-1 gap-4 px-0 min-[1440px]:grid-cols-[120px_minmax(0,1fr)_120px] min-[1440px]:px-4 min-[1680px]:grid-cols-[160px_minmax(0,1fr)_160px]">
      <SideAd side="left" />
      <div className="min-w-0">{children}</div>
      <SideAd side="right" />
    </div>
  );
}
