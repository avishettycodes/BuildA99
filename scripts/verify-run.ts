/** Drives the real store through deterministic runs, unique team draws and mode rules. */
import { safeStorage } from '../src/lib/storage';
import { quitNeedsConfirmation, useGame } from '../src/store/gameStore';
import { ATTRIBUTE_SETS, ERAS, getPool, positionsWithData } from '../src/data';
import type { AttributeKey, Era, Position } from '../src/data';

type Result = { picks: string[]; teams: string[]; ok: boolean; notes: string[] };

function playRun(seed: string, hardMode: boolean, position: Position = 'RB', era: Era = 'alltime'): Result {
  const s = useGame.getState();
  s.abandonRun();
  s.startRun({ position, hardMode, era, seed });

  const notes: string[] = [];
  const picks: string[] = [];
  const teams: string[] = [];
  let guard = 0;

  while (useGame.getState().phase !== 'complete' && guard++ < 100) {
    const g = useGame.getState();
    if (g.phase === 'ready') {
      g.spin();
      continue;
    }
    if (g.phase === 'spinning') { g.landSpin(); continue; }
    if (g.phase === 'picking') {
      const state = useGame.getState();
      teams.push(state.currentTeamId!);
      const pool = getPool(state.position, state.currentTeamId!, state.era);
      if (pool.length === 0) { notes.push('LANDED ON AN EMPTY POOL'); break; }
      const open = ATTRIBUTE_SETS[state.position].filter((k) => !state.slots[k]);
      // Greedy: take the best available number for any open slot.
      let best = { pid: '', attr: open[0], val: -1 };
      for (const p of pool) {
        for (const k of open) {
          const v = p.attributes[k] ?? 0;
          if (v > best.val) best = { pid: p.id, attr: k as AttributeKey, val: v };
        }
      }
      picks.push(`${best.attr}=${best.val}`);
      state.takeAttribute(best.pid, best.attr);
      continue;
    }
    notes.push(`unexpected phase: ${g.phase}`); break;
  }

  const g = useGame.getState();
  const keys = ATTRIBUTE_SETS[g.position];
  const allFilled = keys.every((k) => g.slots[k]);
  // Repeating a franchise is legal now, in both modes. What hard mode owes you is
  // nothing: no rerolls, and no way to talk your way out of a roster you do not like.
  const noRerollsInHardMode = !hardMode || g.rerollsLeft === 0;

  if (!allFilled) notes.push('not all slots filled');
  if (!noRerollsInHardMode) notes.push(`hard mode handed out ${g.rerollsLeft} rerolls`);

  return {
    picks, teams, notes,
    ok: allFilled && noRerollsInHardMode && notes.length === 0,
  };
}

console.log('Build a 99 — run simulation\n');

const a = playRun('GRIDIRON-7QX3', false);
const b = playRun('GRIDIRON-7QX3', false);
const hard = playRun('BLITZ-M4KP', true);

console.log('normal  GRIDIRON-7QX3 teams:', a.teams.join(' '));
console.log('replay  GRIDIRON-7QX3 teams:', b.teams.join(' '));
console.log('hard    BLITZ-M4KP    teams:', hard.teams.join(' '));
console.log('\nhard-mode build:', hard.picks.join('  '));

const deterministic = a.teams.join() === b.teams.join() && a.picks.join() === b.picks.join();

// A visited franchise must be excluded from subsequent draws.
function firstTeam(seed: string, visitedTeamIds: string[]): string | null {
  useGame.getState().abandonRun();
  useGame.getState().startRun({ position: 'TE', hardMode: false, era: 'current', seed });
  useGame.setState({ visitedTeamIds });
  useGame.getState().spin();
  return useGame.getState().currentTeamId;
}
const freshWheelTeam = firstTeam('UNIFORM-WHEEL', []);
const visitedWheelTeam = firstTeam('UNIFORM-WHEEL', [freshWheelTeam!]);
const visitedTeamsExcluded = freshWheelTeam !== null && visitedWheelTeam !== null && freshWheelTeam !== visitedWheelTeam;

