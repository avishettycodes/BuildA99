import type { Position } from '../data';

/** The caption people send with the result card. Keep it a challenge, not an explanation. */
export function resultShareText(overall: number, position: Position): string {
  return 'I built a ' + overall + ' overall ' + position + ' on Build a 99. Can you beat my build?';
}
