import { PLAYERS } from '../data';
import { computeOverall } from './scoring';
import { hashSeed } from './rng';

// One identity per name, even if a player has several franchise/era cards.
const unique = new Map<string, { id: string; name: string; position: typeof PLAYERS[number]['position']; rating: number }>();
for (const player of PLAYERS) {
  const key = player.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const rating = computeOverall(player.position, player.attributes).overall;
  const prior = unique.get(key);
  if (!prior || rating > prior.rating) unique.set(key, { id: player.id, name: player.name, position: player.position, rating });
}
const ranked = [...unique.values()].sort((a,b) => a.rating - b.rating || a.id.localeCompare(b.id));
const badCount = Math.floor(ranked.length * 2 / 7);
const mix = (a: typeof ranked[number], b: typeof ranked[number]) => hashSeed(`daily-roster-v1-${a.id}`) - hashSeed(`daily-roster-v1-${b.id}`) || a.id.localeCompare(b.id);
export const DAILY_BAD_PLAYERS = ranked.slice(0, badCount).sort(mix);
export const DAILY_GOOD_PLAYERS = ranked.slice(badCount).sort(mix);
