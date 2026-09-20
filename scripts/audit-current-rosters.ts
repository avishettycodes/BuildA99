/**
 * Compare the checked-in Current rooms with ESPN's live offensive depth charts.
 * This is deliberately read-only; it makes roster drift visible before a refresh.
 */
import { ROSTERS, TEAMS } from '../src/data';
import type { Position } from '../src/data';

const ESPN_TEAM_IDS: Record<string, string> = { was: 'wsh' };
const POSITIONS = new Set<Position>(['QB', 'RB', 'WR', 'TE']);
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

const normalize = (value: string) => value
  .normalize('NFKD')
  .replace(/[’']/g, '')
  .replace(/\./g, '')
  .replace(/\b(jr|sr|ii|iii|iv|v)\b/gi, '')
  .replace(/\s+/g, '')
  .toLowerCase();

let changes = 0;
let latestTimestamp = '';

for (const team of TEAMS) {
  const espnId = ESPN_TEAM_IDS[team.id] ?? team.id;
  const response = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${espnId}/depthcharts`,
  );
  if (!response.ok) throw new Error(`${team.abbr} depth-chart request failed: ${response.status}`);
  const chart = await response.json() as EspnDepthChart;
  if (chart.timestamp && chart.timestamp > latestTimestamp) latestTimestamp = chart.timestamp;

  const live = (chart.depthchart ?? [])
    .filter((group) => !/defense|special/i.test(group.name ?? ''))
    .flatMap((group) => Object.values(group.positions ?? {}))
    .flatMap((room) => (room.athletes ?? []).map((athlete) => ({
      fullName: athlete.displayName,
      position: room.position?.abbreviation as Position,
    })))
    .filter((athlete) => POSITIONS.has(athlete.position));
  const checkedIn = ROSTERS.current.filter((player) => player.teamId === team.id);

  for (const position of POSITIONS) {
    const liveAtPosition = live.filter((athlete) => athlete.position === position);
    const checkedAtPosition = checkedIn.filter((player) => player.position === position);
    const additions = liveAtPosition.filter((athlete) => !checkedAtPosition.some(
      (player) => normalize(player.name) === normalize(athlete.fullName),
    ));
    const removals = checkedAtPosition.filter((player) => !liveAtPosition.some(
      (athlete) => normalize(athlete.fullName) === normalize(player.name),
    ));

    if (!additions.length && !removals.length) continue;
    changes += additions.length + removals.length;
    console.log(`${team.abbr} ${position}`);
    for (const athlete of additions) {
      console.log(`  + ${athlete.fullName}`);
    }
    for (const player of removals) console.log(`  - ${player.name}`);
  }
}

console.log(`\nESPN snapshot ${latestTimestamp || 'unknown'} — ${changes} roster difference(s).`);
