/**
 * Rebuild all four Current rooms from ESPN's live offensive depth charts and the latest
 * downloaded EA Madden ratings pages.
 *
 * Usage: npm run refresh:current -- /path/to/madden-html
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROSTERS, TEAMS } from '../src/data';
import { ATTRIBUTE_SETS } from '../src/data/types';
import type { AttributeKey, Player, Position } from '../src/data/types';
import {
  REQUIRED_MADDEN_STATS,
  calculateCurrentRatings,
  type CurrentRatingSource,
  type MaddenSource,
} from './current-rating-model';

const sourceDirectory = process.argv[2];
if (!sourceDirectory) throw new Error('Pass the directory containing downloaded EA ratings HTML.');

const SNAPSHOT_DATE = '2026-09-20';
const ESPN_TEAM_IDS: Record<string, string> = { was: 'wsh' };
const POSITIONS = ['QB', 'RB', 'WR', 'TE'] as const;

const normalizeName = (name: string) => name
  .normalize('NFKD')
  .replace(/[’']/g, '')
  .replace(/\./g, '')
  .replace(/\b(jr|sr|ii|iii|iv|v)\b/gi, '')
  .replace(/\s+/g, '')
  .toLowerCase();

const NAME_ALIASES: Record<string, string> = {
  'Hollywood Brown': 'Marquise Brown',
  'Nicholas Singleton': 'Nick Singleton',
  'Chig Okonkwo': 'Chigoziem Okonkwo',
  'J. Michael Sturdivant': 'J.Michael Sturdivant',
};

const TENURE_START: Record<string, number> = {
  'James Conner': 2021,
  'Trey Benson': 2024,
  'Tip Reiman': 2024,
  'Tyrell Shavers': 2023,
  'Dillon Gabriel': 2025,
  'Luke Musgrave': 2023,
  'Savion Williams': 2025,
  'Tank Dell': 2023,
  'Jayden Higgins': 2025,
  'Anthony Gould': 2024,
  'Will Mallory': 2023,
  'Dont\'e Thornton Jr.': 2025,
  'Jeshaun Jones': 2025,
  'Ben Yurosek': 2025,
  'Julian Hill': 2023,
  'Mason Tipton': 2024,
  'Johnny Wilson': 2024,
  'Grant Calcaterra': 2022,
  'Isaac Guerendo': 2024,
  'Ricky Pearsall': 2024,
  'Brandon Aiyuk': 2020,
  'Brayden Willis': 2023,
  'Zach Charbonnet': 2023,
  'Jake Bobo': 2023,
  'Jeremy McNichols': 2024,
};

type EaPlayer = {
  id: number;
  firstName: string;
  lastName: string;
  height: number;
  weight: number;
  overallRating: number;
  college?: string;
  yearsPro?: number;
  team: { label: string } | null;
  position: { shortLabel: string };
  iteration?: { label?: string };
  stats: Record<string, { value: number }>;
};

type EspnDepthChart = {
  timestamp?: string;
  depthchart?: {
    name?: string;
    positions?: Record<string, {
      position?: { abbreviation?: string };
      athletes?: { displayName: string }[];
    }>;
  }[];
};

type EspnBio = {
  id?: string;
  fullName: string;
  height?: number;
  weight?: number;
  experience?: { years?: number };
  college?: { name?: string };
};

const MADDEN_TOOLS_STATS: Record<string, string> = {
  acceleration: 'rating_acceleration', agility: 'rating_agility', awareness: 'rating_awareness',
  bCVision: 'rating_ball_carrier_vision', breakSack: 'rating_break_sack',
  breakTackle: 'rating_break_tackle', catchInTraffic: 'rating_catch_in_traffic',
  catching: 'rating_catching', changeOfDirection: 'rating_change_of_direction',
  deepRouteRunning: 'rating_route_running_deep', impactBlocking: 'rating_impact_block',
  jukeMove: 'rating_juke_move', leadBlock: 'rating_lead_block',
  jumping: 'rating_jumping',
  mediumRouteRunning: 'rating_route_running_medium', passBlock: 'rating_pass_block',
  playAction: 'rating_play_action', release: 'rating_release', runBlock: 'rating_run_block',
  shortRouteRunning: 'rating_route_running_short', spectacularCatch: 'rating_spectacular_catch',
  speed: 'rating_speed', spinMove: 'rating_spin_move', stiffArm: 'rating_stiff_arm',
  strength: 'rating_strength', throwAccuracyDeep: 'rating_throw_accuracy_deep',
  throwAccuracyMid: 'rating_throw_accuracy_medium', throwAccuracyShort: 'rating_throw_accuracy_short',
  throwPower: 'rating_throw_power', throwUnderPressure: 'rating_throw_under_pressure',
  toughness: 'rating_toughness', trucking: 'rating_trucking',
};

const eaPlayers = new Map<string, EaPlayer>();
for (const filename of fs.readdirSync(sourceDirectory).filter((name) => name.endsWith('.html')).sort()) {
  const html = fs.readFileSync(path.join(sourceDirectory, filename), 'utf8');
  const payload = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)?.[1];
  if (!payload) continue;
  const page = JSON.parse(payload).props.pageProps;
  if (filename.startsWith('madden-tools-') && page.player) {
    const item = page.player as Record<string, number | string>;
    const stats = Object.fromEntries(Object.entries(MADDEN_TOOLS_STATS).flatMap(([key, property]) => {
      const value = item[property];
      return typeof value === 'number' ? [[key, { value }]] : [];
    }));
    const player: EaPlayer = {
      id: item.id as number,
      firstName: item.first_name as string,
      lastName: item.last_name as string,
      height: item.height as number,
      weight: item.weight as number,
      overallRating: item.rating_overall as number,
      college: page.college?.name,
      yearsPro: item.years_pro as number,
      team: page.team?.name ? { label: page.team.name } : null,
      position: { shortLabel: item.position as string },
      iteration: { label: page.currentIteration?.name ?? 'Madden NFL 27' },
      stats,
    };
    eaPlayers.set(normalizeName(`${player.firstName} ${player.lastName}`), player);
    continue;
  }
  const players: EaPlayer[] = page.ratingDetails?.items ?? page.ratingsEntries?.items ?? [];
  for (const player of players) {
    eaPlayers.set(normalizeName(`${player.firstName} ${player.lastName}`), player);
  }
}

const oldByName = new Map(ROSTERS.current.map((player) => [normalizeName(player.name), player]));
const usedIds = new Set<string>();
const slug = (name: string) => normalizeName(name).replace(/[^a-z0-9]/g, '');
const quote = (value: string) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const makeId = (teamId: string, name: string) => {
  const last = slug(name.split(/\s+/).at(-1) ?? name);
  let id = `now-${teamId}-${last}`;
  if (usedIds.has(id)) id = `now-${teamId}-${slug(name)}`;
  if (usedIds.has(id)) throw new Error(`Could not make a unique id for ${name}`);
  return id;
};

const STAT_LABELS: Record<string, string> = {
  acceleration: 'acceleration', agility: 'agility', awareness: 'awareness',
  bCVision: 'vision', breakSack: 'strength through contact', breakTackle: 'broken tackles',
  catching: 'catching', changeOfDirection: 'change of direction', deepRouteRunning: 'deep routes',
  impactBlocking: 'impact blocking', jukeMove: 'juke move', leadBlock: 'lead blocking',
  jumping: 'jumping',
  mediumRouteRunning: 'medium routes', passBlock: 'pass blocking', playAction: 'play action',
  release: 'release', runBlock: 'run blocking', shortRouteRunning: 'short routes',
  speed: 'speed', spinMove: 'spin move', spectacularCatch: 'spectacular catch',
  stiffArm: 'stiff arm', strength: 'strength', throwAccuracyDeep: 'deep accuracy',
  throwAccuracyMid: 'mid accuracy', throwAccuracyShort: 'short accuracy',
  throwPower: 'throw power', throwUnderPressure: 'throws under pressure', toughness: 'toughness',
  trucking: 'trucking', catchInTraffic: 'traffic catches',
};

function newBlurb(name: string, teamId: string, position: Position, rank: number, ea: EaPlayer) {
  if (name === 'Kevin Austin Jr.') return 'Kevin Austin Jr.: 200 pounds and 92 jumping; NO WR2.';
  const relevant = REQUIRED_MADDEN_STATS[position]
    .map((key) => [key, ea.stats[key]?.value ?? 0] as const)
    .sort((a, b) => b[1] - a[1]);
  const [bestKey, bestValue] = relevant[0];
  const college = ea.college || 'college ball';
  const team = TEAMS.find((entry) => entry.id === teamId)!;
  const lastName = name.split(/\s+/).at(-1)?.replace(/\.$/, '') ?? name;
  const blurb = `${name}: ${college}; ${ea.weight} pounds, ${bestValue} ` +
    `${STAT_LABELS[bestKey]}, ${team.abbr} ${position}${rank}.`;
  if (blurb.length > 96) {
    return `${lastName}'s best Madden number is ${bestValue} ${STAT_LABELS[bestKey]}, and ${team.abbr} kept him.`;
  }
  return blurb;
}

const live: { teamId: string; name: string; position: Position; rank: number }[] = [];
const espnBios = new Map<string, EspnBio>();
let latestEspnTimestamp = '';
for (const team of TEAMS) {
  const espnId = ESPN_TEAM_IDS[team.id] ?? team.id;
  const [chartResponse, rosterResponse] = await Promise.all([
    fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${espnId}/depthcharts`),
    fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${espnId}/roster`),
  ]);
  if (!chartResponse.ok) throw new Error(`${team.abbr} depth-chart request failed: ${chartResponse.status}`);
  if (!rosterResponse.ok) throw new Error(`${team.abbr} roster request failed: ${rosterResponse.status}`);
  const chart = await chartResponse.json() as EspnDepthChart;
  const roster = await rosterResponse.json() as { athletes?: { items?: EspnBio[] }[] };
  for (const athlete of (roster.athletes ?? []).flatMap((group) => group.items ?? [])) {
    espnBios.set(`${team.id}:${normalizeName(athlete.fullName)}`, athlete);
  }
  if (chart.timestamp && chart.timestamp > latestEspnTimestamp) latestEspnTimestamp = chart.timestamp;

  for (const group of chart.depthchart ?? []) {
    if (/defense|special/i.test(group.name ?? '')) continue;
    for (const room of Object.values(group.positions ?? {})) {
      const position = room.position?.abbreviation as Position;
      if (!POSITIONS.includes(position)) continue;
      for (const [index, athlete] of (room.athletes ?? []).entries()) {
        if (!live.some((entry) => entry.teamId === team.id && entry.position === position &&
          normalizeName(entry.name) === normalizeName(athlete.displayName))) {
          live.push({ teamId: team.id, name: athlete.displayName, position, rank: index + 1 });
        }
      }
    }
  }
}

const missing: string[] = [];
const estimatedPlayers: string[] = [];
const sourceRows: { source: CurrentRatingSource; meta: Player }[] = [];

function estimatedPlayer(
  entry: { teamId: string; name: string; position: Position; rank: number },
  bio: EspnBio,
): EaPlayer {
  const depthPenalty = Math.min(8, Math.max(0, entry.rank - 1) * 2);
  const defaults: Record<Position, Record<string, number>> = {
    QB: {
      acceleration: 78, agility: 76, awareness: 60, breakSack: 62,
      changeOfDirection: 74, playAction: 65, speed: 77, throwAccuracyDeep: 68,
      throwAccuracyMid: 72, throwAccuracyShort: 77, throwPower: 85,
      throwUnderPressure: 70, toughness: 80,
    },
    RB: {
      acceleration: 88, agility: 82, awareness: 60, bCVision: 72, breakTackle: 73,
      catching: 68, changeOfDirection: 81, jukeMove: 79, speed: 87, spinMove: 74,
      stiffArm: 70, strength: 68, trucking: 72,
    },
    WR: {
      acceleration: 87, agility: 81, bCVision: 71, breakTackle: 69, catching: 72,
      catchInTraffic: 70, changeOfDirection: 80, deepRouteRunning: 65, jukeMove: 77,
      jumping: 82,
      mediumRouteRunning: 67, release: 68, shortRouteRunning: 70, spectacularCatch: 72,
      speed: 86, spinMove: 72, strength: 58,
    },
    TE: {
      agility: 72, bCVision: 67, breakTackle: 70, catching: 72,
      catchInTraffic: 74, changeOfDirection: 69, deepRouteRunning: 56,
      impactBlocking: 64, jukeMove: 65, leadBlock: 61, mediumRouteRunning: 61,
      passBlock: 60, runBlock: 63, shortRouteRunning: 66, speed: 78,
      spinMove: 60, strength: 70, toughness: 82,
    },
  };
  const stats = Object.fromEntries(Object.entries(defaults[entry.position]).map(([key, value]) => [
    key,
    { value: Math.max(45, value - depthPenalty) },
  ]));
  const split = entry.name.split(/\s+/);
  return {
    id: -Number(bio.id ?? sourceRows.length + 1),
    firstName: split.slice(0, -1).join(' '),
    lastName: split.at(-1) ?? entry.name,
    height: bio.height ?? (entry.position === 'TE' ? 76 : 72),
    weight: bio.weight ?? (entry.position === 'TE' ? 245 : 205),
    overallRating: Math.max(50, 64 - depthPenalty),
    college: bio.college?.name,
    yearsPro: bio.experience?.years,
    team: { label: TEAMS.find((team) => team.id === entry.teamId)?.name ?? entry.teamId },
    position: { shortLabel: entry.position === 'RB' ? 'HB' : entry.position },
    iteration: { label: 'Conservative estimate; not in Madden NFL 27 database' },
    stats,
  };
}

for (const entry of live) {
  const old = oldByName.get(normalizeName(entry.name));
  const sourceName = NAME_ALIASES[entry.name] ?? entry.name;
  let ea = eaPlayers.get(normalizeName(sourceName));
  if (!ea) {
    const bio = espnBios.get(`${entry.teamId}:${normalizeName(entry.name)}`);
    if (bio) {
      ea = estimatedPlayer(entry, bio);
      estimatedPlayers.push(entry.name);
    }
  }
  if (!ea) {
    missing.push(`${entry.teamId.toUpperCase()} ${entry.position} ${entry.name}`);
    continue;
  }
  const id = old?.id ?? makeId(entry.teamId, entry.name);
  if (usedIds.has(id)) throw new Error(`Duplicate id ${id}`);
  usedIds.add(id);
  const stats = Object.fromEntries(REQUIRED_MADDEN_STATS[entry.position].map((key) => {
    const value = ea.stats[key]?.value;
    if (typeof value !== 'number') throw new Error(`${sourceName} is missing ${key}`);
    return [key, value];
  }));
  const madden: MaddenSource = {
    id: ea.id,
    name: `${ea.firstName} ${ea.lastName}`,
    team: ea.team?.label ?? null,
    position: ea.position.shortLabel,
    overall: ea.overallRating,
    height: ea.height,
    weight: ea.weight,
    stats,
  };
  const years = old?.years ?? `${TENURE_START[entry.name] ?? 2026}–`;
  const generatedBefore = old && (
    /best Madden number|Madden puts| sent him here |Madden likes|he brings \d+/.test(old.blurb) ||
    /^[^:]+: .*; \d+ pounds, \d+/.test(old.blurb)
  );
  const blurb = old && !generatedBefore
    ? old.blurb
    : newBlurb(entry.name, entry.teamId, entry.position, entry.rank, ea);
  sourceRows.push({
    source: { id, name: entry.name, teamId: entry.teamId, position: entry.position, madden },
    meta: { id, name: entry.name, teamId: entry.teamId, position: entry.position, years, blurb, attributes: {} },
  });
}

if (missing.length) {
  console.error(`No official Madden rating found for ${missing.length} depth-chart player(s):`);
  for (const player of missing) console.error(`  ${player}`);
  process.exit(1);
}

const sources = sourceRows.map((row) => row.source);
const ratings = calculateCurrentRatings(sources);
const ABBR: Record<Position, string[]> = {
  QB: ['ARM', 'ACC', 'DEEP', 'PKT', 'MOB', 'PRO', 'CLT'],
  RB: ['SPD', 'BRS', 'JKE', 'PWR', 'VIS', 'HND', 'SZE'],
  WR: ['SPD', 'HND', 'RTE', 'RLS', 'CTC', 'YAC', 'SZE'],
  TE: ['HND', 'BLK', 'SPD', 'RTE', 'YAC', 'TGH', 'SZE'],
};
const propertyRows: Record<Position, string> = {
  QB: 'armStrength, accuracy, deepBall, pocketPresence, mobility, processing, clutch',
  RB: 'speed, burst, juke, power, vision, hands, size',
  WR: 'speed, hands, routeRunning, release, contestedCatch, yac, size',
  TE: 'hands, blocking, speed, routeRunning, yac, toughness, size',
};
const exportNames: Record<Position, string> = {
  QB: 'QB_CURRENT', RB: 'RB_CURRENT', WR: 'WR_CURRENT', TE: 'TE_CURRENT',
};

for (const position of POSITIONS) {
  const groups = TEAMS.map((team) => {
    const rows = sourceRows.filter((row) =>
      row.source.position === position && row.source.teamId === team.id,
    );
    const lines = rows.map(({ source, meta }) => {
      const attributes = ratings.get(source.id)!;
      const values = ATTRIBUTE_SETS[position].map((key) => attributes[key]);
      return `    [${[quote(source.id), quote(source.name), quote(meta.years), quote(meta.blurb), ...values].join(', ')}],`;
    });
    return `  ${team.id}: [\n${lines.join('\n')}\n  ],`;
  });
  const lower = position.toLowerCase();
  const content = `import type { Player } from '../types';

/**
 * 2026 Week 2 offensive depth charts as of September 20. Ratings are generated from
 * EA SPORTS Madden NFL 27 Week 1 ratings, the latest official update on this date.
 *
 * Row format:
 *   [id, name, years, blurb, ${ABBR[position].join(', ')}]
 */

