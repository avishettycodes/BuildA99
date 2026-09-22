import { ATTRIBUTE_SETS, PLAYERS_BY_ID, TEAMS, getPool } from '../data';
import { hashSeed, nextPick } from './rng';
import { simulateCareer } from './scoring';
import type { Position } from '../data';
import type { CareerResult } from './scoring';
import { readJSON, writeJSON } from './storage';

export type DailyChallenge = {
  date: string;
  position: Position;
  kind: 'rival' | 'worst';
  title: string;
  target: number;
  seed: string;
};
export type DailyAttempt = { date: string; complete: boolean; won?: boolean; score?: number };
const KEY = 'builda99.daily.v1';
// Retired-player regular-season totals, checked against Pro Football Reference:
// https://www.pro-football-reference.com/hof/
// https://www.profootballhof.com/players/joe-montana
const RIVALS = [
  { id: 'det-cjohnson', yards: 11619 },
  { id: 'det-barry', yards: 15269 },
  { id: 'sf-montana', yards: 40551 },
  { id: 'kc-tgonzalez', yards: 15127 },
];

const challengeCache = new Map<string, DailyChallenge>();

/** A legal witness prevents a shared daily wheel from making the target impossible. */
export function dailyWitness(position: Position, seed: string, worst = false) {
  let cursor = hashSeed(seed);
  const remaining = [...ATTRIBUTE_SETS[position]];
  const build: Partial<Record<typeof remaining[number], number>> = {};
  for (let spin = 0; spin < 7; spin++) {
    const draw = nextPick(cursor, TEAMS);
    cursor = draw.state;
    const pool = getPool(position, draw.value.id, 'alltime');
    const choices = remaining.map((key) => ({ key, value: (worst ? Math.min : Math.max)(...pool.map((player) => player.attributes[key] ?? 0)) }));
    choices.sort((a, b) => worst ? a.value - b.value : b.value - a.value);
    const pick = choices[0];
    build[pick.key] = pick.value;
    remaining.splice(remaining.indexOf(pick.key), 1);
  }
  return simulateCareer(position, build, seed, 'alltime');
}

/** Use the device's calendar date, so the challenge changes at local midnight. */
export function localDailyDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Calendar arithmetic accounts for 23- and 25-hour daylight-saving days. */
export function secondsUntilDailyReset(now = new Date()): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.ceil((midnight.getTime() - now.getTime()) / 1000);
}

/** The same local calendar date gives everyone the same card and wheel sequence. */
export function dailyChallenge(now = new Date()): DailyChallenge {
  const date = localDailyDate(now);
  const cached = challengeCache.get(date);
  if (cached) return cached;
  // UTC is only a stable calendar-day index here, not the reset time.
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  const seed = `daily-v1-${date}`;
  if (day % 5 === 0) {
    return { date, seed, position: 'RB', kind: 'worst', title: 'Build the worst running back', target: 75 };
  }
  const benchmark = RIVALS[day % RIVALS.length];
  const rival = PLAYERS_BY_ID[benchmark.id];
  // Search a bounded deterministic sequence. Only offer a rival if a legal build
  // can beat him on this exact wheel and career key; never weaken the benchmark.
  for (let attempt = 0; attempt < 256; attempt++) {
    const candidate = `${seed}-${attempt}`;
    if (dailyWitness(rival.position, candidate).careerYards <= benchmark.yards) continue;
    const challenge: DailyChallenge = { date, seed: candidate, position: rival.position, kind: 'rival', title: `Beat ${rival.name}`, target: benchmark.yards };
    challengeCache.set(date, challenge);
    return challenge;
  }
  const challenge: DailyChallenge = { date, seed, position: 'RB', kind: 'worst', title: 'Build the worst running back', target: 75 };
  challengeCache.set(date, challenge);
  return challenge;
}

export function dailyAttempt(date: string): DailyAttempt | undefined {
  const entries = readJSON<DailyAttempt[]>(KEY, []);
  return Array.isArray(entries) ? entries.find((entry) => entry?.date === date) : undefined;
}
export function recordDaily(attempt: DailyAttempt): void {
  const entries = readJSON<DailyAttempt[]>(KEY, []);
  writeJSON(KEY, [...(Array.isArray(entries) ? entries : []).filter((entry) => entry?.date !== attempt.date), attempt].slice(-60));
}
export function dailyOutcome(challenge: DailyChallenge, career: CareerResult) {
  const score = challenge.kind === 'worst' ? career.overall : career.careerYards;
  return { score, won: challenge.kind === 'worst' ? score <= challenge.target : score > challenge.target };
}
export function dailyGoal(challenge: DailyChallenge): string {
  return challenge.kind === 'worst'
    ? `Finish at ${challenge.target} overall or lower.`
    : `Top ${challenge.target.toLocaleString('en-US')} career ${challenge.position === 'QB' ? 'passing' : challenge.position === 'RB' ? 'rushing' : 'receiving'} yards. Beat his real regular-season total with your simulated career.`;
}
