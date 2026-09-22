import assert from 'node:assert/strict';
import { dailyChallenge, dailyAttempt, dailyOutcome, dailyStats, dailyShareText, dailyHistory, localDailyDate, secondsUntilDailyReset, recordDaily } from '../src/lib/daily';
import { useGame } from '../src/store/gameStore';
import { safeStorage } from '../src/lib/storage';
import { simulateCareer } from '../src/lib/scoring';
import { careerLength } from '../src/lib/career';
import { ATTRIBUTE_SETS, CURRENT_BASE } from '../src/data';
import { applyRosterUpdates } from '../src/data/current/rosterUpdates';

const originalTimezone = process.env.TZ;
try {
  let sharedTarget: number | undefined;
  for (const timezone of ['UTC', 'America/Los_Angeles', 'America/New_York', 'Asia/Kolkata', 'Pacific/Kiritimati', 'Pacific/Honolulu']) {
    process.env.TZ = timezone;
    const first = dailyChallenge(new Date(2026, 8, 22));
    assert.equal(first.date, '2026-09-22', timezone);
    assert.deepEqual(first, dailyChallenge(new Date(2026, 8, 22, 23, 59, 59)), timezone);
    assert.notEqual(first.title, dailyChallenge(new Date(2026, 8, 23)).title, timezone);
    if (sharedTarget) assert.equal(first.target, sharedTarget, 'Same calendar date shares a target across time zones');
    sharedTarget = first.target;
    assert.equal(secondsUntilDailyReset(new Date(2026, 8, 22, 23, 59, 59)), 1, timezone);
    assert.equal(secondsUntilDailyReset(new Date(2026, 8, 23)), 86400, timezone);
    assert.equal(localDailyDate(new Date(2026, 11, 31, 24)), '2027-01-01', timezone);
    assert.equal(localDailyDate(new Date(2026, 8, 30, 24)), '2026-10-01', timezone);
  }
  process.env.TZ = 'America/Los_Angeles';
  assert.equal(localDailyDate(new Date('2026-09-23T00:00:00Z')), '2026-09-22', 'UTC midnight does not reset a local day');
  assert.deepEqual(dailyChallenge(new Date('2026-09-22T23:59:59Z')), dailyChallenge(new Date('2026-09-23T00:00:00Z')));
  assert.equal(secondsUntilDailyReset(new Date(2026, 2, 8)), 23 * 3600, 'Spring DST day');
  assert.equal(secondsUntilDailyReset(new Date(2026, 10, 1)), 25 * 3600, 'Fall DST day');
  process.env.TZ = 'Asia/Kolkata';
  assert.equal(localDailyDate(new Date('2026-09-22T18:30:00Z')), '2026-09-23', 'Local midnight can precede UTC midnight');
  safeStorage.removeItem('builda99.daily.v1');
  recordDaily({ date: '2026-09-22', hardMode: false, era: 'current', complete: true, won: true, score: 70 });
  assert.ok(dailyAttempt(dailyChallenge(new Date(2026, 8, 22, 23, 59, 59)).date));
  assert.equal(dailyAttempt(dailyChallenge(new Date(2026, 8, 23)).date), undefined, 'New local day gets a fresh attempt');
} finally {
  if (originalTimezone === undefined) delete process.env.TZ;
  else process.env.TZ = originalTimezone;
}
assert.equal(dailyChallenge(new Date(2026, 8, 22)).title, 'Beat Tom Brady');
assert.equal(dailyChallenge(new Date(2026, 8, 23)).title, 'Beat Jerry Rice');
for (let day = 1; day <= 30; day++) {
  const challenge = dailyChallenge(new Date(2026, 8, day));
  assert.equal(challenge.kind, 'rival');
  assert.equal(challenge.seed, undefined, 'Schedule must not predetermine spins or career');
  assert.ok(Number.isFinite(challenge.target) && challenge.target > 0);
}
safeStorage.removeItem('builda99.daily.v1');
useGame.getState().abandonRun();
useGame.getState().startDaily({ era: 'current' });
let game = useGame.getState();
assert.equal(game.hardMode, false);
assert.equal(game.era, 'current');
assert.equal(game.rerollsLeft, 2);
const normalSeed = game.seed;
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
assert.deepEqual(dailyAttempt(game.challenge.date, 'current'), { date: game.challenge.date, hardMode: false, era: 'current', challenge: game.challenge, complete: true, ...outcome });
assert.equal(outcome.won, game.career.careerYards > game.challenge.target, 'Yardage decides, not overall');
assert.match(dailyShareText(game.challenge, outcome.score, outcome.won), /Normal/);
assert.match(dailyShareText(game.challenge, outcome.score, outcome.won), /Current/);
const career = game.career;
game.runSimulation();
assert.equal(useGame.getState().career, career);
game.setCreationName('Daily test');
assert.deepEqual(useGame.getState().hall[0].challenge, game.challenge);
game.abandonRun();
useGame.getState().startDaily({ era: 'current' });
assert.equal(useGame.getState().phase, 'setup', 'Completed Current daily cannot be replayed');
useGame.getState().startDaily({ era: 'alltime' });
game = useGame.getState();
assert.equal(game.phase, 'ready', 'All-Time gets an independent daily attempt');
assert.equal(game.hardMode, false);
assert.equal(game.era, 'alltime');
assert.equal(game.rerollsLeft, 2);
assert.notEqual(game.seed, normalSeed, 'Attempts receive fresh random keys');
useGame.getState().abandonRun();
assert.equal(dailyAttempt(dailyChallenge().date, 'alltime')?.abandoned, true);
useGame.getState().startDaily({ era: 'alltime' });
assert.equal(useGame.getState().phase, 'setup', 'Quitting uses the All-Time attempt');
useGame.getState().deleteSaved(runId);
safeStorage.removeItem('builda99.daily.v1');
useGame.getState().startRun({ position: 'TE', era: 'current', hardMode: false });
const ordinaryId = useGame.getState().runId;
useGame.getState().startDaily();
assert.equal(useGame.getState().runId, ordinaryId, 'Daily cannot replace unfinished ordinary build');
useGame.getState().abandonRun();
// Legacy Hard history remains stored without consuming either new Normal attempt.
recordDaily({ date: dailyChallenge().date, complete: true, won: true, score: 100000 });
assert.equal(dailyAttempt(dailyChallenge().date, 'alltime'), undefined);
assert.equal(dailyAttempt(dailyChallenge().date, 'current'), undefined);
useGame.getState().startDaily();
useGame.getState().startRun({ position: 'TE', era: 'current', hardMode: false });
assert.equal(dailyAttempt(dailyChallenge().date, 'current')?.abandoned, true, 'Replacing a daily records its used attempt');
useGame.getState().abandonRun();
safeStorage.removeItem('builda99.daily.v1');
for (const date of ['2026-09-19', '2026-09-20', '2026-09-21']) recordDaily({ date, complete: true, won: date === '2026-09-20', hardMode: false });
recordDaily({ date: '2026-09-21', complete: true, won: false, hardMode: true });
assert.deepEqual(dailyStats(new Date(2026, 8, 22)), { current: 3, best: 3, played: 3, wins: 1 });
assert.equal(dailyStats(new Date(2026, 8, 23)).current, 0, 'Missing a date breaks the streak');
recordDaily({ date: '2026-09-22', complete: true, abandoned: true, won: false, hardMode: false });
assert.equal(dailyStats(new Date(2026, 8, 23)).current, 0, 'Quitting does not earn a streak day');
recordDaily({ date: '2026-09-22', complete: true, won: true, hardMode: true });
assert.deepEqual(dailyStats(new Date(2026, 8, 22)), { current: 4, best: 4, played: 4, wins: 2 });
// Completing yesterday after midnight must not erase today's entry.
recordDaily({ date: '2026-09-21', complete: true, won: true, hardMode: true });
assert.ok(dailyHistory().some((entry) => entry.date === '2026-09-22'));

