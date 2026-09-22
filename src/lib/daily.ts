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
  seed?: string; // Legacy daily saves may still carry their original shared key.
  hardMode?: boolean;
  era?: Era;
};
export const DAILY_ATTEMPT_LIMIT = 2;
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
export function dailyChallenge(now = new Date()): DailyChallenge {
  const date = localDailyDate(now);
  // UTC arithmetic indexes calendar labels only; resets follow the local date above.
  const day = Math.floor((Date.parse(`${date}T00:00:00Z`) - Date.parse('2026-09-22T00:00:00Z')) / 86400000);
  const benchmark = RIVALS[((day % RIVALS.length) + RIVALS.length) % RIVALS.length];
  const rival = PLAYERS_BY_ID[benchmark.id];
  return { date, position: rival.position, kind: 'rival', title: `Beat ${rival.name}`, target: benchmark.yards };
}

export function dailyHistory(): DailyAttempt[] {
  const entries = readJSON<DailyAttempt[]>(KEY, []);
  return Array.isArray(entries) ? entries.filter((entry) => entry && typeof entry.date === 'string' && typeof entry.complete === 'boolean') : [];
}
export function dailyAttempts(date: string, era: Era = 'current'): DailyAttempt[] {
  return dailyHistory().filter((entry) => entry.date === date && entry.hardMode === false && (entry.era ?? 'alltime') === era)
    .sort((a, b) => (a.attempt ?? 1) - (b.attempt ?? 1));
}
export function dailyAttempt(date: string, era: Era = 'current'): DailyAttempt | undefined {
  return dailyAttempts(date, era).at(-1);
}
export function recordDaily(attempt: DailyAttempt): void {
  const entries = dailyHistory().filter((entry) => entry.date !== attempt.date || (entry.hardMode ?? true) !== (attempt.hardMode ?? true) || (entry.era ?? 'alltime') !== (attempt.era ?? 'alltime') || (entry.attempt ?? 1) !== (attempt.attempt ?? 1));
  writeJSON(KEY, [...entries, attempt].sort((a, b) => a.date.localeCompare(b.date)).slice(-7300));
}

/** Streaks count completed daily challenges, with either league counting once per date. */
export function dailyStats(now = new Date()) {
  const today = localDailyDate(now);
  const days = [...new Set(dailyHistory().filter((entry) => entry.complete && !entry.abandoned && entry.date <= today).map((entry) => entry.date))].sort();
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
    : `Top ${challenge.target.toLocaleString('en-US')} career ${challenge.position === 'QB' ? 'passing' : challenge.position === 'RB' ? 'rushing' : 'receiving'} yards. Beat his real regular-season total with your simulated career.`;
}
