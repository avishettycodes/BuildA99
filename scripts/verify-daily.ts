import assert from 'node:assert/strict';
import { dailyChallenge, dailyAttempt, dailyOutcome, dailyWitness } from '../src/lib/daily';
import { useGame } from '../src/store/gameStore';
import { safeStorage } from '../src/lib/storage';
import { CURRENT_BASE } from '../src/data';
import { applyRosterUpdates } from '../src/data/current/rosterUpdates';

const first = dailyChallenge(new Date('2026-09-22T00:00:00Z'));
assert.deepEqual(first, dailyChallenge(new Date('2026-09-22T23:59:59Z')));
assert.notEqual(first.seed, dailyChallenge(new Date('2026-09-23T00:00:00Z')).seed);
const kinds = new Set<string>();
for (let day = 1; day <= 30; day++) {
  const challenge = dailyChallenge(new Date(`2026-09-${String(day).padStart(2, '0')}T12:00:00Z`));
  kinds.add(challenge.kind);
  assert.ok(dailyOutcome(challenge, dailyWitness(challenge.position, challenge.seed, challenge.kind === 'worst')).won, 'Daily must have a legal winning path');
  assert.ok(Number.isFinite(challenge.target) && challenge.target > 0);
}
assert.equal(kinds.size, 2);
safeStorage.removeItem('builda99.daily.v1');
useGame.getState().abandonRun();
useGame.getState().startDaily();
let game = useGame.getState();
assert.equal(game.hardMode, true);
assert.equal(game.era, 'alltime');
assert.equal(game.rerollsLeft, 0);
assert.equal(game.seed, dailyChallenge().seed);
const runId = game.runId;
assert.ok(JSON.parse(safeStorage.getItem('megatron.run.v1')!).state.challenge);
while (useGame.getState().phase !== 'complete') {
  game = useGame.getState();
  game.spin();
  useGame.getState().landSpin();
  game = useGame.getState();
  game.takeAttribute(game.currentPool()[0].id, game.remainingSlots()[0]);
}
useGame.getState().runSimulation();
game = useGame.getState();
assert.ok(game.career && game.challenge);
const outcome = dailyOutcome(game.challenge, game.career);
assert.deepEqual(dailyAttempt(game.challenge.date), { date: game.challenge.date, complete: true, ...outcome });
const career = game.career;
game.runSimulation();
assert.equal(useGame.getState().career, career);
game.setCreationName('Daily test');
assert.deepEqual(useGame.getState().hall[0].challenge, game.challenge);
game.abandonRun();
useGame.getState().startDaily();
assert.equal(useGame.getState().phase, 'setup', 'Completed daily cannot be restarted');
safeStorage.removeItem('builda99.daily.v1');
useGame.getState().startRun({ position: 'TE', era: 'current', hardMode: false });
const ordinaryId = useGame.getState().runId;
useGame.getState().startDaily();
assert.equal(useGame.getState().runId, ordinaryId, 'Daily cannot replace unfinished ordinary build');
useGame.getState().abandonRun();
useGame.getState().startDaily();
useGame.getState().abandonRun();
useGame.getState().startDaily();
assert.equal(useGame.getState().phase, 'setup', 'Quitting uses the attempt');
useGame.getState().deleteSaved(runId);

const player = CURRENT_BASE[0];
const update = { playerId: player.id, source: 'https://example.com/transaction', date: '2026-09-22' };
const moved = applyRosterUpdates([player], [{ ...update, teamId: 'buf', status: 'roster' }])[0];
assert.equal(moved.id, player.id);
assert.equal(moved.teamId, 'buf');
assert.deepEqual(moved.attributes, player.attributes);
assert.equal(applyRosterUpdates([player], [{ ...update, status: 'injured' }]).length, 1);
for (const status of ['practice-squad', 'free-agent', 'retired'] as const) {
  assert.equal(applyRosterUpdates([player], [{ ...update, status }]).length, 0);
}
assert.throws(() => applyRosterUpdates([player], [{ ...update, playerId: 'missing', status: 'roster' }]));
console.log('PASS: daily rotation, persistence, hard mode, completion, attempt limits and roster-only updates.');
