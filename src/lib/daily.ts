import { PLAYERS_BY_ID } from '../data';
import type { Era, Position } from '../data';
import type { CareerResult } from './scoring';
import { readJSON, writeJSON } from './storage';

export type DailyChallenge = {
  attempt?: number;
  date: string;
  position: Position;
  kind: 'rival' | 'worst';
  title: string;
  target: number;
  legendTarget?: number;
  balanceVersion?: 1;
  seed?: string; // Legacy daily saves may still carry their original shared key.
  hardMode?: boolean;
  era?: Era;
};
export const DAILY_ATTEMPT_LIMIT = 1;
export type DailyAttempt = { attempt?: number; date: string; complete: boolean; won?: boolean; score?: number; hardMode?: boolean; era?: Era; abandoned?: boolean; challenge?: DailyChallenge };
const KEY = 'builda99.daily.v1';
// Retired-player regular-season totals, checked against Pro Football Reference:
// https://www.pro-football-reference.com/hof/
// https://www.profootballhof.com/players/joe-montana
// Brady: https://www.nfl.com/news/tom-brady-retirement-23-seasons-in-nfl-buccaneers-patriots
// Rice: https://www.profootballhof.com/players/jerry-rice
const RIVALS = [
  { id: 'ne-brady', yards: 89214 },
  { id: 'sf-rice', yards: 22895 },
  { id: 'det-cjohnson', yards: 11619 },
  { id: 'det-barry', yards: 15269 },
  { id: 'sf-montana', yards: 40551 },
  { id: 'kc-tgonzalez', yards: 15127 },
];
// Career totals: profootballhof.com/players/{randy-moss,antonio-gates,emmitt-smith}
// Walter Payton: nfl.com/players/walter-payton/stats/
const EXPANDED_RIVALS = [
  RIVALS[0], RIVALS[1], RIVALS[3], RIVALS[5],
  RIVALS[4], { id: 'min-moss', yards: 15292 },
  { id: 'dal-emmitt', yards: 18355 }, { id: 'lac-agates', yards: 11841 },
  RIVALS[2], { id: 'chi-payton', yards: 16726 },
];
export const DAILY_TARGET_FACTORS = [0.99, 0.995, 1, 1.005, 1.01] as const;
export function variedDailyTarget(base: number, factor: number): number {
  return Math.round(base * factor / 25) * 25;
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

/** A shared opponent, with fresh randomness generated when an attempt starts. */
export const DAILY_TARGETS: Record<Era, Record<Position, number>> = {
  current: { QB: 26000, RB: 8500, WR: 11000, TE: 4250 },
  alltime: { QB: 43500, RB: 13250, WR: 15250, TE: 8250 },
};

export function dailyChallenge(now = new Date(), era: Era = 'current'): DailyChallenge {
  const date = localDailyDate(now);
  // UTC arithmetic indexes calendar labels only; resets follow the local date above.
  const day = Math.floor((Date.parse(`${date}T00:00:00Z`) - Date.parse('2026-09-22T00:00:00Z')) / 86400000);
  // Start the expanded schedule tomorrow; existing calendar dates keep their goals.
  const freshDay = day - 7;
  const cycle = Math.floor(freshDay / EXPANDED_RIVALS.length);
  const slot = ((freshDay % EXPANDED_RIVALS.length) + EXPANDED_RIVALS.length) % EXPANDED_RIVALS.length;
  const benchmark = freshDay >= 0 ? EXPANDED_RIVALS[slot] : RIVALS[((day % RIVALS.length) + RIVALS.length) % RIVALS.length];
  const rival = PLAYERS_BY_ID[benchmark.id];
  const base = DAILY_TARGETS[era][rival.position];
  const target = freshDay >= 0 ? variedDailyTarget(base, DAILY_TARGET_FACTORS[(cycle + slot) % DAILY_TARGET_FACTORS.length]) : base;
  return { date, era, hardMode: false, position: rival.position, kind: 'rival', title: `${rival.name} Challenge`, target, legendTarget: benchmark.yards, balanceVersion: 1 };
}

export function dailyHistory(): DailyAttempt[] {
  const entries = readJSON<DailyAttempt[]>(KEY, []);
  return Array.isArray(entries) ? entries.filter((entry) => entry && typeof entry.date === 'string' && typeof entry.complete === 'boolean') : [];
}
export function dailyAttempts(date: string, era: Era = 'current', hardMode = false): DailyAttempt[] {
  return dailyHistory().filter((entry) => entry.date === date && (entry.hardMode ?? true) === hardMode && (entry.era ?? 'alltime') === era)
    .sort((a, b) => (a.attempt ?? 1) - (b.attempt ?? 1));
}
export function dailyAttempt(date: string, era: Era = 'current', hardMode = false): DailyAttempt | undefined {
  return dailyAttempts(date, era, hardMode).at(-1);
}
export function recordDaily(attempt: DailyAttempt): void {
  const entries = dailyHistory().filter((entry) => entry.date !== attempt.date || (entry.hardMode ?? true) !== (attempt.hardMode ?? true) || (entry.era ?? 'alltime') !== (attempt.era ?? 'alltime') || (entry.attempt ?? 1) !== (attempt.attempt ?? 1));
  writeJSON(KEY, [...entries, attempt].sort((a, b) => a.date.localeCompare(b.date)).slice(-7300));
}

/** Streaks count winning dates, with either league or difficulty counting once. */
export function dailyStats(now = new Date()) {
  const today = localDailyDate(now);
  const days = [...new Set(dailyHistory().filter((entry) => entry.complete && entry.won && !entry.abandoned && entry.date <= today).map((entry) => entry.date))].sort();
  const dayIndex = (date: string) => Date.parse(`${date}T00:00:00Z`) / 86400000;
  let best = 0, chain = 0, previous = -Infinity;
  for (const date of days) {
    const day = dayIndex(date);
    chain = day === previous + 1 ? chain + 1 : 1;
    best = Math.max(best, chain);
    previous = day;
  }
  const current = previous >= dayIndex(today) - 1 ? chain : 0;
  const wins = new Set(dailyHistory().filter((entry) => entry.complete && entry.won && entry.date <= today).map((entry) => entry.date)).size;
  return { current, best, played: days.length, wins };
}

export function dailyShareText(challenge: DailyChallenge, score: number, won: boolean): string {
  return `Build a 99 Daily · ${challenge.date}\n${challenge.title} · ${(challenge.era ?? 'alltime') === 'current' ? 'Current' : 'All-Time'} · ${(challenge.hardMode ?? true) ? 'Hard' : 'Normal'}\n${won ? 'CHALLENGE PASSED' : 'CHALLENGE FAILED'}: ${score.toLocaleString('en-US')} ${challenge.kind === 'worst' ? 'OVR' : 'career yards'} / ${challenge.target.toLocaleString('en-US')} target`;
}
export function dailyOutcome(challenge: DailyChallenge, career: CareerResult) {
  const score = challenge.kind === 'worst' ? career.overall : career.careerYards;
  return { score, won: challenge.kind === 'worst' ? score <= challenge.target : score > challenge.target };
}
export function dailyGoal(challenge: DailyChallenge): string {
  return challenge.kind === 'worst'
    ? `Finish at ${challenge.target} overall or lower.`
    : challenge.balanceVersion === 1
      ? `Beat the daily target of ${challenge.target.toLocaleString('en-US')} career ${challenge.position === 'QB' ? 'passing' : challenge.position === 'RB' ? 'rushing' : 'receiving'} yards. The target is tuned for ${challenge.era === 'current' ? 'Current' : 'All-Time'} builds; the legend’s real total is a separate bonus milestone.`
      : `Top ${challenge.target.toLocaleString('en-US')} career ${challenge.position === 'QB' ? 'passing' : challenge.position === 'RB' ? 'rushing' : 'receiving'} yards. Beat his real regular-season total with your simulated career.`;
}

/** Finishing either league counts once per date; abandoned runs never count. */
export function dailyCompletionStats(now = new Date()) {
  const today = localDailyDate(now);
  const days = [...new Set(dailyHistory().filter((entry) => entry.complete && !entry.abandoned && entry.date <= today).map((entry) => entry.date))].sort();
  const index = (date: string) => Date.parse(`${date}T00:00:00Z`) / 86400000;
  let best = 0, chain = 0, previous = -Infinity;
  for (const date of days) {
    const day = index(date);
    chain = day === previous + 1 ? chain + 1 : 1;
    best = Math.max(best, chain);
    previous = day;
  }
  return { current: previous >= index(today) - 1 ? chain : 0, best, completed: days.length };
}

/** Compare only earlier completed attempts with the same position and rules. */
export function dailyPersonalBest(challenge: DailyChallenge, score: number) {
  const scores = dailyHistory().filter((entry) => entry.complete && !entry.abandoned &&
    entry.date < challenge.date && Number.isFinite(entry.score) &&
    entry.challenge?.position === challenge.position && entry.challenge.kind === challenge.kind &&
    (entry.era ?? 'alltime') === (challenge.era ?? 'alltime') &&
    (entry.hardMode ?? true) === (challenge.hardMode ?? true))
    .map((entry) => entry.score!);
  const previous = scores.length ? (challenge.kind === 'worst' ? Math.min(...scores) : Math.max(...scores)) : null;
  return { previous, isBest: previous === null || (challenge.kind === 'worst' ? score < previous : score > previous), tied: score === previous };
}
