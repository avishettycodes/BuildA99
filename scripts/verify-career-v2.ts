/** Production regressions: real build, all eight position/era combinations, and saves. */
import assert from 'node:assert/strict';
import { ATTRIBUTE_SETS, ERAS, positionsWithData } from '../src/data';
import type { AttributeKey } from '../src/data';
import { careerStats } from '../src/lib/career';
import { legacyCareerStats } from '../src/lib/legacyCareer';
import { computeOverall, simulateCareer, superBowlOdds } from '../src/lib/scoring';
import { ringMissLine } from '../src/lib/narrative';

const reported = { armStrength: 97, accuracy: 99, deepBall: 89, pocketPresence: 82, mobility: 99, processing: 94, clutch: 84 };
const overall = computeOverall('QB', reported, 'current').overall;
assert.equal(overall, 88);
const old = legacyCareerStats('QB', reported, overall, 6, 'reported-build');
assert.deepEqual([old.yards, old.touchdowns, old.secondary, old.secondaryYards], [12140, 81, 69, 2363]);
const revised = careerStats('QB', reported, overall, 6, 'reported-build');
assert(revised.best.yards >= 3300 && revised.best.yards <= 4700);
assert(revised.best.touchdowns >= 23 && revised.best.touchdowns <= 38);
assert(revised.yards > old.yards * 1.25 && revised.secondary < old.secondary);
assert(revised.secondaryYards > old.secondaryYards * 1.25);
// Accuracy must directly improve passing, not merely an aggregate rating.
const inaccurate = careerStats('QB', { ...reported, accuracy: 60 }, overall, 6, 'reported-build');
assert(revised.yards > inaccurate.yards && revised.touchdowns > inaccurate.touchdowns);
assert(revised.secondary / revised.volume < inaccurate.secondary / inaccurate.volume);

let careers = 0;
for (const era of ERAS) {
  for (const position of positionsWithData(era)) {
    for (let i = 0; i < 200; i++) {
      const build: Partial<Record<AttributeKey, number>> = {};
      ATTRIBUTE_SETS[position].forEach((key, k) => { build[key] = 70 + ((i * 7 + k * 3) % 30); });
      const seed = `v2-${era}-${position}-${i}`;
      const career = simulateCareer(position, build, seed, era);
      assert.deepEqual(career, simulateCareer(position, build, seed, era));
      assert.equal(career.modelVersion, 2);
      const stats = career.stats!;
      assert.equal(stats.yards, career.careerYards);
      assert.equal(stats.seasons.length, career.seasons);
      assert.deepEqual(JSON.parse(JSON.stringify(career)).stats, stats);
      for (const field of ['yards', 'touchdowns', 'volume', 'secondary', 'secondaryYards'] as const) {
        assert.equal(stats[field], stats.seasons.reduce((sum, line) => sum + line[field], 0));
        assert(stats.seasons.every(line => Number.isFinite(line[field]) && line[field] >= 0));
      }
      assert(stats.seasons.every(line => line.touchdowns <= line.volume));
      if (position === 'QB') assert(stats.seasons.every(line => line.secondary <= line.volume));
      for (const award of ['allPro', 'opoy', 'mvp'] as const) {
        if (career.accolades[award]) assert(career.productionQualified?.[award]);
      }
      assert.equal(career.accolades.superBowl, career.superBowl.roll < career.superBowl.odds);
      careers++;
    }
    // At a fixed career length, a starter should substantially outproduce a reserve.
    const flat = (rating: number) => Object.fromEntries(ATTRIBUTE_SETS[position].map(key => [key, rating]));
    const reserve = careerStats(position, flat(70), 70, 6, 'opportunity');
    const starter = careerStats(position, flat(88), 88, 6, 'opportunity');
    assert(starter.volume > reserve.volume * 2);
    const floor = { QB: 3000, RB: 1000, WR: 800, TE: 550 }[position];
    assert(starter.best.yards > floor, `${era} ${position} should produce a starter season`);
    console.log(`PASS ${era} ${position}: replay, totals, awards, saves, starter opportunity`);
  }
}
assert.equal(superBowlOdds(99, 0), 0);
assert(superBowlOdds(88, 6) < superBowlOdds(88, 16));
assert(superBowlOdds(88, 6, 0.5) < superBowlOdds(88, 6, 1));
assert(superBowlOdds(99, 23) <= 0.85);
assert.equal(ringMissLine(99, 0.02), 'He was never really in it.');
assert.equal(ringMissLine(88, 0.45), 'He was as likely to win one as not, and it never happened.');
console.log(`PASS ${careers} careers; reported QB regression; legacy fixture; championship opportunities`);
console.log(`Reported traits, six seasons, fixed regression seed: ${revised.yards} yards, ${revised.touchdowns} TD, ${revised.secondary} INT, ${revised.secondaryYards} rushing yards.`);
