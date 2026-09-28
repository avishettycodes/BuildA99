/** Deterministic gameplay samples: visible ratings, three rerolls, no repeated teams. */
import assert from 'node:assert/strict';
import { DAILY_TARGETS, DAILY_TARGET_FACTORS, variedDailyTarget } from '../src/lib/daily';
import { ATTRIBUTE_SETS, TEAMS, getPool } from '../src/data';
import type { AttributeKey, Era, Position } from '../src/data';
import { useGame } from '../src/store/gameStore';
import { simulateCareer } from '../src/lib/scoring';
const count = Number(process.env.RUNS ?? 1500);
for (const era of ['current', 'alltime'] as Era[]) for (const position of ['QB', 'RB', 'WR', 'TE'] as Position[]) {
  const keys = ATTRIBUTE_SETS[position];
  const premium = Object.fromEntries(keys.map(key => {
    const values = TEAMS.map(team => Math.max(...getPool(position, team.id, era).map(p => p.attributes[key] ?? 0))).sort((a,b) => a-b);
    return [key, values[Math.floor(values.length * 0.6)]];
  }));
  const yards: number[] = [];
  for (let i = 0; i < count; i++) {
    const seed = `daily-balance-v1-${era}-${position}-${i}`;
    useGame.getState().startRun({ position, era, hardMode: false, seed });
    for (let guard = 0; useGame.getState().phase !== 'complete' && guard < 100; guard++) {
      const g = useGame.getState();
      if (g.phase === 'ready') { g.spin(); continue; }
      if (g.phase === 'spinning') { g.landSpin(); continue; }
      assert.equal(g.phase, 'picking');
      let best = -1, playerId = '', attribute = g.remainingSlots()[0];
      for (const player of g.currentPool()) for (const key of g.remainingSlots()) {
        const value = player.attributes[key] ?? 0;
        if (value > best) { best = value; playerId = player.id; attribute = key; }
      }
      if (g.rerollsLeft && best < premium[attribute]) g.reroll();
      else g.takeAttribute(playerId, attribute);
    }
    const g = useGame.getState();
    assert.equal(g.phase, 'complete');
    const build = Object.fromEntries(keys.map(key => [key, g.slots[key]!.value])) as Record<AttributeKey, number>;
    yards.push(simulateCareer(position, build, seed, era).careerYards);
  }
  yards.sort((a,b) => a-b);
  for (const factor of DAILY_TARGET_FACTORS) {
  const target = variedDailyTarget(DAILY_TARGETS[era][position], factor);
  const rate = yards.filter(value => value > target).length / count;
  console.log(`${era} ${position}: ${target} yards, ${(rate * 100).toFixed(1)}% wins over ${count} runs`);
  assert.ok(rate >= .15 && rate <= .27, `${era} ${position} daily must stay hard but achievable`);
  }
}
