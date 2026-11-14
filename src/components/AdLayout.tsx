import { ARTICLE_AD_SLOT, canShowArticleAd } from '../lib/ads';
import { AdSlot } from './AdSlot';

/** One labelled unit after the complete article, away from game controls. */
export function ArticleAd() {
  if (!ARTICLE_AD_SLOT || !canShowArticleAd(location.pathname, location.search, location.hash)) return null;
  return <aside aria-label="Advertisement" className="mt-12 border-t border-white/10 pt-8">
    <p className="mb-3 text-center font-mono text-xs text-white/60">ADVERTISEMENT</p>
    <AdSlot slot={ARTICLE_AD_SLOT} format="auto" />
  </aside>;
}
