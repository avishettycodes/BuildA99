import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ATTRIBUTE_SETS, getTeam } from './data';
import type { AttributeKey } from './data';
import { quitNeedsConfirmation, useGame } from './store/gameStore';
import { audioState, lock, primeAudio, setSoundEnabled, subscribeAudio } from './lib/audio';
import { savedEra } from './lib/hall';
import type { SavedPlayer } from './lib/hall';
import { Chevron, Moon, SoundOff, SoundOn, Sun } from './components/Icons';
import { AdLayout } from './components/AdLayout';
import { SlotMachine } from './components/SlotMachine';
import { BuildSheet } from './components/BuildSheet';
import { PoolPicker } from './components/PoolPicker';
import { StartScreen } from './components/StartScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { DailyProgress } from './components/DailyCard';
import { applyTheme, savedTheme } from './lib/theme';
import DataInspector from './DataInspector';
import { LegalPage } from './components/LegalPages';
import { LEGAL_LINKS, legalOwner } from './lib/legal';
import { safeStorage } from './lib/storage';
import { dailyAttempts, localDailyDate } from './lib/daily';

export default function App() {
  const g = useGame();
  const [legalPage, setLegalPage] = useState(() => window.location.hash.slice(1));
  useEffect(() => {
    const update = () => setLegalPage(window.location.hash.slice(1));
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const showingLegal = LEGAL_LINKS.some(([id]) => id === legalPage);
  const [theme, setTheme] = useState(savedTheme);
  useEffect(() => { applyTheme(theme); }, [theme]);
  const [hover, setHover] = useState<AttributeKey | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  /** Confirm step for walking out on a run. See the quit control in the header. */
  const [quitting, setQuitting] = useState(false);
  const [nextAction, setNextAction] = useState<'free' | 'other' | null>(null);
  const quitDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (quitting) quitDialog.current?.showModal();
    else quitDialog.current?.close();
  }, [quitting]);
  /**
   * A saved player being read back out of the hall. This is not a run and never becomes
   * one: it renders the frozen report and nothing else, so opening somebody you built
   * last week cannot disturb a half finished build sitting in the autosave.
   */
  const [viewing, setViewing] = useState<SavedPlayer | null>(null);
  /**
   * Whether a sound played right now would actually be heard. A tester could not tell
   * the toggle apart from a browser that had simply never let the audio start, so the
   * header says which of the two it is instead of showing one ambiguous speaker icon.
   */
  const audio = useSyncExternalStore(subscribeAudio, audioState);

  /**
   * With the sound off, never open an audio context at all. On iOS opening one claims
   * the playback audio session, which is what stops the ringer switch muting the game,
   * and it is also what interrupts whatever the phone was already playing. Nobody who
   * turned the sound off should lose their podcast to a silent game.
   */
  useEffect(() => { setSoundEnabled(g.soundOn); }, [g.soundOn]);

  if (new URLSearchParams(window.location.search).has('debug')) return <DataInspector />;

  /** A run is live from the first spin screen until the report is closed. */
  const inRun = g.entered && g.phase !== 'setup';
  const pool = g.currentTeamId ? g.currentPool() : [];
  const team = g.currentTeamId ? getTeam(g.currentTeamId) : null;
  const filledCount = ATTRIBUTE_SETS[g.position].filter((k) => g.slots[k]).length;
  const totalSlots = ATTRIBUTE_SETS[g.position].length;
  const quitRun = () => {
    setNextAction(null);
    if (quitNeedsConfirmation(g.phase)) {
      setQuitting(true);
      return;
    }
    setViewing(null);
    setHover(null);
    setSheetOpen(false);
    g.abandonRun();
  };
  const confirmQuit = () => {
    const action = nextAction;
    const otherEra = g.era === 'current' ? 'alltime' : 'current';
    setNextAction(null);
    setQuitting(false);
    setViewing(null);
    setHover(null);
    setSheetOpen(false);
    if (action === 'free') safeStorage.setItem('builda99.menu', 'free');
    g.abandonRun();
    if (action === 'other') g.startDaily({ era: otherEra });
  };

  /* Short on purpose. At full length it took a whole extra row of a phone header. */
  const soundChip = g.soundOn && audio === 'blocked' && (
    <span className="bug h-6 bg-amber-500/20 px-2 text-amber-300">Tap for sound</span>
  );

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-turf-950/80 backdrop-blur-xl">
        {/* A hairline of the call to action yellow under the header, like a broadcast bar. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-hazard/50 to-transparent" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
          <button
            onClick={() => {
              if (showingLegal) { window.location.hash = ''; return; }
              if (viewing) { setViewing(null); return; }
              quitRun();
            }}
            className="group text-left"
            aria-label="Build a 99, main menu"
          >
            <h1 className="flex items-center font-display text-[22px] leading-none whitespace-nowrap uppercase sm:text-[28px]">
              <span className="pt-0.5">Build a</span>
              <span className="ml-2 inline-block -skew-x-12 rounded-[5px] bg-hazard px-2 py-1 shadow-[0_6px_18px_-6px_rgba(255,212,0,0.6)] transition-transform group-hover:-translate-y-px">
                <span className="inline-block skew-x-12 text-turf-950">99</span>
              </span>
            </h1>
          </button>

          {/*
            Wraps rather than overflows. With a run live, the sound blocked and the quit
            button up, this row is 404px of chips inside a 390px phone, and a header that
            cannot wrap simply cuts the last one off the screen.
          */}
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {!inRun && soundChip}
            {/* All menu exits share the same confirmation, including the first spin. */}
            {inRun && g.phase !== 'results' && (
              <button
                onClick={quitRun}
                title="Return to the main menu"
                className="bug bg-white/8 text-white/60 transition-colors hover:bg-red-500/25 hover:text-red-300"
              >
                MAIN MENU
              </button>
            )}
            {!inRun && !viewing && g.hall.length > 0 && (
              <a
                href="#your-builds"
                className="bug bg-white/8 text-white/60 transition-colors hover:bg-white/15 hover:text-white/85"
              >
                YOUR BUILDS
              </a>
            )}
            <button
              onClick={() => {
                // Enable BEFORE priming. With the sound off no context is opened at all,
                // so switching it on has to lift that inside the same tap or the browser
                // will not let the context start until you tap something else.
                const next = !g.soundOn;
                setSoundEnabled(next);
                if (next) primeAudio();
                g.toggleSound();
              }}
              aria-pressed={g.soundOn}
              aria-label={g.soundOn ? 'Sound on, turn it off' : 'Sound off, turn it on'}
              title={g.soundOn ? 'Turn the sound off' : 'Turn the sound on'}
              data-on={g.soundOn}
              className="icon-btn"
            >
              {g.soundOn ? <SoundOn className="h-[18px] w-[18px]" /> : <SoundOff className="h-[18px] w-[18px]" />}
            </button>
            <button aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={theme === 'light'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="icon-btn">
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>
        {/*
          THE RUN STRIP. With a run live, the position, the mode and the rerolls sit in
          their own row under the logo like a scorebug, instead of wrapping the header onto
          a second ragged line on a phone.
        */}
        {inRun && (
          <div className="border-t border-white/6 bg-turf-900/60">
            <div className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto px-4 py-1.5">
              <span className="bug h-6 bg-hazard px-2 text-turf-950">{g.position}</span>
              <span className={`bug h-6 px-2 ${g.hardMode ? 'bg-red-500/20 text-red-400' : 'bg-white/8 text-white/60'}`}>{g.hardMode ? 'Hard' : 'Normal'}</span>
              <span className="bug h-6 bg-white/8 px-2 text-white/60">{g.era === 'current' ? 'Current' : 'All-Time'}</span>
              {g.phase !== 'results' && (
                <span className="bug h-6 bg-white/8 px-2 text-white/60">
                  {g.rerollsLeft} reroll{g.rerollsLeft === 1 ? '' : 's'}
                </span>
              )}
              <span className="ml-auto" />
              {soundChip}
            </div>
          </div>
        )}
      </header>

      {showingLegal && <LegalPage page={legalPage} />}
      <div hidden={showingLegal}>
      <AdLayout>
      {viewing ? (
        <main className="mx-auto max-w-7xl px-4 py-5">
          {viewing.challenge && <DailyProgress challenge={viewing.challenge} career={viewing.career} />}
          <ResultsScreen
            daily={!!viewing.challenge}
            position={viewing.position}
            era={savedEra(viewing)}
            slots={viewing.slots}
            pickOrder={viewing.pickOrder}
            career={viewing.career}
            seed={viewing.seed}
            hardMode={viewing.hardMode}
            creationName={viewing.name}
            // A saved report is a record of what happened. Renaming him happens on the
            // run that made him, not here.
            onName={() => {}}
            onRestart={() => setViewing(null)}
            soundOn={g.soundOn}
            replay
          />
        </main>
      ) : g.phase === 'setup' || !g.entered ? (
        <StartScreen
          onDaily={(opts) => { primeAudio(); g.startDaily(opts); }}
          onStart={(opts) => { primeAudio(); g.startRun(opts); }}
          setup={g.setup}
          hall={g.hall}
          onOpenSaved={setViewing}
          onDeleteSaved={g.deleteSaved}
        />
      ) : (
        <main
          className={`mx-auto grid max-w-7xl gap-5 px-4 py-5 ${
            g.phase === 'results' ? '' : 'lg:grid-cols-[1fr_300px]'
          }`}
        >
          <div className="min-w-0">
            {g.challenge && <DailyProgress challenge={g.challenge} career={g.career} />}
            {g.lastEventMessage && (
              <div className="mb-3 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-mono text-[11px] tracking-wider text-amber-300">
                {g.lastEventMessage}
              </div>
            )}

            {(g.phase === 'ready' || g.phase === 'spinning') && (
              <section className="rise">
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <div className="kicker">On the clock</div>
                    <h2 className="mt-1 font-display text-3xl leading-none tracking-tight uppercase">
                      Slot {filledCount + 1} <span className="text-white/35">of {totalSlots}</span>
                    </h2>
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.14em] text-white/50 uppercase">
                    {g.remainingSlots().length} slots left
                  </span>
                </div>
                {/* One segment per slot, filled as the build sheet fills. */}
                <div aria-hidden className="mb-4 flex gap-1">
                  {Array.from({ length: totalSlots }, (_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 -skew-x-12 rounded-[2px] ${
                        i < filledCount ? 'bg-hazard' : i === filledCount ? 'bg-hazard/35' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                {g.phase === 'spinning' && g.currentTeamId ? (
                  <SlotMachine
                    position={g.position}
                    era={g.era}
                    targetTeamId={g.currentTeamId}
                    spinNonce={g.spinNonce}
                    visitedTeamIds={g.visitedTeamIds}
                    soundOn={g.soundOn}
                    onLanded={g.landSpin}
                  />
                ) : (
                  <div className="relative flex h-[84px] items-center justify-center overflow-hidden rounded-lg border-2 border-white/12 bg-turf-900 font-mono text-[12px] tracking-[0.3em] text-white/40">
                    <div aria-hidden className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_38px,rgba(242,245,248,0.05)_38px_40px)]" />
                    <div aria-hidden className="pointer-events-none absolute inset-0 border-y-2 border-hazard/30" />
                    <span className="relative">PULL THE LEVER</span>
                  </div>
                )}

                <button
                  onClick={() => { primeAudio(); g.spin(); }}
                  disabled={g.phase === 'spinning'}
                  className="mt-4 w-full rounded-lg bg-hazard py-5 font-display text-3xl tracking-wide text-turf-950 uppercase transition-transform enabled:hover:scale-[1.01] disabled:opacity-40"
                >
                  {g.phase === 'spinning' ? 'Spinning…' : 'Spin'}
                </button>
              </section>
            )}

            {g.phase === 'picking' && team && (
              <section className="rise">
                <div
                  className="theme-fixed relative mb-4 flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-lg px-4 py-3.5 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]"
                  style={{ background: `linear-gradient(100deg, ${team.primary} 0%, ${team.primary}cc 45%, ${team.primary}26 100%), #0c1114`, boxShadow: `inset 0 -3px 0 ${team.secondary}` }}
                >
                  <div aria-hidden className="pointer-events-none absolute inset-y-0 right-24 w-24 -skew-x-12 bg-white/[0.06]" />
                  <div className="relative">
                    <div className="font-mono text-[10px] tracking-[0.2em] text-white/60">
                      {g.repeatVisit ? 'YOU LANDED HERE AGAIN' : 'YOU LANDED ON'}
                    </div>
                    <h2 className="font-display text-2xl leading-none tracking-tight uppercase sm:text-3xl">
                      {team.city} {team.name}
                    </h2>
                  </div>
                  <button
                    onClick={g.reroll}
                    disabled={g.rerollsLeft === 0}
                    className="relative rounded-md border-2 border-white/35 bg-black/15 px-4 py-2 font-display text-sm tracking-wide uppercase backdrop-blur-sm transition-colors enabled:hover:bg-white/15 disabled:opacity-30"
                    title={g.rerollsLeft === 0 ? 'No rerolls left. Take somebody.' : 'Skip this franchise'}
                  >
                    Reroll ({g.rerollsLeft})
                  </button>
                </div>

                <PoolPicker
                  position={g.position}
                  pool={pool}
                  slots={g.slots}
                  blind={g.hardMode}
                  onSteal={(playerId, attribute) => { if (g.soundOn) lock(); g.takeAttribute(playerId, attribute); }}
                  onHover={setHover}
                />
              </section>
            )}

            {g.phase === 'complete' && (
              <section className="rise relative overflow-hidden rounded-xl border-2 border-hazard bg-hazard/10 px-5 py-10 text-center">
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(255,212,0,0.18),transparent)]" />
                <div className="kicker relative justify-center">Seven for seven</div>
                <h2 className="relative mt-2 font-display text-4xl tracking-tight uppercase">Build complete</h2>
                <p className="relative mt-2 text-sm text-white/65">
                  Every slot is full. Time to find out what he did with his career.
                </p>
                <button
                  onClick={g.runSimulation}
                  className="relative mt-6 w-full rounded-lg bg-hazard py-5 font-display text-3xl tracking-wide text-turf-950 uppercase transition-transform hover:scale-[1.01]"
                >
                  Simulate career
                </button>
              </section>
            )}

            {g.phase === 'results' && g.career && g.challenge && (
              <section className="mb-5 rounded-xl border border-white/15 bg-turf-900 p-4">
                <h2 className="font-display text-xl uppercase">Keep building</h2>
                <p className="mt-1 text-sm text-white/60">Name your player below to keep this build before moving on.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {dailyAttempts(localDailyDate(), g.era === 'current' ? 'alltime' : 'current', false).length === 0 && <button className="rounded-lg bg-hazard px-4 py-3 font-display text-turf-950 uppercase" onClick={() => { setNextAction('other'); setQuitting(true); }}>Play {g.era === 'current' ? 'All-Time' : 'Current'} daily</button>}
                  <button className="rounded-lg border border-white/25 px-4 py-3 font-display uppercase" onClick={() => { setNextAction('free'); setQuitting(true); }}>Choose a free play build</button>
                </div>
              </section>
            )}
            {g.phase === 'results' && g.career && (
              <ResultsScreen
                daily={!!g.challenge}
                position={g.position}
                era={g.era}
                slots={g.slots}
                pickOrder={g.pickOrder}
                career={g.career}
                seed={g.seed}
                hardMode={g.hardMode}
                creationName={g.creationName}
                onName={g.setCreationName}
                onRestart={quitRun}
                soundOn={g.soundOn}
              />
            )}

            {g.phase === 'stuck' && (
              <section className="rounded-lg border-2 border-red-500 bg-red-500/10 px-5 py-8 text-center">
                <h2 className="font-display text-2xl uppercase">This run got stuck</h2>
                <p className="mt-2 font-mono text-[12px] text-white/60">{g.lastEventMessage}</p>
                <button onClick={quitRun} className="mt-4 rounded bg-white/15 px-5 py-2 font-display uppercase">
                  Start over
                </button>
              </section>
            )}
          </div>

          {/* Sidebar on desktop, drawer on phones. */}
          <aside className={`hidden ${g.phase === 'results' ? '' : 'lg:block'}`}>
            <div className="sticky top-28">
              <BuildSheet
                position={g.position}
                slots={g.slots}
                highlight={hover}
              />
            </div>
          </aside>

          <div className={g.phase === 'results' ? 'hidden' : 'lg:hidden'}>
            <button
              onClick={() => setSheetOpen(!sheetOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-white/12 bg-turf-800 px-4 py-3 text-left font-display text-lg uppercase"
            >
              <span>Build sheet · {filledCount}/{totalSlots}</span>
              <Chevron className={`h-5 w-5 transition-transform ${sheetOpen ? '' : '-rotate-90'}`} />
            </button>
            {sheetOpen && (
              <div className="mt-2">
                <BuildSheet
                  position={g.position}
                  slots={g.slots}
                  highlight={hover}
                />
              </div>
            )}
          </div>
        </main>
      )}
      </AdLayout>
      </div>

      <dialog
          ref={quitDialog}
          aria-labelledby="quit-title"
          aria-describedby="quit-description"
          className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl bg-transparent p-0 text-white backdrop:bg-turf-950/85 backdrop:backdrop-blur-sm"
          onCancel={() => setQuitting(false)}
          onClick={(event) => { if (event.target === event.currentTarget) setQuitting(false); }}
        >
          <div
            className="w-full max-w-sm rounded-xl border-2 border-white/20 bg-turf-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="quit-title" className="font-display text-2xl tracking-tight uppercase">
              {g.phase === 'results' ? 'Leave this report?' : 'Abandon this run?'}
            </h2>
            <p id="quit-description" className="mt-2 font-mono text-[11px] leading-relaxed text-white/55">
              {g.phase === 'results'
                ? 'Clear this run and continue? Players saved in YOUR BUILDS will stay saved. An unnamed player cannot be reopened.'
                : `Return to the main menu and discard this run? You have filled ${filledCount} of ${totalSlots} slots. You cannot resume it afterward.${g.challenge ? ' This will count as a failed daily attempt.' : ''}`}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                autoFocus
                onClick={() => setQuitting(false)}
                className="flex-1 rounded-lg bg-hazard px-4 py-3 font-display text-lg tracking-wide text-turf-950 uppercase"
              >
                {g.phase === 'results' ? 'Stay here' : 'Keep playing'}
              </button>
              <button
                onClick={confirmQuit}
                className="rounded-lg border-2 border-red-500/60 px-4 py-3 font-display text-lg tracking-wide text-red-300 uppercase hover:bg-red-500/15"
              >
                {g.phase === 'results' ? (nextAction ? 'Continue' : 'Main menu') : 'Abandon run'}
              </button>
            </div>
          </div>
        </dialog>

      <footer className="mt-12 border-t border-white/10 bg-turf-950/60 px-4 pt-8 pb-10 text-center text-[12px] leading-relaxed text-white/45">
        <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center justify-center font-display text-lg leading-none uppercase">
          <span className="pt-0.5 text-white/80">Build a</span>
          <span className="ml-1.5 inline-block -skew-x-12 rounded-[4px] bg-hazard px-1.5 py-0.5">
            <span className="inline-block skew-x-12 text-turf-950">99</span>
          </span>
        </div>
        <nav aria-label="Legal and help" className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-[13px] tracking-[0.12em] text-white/70 uppercase">
          {LEGAL_LINKS.map(([id, label]) => <a key={id} href={`#${id}`} className="transition-colors hover:text-hazard">{label}</a>)}
        </nav>
        <p className="mb-3 text-white/55">
          Build a 99 is an independent fan game. It is not affiliated with or endorsed by the NFL, the NFLPA or any team or player.
          Team and player names are used only to identify whose history you are digging through, and all trademarks belong to their owners.
        </p>
        <p className="mb-3">
          All-Time ratings were written by hand for fun. Current ratings are derived from the documented source model.
          None of it is a real scouting source. If you disagree with a number, you are probably right.
        </p>
        <p>© 2026 {legalOwner || 'Build a 99'}. All rights reserved in original site content.</p>
        {/*
          THE DATA INSPECTOR IS NOT LINKED ANY MORE, and it has not been deleted either.
          It is a wall of raw ratings for whoever is editing the pools, and a link to it
          sitting under the disclaimer on a public site is an invitation to read the
          answers before playing. `?debug` still opens it for anyone who knows.
        */}
        {import.meta.env.VITE_FEEDBACK_URL && (
          <a
            href={import.meta.env.VITE_FEEDBACK_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-hazard/70 underline hover:text-hazard"
          >
            Something feel wrong? Tell me about it
          </a>
        )}
        </div>
      </footer>
    </div>
  );
}