// Normal grants exactly three rerolls; discarded franchises stay excluded.
useGame.getState().landSpin();
const rerollTeams = new Set([useGame.getState().currentTeamId]);
let rerollIsFresh = useGame.getState().rerollsLeft === 3;
for (let remaining = 2; remaining >= 0; remaining--) {
  useGame.getState().reroll();
  const state = useGame.getState();
  rerollIsFresh &&= state.phase === 'spinning' && state.rerollsLeft === remaining && !rerollTeams.has(state.currentTeamId);
  rerollTeams.add(state.currentTeamId);
  state.landSpin();
}
const exhaustedTeam = useGame.getState().currentTeamId;
useGame.getState().reroll();
rerollIsFresh &&= useGame.getState().phase === 'picking' && useGame.getState().currentTeamId === exhaustedTeam;

// Every position and both leagues must fill seven slots without repeated teams.
const FUZZ = 1500;
let stranded = 0;
let repeatedRuns = 0;
let fuzzed = 0;
const perPosition: string[] = [];
for (const era of ERAS) {
  for (const position of positionsWithData(era)) {
    let positionStranded = 0;
    let positionRepeats = 0;
    for (let i = 0; i < FUZZ; i++) {
      const hard = i % 2 === 0;
      const r = playRun(`FUZZ-${era}-${position}-${i}`, hard, position, era);
      fuzzed++;
      if (new Set(r.teams).size !== r.teams.length) positionRepeats++;
      if (!r.ok) {
        positionStranded++;
        if (stranded + positionStranded < 4) {
          console.log(`  FAIL ${era} ${position} ${hard ? 'hard' : 'normal'} seed ${i}: ${r.notes.join('; ')}`);
        }
      }
    }
    stranded += positionStranded;
    repeatedRuns += positionRepeats;
    perPosition.push(
      `  ${era} ${position}: ${positionRepeats}/${FUZZ} runs hit the same franchise twice, ` +
      `${positionStranded} stranded`,
    );
  }
}

// Repeated or stale landings cannot donate a second attribute from one player.
useGame.getState().abandonRun();
useGame.getState().startRun({ position: 'TE', hardMode: false, era: 'current', seed: 'REPEAT-LEADER' });
for (const attribute of ['hands', 'routeRunning', 'yac'] as const) {
  useGame.setState({ phase: 'picking', currentTeamId: 'ari' });
  useGame.getState().takeAttribute('now-ari-mcbride', attribute);
}
const repeatedLeaderState = useGame.getState();
let repeatedLeaderWorks = repeatedLeaderState.usedPlayerIds.length === 1 &&
  repeatedLeaderState.slots.hands?.playerId === 'now-ari-mcbride' &&
  !repeatedLeaderState.slots.routeRunning && !repeatedLeaderState.slots.yac &&
  !repeatedLeaderState.currentPool().some((player) => player.id === 'now-ari-mcbride');

// Slot history also protects older saves whose used-player list is incomplete.
useGame.setState({ usedPlayerIds: [] });
useGame.getState().takeAttribute('now-ari-mcbride', 'yac');
repeatedLeaderWorks &&= !useGame.getState().slots.yac &&
  !useGame.getState().currentPool().some((player) => player.id === 'now-ari-mcbride');

// --- Super Bowl roll properties -------------------------------------------------
// 1. Rolling is idempotent: re-running the simulation cannot change the outcome,
//    so nobody can refresh the results screen until they win a ring.
useGame.getState().abandonRun();
playRun('RING-TEST', false);
useGame.getState().runSimulation();
const firstRoll = useGame.getState().career!.superBowl;
useGame.getState().runSimulation();
useGame.getState().runSimulation();
const afterRepeat = useGame.getState().career!.superBowl;
const idempotent = firstRoll.roll === afterRepeat.roll && firstRoll.won === afterRepeat.won;

