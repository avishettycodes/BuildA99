# Career model v2

The same production model applies to QB, RB, WR, and TE in Current and All-Time. The eras choose different player pools and award rating gates; an identical set of traits has identical production potential.

- Overall remains the build game's balance score. Efficiency uses 25% overall and 75% average trait talent, so the two weakest slots no longer dominate every outcome.
- Playing opportunity saturates around 87 overall. Additional quality improves efficiency rather than silently withholding starter workloads until 95.
- Accuracy and reads affect passing efficiency and touchdown rate; pocket presence affects attempts. RB speed and juke affect rushing efficiency, WR release affects receptions, and TE routes and blocking affect receiving opportunity. Existing trait effects remain.
- Interceptions follow passing volume. A down season can have a higher interception rate while having fewer total interceptions.
- Career length retains the seeded, position-specific model, including early exits. Short careers remain possible; they no longer also imply backup-level peak production.
- Individual awards require a season with both the yards and touchdowns below, in addition to the existing era-specific rating requirements. OPOY uses 1.08 times the base and MVP 1.15 times the base. These are game eligibility floors, not claims about real award voting.

| Position | Base yards | Base TDs |
| --- | ---: | ---: |
| QB | 3,500 passing | 24 passing |
| RB | 1,200 rushing | 10 rushing |
| WR | 1,100 receiving | 8 receiving |
| TE | 800 receiving | 6 receiving |

Championship probability compounds annual opportunities over the actual career length. The annual probability uses overall and average production relative to a full season at the position. Team circumstances remain random; this is not a simulation of a full league or playoff bracket. The report uses the probability that actually determined the result.

Vick's 6,109 rushing yards remain a historical calibration benchmark, not a current record or hard cap. [NFL.com reported Jackson passing that total in December 2024](https://www.nfl.com/news/ravens-lamar-jackson-sets-record-for-career-rushing-yards-by-quarterback).

## Replays and verification

New careers freeze season lines alongside their awards, totals, and model version. Previously saved careers use the isolated v1 production implementation, preserving their original stats and trophies. Start a new build to use the revised model.

`npm run verify:career` checks the seeded career distributions and runs v2 regressions across all eight position/era combinations. The regression for the reported QB traits uses a fixed test seed and six seasons: 17,180 passing yards, 121 passing TDs, 58 interceptions, and 3,425 rushing yards. Its best season is 4,053 passing yards and 29 TDs. This is a reproducible example, not a reconstruction of the user's unavailable original seed.

The scoring harness still checks the skill ladder and rare-outcome bounds. Its QB grand-slam lower bounds were reduced because championship chances now reflect career opportunities and awards require season production; the upper bounds were retained.
