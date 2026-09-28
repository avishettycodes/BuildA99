import { useEffect, useRef } from 'react';

import { legalOwner, legalReady, contactEmail, validEmail } from '../lib/legal';

const content: Record<string, { title: string; sections: [string, string][] }> = {
  'how-to-play': {
    title: 'How to Play',
    sections: [
      ['Build your player', 'Choose Daily Challenge or Free Play. Pick a league and position where available. Spin for a team, then take one player’s rating for an empty attribute. Each player contributes once and teams do not repeat within a run, including rerolls. Fill all seven attributes, then simulate your career.'],
      ['Ratings and difficulty', 'Normal mode shows ratings and gives you three rerolls. Hard mode hides ratings and gives no rerolls. Overall combines a weighted trait average with a weighted score for your two weakest traits. Career length, production, and some outcomes also depend on the run’s randomness. A high overall does not guarantee a record or a championship.'],
      ['Daily challenges', 'Tuesday and Friday ask you to finish at or below a low overall target. The other five days ask you to beat a career yardage target; a yardage tie does not win. Targets are game goals, not the featured player’s real statistics. You get one Normal attempt per league per local calendar day. Abandoning a daily uses that attempt. Finishing either league counts toward your completion streak; winning counts toward your win streak. Both count each date only once.'],
      ['Save and share', 'Name a finished player to save it in YOUR BUILDS on this browser. Your leaderboard and personal bests are local to this device. Clearing browser data can erase them. Unnamed and unfinished runs are discarded when you leave or reload the page. Use the share and download controls to export your result. Returning to the menu asks before clearing your active run.'],
      ['For fun', 'This is a fictional football simulation. Game ratings and career results are not scouting advice, real predictions, betting advice, or official league statistics. There are no entry fees or cash prizes in this version.'],
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    sections: [
      ['Scope', 'This notice describes the current Build a 99 game. It does not cover external sites you choose to open. The operator and contact details appear below.'],
      ['Data on your device', 'The game stores your active run, player names you enter, saved builds, results, daily attempts, streak history, and preferences in this browser. The game does not upload these saves to a game account or a public leaderboard. Please use a fictional player name rather than personal or sensitive information.'],
      ['Hosting and communications', 'Vercel hosts the site. Visiting a website sends technical information such as your IP address, requested URL, browser information, and request time to its hosting infrastructure. Hosting logs may be processed for delivery, security, and troubleshooting. If you email us, we receive your address and the information you choose to send, and use it to respond.'],
      ['Ads, analytics, and sharing', 'This version does not include an advertising network, third-party analytics SDK, account registration, or payments. Advertisement areas are placeholders. Copying or downloading a result happens on your device. If you choose a share destination, that service receives the content you share and its own privacy policy applies.'],
      ['Storage and retention', 'Local saves remain until you remove them, clear this site’s browser data, or your browser removes them. Daily history is capped at the latest 7,300 stored attempts. You can delete individual named builds from YOUR BUILDS. Hosting and email records are separate from browser saves; ask the operator about records it holds and applicable retention.'],
      ['Your choices and rights', 'You can clear this site’s data through your browser settings. This removes local progress and preferences and cannot be undone through the game. Depending on where you live, you may have rights to access, correct, delete, restrict, or object to processing of personal information, and to complain to a privacy regulator. Contact the operator to make a request. We cannot retrieve a local save that was never sent to us.'],
      ['Children', 'The game does not ask for a birth date or create player accounts. Do not enter a child’s personal information into player names or send it in a message. If you believe personal information about a child has been sent to the operator, contact us so it can be investigated.'],
      ['Changes', 'We will update this notice when our practices change. Adding advertising, analytics, accounts, or payments requires a new privacy review and any legally required notices or consent before those features collect information.'],
    ],
  },
  'cookie-policy': {
    title: 'Cookie and Browser Storage Policy',
    sections: [
      ['What this game uses', 'The game code does not set HTTP cookies. It uses localStorage, which saves information in your browser between visits. Storage rules can apply to localStorage as well as cookies. Hosting infrastructure may separately process technical requests.'],
      ['Active run and preferences', 'megatron.run.v1 stores session bookkeeping, setup, and sound preference. A new page load discards the previous run and records an unfinished daily as abandoned. builda99.theme stores your selected appearance. builda99.menu stores your selected menu section. The older “megatron” key names remain so existing players do not lose their saves.'],
      ['Saved builds and daily history', 'megatron.hall.v1 stores named players for YOUR BUILDS and the local leaderboard. builda99.daily.v1 stores daily attempts and results used for attempt limits, streaks, and personal bests. These values are not advertising identifiers.'],
      ['Your controls', 'Use your browser’s site-data settings to inspect or clear stored data for this domain. Clearing it removes local saves, daily history, and preferences. Blocking storage may prevent progress from surviving a reload. Deleting browser data does not delete separate hosting or email records.'],
      ['Advertising and analytics', 'No advertising or analytics cookies are integrated in this version. If optional tracking is introduced, we will update this page and provide any required consent controls before it starts. A banner without actually controlling those technologies would not protect your choices.'],
    ],
  },
  'terms-of-use': {
    title: 'Terms of Use',
    sections: [
      ['About the service', 'Build a 99 is a free entertainment game. These terms describe permitted use of the game. If you do not agree, please do not use it. If you are not old enough to agree to terms where you live, ask a parent or guardian to review them with you.'],
      ['Independent fan project', 'Build a 99 is not affiliated with, sponsored by, or endorsed by the NFL, NFLPA, any team, any player, EA SPORTS, or Madden NFL. Names and team references identify the subjects of the game. Third-party names, marks, and other rights remain with their respective owners.'],
      ['Game content', 'All-Time ratings are subjective game ratings. Current ratings use a documented source model with game-specific overrides. Simulated careers, awards, and draft results are fictional. They are not official records or statements about a real player’s future performance.'],
      ['Permitted use', 'You may play the game and share the result cards it generates for personal, noncommercial use, subject to third-party rights. Do not interfere with the site, attempt unauthorized access, distribute malicious code, or use the service to harass others or violate their rights. This notice does not grant rights to third-party trademarks, likenesses, or data.'],
      ['Availability and local saves', 'The service may change, be interrupted, or stop. Results and ratings may change as the game is updated. Saves are kept on your device and are not backed up by a player account. Download a result you want to keep.'],
      ['Disclaimers and applicable rights', 'To the extent permitted by applicable law, the game is provided as available without a promise of uninterrupted operation, accuracy, or fitness for a particular purpose. Nothing here excludes rights or liabilities that cannot legally be excluded, including any mandatory consumer rights.'],
      ['Concerns and updates', 'Contact the operator about privacy, accessibility, errors, or intellectual-property concerns. Include the relevant page and enough detail to identify the issue. Updated terms will be posted with a revised date. Material changes will be communicated where required by law.'],
    ],
  },
  contact: {
    title: 'Contact Us',
    sections: [
      ['Get in touch', 'For support, privacy requests, accessibility issues, or rights concerns, use the operator contact below. Include the relevant page and a description of the issue. Do not send passwords, payment details, or other sensitive information.'],
      ['Rights concerns', 'If you believe content infringes your rights, identify the content, explain your relationship to the rights holder, and provide a way to contact you. A non-affiliation disclaimer does not replace permission where permission is required.'],
    ],
  },
};

export function LegalPage({ page }: { page: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const article = content[page];
  useEffect(() => {
    if (!article) return;
    const previous = document.title;
    document.title = `${article.title} | Build a 99`;
    heading.current?.focus();
    return () => { document.title = previous; };
  }, [article]);
  if (!article) return null;
  return <main className="mx-auto max-w-3xl px-5 py-8 text-white/85">
    <a href="#" className="text-hazard underline">Back to game</a>
    <h1 ref={heading} tabIndex={-1} className="mt-6 font-display text-4xl uppercase">{article.title}</h1>
    <p className="mt-2 text-sm text-white/60">Updated September 28, 2026</p>
    {!legalReady && <p role="status" className="mt-4 rounded-lg border border-amber-400/50 p-4 text-sm">Draft for review. Operator identity and contact details must be completed before public launch.</p>}
    {article.sections.map(([title, text]) => <section key={title} className="mt-6">
      <h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 leading-relaxed">{text}</p>
    </section>)}
    <section className="mt-8 border-t border-white/20 pt-5">
      <h2 className="text-xl font-semibold">Operator and contact</h2>
      <p className="mt-2">{legalOwner || 'Operator details pending.'}</p>
      {validEmail ? <a className="text-hazard underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> : <p>Contact address pending.</p>}
      {page === 'privacy-policy' && <p className="mt-3"><a className="text-hazard underline" href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">Vercel privacy notice</a></p>}
    </section>
  </main>;
}
