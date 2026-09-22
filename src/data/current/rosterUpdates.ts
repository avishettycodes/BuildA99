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
export const ROSTER_UPDATES: RosterUpdate[] = [];

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