// 2. The roll is keyed on the seed alone, so two people who make DIFFERENT picks on
//    the same hidden run key face the identical coin — only build quality decides it.
function rollFor(seed: string, mode: 'greedy' | 'worst') {
  useGame.getState().abandonRun();
  useGame.getState().startRun({ position: 'RB', hardMode: false, era: 'alltime', seed });
  let guard = 0;
  while (useGame.getState().phase !== 'complete' && guard++ < 100) {
    const g = useGame.getState();
    if (g.phase === 'ready') { g.spin(); continue; }
    if (g.phase === 'spinning') { g.landSpin(); continue; }
    if (g.phase !== 'picking') break;
    const pool = getPool(g.position, g.currentTeamId!, g.era);
    const open = ATTRIBUTE_SETS[g.position].filter((k) => !g.slots[k]) as AttributeKey[];
    let pid = pool[0].id;
    let attr = open[0];
    let best = mode === 'greedy' ? -1 : 1e9;
    for (const p of pool) for (const k of open) {
      const v = p.attributes[k] ?? 0;
      if (mode === 'greedy' ? v > best : v < best) { best = v; pid = p.id; attr = k; }
    }
    useGame.getState().takeAttribute(pid, attr);
  }
  useGame.getState().runSimulation();
  return useGame.getState().career!;
}

const good = rollFor('SHARED-SEED-1', 'greedy');
const bad = rollFor('SHARED-SEED-1', 'worst');
const sameCoin = good.superBowl.roll === bad.superBowl.roll;
const betterBuildBetterOdds = good.superBowl.odds > bad.superBowl.odds;
const quitThresholdHolds = !quitNeedsConfirmation('setup') &&
  (['ready', 'spinning', 'picking', 'complete', 'results', 'stuck'] as const).every(quitNeedsConfirmation);
useGame.getState().abandonRun();
const cleared = useGame.getState();
const persisted = JSON.parse(safeStorage.getItem('megatron.run.v1')!).state;
const abandonmentClearsSave = !cleared.hasSavedRun() && !cleared.entered &&
  cleared.phase === 'setup' && cleared.runId === '' && Object.keys(cleared.slots).length === 0 &&
  cleared.career === null && persisted.phase === 'setup' && persisted.runId === '';


console.log(`\nnormal run completes:   ${a.ok ? 'PASS' : 'FAIL — ' + a.notes.join('; ')}`);
console.log(`hard run completes:     ${hard.ok ? 'PASS' : 'FAIL — ' + hard.notes.join('; ')}`);
console.log(`same seed, same run:    ${deterministic ? 'PASS' : 'FAIL'}`);
console.log(`prior teams excluded:  ${visitedTeamsExcluded ? 'PASS' : 'FAIL'}`);
console.log(`${fuzzed} fuzz runs, 0 stuck: ${stranded === 0 ? 'PASS' : `FAIL (${stranded} stranded)`}`);
console.log(perPosition.join('\n'));
console.log(`  ${repeatedRuns} of ${fuzzed} runs landed on a franchise more than once`);
console.log(`repeat player donation blocked: ${repeatedLeaderWorks ? 'PASS' : 'FAIL'}`);
console.log(`SB roll idempotent:     ${idempotent ? 'PASS' : 'FAIL — refreshing re-rolls the ring'}`);
console.log(`SB coin stable by run key: ${sameCoin ? 'PASS' : 'FAIL'} (roll ${good.superBowl.roll.toFixed(4)})`);
console.log(`  best build ${good.overall} OVR, ${(good.superBowl.odds * 100).toFixed(0)}% -> ${good.superBowl.won ? 'RING' : 'no ring'}`);
console.log(`  worst build ${bad.overall} OVR, ${(bad.superBowl.odds * 100).toFixed(0)}% -> ${bad.superBowl.won ? 'RING' : 'no ring'}`);
console.log(`better build, better odds: ${betterBuildBetterOdds ? 'PASS' : 'FAIL'}`);
console.log(`Every run exit asks: ${quitThresholdHolds ? 'PASS' : 'FAIL'}`);

console.log(`Abandon clears autosave: ${abandonmentClearsSave ? 'PASS' : 'FAIL'}`);

process.exit(
  a.ok && hard.ok && deterministic && visitedTeamsExcluded && rerollIsFresh && stranded === 0 && repeatedRuns === 0 && repeatedLeaderWorks &&
  idempotent && sameCoin && betterBuildBetterOdds && quitThresholdHolds && abandonmentClearsSave ? 0 : 1,
);
