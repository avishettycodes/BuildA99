import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pageContent } from '../src/lib/pageContent';

const origin = 'https://builda99.com';
const template = readFileSync('dist/index.html', 'utf8');
const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const links = Object.entries(pageContent).map(([id, page]) => `<a href="/${id}/">${escape(page.title)}</a>`).join(' · ');
const descriptions: Record<string, string> = {
  'how-to-play': 'Learn how to play Build a 99: spin for a team, choose player traits, use rerolls and simulate a career in daily challenges or free play.',
  'privacy-policy': 'Read how Build a 99 handles browser saves, advertising and contact information, plus your privacy choices.',
  'cookie-policy': 'Learn how Build a 99 uses browser storage and how Google AdSense uses cookies, with controls for your data.',
  'terms-of-use': 'Read the terms for playing Build a 99, sharing results and using this independent fan-made football game.',
  contact: 'Contact the Build a 99 operator for game support, privacy requests, accessibility issues or rights concerns.',
};
const home = `<main><h1>Build a 99: Free Football Player Builder</h1><p>Steal a trait. Chase a 99.</p><p>Build a football player from current stars or all-time greats. Spin for an NFL franchise, steal one rating and fill all seven traits. Play a daily challenge or build a QB, RB, WR or TE in free play.</p><ol><li>Spin: land on a team.</li><li>Steal: take one rating.</li><li>Simulate: live his career.</li></ol><p>The interactive game requires JavaScript. No account is needed. Saved builds stay on your device.</p><p>Build a 99 is an independent fan game, not affiliated with or endorsed by the NFL, NFLPA, any team or player.</p></main>`;
const baseSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'Build a 99', inLanguage: 'en' },
    { '@type': 'WebApplication', '@id': `${origin}/#game`, name: 'Build a 99', url: `${origin}/`, applicationCategory: 'GameApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript', isAccessibleForFree: true, description: 'A free football player builder with daily challenges and simulated careers.', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
  ],
};
function emit(path: string, body: string, title?: string, description?: string) {
  let html = template;
  if (title) {
    html = html.replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
      .replace(/(<meta\s+(?:property="og:title"|name="twitter:title")\s+content=")[^"]*/g, `$1${escape(title)}`);
  }
  if (description) html = html.replace(/(<meta\s+(?:name="description"|property="og:description"|name="twitter:description")\s+content=")[^"]*/g, `$1${escape(description)}`);
  const url = `${origin}${path}`;
  html = html.replace('rel="canonical" href="https://builda99.com/"', `rel="canonical" href="${url}"`)
    .replace('property="og:url" content="https://builda99.com/"', `property="og:url" content="${url}"`);
  const schema = path === '/' ? baseSchema : {
    '@context': 'https://schema.org', '@type': 'WebPage', url, name: title,
    description, isPartOf: { '@id': `${origin}/#website` }, inLanguage: 'en',
  };
  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}<footer><nav aria-label="Site information">${links}</nav></footer></div>`);
  const directory = `dist${path}`;
  mkdirSync(directory, { recursive: true });
  writeFileSync(`${directory}index.html`, html);
}
emit('/', home);
for (const [id, page] of Object.entries(pageContent)) {
  const owner = process.env.VITE_LEGAL_OWNER?.trim() || 'Andrew Yee';
  const email = process.env.VITE_CONTACT_EMAIL?.trim() || 'acyee25@gmail.com';
  const body = `<main><a href="/">Back to game</a><h1>${escape(page.title)}</h1><p>Updated October 16, 2026</p>${page.sections.map(([heading, text]) => `<section><h2>${escape(heading)}</h2><p>${escape(text)}</p></section>`).join('')}<section><h2>Operator and contact</h2><p>${escape(owner)}</p><a href="mailto:${escape(email)}">${escape(email)}</a></section></main>`;
  emit(`/${id}/`, body, `${page.title} | Build a 99`, descriptions[id]);
}
const paths = ['/', ...Object.keys(pageContent).map((id) => `/${id}/`)];
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${origin}${path}</loc></url>`).join('')}</urlset>\n`);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
// A real missing-page document avoids serving an indexable home page at every typo URL.
writeFileSync('dist/404.html', template.replace('<title>Build a 99 | Free Football Player Builder &amp; Daily Game</title>', '<title>Page not found | Build a 99</title>').replace('content="index, follow, max-image-preview:large"', 'content="noindex, follow"').replace('<div id="root"></div>', '<main><h1>Page not found</h1><a href="/">Back to Build a 99</a></main>').replace(/<script type="module"[^>]*><\/script>/g, ''));
console.log(`SEO: generated ${paths.length} pages, structured data, sitemap, robots.txt and 404.html.`);
