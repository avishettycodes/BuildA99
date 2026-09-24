import { useEffect, useState } from 'react';
import { DATA_STATS } from '../data';
import type { Era, Position } from '../data';
import type { SavedPlayer } from '../lib/hall';
import type { Setup } from '../store/gameStore';
import { safeStorage } from '../lib/storage';
import { DailyCard } from './DailyCard';
import { HallOfBuilds } from './HallOfBuilds';

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE'];

type Props = {
  onDaily: (opts: { era: Era; hardMode?: boolean }) => void;
  onStart: (opts: { position: Position; hardMode: boolean; era: Era }) => void;
  /** The league, position and mode to open on. See `Setup` in the store for why. */
  setup: Setup;
  canResume: boolean;
  onResume: () => void;
  hall: SavedPlayer[];
  onOpenSaved: (player: SavedPlayer) => void;
  onDeleteSaved: (id: string) => void;
};

export function StartScreen({
  onDaily, onStart, setup, canResume, onResume, hall, onOpenSaved, onDeleteSaved,
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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-turf-900 p-1" aria-label="Game type">
        {(['daily', 'free'] as const).map((item) => <button key={item} aria-pressed={section === item} onClick={() => { setSection(item); safeStorage.setItem('builda99.menu', item); }} className={`rounded-lg px-3 py-3 font-display text-xl uppercase transition-colors ${section === item ? 'bg-hazard text-turf-950' : 'text-white/60 hover:bg-white/5'}`}>
          {item === 'daily' ? 'Daily challenge' : 'Free play'}
        </button>)}
      </div>
      {canResume && (
        <button
          onClick={onResume}
          className="mb-6 w-full rounded-lg border-2 border-hazard bg-hazard/10 px-4 py-3 text-left transition-colors hover:bg-hazard/20"
        >
          <div className="font-display text-xl tracking-tight uppercase">Pick up where you left off</div>
          <div className="font-mono text-[11px] text-white/55">
            You have a half-finished player waiting. Go back and finish the build.
          </div>
        </button>
      )}

      {section === 'daily' ? <DailyCard onStart={onDaily} canResume={canResume} /> : <section className="rounded-xl border border-white/10 bg-turf-900/70 p-5 sm:p-6">
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
      <h2 className="font-display text-2xl tracking-tight uppercase">1 · Pick your league</h2>
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
          Ratings stay fixed. Roster moves are handled individually. Practice-squad players are excluded. Base roster: September 20, 2026.
        </p>
      )}

      <h2 className="mt-8 font-display text-2xl tracking-tight uppercase">2 · Pick your position</h2>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {POSITIONS.map((pos) => {
          const live = DATA_STATS.byEra[era][pos] > 0;
          return (
            <button
              key={pos}
              disabled={!live}
              onClick={() => setPosition(pos)}
              className={`rounded-lg py-4 font-display text-2xl tracking-wide uppercase transition-all ${
                position === pos
                  ? 'scale-105 bg-hazard text-turf-950'
                  : live
                    ? 'bg-turf-700 hover:bg-turf-600'
                    : 'cursor-not-allowed bg-turf-800 text-white/20'
              }`}
            >
              {pos}
              {!live && <div className="font-mono text-[9px] opacity-60">SOON</div>}
            </button>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-2xl tracking-tight uppercase">3 · Set the rules</h2>
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
              : 'Two rerolls. Every rating in the pool is visible. Each spin lands on a different franchise.'}
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
        className="mt-8 w-full rounded-lg bg-hazard py-5 font-display text-3xl tracking-tight text-turf-950 uppercase transition-transform hover:scale-[1.02] active:scale-100"
      >
        Build a player
      </button>

      </section>}

      <HallOfBuilds hall={hall} onOpen={onOpenSaved} onDelete={onDeleteSaved} />
    </div>
  );
}
