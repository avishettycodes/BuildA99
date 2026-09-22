import { forwardRef } from 'react';
import { ATTRIBUTE_LABELS, ATTRIBUTE_SETS, ERA_LABELS, TEAMS_BY_ID } from '../data';
import type { AttributeKey, Era, Position } from '../data';
import type { AccoladeDef, CareerResult } from '../lib/scoring';
import type { FilledSlot } from '../store/gameStore';
import { inkOn } from '../lib/contrast';
import { ratingColor } from './AttributeBar';
import { TrophyIcon } from './Icons';

type Props = {
  position: Position;
  era: Era;
  slots: Partial<Record<AttributeKey, FilledSlot>>;
  career: CareerResult;
  accolades: AccoladeDef[];
  hardMode: boolean;
  creationName: string;
  seasons: number;
  draft: string;
  yards: string;
  yardsLabel: string;
  touchdowns: string;
  touchdownsLabel: string;
};

const shortAward = (label: string) => {
  if (label === 'First-Team All-Pro') return '1ST TEAM ALL-PRO';
  if (label === 'Offensive Player of the Year') return 'OPOY';
  if (label === 'Hall of Fame') return 'HALL OF FAME';
  return label.toUpperCase();
};

/**
 * The report is the whole story; this is the one-frame version people can actually post.
 * It is deliberately 4:5, the portrait shape shared by the major social feeds, and every
 * picked player stays visible at phone width instead of disappearing behind a breakpoint.
 */
export const ShareCard = forwardRef<HTMLDivElement, Props>(function ShareCard({
  position,
  era,
  slots,
  career,
  accolades,
  hardMode,
  creationName,
  seasons,
  draft,
  yards,
  yardsLabel,
  touchdowns,
  touchdownsLabel,
}, ref) {
  const picks = ATTRIBUTE_SETS[position]
    .map((attribute) => ({ attribute, slot: slots[attribute] }))
    .filter((pick): pick is { attribute: AttributeKey; slot: FilledSlot } => Boolean(pick.slot));
  const earned = accolades.filter((award) => career.accolades[award.id]);

  return (
    <div
      ref={ref}
      data-share-card
      className="theme-fixed relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/15 bg-turf-950 p-4 text-white shadow-2xl sm:p-7"
      style={{
        backgroundImage:
          'radial-gradient(80% 55% at 100% 0%, rgba(255,212,0,.17), transparent 70%), linear-gradient(145deg, #11191d 0%, #06090b 70%)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-hazard" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-xl leading-none tracking-wide uppercase sm:text-3xl">
            Build a <span className="text-hazard">99</span>
          </div>
          <div className="mt-1 font-mono text-[7px] tracking-[0.2em] text-white/35 sm:text-[10px]">
            CAREER CARD{hardMode ? ' · HARD MODE' : ''}
          </div>
        </div>
        <div className="rounded border border-white/15 bg-white/6 px-2 py-1 font-mono text-[8px] tracking-[0.16em] text-white/60 sm:text-[11px]">
          {position} · {ERA_LABELS[era].toUpperCase()}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 border-b border-white/10 pb-3 sm:mt-5 sm:pb-5">
        <div className="min-w-0">
          <div className="truncate font-display text-3xl leading-none uppercase sm:text-5xl">
            {creationName.trim() || 'YOUR PLAYER'}
          </div>
          <div className="mt-1.5 font-mono text-[7px] tracking-[0.12em] text-white/45 sm:text-[10px]">
            {draft} · {seasons} SEASON{seasons === 1 ? '' : 'S'}
          </div>
        </div>
        <div className="shrink-0 text-center">
          <div
            className="font-display text-6xl leading-[0.75] tabular-nums sm:text-8xl"
            style={{ color: ratingColor(career.overall) }}
          >
            {career.overall}
          </div>
          <div className="mt-2 font-mono text-[7px] tracking-[0.2em] text-white/40 sm:text-[10px]">
            OVERALL
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-3">
        <div className="rounded-md bg-white/6 px-2 py-1.5 sm:px-3 sm:py-2.5">
          <div className="font-stat text-lg leading-none font-bold tabular-nums sm:text-3xl">{yards}</div>
          <div className="mt-1 truncate font-mono text-[6px] tracking-[0.1em] text-white/35 sm:text-[9px]">{yardsLabel}</div>
        </div>
        <div className="rounded-md bg-white/6 px-2 py-1.5 sm:px-3 sm:py-2.5">
          <div className="font-stat text-lg leading-none font-bold tabular-nums sm:text-3xl">{touchdowns}</div>
          <div className="mt-1 truncate font-mono text-[6px] tracking-[0.1em] text-white/35 sm:text-[9px]">{touchdownsLabel}</div>
        </div>
        <div className="rounded-md bg-white/6 px-2 py-1.5 sm:px-3 sm:py-2.5">
          <div className="font-stat text-lg leading-none font-bold tabular-nums text-hazard sm:text-3xl">{earned.length}/{accolades.length}</div>
          <div className="mt-1 font-mono text-[6px] tracking-[0.1em] text-white/35 sm:text-[9px]">ACCOLADES</div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {earned.length > 0 ? earned.map((award) => (
            <div
              key={award.id}
              className={`flex min-w-0 items-center gap-1 rounded border px-1.5 py-1 sm:gap-1.5 sm:px-2 sm:py-1.5 ${
                award.id === 'hof'
                  ? 'border-hazard/60 bg-hazard/12 text-hazard'
                  : 'border-white/15 bg-white/5 text-white/80'
              }`}
            >
              <TrophyIcon id={award.trophy} className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate font-mono text-[6px] font-bold tracking-[0.05em] sm:text-[8px]">
                {shortAward(award.label)}
              </span>
            </div>
          )) : (
            <div className="font-mono text-[7px] tracking-[0.16em] text-white/30 sm:text-[10px]">
              NO TROPHIES. RUN IT BACK.
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 sm:mt-5">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[7px] tracking-[0.18em] text-white/35 sm:mb-2 sm:text-[9px]">
          <span>BUILT FROM</span>
          <span>{picks.length} PICKS</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {picks.map(({ attribute, slot }) => {
            const team = TEAMS_BY_ID[slot.teamId];
            return (
              <div key={attribute} className="flex min-w-0 items-center gap-1.5 rounded-md bg-white/6 px-2 py-1.5 sm:gap-2 sm:px-3 sm:py-2.5">
                <span
                  className="w-7 shrink-0 rounded py-1 text-center font-mono text-[7px] font-bold sm:w-9 sm:text-[9px]"
                  style={{ backgroundColor: team.primary, color: inkOn(team.primary) }}
                >
                  {team.abbr}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-stat text-[10px] leading-[0.9] font-semibold sm:text-base sm:leading-none">{slot.playerName}</span>
                  <span className="mt-0.5 block truncate font-mono text-[6px] tracking-[0.06em] text-white/35 sm:text-[8px]">
                    {ATTRIBUTE_LABELS[attribute]}
                  </span>
                </span>
                <span className="shrink-0 font-stat text-base font-bold tabular-nums sm:text-xl" style={{ color: ratingColor(slot.value) }}>
                  {slot.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-3 flex items-center justify-between font-mono text-[6px] tracking-[0.15em] text-white/25 sm:inset-x-7 sm:bottom-5 sm:text-[9px]">
        <span>BUILD-A-99</span>
        <span>CAN YOU BEAT MY BUILD?</span>
      </div>
    </div>
  );
});
