import type { Player } from '../types';
import { TEAMS } from '../teams';

/** Roster-only maintenance. Never recalculate ratings for a trade or an injury. */
export type RosterUpdate = {
  playerId: string;
  teamId?: string;
  status: 'roster' | 'injured' | 'practice-squad' | 'free-agent' | 'retired';
  source: string;
  date: string;
};

// Add verified individual transactions here. Injured players remain playable;
// practice-squad, unsigned and retired players leave Current until eligible again.
export const ROSTER_UPDATES: RosterUpdate[] = [
  // October 16, 2026, checked against ESPN's team rosters, which mark injured reserve
  // and practice squad separately. Trades keep the player's frozen ratings; anybody on
  // a practice squad or on no roster at all leaves Current.
  { playerId: 'now-ari-harrison', teamId: 'hou', status: 'roster', source: 'https://www.espn.com/nfl/team/roster/_/name/hou', date: '2026-10-16' },
  { playerId: 'now-hou-wayne', teamId: 'mia', status: 'roster', source: 'https://www.espn.com/nfl/team/roster/_/name/mia', date: '2026-10-16' },
  { playerId: 'now-min-mccarthy', teamId: 'nyg', status: 'roster', source: 'https://www.espn.com/nfl/team/roster/_/name/nyg', date: '2026-10-16' },
  { playerId: 'now-no-estime', teamId: 'cle', status: 'roster', source: 'https://www.espn.com/nfl/team/roster/_/name/cle', date: '2026-10-16' },
  { playerId: 'now-nyg-obj', teamId: 'min', status: 'roster', source: 'https://www.espn.com/nfl/team/roster/_/name/min', date: '2026-10-16' },
  { playerId: 'now-was-kallen', teamId: 'mia', status: 'roster', source: 'https://www.espn.com/nfl/team/roster/_/name/mia', date: '2026-10-16' },
  { playerId: 'now-lar-xsmith', status: 'practice-squad', source: 'https://www.espn.com/nfl/team/roster/_/name/sf', date: '2026-10-16' },
  { playerId: 'now-cin-kwilliams', status: 'practice-squad', source: 'https://www.espn.com/nfl/team/roster/_/name/cin', date: '2026-10-16' },
  { playerId: 'now-lac-jennings', status: 'practice-squad', source: 'https://www.espn.com/nfl/team/roster/_/name/lac', date: '2026-10-16' },
  { playerId: 'now-mia-cook', status: 'practice-squad', source: 'https://www.espn.com/nfl/team/roster/_/name/mia', date: '2026-10-16' },
  { playerId: 'now-no-', status: 'practice-squad', source: 'https://www.espn.com/nfl/team/roster/_/name/no', date: '2026-10-16' },
  { playerId: 'now-lv-shorter', status: 'free-agent', source: 'https://www.espn.com/nfl/team/roster/_/name/lv', date: '2026-10-16' },
  { playerId: 'now-mia-rmiller', status: 'free-agent', source: 'https://www.espn.com/nfl/team/roster/_/name/mia', date: '2026-10-16' },
  { playerId: 'now-phi-dalton', status: 'free-agent', source: 'https://www.espn.com/nfl/team/roster/_/name/phi', date: '2026-10-16' },
  { playerId: 'now-sf-hodge', status: 'free-agent', source: 'https://www.espn.com/nfl/team/roster/_/name/sf', date: '2026-10-16' },
];

/** The newest roster move applied on top of the September 20 base. */
export const ROSTER_UPDATED = ROSTER_UPDATES.reduce((latest, update) => (update.date > latest ? update.date : latest), '2026-09-20');

export function applyRosterUpdates(players: Player[], updates: RosterUpdate[]): Player[] {
  const byId = new Map(players.map((player) => [player.id, player]));
  const latest = new Map<string, RosterUpdate>();
  for (const update of updates) {
    if (!byId.has(update.playerId)) throw new Error(`Unknown roster player: ${update.playerId}`);
    if (update.teamId && !TEAMS.some((team) => team.id === update.teamId)) throw new Error(`Unknown franchise: ${update.teamId}`);
    if (!/^https:\/\//.test(update.source) || !/^\d{4}-\d{2}-\d{2}$/.test(update.date)) throw new Error(`Roster update needs a source and date: ${update.playerId}`);
    latest.set(update.playerId, update);
  }
  return players.flatMap((player) => {
    const update = latest.get(player.id);
    if (!update) return [player];
    if (['practice-squad', 'free-agent', 'retired'].includes(update.status)) return [];
    // IDs and attributes remain stable even when the player changes franchises.
    return [{ ...player, teamId: update.teamId ?? player.teamId,
      years: update.teamId && update.teamId !== player.teamId ? `${update.date.slice(0, 4)}–present` : player.years }];
  });
}
