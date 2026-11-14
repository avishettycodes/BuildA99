/** Serve known static pages and return a real 404 for unknown document URLs. */
const pages = new Set(['/', '/how-to-play/', '/build-strategy/', '/ratings-and-scoring/', '/about/', '/privacy-policy/', '/cookie-policy/', '/terms-of-use/', '/contact/']);
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (pages.has(path) || path.startsWith('/assets/') || ['/ads.txt', '/robots.txt', '/sitemap.xml', '/favicon.svg', '/apple-touch-icon.png', '/og.png'].includes(path)) {
      return env.ASSETS.fetch(request);
    }
    if (pages.has(`${path}/`)) {
      url.pathname = `${path}/`;
      return Response.redirect(url.toString(), 308);
    }
    url.pathname = '/404.html';
    const response = await env.ASSETS.fetch(new Request(url, request));
    return new Response(response.body, { status: 404, headers: response.headers });
  },
};
