import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canShowArticleAd } from '../src/lib/ads';
import { pageContent } from '../src/lib/pageContent';

for (const page of ['build-strategy', 'ratings-and-scoring']) {
  assert(canShowArticleAd(`/${page}/`, '', ''));
  assert(!canShowArticleAd(`/${page}/`, '?debug', ''));
  assert(!canShowArticleAd(`/${page}/`, '', '#privacy-policy'));
}
for (const path of ['/', '/404.html', '/missing/', '/how-to-play/', '/privacy-policy/', '/cookie-policy/', '/terms-of-use/', '/contact/', '/about/']) {
  assert(!canShowArticleAd(path, '', ''));
}
for (const path of ['index.html', '404.html', ...Object.keys(pageContent).map(id => `${id}/index.html`)]) {
  const html = readFileSync(`dist/${path}`, 'utf8');
  assert(!html.includes('pagead2.googlesyndication.com'), `Global advertising on ${path}`);
  if (path !== '404.html') assert(html.includes('google-adsense-account'));
  if (path.includes('/')) {
    const page = pageContent[path.split('/')[0]];
    assert(html.includes(page.title.replaceAll('&', '&amp;')));
    assert(html.includes(page.sections[0][1].slice(0, 30)));
  }
}
assert(readFileSync('dist/404.html', 'utf8').includes('noindex, follow'));
assert(readFileSync('dist/ads.txt', 'utf8').includes('pub-1226733358806955'));
console.log('Ad eligibility and generated content: PASS');
