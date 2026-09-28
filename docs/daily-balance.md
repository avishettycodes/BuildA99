# Daily challenge balance

Updated September 28, 2026.

The original daily required beating a legend's real career total. A 1,000-run sample of the visible-rating greedy strategy could not reach Brady, Rice, Barry Sanders, or Tony Gonzalez in Current mode. The existence of a rare perfect-build seed was not evidence of a playable daily.

Version 1 gives each league and position an explicit game target. Legend totals remain separate milestones, not altered historical statistics. Existing saved challenges keep their original target and title; new attempts use the new target. Attempt limits, fresh randomness, career production, and ratings do not change.

The calibration strategy chooses the highest visible open attribute and spends a reroll when it is below the 60th-percentile franchise maximum for that attribute. It plays through the real store, including distinct teams and players and three rerolls. It does not look ahead at teams or career randomness. These are simulated strategy results, not observed user win rates.

| League | Position | Target yards | Wins in 1,500 runs |
|---|---|---:|---:|
| Current | QB | 26,000 | 21.8% |
| Current | RB | 8,500 | 20.7% |
| Current | WR | 11,000 | 21.8% |
| Current | TE | 4,250 | 19.9% |
| All-Time | QB | 43,500 | 19.9% |
| All-Time | RB | 13,250 | 21.2% |
| All-Time | WR | 15,250 | 20.1% |
| All-Time | TE | 8,250 | 22.4% |

A tie still loses. `npm run verify:daily` checks the schedule, persistence, and strict target comparisons, then samples 12,000 careers. The regression range is 15–27%, allowing sample variation while detecting major balance drift. Tune based on actual voluntarily collected player feedback before claiming a real-world win rate or retention improvement.

## Daily variety from September 29, 2026

The schedule expands to ten legends and changes at local midnight without a manual update. Adjacent days never use the same opponent. Each return matchup cycles through five target variations within ±1% of its calibrated baseline, rounded to 25 yards. Both leagues share the featured opponent but keep their own targets. Existing saved attempts retain their exact targets. Opponents eventually return; this is not a promise of infinitely unique content.

The menu and completed results show tomorrow's opponent and a live countdown. A result left open across midnight announces the new daily. Finishing continues to count toward the completion streak, even on a loss. These features support a return habit; they do not establish an observed retention improvement.

Tests cover 366 days in each league, within-day consistency, opponent variety, target variation, and the previously tested local-midnight/DST boundaries. Every target variation is checked against the same 12,000-career sample, rather than testing only the base target.

Additional real career totals verified against the Pro Football Hall of Fame profiles for [Randy Moss](https://www.profootballhof.com/players/randy-moss), [Antonio Gates](https://www.profootballhof.com/players/antonio-gates), and [Emmitt Smith](https://www.profootballhof.com/players/emmitt-smith), and [NFL's Walter Payton statistics](https://www.nfl.com/players/walter-payton/stats/).
