/**
 * Google AdSense. The publisher id is public (it is printed in every ad tag on the web),
 * so it lives here rather than in an environment variable.
 *
 * Ad unit ids come from AdSense > Ads > By ad unit. Until one is set the matching slot
 * renders nothing at all, and Auto ads (switched on in the AdSense dashboard, not here)
 * can still place ads on the page using the script in index.html.
 */
export const ADSENSE_CLIENT = 'ca-pub-1226733358806955';
export const AD_SLOTS = {
  rail: import.meta.env.VITE_ADSENSE_SLOT_RAIL?.trim() || '',
  inline: import.meta.env.VITE_ADSENSE_SLOT_INLINE?.trim() || '',
};
