/** Public publisher identity; never load advertising on game or utility screens. */
export const ADSENSE_CLIENT = 'ca-pub-1226733358806955';
export const ARTICLE_AD_SLOT = import.meta.env?.VITE_ADSENSE_SLOT_INLINE?.trim() || '';
export const AD_ARTICLES = new Set(['build-strategy', 'ratings-and-scoring']);

export function canShowArticleAd(pathname: string, search: string, hash: string): boolean {
  const page = pathname.replace(/^\/+|\/+$/g, '');
  return AD_ARTICLES.has(page) && !hash && !new URLSearchParams(search).has('debug');
}

/** One document-level script. The meta tag and ads.txt handle site verification. */
export function loadAdSense() {
  if (document.querySelector('script[data-article-ads]')) return;
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.dataset.articleAds = 'true';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
}
