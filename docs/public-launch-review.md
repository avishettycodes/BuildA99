# Public launch review

Prepared September 27, 2026. This is an implementation audit and review checklist, not a legal opinion or clearance to launch.

## Implemented

Footer links to How to Play, Privacy Policy, Cookie and Browser Storage Policy, Terms of Use, and Contact Us. Hash links work on static hosting without rewrite configuration, and opening a policy keeps the game mounted so a spin or active run is not discarded. Policies describe local saves rather than an imaginary account service. No policies, copyright claims, or contact details were copied from 82-0 or Vaulty Studios.

Owner confirmed September 28, 2026: Andrew Yee; public contact acyee25@gmail.com. These are the default site values. This completes identity/contact configuration, not legal clearance.

To override them, set public build environment values `VITE_LEGAL_OWNER` and `VITE_CONTACT_EMAIL` to the actual operator and monitored email. These values are public, not secrets. Without both, policy pages display a draft notice. Do not launch with the draft notice. Setting the values removes that notice but does not constitute legal review.

## Required owner decisions before publication

- Confirm the actual operator, business/contact address if required, jurisdiction, launch domain, target countries, and intended audience. Do not assume a brand name is a legal entity.
- Confirm whether any Vercel project settings inject analytics, monitoring, or scripts not visible in the repository. Review actual production requests and response cookies.
- Confirm any planned advertising, analytics, accounts, email collection, payments, or prizes. Current drafts describe a game without these features. Update the notices and implement the applicable consent/opt-out controls before adding them.
- Have counsel review policy completeness, applicable legal bases, contact and hosting-log retention, international transfers, applicable regional privacy rights, terms assent, and child-directed-service obligations. A “13+” label alone does not resolve COPPA applicability.
- Review browser storage purposes and applicable exemptions in launch regions. Current browser preferences and persistent game history are not automatically exempt just because they use localStorage. If consent is required, block the relevant reads/writes until consent, allow refusal, and support withdrawal. No empty cookie banner has been added.

## Rights and content review

- Review use of player names/likenesses and team names/marks, including publicity rights. No disclaimer grants permission or guarantees that a commercial game is protected.
- Verify rights and source terms for the Madden-derived ratings snapshot, imported data, and game-specific overrides. Attribution is not a license. Document permission or another reviewed basis; replace data if necessary.
- Establish provenance and licenses for `src/assets/hero.png`, `public/og.png`, `public/favicon.svg`, `public/icons.svg`, and all promotional assets. Check them for protected imagery. Review third-party dependency/font licenses and retain required notices.
- Audit player blurbs for unsupported factual accusations and reputational claims. Entertainment tone does not establish factual accuracy or legal protection.
- Perform name/domain trademark clearance for Build a 99 and the final public branding. Do not claim ownership of NFL, player, EA, or team rights.

## Verified repository behavior

- Browser keys: `megatron.run.v1`, `megatron.hall.v1`, `builda99.daily.v1`, `builda99.theme`, `builda99.menu`.
- Game saves and the leaderboard are device-local. Daily history stores at most 7,300 attempts, not 7,300 days.
- Sharing is user-initiated. Native sharing sends content to the user's chosen destination. Downloads and clipboard copies are local operations.
- Ad rails are placeholders. No advertising or analytics integration was found in application code in this audit.
- Vercel receives hosting requests; local-only game saves do not mean the website processes no personal information.

## Reference guidance

- FTC COPPA compliance: https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
- ICO browser storage scope: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-storage-and-access-technologies/
- Vercel privacy notice: https://vercel.com/legal/privacy-notice
- USPTO trademark confusion: https://www.uspto.gov/trademarks/search/likelihood-confusion
- Copyright Office photographs guidance: https://www.copyright.gov/help/faq/faq-fairuse.html
