// Frozen pre-v2 production, used only to render previously saved careers.
import type { AttributeKey, Position } from '../data';
import type { CareerStats, SeasonLine } from './career';
import { hashSeed, nextRandom } from './rng';
function stream(seed: string, tag: string): () => number {
  let state = hashSeed(`${seed}::${tag}`);
  return () => {
    const draw = nextRandom(state);
    state = draw.state;
    return draw.value;
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function bell(roll: () => number): number {
  return (roll() + roll() + roll()) / 3;
}

const PRODUCTION_CURVE = 2.2;
function production(overall: number): number {
  return Math.pow(clamp((overall - 58) / 41, 0, 1), PRODUCTION_CURVE);
}

const STARTER_GRADE = 0.80;

function playingTime(p: number): number {
  return Math.pow(clamp(p / STARTER_GRADE, 0, 1), 0.8);
}

const STARTER_LOAD = { QB: 490, RB: 270, WR: 74, TE: 52 } as const;

function lean(build: Partial<Record<AttributeKey, number>>, key: AttributeKey): number {
  return clamp(((build[key] ?? 76) - 76) / 20, -1.2, 1.2);
}

const ARC_PEAK = 1.4;
function arc(index: number, seasons: number): number {
  const x = seasons === 1 ? 0.35 : index / (seasons - 1);
  return (0.55 + 0.85 * Math.exp(-Math.pow((x - 0.35) / 0.42, 2))) / ARC_PEAK;
}

function legs(index: number): number {
  return clamp(1 - Math.pow(index / 12, 1.4), 0.15, 1);
}

function primeSeason(
  position: Position,
  build: Partial<Record<AttributeKey, number>>,
  overall: number,
): { yards: number; touchdowns: number; volume: number; secondary: number; secondaryYards: number } {
  const p = production(overall);
  const snaps = playingTime(p);

  if (position === 'QB') {
    const attempts = (STARTER_LOAD.QB + 60 * p) * snaps;

    const perAttempt = (5.9 + 1.75 * p) * (1 + 0.09 * lean(build, 'deepBall') + 0.04 * lean(build, 'armStrength'));
    const touchdowns = attempts * (0.030 + 0.030 * p) * (1 + 0.14 * lean(build, 'deepBall') + 0.08 * lean(build, 'clutch'));

    const picks = attempts * (0.048 - 0.022 * p) * (1 - 0.18 * lean(build, 'processing') - 0.12 * lean(build, 'accuracy'));

    const scramble = clamp(((build.mobility ?? 55) - 40) / 59, 0, 1);
    const rushing = (30 + 820 * Math.pow(scramble, 1.6)) * snaps;
    return {
      yards: attempts * perAttempt, touchdowns, volume: attempts,
      secondary: Math.max(1, picks), secondaryYards: rushing,
    };
  }

  if (position === 'RB') {
    const carries = (STARTER_LOAD.RB + 40 * p) * snaps * (1 + 0.08 * lean(build, 'power') + 0.06 * lean(build, 'size'));

    const perCarry = (3.6 + 1.0 * p) * (1 + 0.07 * lean(build, 'vision') + 0.05 * lean(build, 'burst'));

    const touchdowns = carries * (0.020 + 0.026 * p) * (1 + 0.20 * lean(build, 'power') + 0.10 * lean(build, 'size'));

    const catches = (20 + 42 * p) * snaps * (1 + 0.40 * lean(build, 'hands'));
    const perCatch = (7.0 + 2.5 * p) * (1 + 0.08 * lean(build, 'hands'));
    return {
      yards: carries * perCarry, touchdowns, volume: carries,
      secondary: catches, secondaryYards: catches * perCatch,
    };
  }

  if (position === 'WR') {

    const catches = (STARTER_LOAD.WR + 16 * p) * snaps * (1 + 0.07 * lean(build, 'hands') + 0.05 * lean(build, 'routeRunning'));

    const perCatch = (11 + 4.0 * p) * (1 + 0.06 * lean(build, 'speed') + 0.03 * lean(build, 'yac'));
    const touchdowns = catches * (0.055 + 0.055 * p) * (1 + 0.12 * lean(build, 'contestedCatch') + 0.10 * lean(build, 'size'));
    return { yards: catches * perCatch, touchdowns, volume: catches, secondary: 0, secondaryYards: 0 };
  }

  const catches = (STARTER_LOAD.TE + 12 * p) * snaps * (1 + 0.16 * lean(build, 'hands') + 0.06 * lean(build, 'toughness'));
  const perCatch = (9.5 + 3.8 * p) * (1 + 0.10 * lean(build, 'speed') + 0.07 * lean(build, 'yac'));
  const touchdowns = catches * (0.050 + 0.045 * p) * (1 + 0.14 * lean(build, 'hands') + 0.12 * lean(build, 'size'));
  return { yards: catches * perCatch, touchdowns, volume: catches, secondary: 0, secondaryYards: 0 };
}

export function legacyCareerStats(
  position: Position,
  build: Partial<Record<AttributeKey, number>>,
  overall: number,
  seasons: number,
  seed: string,
): CareerStats {
  const prime = primeSeason(position, build, overall);
  const roll = stream(seed, 'STATS');

  const lines: SeasonLine[] = [];
  for (let i = 0; i < seasons; i++) {

    const swing = 0.80 + 0.40 * bell(roll);
    const share = arc(i, seasons) * swing;
    lines.push({
      season: i + 1,
      yards: Math.round(prime.yards * share),
      touchdowns: Math.round(prime.touchdowns * share),
      volume: Math.round(prime.volume * share),

      secondary: Math.round(prime.secondary * (position === 'QB' ? 2 - share : share)),

      secondaryYards: Math.round(prime.secondaryYards * (position === 'QB' ? share * legs(i) : share)),
    });
  }

  const sum = (pick: (line: SeasonLine) => number) => lines.reduce((total, line) => total + pick(line), 0);
  const best = lines.reduce((a, b) => (b.yards > a.yards ? b : a), lines[0]);

  return {
    seasons: lines,
    yards: sum((l) => l.yards),
    touchdowns: sum((l) => l.touchdowns),
    volume: sum((l) => l.volume),
    secondary: sum((l) => l.secondary),
    secondaryYards: sum((l) => l.secondaryYards),
    best,
  };
}