type Row = [string, string, string, string, number, number, number, number, number, number, number];

const POOLS: Record<string, Row[]> = {
${groups.join('\n')}
};

export const ${exportNames[position]}: Player[] = Object.entries(POOLS).flatMap(([teamId, rows]) =>
  rows.map(([id, name, years, blurb, ${propertyRows[position]}]) => ({
    id,
    name,
    teamId,
    position: '${position}' as const,
    years,
    blurb,
    attributes: { ${propertyRows[position]} },
  })),
);
`;
  fs.writeFileSync(path.resolve(`src/data/current/${lower}.ts`), content);
}

const fixture = {
  season: 2026,
  week: 2,
  snapshotDate: SNAPSHOT_DATE,
  ratingSource: 'EA SPORTS Madden NFL 27 Week 1 ratings (latest published as of September 20, 2026)',
  ratingSourceUrl: 'https://www.ea.com/games/madden-nfl/ratings',
  rosterSources: [
    'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{team}/depthcharts',
  ],
  rosterSourceTimestamp: latestEspnTimestamp,
  eligibility: 'Offensive depth chart as of September 20, 2026; excludes practice squad and reserve lists',
  ratingMethod: 'Official EA Week 1 ratings where available; Madden Tools Week 2 data for players removed from EA search; conservative position-and-depth estimates only for players absent from both databases',
  estimatedPlayers,
  explicitExclusions: [],
  players: sources,
};

fs.writeFileSync(
  path.resolve('scripts/fixtures/current-2026-09-20.json'),
  `${JSON.stringify(fixture, null, 2)}\n`,
);

console.log(
  `Updated ${sources.length} current-player cards from ESPN depth charts at ${latestEspnTimestamp} ` +
  `and Madden NFL 27 ratings (${estimatedPlayers.length} conservative estimates).`,
);