// Even the hardest named target must be reachable in the ordinary career engine.
for (const [position, target] of [['QB', 89214], ['WR', 22895]] as const) {
  const perfect = Object.fromEntries(ATTRIBUTE_SETS[position].map((key) => [key, 99]));
  let cleared = false;
  for (let i = 0; i < 5000; i++) {
    const seed = position === 'QB' ? 'legend-ceiling-100614' : `legend-ceiling-${i}`;
    if (simulateCareer(position, perfect, seed, 'alltime').careerYards > target) { cleared = true; break; }
  }
  assert.ok(cleared, `${position} legend target must be possible in the career engine`);
}
let longCareers = 0;
for (let i = 0; i < 5000; i++) {
  const seed = `longevity-${i}`;
  const length = careerLength('QB', 99, seed);
  if (length.seasons >= 21) { longCareers++; assert.equal(length.cutShort, false); }
  assert.ok(length.seasons <= 23);
  assert.ok(careerLength('QB', 95, seed).seasons < 21, 'Ordinary builds do not get the elite longevity tail');
}
assert.ok(longCareers > 0 && longCareers < 50, 'Long elite QB careers remain rare');

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
console.log('PASS: local-midnight resets across time zones and DST, legend rotation, fresh spins, separate league limits, streaks, sharing and persistence and roster-only updates.');
