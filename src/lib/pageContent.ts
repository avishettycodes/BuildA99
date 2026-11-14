export const pageContent: Record<string, { title: string; sections: [string, string][] }> = {
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
  'build-strategy': {
    title: 'Build Strategy: Choosing Seven Traits',
    sections: [
      ['Read the whole room before choosing', 'Each spin gives you a franchise pool, but you only take one trait from one player. Compare the useful ratings across every empty slot before locking a choice. A 97 in a slot with plenty of strong options can be less useful than a 92 that fills your last difficult slot. The right choice depends on the build you already have, not simply the largest number on the screen.'],
      ['Protect the floor', 'Overall gives substantial weight to the two weakest traits after adjusting for positional importance. Six outstanding numbers cannot completely hide one poor choice. In Normal mode, look for a strong usable rating in the attributes you have left. Avoid leaving a difficult attribute until the last spin, when you have no alternative slot to fill.'],
      ['Use positional strengths', 'Quarterbacks put the greatest weight on accuracy and processing. Running backs emphasize vision, with speed and burst next. Receivers lean on hands and route running, while tight ends place the most weight on hands. Lower-weight traits still affect the result, so a fast receiver with poor hands or a powerful back with poor vision can finish below a more balanced build.'],
      ['Treat rerolls as a limited resource', 'Normal mode provides three rerolls for the entire run. Compare the best remaining choice to the risk of another franchise before using one. Early in the run you have more slots that a room can help. Late in the run, a room can offer several great players and still have nothing for your one empty attribute. Saving a reroll gives you another chance at that point; it does not guarantee an upgrade.'],
      ['Change the plan for the daily', 'Read the daily objective before spinning. A low-overall challenge rewards finishing at or below its target, so the strategy for chasing a 99 is backwards for that day. A career-yardage challenge requires exceeding its yardage target. Career length and simulated outcomes include randomness, so the highest overall is useful but does not promise the winning career.'],
      ['Learn in Free Play', 'Free Play lets you repeat a position without spending a daily attempt. Normal mode exposes the ratings and helps you learn which attributes each room can fill. Hard mode hides ratings and removes rerolls, so it rewards remembering the pools and accepting uncertainty. Compare your saved builds on this device to see whether your weak slots improved over several attempts.'],
      ['Review the finished player', 'After the simulation, compare the full trait sheet with the career report. Look for the slot that limited the build rather than judging every decision by a random career outcome. Name the player if you want to keep that report in this browser. Download or share a result you want to preserve elsewhere; local saves are not a cloud backup.'],
    ],
  },
  'ratings-and-scoring': {
    title: 'How Ratings and Overall Work',
    sections: [
      ['What a rating represents', 'A trait is a game value for one part of a football player’s skill set. Taking a player’s speed does not add his other ratings to your build. You assemble seven separate contributions, and the finished player is fictional. These numbers are a model for an entertainment game, not official scouting evaluations or predictions about real careers.'],
      ['Current and All-Time pools', 'All-Time ratings are subjective ratings written for this game. Current ratings use the source model documented in the project, combining direct rating fields, derived categories and audited leader overrides. Some players require replacement-level estimates. The roster snapshot is fixed to an update date shown in Free Play; it is not a live feed. Current and All-Time use the same overall calculation.'],
      ['Step one: the weighted mean', 'Each position has seven traits with different weights. Multiply each rating by its positional weight, add those products, and divide by the sum of the weights. For example, quarterback accuracy has weight 1.55 while mobility has weight 0.80. Raising accuracy by ten points therefore improves the weighted mean more than raising mobility by ten points.'],
      ['Step two: adjust the weak spots', 'For each trait, divide its weight by the average trait weight for that position. Multiply the gap between its rating and 99 by that relative weight, then subtract the result from 99 and clamp it between zero and 99. Sort these adjusted values from lowest to highest. This makes a weakness in a defining skill count more strongly than the same raw rating in a less important skill.'],
      ['Step three: calculate overall', 'The weak-link anchor is the weighted average of the lowest two adjusted values, with the lowest counting twice: (2 × lowest + second-lowest) ÷ 3. Overall is half the weighted mean plus half that anchor, rounded to a whole number and limited to the range zero to 99. If all seven traits are 90, the weighted mean is 90, but the adjusted weak spots can pull the final overall below 90 because the position’s most important traits carry more weight.'],
      ['Why the displayed weakest slot can differ', 'The smallest raw rating on your sheet need not be the most costly weakness after positional weighting. Read the actual seven ratings alongside the overall breakdown. Improving a lower raw number helps, but fixing a heavily weighted weak trait can have a larger effect on the combined grade.'],
      ['Overall and a career are different results', 'Overall summarizes the seven traits. Career simulation also uses career length and run randomness to produce fictional yards, awards and other outcomes. Two strong builds can finish with different careers. An overall rating does not guarantee a particular award, a yardage record or a championship, and the simulation should not be used as betting advice.'],
    ],
  },
  about: {
    title: 'About Build a 99',
    sections: [
      ['A football decision game', 'Build a 99 asks a simple question: which single skill would you take from a player if you had to build someone new? A run combines seven traits from franchise pools, then simulates the career of the player you assembled. The challenge comes from choosing which skills to secure early and which to leave for a later spin.'],
      ['What we make', 'The project combines original game rules, a positional scoring model, curated player pools and fictional career reports. All-Time ratings express the game’s own judgments. Current ratings use a documented source model with game-specific adjustments. The strategy and scoring guides explain how those decisions affect play.'],
      ['Who operates the site', 'Build a 99 is an independent fan project operated by the person listed below. Use the contact page to report a broken feature, question a rating or raise a privacy or rights concern. Please include the league, position, player and trait when reporting a rating issue so it can be checked against the correct snapshot.'],
      ['Play without an account', 'The game is free to play and stores progress in your browser. Saved builds and leaderboards are personal to this device. There are no entry fees or cash prizes. The game is not affiliated with or endorsed by the NFL, NFLPA, any team or player, EA SPORTS or Madden NFL.'],
    ],
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    sections: [
      ['Scope', 'This notice describes the current Build a 99 game. It does not cover external sites you choose to open. The operator and contact details appear below.'],
      ['Data on your device', 'The game stores your active run, player names you enter, saved builds, results, daily attempts, streak history, and preferences in this browser. The game does not upload these saves to a game account or a public leaderboard. Please use a fictional player name rather than personal or sensitive information.'],
      ['Hosting and communications', 'Vercel hosts the site. Visiting a website sends technical information such as your IP address, requested URL, browser information, and request time to its hosting infrastructure. Hosting logs may be processed for delivery, security, and troubleshooting. If you email us, we receive your address and the information you choose to send, and use it to respond.'],
      ['Advertising', 'The site shows ads served by Google AdSense. Google and its partners may use cookies and similar technologies to serve ads, limit how often you see them, measure them and, where the law allows, personalize them based on your visits to this and other websites. Google explains how it uses this information at policies.google.com/technologies/partner-sites. You can turn off personalized ads in My Ad Center at myadcenter.google.com. Advertising availability depends on the site’s active AdSense and consent configuration. If a consent message is available, use its controls to review or change your choices.'],
      ['Analytics and sharing', 'This version does not include a third-party analytics SDK, account registration, or payments. Copying or downloading a result happens on your device. If you choose a share destination, that service receives the content you share and its own privacy policy applies.'],
      ['Storage and retention', 'Local saves remain until you remove them, clear this site’s browser data, or your browser removes them. Daily history is capped at the latest 7,300 stored attempts. You can delete individual named builds from YOUR BUILDS. Hosting and email records are separate from browser saves; ask the operator about records it holds and applicable retention.'],
      ['Your choices and rights', 'You can clear this site’s data through your browser settings. This removes local progress and preferences and cannot be undone through the game. Depending on where you live, you may have rights to access, correct, delete, restrict, or object to processing of personal information, and to complain to a privacy regulator. Contact the operator to make a request. We cannot retrieve a local save that was never sent to us.'],
      ['Children', 'The game does not ask for a birth date or create player accounts. Do not enter a child’s personal information into player names or send it in a message. If you believe personal information about a child has been sent to the operator, contact us so it can be investigated.'],
      ['Changes', 'We will update this notice when our practices change. Adding analytics, accounts, or payments requires a new privacy review and any legally required notices or consent before those features collect information.'],
    ],
  },
  'cookie-policy': {
    title: 'Cookie and Browser Storage Policy',
    sections: [
      ['What this game uses', 'The game code itself does not set HTTP cookies. It uses localStorage, which saves information in your browser between visits. Storage rules can apply to localStorage as well as cookies. Google AdSense, which serves the ads, does use cookies and is described under Advertising below. Hosting infrastructure may separately process technical requests.'],
      ['Active run and preferences', 'megatron.run.v1 stores session bookkeeping, setup, and sound preference. A new page load discards the previous run and records an unfinished daily as abandoned. builda99.theme stores your selected appearance. builda99.menu stores your selected menu section. The older “megatron” key names remain so existing players do not lose their saves.'],
      ['Saved builds and daily history', 'megatron.hall.v1 stores named players for YOUR BUILDS and the local leaderboard. builda99.daily.v1 stores daily attempts and results used for attempt limits, streaks, and personal bests. These values are not advertising identifiers.'],
      ['Your controls', 'Use your browser’s site-data settings to inspect or clear stored data for this domain. Clearing it removes local saves, daily history, and preferences. Blocking storage may prevent progress from surviving a reload. Deleting browser data does not delete separate hosting or email records.'],
      ['Advertising', 'Ads on this site come from Google AdSense. Google and its partners may set or read cookies and use similar technologies on this site to deliver ads, measure them and, where permitted, personalize them. Where a consent message is available, use its controls to review or change your choices. You can also manage ad personalization at myadcenter.google.com and block or delete cookies in your browser settings. Google’s own policy applies to its cookies.'],
      ['Analytics', 'No analytics cookies are integrated in this version. If analytics are introduced, we will update this page and provide any required consent controls before they start.'],
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

