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
