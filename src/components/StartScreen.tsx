import { useEffect, useState } from 'react';
import { DATA_STATS } from '../data';
import { ROSTER_UPDATED } from '../data/current/rosterUpdates';
import type { Era, Position } from '../data';
import type { SavedPlayer } from '../lib/hall';
import type { Setup } from '../store/gameStore';
import { safeStorage } from '../lib/storage';
import { DailyCard } from './DailyCard';
import { HallOfBuilds } from './HallOfBuilds';
import { BallMark } from './Logo';

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE'];

/** A step number set like a down marker. */
function StepNo({ n }: { n: number }) {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 -skew-x-12 items-center justify-center rounded-md bg-hazard/15 ring-1 ring-hazard/40">
      <span className="skew-x-12 font-display text-lg text-hazard">{n}</span>
    </span>
  );
}

type Props = {
  onDaily: (opts: { era: Era }) => void;
  onStart: (opts: { position: Position; hardMode: boolean; era: Era }) => void;
  /** The league, position and mode to open on. See `Setup` in the store for why. */
  setup: Setup;
  hall: SavedPlayer[];
  onOpenSaved: (player: SavedPlayer) => void;
  onDeleteSaved: (id: string) => void;
};

export function StartScreen({
  onDaily, onStart, setup, hall, onOpenSaved, onDeleteSaved,
}: Props) {
  /*
    THE SCREEN OPENS ON WHAT YOU WERE JUST PLAYING.

    These three were hardcoded to running back, normal mode and the current league, so
    finishing a hard mode tight end run and tapping BUILD ANOTHER PLAYER put you back at
    the top of a form you had already filled in once. The run itself is gone by then, which
    is correct, but what you were in the mood for is not part of the run.

    Read once, on mount, and that is the whole of it. This screen unmounts for the length
    of a run and comes back fresh, so the initial value is always the setup of the run that
    just ended. Nothing here writes back: the store records a setup when a run actually
    starts, not while somebody is still flicking the switches.
  */
  const [section, setSection] = useState<'daily' | 'free'>(() => safeStorage.getItem('builda99.menu') === 'free' ? 'free' : 'daily');
  const [position, setPosition] = useState<Position>(setup.position);
  const [hardMode, setHardMode] = useState(setup.hardMode);
  const [era, setEra] = useState<Era>(setup.era);

  /**
   * Old shared links carried a public seed. Seeds are no longer a game option, so an old
   * link opens the ordinary setup screen and loses the obsolete query before it is copied.
   */
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('seed')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('seed');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  return (
    /*
      On a wide screen the masthead becomes a poster on the left and the game sits beside
      it, rather than one phone-width column floating in the middle of a monitor.
    */
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8 xl:grid xl:max-w-6xl xl:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] xl:items-start xl:gap-10 xl:py-10">
      {/*
        The masthead is a slice of field: mowed stripes, yard lines, a row of hash marks
        and the ball. It is always drawn as a night game, in either theme, the way the
        team banners are, because a pale field reads as a spreadsheet.
      */}
      <div className="theme-fixed rise relative mb-6 overflow-hidden rounded-2xl border border-white/10 px-5 pt-5 pb-5 sm:px-7 sm:pt-8 xl:mb-0 xl:flex xl:min-h-[660px] xl:flex-col xl:justify-end xl:px-8 xl:pb-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(70% 60% at 85% 0%, rgba(255, 244, 214, 0.16), transparent 65%)',
              'repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.09) 0 2px, transparent 2px 72px)',
              'repeating-linear-gradient(90deg, rgba(58, 140, 84, 0.22) 0 36px, rgba(22, 74, 43, 0.22) 36px 72px)',
              'linear-gradient(170deg, #143823 0%, #0c1f15 45%, #070c09 100%)',
            ].join(', '),
          }}
        />
        {/* Hash marks, one tick every 14.4px so five land between each yard line. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[38%] h-2.5 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.1)_0_2px,transparent_2px_14.4px)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <BallMark className="pointer-events-none absolute -top-1 -right-7 w-[150px] rotate-6 drop-shadow-[0_18px_30px_rgba(255,212,0,0.35)] sm:-top-3 sm:w-[230px] xl:top-6 xl:-right-12 xl:w-[320px]" />

        <div className="relative">
          <div className="kicker">Fan-made football game</div>
          <h2 className="mt-3 font-display text-[42px] leading-[0.95] uppercase sm:text-6xl xl:text-[56px] min-[1700px]:text-7xl">
            Steal a trait.<br /><span className="text-hazard">Chase a 99.</span>
          </h2>
          <p className="mt-3 max-w-sm text-[15px] leading-snug text-white/75 xl:mt-5 xl:max-w-md xl:text-lg">
            Spin for a franchise, take one rating from one of its players and keep going until all seven slots are full.
          </p>
          <ol className="mt-5 grid grid-cols-3 gap-2 xl:mt-8 xl:gap-3">
            {([
              ['Spin', 'Land on a team'],
              ['Steal', 'Take one rating'],
              ['Simulate', 'Live his career'],
            ] as const).map(([word, line], i) => (
              <li key={word} className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 backdrop-blur-sm sm:px-3 sm:py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex h-5 w-5 shrink-0 -skew-x-12 items-center justify-center rounded-[3px] bg-hazard">
                    <span className="skew-x-12 font-display text-[11px] text-turf-950">{i + 1}</span>
                  </span>
                  <span className="font-display text-base leading-none uppercase sm:text-lg">{word}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] leading-tight tracking-[0.04em] text-white/60">{line}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="min-w-0">
      <div className="rise rise-2 mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-turf-900 p-1" aria-label="Game type">
        {(['daily', 'free'] as const).map((item) => <button key={item} aria-pressed={section === item} onClick={() => { setSection(item); safeStorage.setItem('builda99.menu', item); }} className={`rounded-lg px-3 py-3 font-display text-xl tracking-wide uppercase transition-colors ${section === item ? 'bg-hazard text-turf-950' : 'text-white/60 hover:bg-white/5 hover:text-white/85'}`}>
          {item === 'daily' ? 'Daily challenge' : 'Free play'}
        </button>)}
      </div>
      {section === 'daily' ? <DailyCard onStart={onDaily} /> : <section className="rise rise-3 rounded-2xl border border-white/10 bg-turf-900/70 p-5 sm:p-6">
      <p className="mb-6 text-sm text-white/60">Build as many players as you like. Pick your league and make your own rules.</p>
      {/*
        THE LEAGUE COMES FIRST because it decides what everything after it means. Picking
        a position before knowing whether the pool is a franchise's whole history or the
        players on its depth chart this week is picking blind.

        CURRENT IS THE DEFAULT and all-time is the switch, which is the way round it
        should always have been. The players lining up this Sunday are who somebody opening
        this wants to argue about, and the whole history of a franchise is the deeper cut
        you go looking for.

        Same switch as the mode below it, on purpose. Two settings that work identically
        should look identical, and the box always names the league it is currently set to
        rather than describing the one you would get by tapping it.
      */}
      <h2 className="flex items-center gap-3 font-display text-2xl tracking-tight uppercase"><StepNo n={1} />Pick your league</h2>
      <button
        onClick={() => {
          const next = era === 'alltime' ? 'current' : 'alltime';
          setEra(next);
          // A position with no pool in the league you just switched to cannot stay
          // selected, or START would deal off an empty wheel.
          if (DATA_STATS.byEra[next][position] === 0) {
            const first = POSITIONS.find((p) => DATA_STATS.byEra[next][p] > 0);
            if (first) setPosition(first);
          }
        }}
        aria-pressed={era === 'alltime'}
        aria-label={era === 'current' ? 'Current players, switch to all time' : 'All time, switch to current players'}
        className={`mt-3 flex w-full items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
          era === 'alltime' ? 'border-sky-400 bg-sky-400/12' : 'border-white/12 bg-turf-800'
        }`}
      >
        <div className="min-w-0">
          <div
            className={`font-display text-lg tracking-tight uppercase ${era === 'alltime' ? 'text-sky-300' : ''}`}
          >
            {era === 'current' ? 'Current players' : 'All-time'}
          </div>
        </div>
        <div className="shrink-0 text-center">
          <div
            className={`h-6 w-11 rounded-full p-0.5 transition-colors ${era === 'alltime' ? 'bg-sky-400' : 'bg-white/20'}`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition-transform ${era === 'alltime' ? 'translate-x-5' : ''}`}
            />
          </div>
          <div className="mt-1 font-mono text-[9px] tracking-wider whitespace-nowrap text-white/35">
            {era === 'current' ? 'GO ALL-TIME' : 'GO CURRENT'}
          </div>
        </div>
      </button>

      {era === 'current' && (
        <p className="mt-3 font-mono text-[11px] text-white/45">
          Ratings stay fixed. Practice-squad players are excluded. Rosters updated {new Date(`${ROSTER_UPDATED}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
        </p>
      )}

      <h2 className="mt-8 flex items-center gap-3 font-display text-2xl tracking-tight uppercase"><StepNo n={2} />Pick your position</h2>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {POSITIONS.map((pos) => {
          const live = DATA_STATS.byEra[era][pos] > 0;
          return (
            <button
              key={pos}
              disabled={!live}
              onClick={() => setPosition(pos)}
              aria-pressed={position === pos}
              className={`rounded-lg border py-4 font-display text-2xl tracking-wide uppercase transition-all ${
                position === pos
                  ? 'scale-[1.04] border-transparent bg-hazard text-turf-950'
                  : live
                    ? 'border-white/10 bg-turf-800 hover:-translate-y-0.5 hover:border-white/25 hover:bg-turf-700'
                    : 'cursor-not-allowed border-white/5 bg-turf-800 text-white/20'
              }`}
            >
              {pos}
              {!live && <div className="font-mono text-[9px] opacity-60">SOON</div>}
            </button>
          );
        })}
      </div>

      <h2 className="mt-8 flex items-center gap-3 font-display text-2xl tracking-tight uppercase"><StepNo n={3} />Set the rules</h2>
      {/*
        THE PANEL NAMES THE MODE YOU ARE IN, and nothing here says ON or OFF any more.

        It used to be one setting called HARD MODE with a state on the end of it, so the
        default read "HARD MODE · OFF" with the normal rules printed underneath. That is
        a heading and a body that disagree: the words say hard mode and the sentence
        describes the other one, and you have to hold the OFF in your head to read it.

        Two modes, one switch, and the box always shows the name and the rules of the
        mode it is currently set to. `aria-pressed` still carries the hard mode state,
        since that is the thing being turned on underneath.
      */}
      <button
        onClick={() => setHardMode(!hardMode)}
        aria-pressed={hardMode}
        aria-label={hardMode ? 'Hard mode, switch to normal' : 'Normal mode, switch to hard'}
        className={`mt-3 flex w-full items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
          hardMode ? 'border-red-500 bg-red-500/12' : 'border-white/12 bg-turf-800'
        }`}
      >
        <div className="min-w-0">
          <div
            className={`font-display text-lg tracking-tight uppercase ${hardMode ? 'text-red-400' : ''}`}
          >
            {hardMode ? 'Hard mode' : 'Normal mode'}
          </div>
          <div className="font-mono text-[11px] text-white/50">
            {/*
              Both lines are a plain statement of the rules and nothing else. They have
              been a joke, a pitch and an explanation of why the rule is good, and every
              version got the same note back: say what it does. A player reading a
              settings screen is deciding, not being entertained.

              No comma before an "and" here either, which is a small thing that was asked
              for twice. Two short sentences beat one that pauses in the middle.
            */}
            {hardMode
              ? 'No rerolls. The pool hides every rating. You pick a player and choose the attribute you think is his best. You find out the rating as you go.'
              : 'Three rerolls. Every rating in the pool is visible. Each spin lands on a different franchise.'}
          </div>
        </div>
        <div className="shrink-0 text-center">
          <div
            className={`h-6 w-11 rounded-full p-0.5 transition-colors ${hardMode ? 'bg-red-500' : 'bg-white/20'}`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition-transform ${hardMode ? 'translate-x-5' : ''}`}
            />
          </div>
          {/*
            The switch on its own does not say what is on the other side of it, and with
            the ON and OFF gone there is nothing else to work it out from. This does.
          */}
          <div className="mt-1 font-mono text-[9px] tracking-wider whitespace-nowrap text-white/35">
            {hardMode ? 'GO NORMAL' : 'GO HARD'}
          </div>
        </div>
      </button>

      <button
        onClick={() => onStart({ position, hardMode, era })}
        className="mt-8 w-full rounded-lg bg-hazard py-5 font-display text-3xl tracking-wide text-turf-950 uppercase transition-transform hover:scale-[1.01] active:scale-100"
      >
        Build a player
      </button>

      </section>}

      <HallOfBuilds hall={hall} onOpen={onOpenSaved} onDelete={onDeleteSaved} />
      </div>
    </div>
  );
}
