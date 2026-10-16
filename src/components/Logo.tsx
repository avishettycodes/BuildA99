import { useId } from 'react';

/*
  THE MARK. A gold football with the end stripes of a game ball and a 99 on it, tilted
  like it is in flight. Drawn as paths rather than set in a font so it looks the same in
  a browser tab, a share card and the header, and it borrows nothing from any league or
  team: no shield, no star, no crest.

  The 99 is Anton converted to outlines, the same face as every headline on the site.
*/
const BALL = 'M3 36C16 0 104 0 117 36C104 72 16 72 3 36Z';
const NINETY_NINE = 'M48.74 55.24L48.74 55.24Q46.36 55.24 44.29 54.41Q42.23 53.59 40.96 51.93Q39.70 50.28 39.70 47.83L39.70 47.83L39.70 43.75L46.98 43.75L46.98 44.52Q46.98 45.47 47.08 46.41Q47.17 47.36 47.57 47.98Q47.97 48.60 48.87 48.60L48.87 48.60Q50.14 48.60 50.63 47.90Q51.13 47.21 51.13 45.90L51.13 45.90L51.13 38.31Q50.59 39.30 49.51 39.92Q48.44 40.55 46.89 40.55L46.89 40.55Q43.78 40.55 42.08 39.29Q40.38 38.03 39.74 35.54Q39.09 33.05 39.09 29.31L39.09 29.31Q39.09 25.53 40.02 22.70Q40.94 19.88 43.10 18.31Q45.26 16.74 48.96 16.74L48.96 16.74Q52.91 16.74 55.12 18.08Q57.33 19.43 58.25 22.12Q59.16 24.82 59.16 28.88L59.16 28.88L59.16 39.11Q59.16 43.04 58.83 46.05Q58.49 49.05 57.44 51.10Q56.39 53.14 54.31 54.19Q52.22 55.24 48.74 55.24ZM49.13 33.86L49.13 33.86Q51.13 33.86 51.13 31.18L51.13 31.18L51.13 26.50Q51.13 23.70 49.23 23.70L49.23 23.70Q47.90 23.70 47.64 24.83Q47.39 25.96 47.39 27.72L47.39 27.72L47.39 30.77Q47.39 33.86 49.13 33.86ZM70.48 55.24L70.48 55.24Q68.10 55.24 66.04 54.41Q63.97 53.59 62.71 51.93Q61.44 50.28 61.44 47.83L61.44 47.83L61.44 43.75L68.72 43.75L68.72 44.52Q68.72 45.47 68.82 46.41Q68.91 47.36 69.31 47.98Q69.71 48.60 70.61 48.60L70.61 48.60Q71.88 48.60 72.37 47.90Q72.87 47.21 72.87 45.90L72.87 45.90L72.87 38.31Q72.33 39.30 71.26 39.92Q70.18 40.55 68.64 40.55L68.64 40.55Q65.52 40.55 63.82 39.29Q62.13 38.03 61.48 35.54Q60.84 33.05 60.84 29.31L60.84 29.31Q60.84 25.53 61.76 22.70Q62.68 19.88 64.84 18.31Q67.00 16.74 70.70 16.74L70.70 16.74Q74.65 16.74 76.86 18.08Q79.08 19.43 79.99 22.12Q80.90 24.82 80.90 28.88L80.90 28.88L80.90 39.11Q80.90 43.04 80.57 46.05Q80.24 49.05 79.18 51.10Q78.13 53.14 76.05 54.19Q73.96 55.24 70.48 55.24ZM70.87 33.86L70.87 33.86Q72.87 33.86 72.87 31.18L72.87 31.18L72.87 26.50Q72.87 23.70 70.98 23.70L70.98 23.70Q69.64 23.70 69.39 24.83Q69.13 25.96 69.13 27.72L69.13 27.72L69.13 30.77Q69.13 33.86 70.87 33.86Z';
const STRIPES = 'M17 0h5.5c-4 12-4 60 0 72H17c-4-12-4-60 0-72ZM103 0h-5.5c4 12 4 60 0 72H103c4-12 4-60 0-72Z';

export function BallMark({ className, title }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 120 72" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe45c" />
          <stop offset=".55" stopColor="#ffd400" />
          <stop offset="1" stopColor="#f0ac00" />
        </linearGradient>
        <clipPath id={`${id}c`}><path d={BALL} /></clipPath>
      </defs>
      <g transform="rotate(-12 60 36)">
        <path d={BALL} fill={`url(#${id}g)`} />
        <path d={STRIPES} fill="#0b1013" clipPath={`url(#${id}c)`} />
        <path d={NINETY_NINE} fill="#0b1013" />
        <path d={BALL} fill="none" stroke="#0b1013" strokeOpacity=".35" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/** The full lockup: BUILD A, then the ball standing in for the 99. */
export function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display leading-none uppercase ${size === 'sm' ? 'text-lg' : 'text-[22px] sm:text-[27px]'}`}>
      <span className="pt-0.5">Build a</span>
      <span className="sr-only">99</span>
      <BallMark className={`${size === 'sm' ? 'h-7' : 'h-9 sm:h-11'} w-auto drop-shadow-[0_6px_14px_rgba(255,212,0,0.35)]`} />
    </span>
  );
}
