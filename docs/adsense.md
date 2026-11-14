# AdSense setup and review

The site verifies publisher ownership with the account meta tag and `/ads.txt`.
Advertising is restricted to two substantial guides: `/build-strategy/` and
`/ratings-and-scoring/`. Each has at most one responsive manual unit after the article.
There are no ads on the game, menus, reports, debug view, utility pages or 404 page.
The guides and homepage introduction are readable in the built HTML without JavaScript.

Production hosting is Cloudflare. The older Vercel deployment is for testing.
For Workers static assets, use `assets.not_found_handling = "404-page"`; for Pages,
publish the complete `dist` directory including its generated top-level `404.html`.
The checked-in `wrangler.jsonc` targets the verified production Worker `builda99`
and both existing custom domains. Build, then run `npx wrangler@4.86.0 deploy`.
Do not apply a wildcard rewrite to the homepage.

## Required account configuration

1. Confirm `builda99.com` is the site submitted under publisher `pub-1226733358806955`.
2. Leave Auto ads off. Create a responsive display ad unit and set its numeric unit ID
   as `VITE_ADSENSE_SLOT_INLINE` in the production build environment, then rebuild.
   The publisher number is not an ad unit ID. With no unit configured, no ad request is made.
3. Publish the Google-certified European regulations message in Privacy & messaging
   and configure applicable US privacy messages. Test the published message and its
   choice/revocation controls from the relevant regions. This is account configuration;
   the repository cannot confirm it has been done.
4. Review the published operator/contact information and privacy/storage disclosures.
5. Confirm the deployed domain serves the new build before requesting review in AdSense.

## Validation

Run `npm run build` and `npm run lint`. The build includes game verification, TypeScript,
static guide generation, sitemap and robots output. Run `npm run verify:ads` after building
to check static content, verification identity and the absence of global advertising.

In a browser, check the homepage, Free Play, a completed report, every guide and utility
page, `/?debug`, and an unknown URL at phone and desktop sizes. Only the two eligible
guide URLs with a configured slot should request `adsbygoogle.js`. Block advertising
requests and confirm the articles and game still work. Use a mocked ad script in automated
tests to avoid generating artificial production ad traffic. Missing URLs must return 404
from the hosting platform, not a successful homepage response.

## Policy references

- https://support.google.com/publisherpolicies/answer/11112688
- https://support.google.com/adsense/answer/1346295
- https://support.google.com/adsense/answer/13554116

The review notice does not name the offending screen. These changes address observable
placement and content issues; Google makes the approval decision and controls ad fill.
