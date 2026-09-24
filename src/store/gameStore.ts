import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ATTRIBUTE_SETS, TEAMS, getPool } from '../data';
import type { AttributeKey, Era, Player, Position } from '../data';
import { hashSeed, makeSeed, nextPick } from '../lib/rng';
import { simulateCareer } from '../lib/scoring';
import type { CareerResult } from '../lib/scoring';
import { loadHall, removeFromHall, saveToHall } from '../lib/hall';
import type { SavedPlayer } from '../lib/hall';
import { safeStorage } from '../lib/storage';
import { dailyChallenge, dailyAttempts, DAILY_ATTEMPT_LIMIT, dailyOutcome, recordDaily } from '../lib/daily';
import type { DailyChallenge } from '../lib/daily';

/** Normal gets three rerolls per new run; Hard keeps none. Calibration uses this limit. */
export const REROLLS_NORMAL = 3;
export const REROLLS_HARD = 0;

/** Early runs are disposable; QUIT protects the build once a fifth slot is filled. */
export const QUIT_CONFIRM_AFTER = 4;

export function quitNeedsConfirmation(filledSlots: number): boolean {
  return filledSlots > QUIT_CONFIRM_AFTER;
}

/**
 * WHAT THE START SCREEN COMES BACK ON.
 *
 * This is deliberately NOT part of RunState. A run's league is frozen onto the run
 * because a career is scored against the pools it came out of, and the whole reason that
 * field cannot drift is written on `era` below. This is the opposite kind of thing: a
 * preference about what to offer you next, which has to survive exactly the events that
 * delete a run.
 *
 * It exists because the screen kept forgetting. BUILD ANOTHER PLAYER dropped you back on
 * running back, normal mode and the current league no matter what you had just spent ten
 * minutes playing, so anybody doing a second tight end run in hard mode had to set all
 * three again every time. A tester put it plainly: he was tired of walking out of a run
 * and then rechoosing.
 */
export type Setup = { position: Position; hardMode: boolean; era: Era };

const DEFAULT_SETUP: Setup = { position: 'RB', hardMode: false, era: 'current' };

export type FilledSlot = {
  attribute: AttributeKey;
  value: number;
  playerId: string;
  playerName: string;
  teamId: string;
};

export type Phase =
  /** No run in progress — position select screen. */
  | 'setup'
  /** Ready to pull the lever. */
  | 'ready'
  /** Reel is moving; the landing team is already decided. */
  | 'spinning'
  /** Landed on a franchise, browsing the pool. */
  | 'picking'
  /** Every slot filled, career not yet simulated. */
  | 'complete'
  /** Career simulated; the result is frozen in state. */
  | 'results'
  /** Should be unreachable — see the deadlock rule below. */
  | 'stuck';

export type RunState = {
  challenge?: DailyChallenge;
  runId: string;
  seed: string;
  /** Serializable PRNG cursor. This is what makes a run replayable and resumable. */
  rngState: number;
  position: Position;
  hardMode: boolean;
  /**
   * Which league this run is digging through, fixed at the first spin and never moved.
   *
   * It is on the RUN rather than being a global preference on purpose. A career is scored
   * against the supply of the pools it was built from, so a saved player whose era could
   * drift would have his All-Pro floor re-read against the wrong league the next time
   * anybody opened him.
   */
  era: Era;
  slots: Partial<Record<AttributeKey, FilledSlot>>;
  /** Pick order, for the results card narrative. */
  pickOrder: AttributeKey[];
  /** Pick history. Legacy saves may contain repeated players. */
  usedPlayerIds: string[];
  visitedTeamIds: string[];
  rerollsLeft: number;
  phase: Phase;
  /** Franchise the reel is heading to / has landed on. */
  currentTeamId: string | null;
  /** Increments per spin so the reel component knows to re-animate. */
  spinNonce: number;
  /** True when the reel just put you back on a roster you have already raided. */
  repeatVisit: boolean;
  /** Short run event notice; retained in persisted state for backward compatibility. */
  lastEventMessage: string | null;
  startedAt: number;
  /** What you named your creation. */
  creationName: string;
  /**
   * Frozen career outcome, including the Super Bowl result. Written ONCE by
   * runSimulation() and then read-only. See the note on that action.
   */
  career: CareerResult | null;
};

type GameStore = RunState & {
  soundOn: boolean;
  /**
   * The last league, position and mode that were actually played. Persisted, so it
   * survives a reload as well as a restart, and updated only by startRun, so a run you
   * abandoned three spins in still counts as what you were playing.
   */
  setup: Setup;
  /** Not persisted — a rehydrated run waits on the start screen until you opt in. */
  entered: boolean;
  /**
   * Saved players, newest first. Lives under its own storage key rather than in this
   * store's persisted slice, because it outlives every run and must survive QUIT.
   */
  hall: SavedPlayer[];
  toggleSound: () => void;
  resumeRun: () => void;
  deleteSaved: (id: string) => void;

  startRun: (opts: { position: Position; hardMode: boolean; era: Era; seed?: string }) => void;
  startDaily: (opts?: { era: Era }) => void;
  spin: () => void;
  landSpin: () => void;
  reroll: () => void;
  takeAttribute: (playerId: string, attribute: AttributeKey) => void;
  runSimulation: () => void;
  setCreationName: (name: string) => void;
  abandonRun: () => void;
  clearEvent: () => void;

  // selectors
  remainingSlots: () => AttributeKey[];
  currentPool: () => Player[];
  hasSavedRun: () => boolean;
};

const emptyRun = (): RunState => ({
  challenge: undefined,
  runId: '',
  seed: '',
  rngState: 0,
  position: 'RB',
  hardMode: false,
  era: 'current',
  slots: {},
  pickOrder: [],
  usedPlayerIds: [],
  visitedTeamIds: [],
  rerollsLeft: REROLLS_NORMAL,
  phase: 'setup',
  currentTeamId: null,
  spinNonce: 0,
  repeatVisit: false,
  lastEventMessage: null,
  startedAt: 0,
  creationName: '',
  career: null,
});

/** Draw uniformly from franchises not yet landed on, including discarded rerolls. */
function drawTeam(state: RunState): { teamId: string | null; rngState: number } {
  const available = TEAMS.filter((team) => !state.visitedTeamIds.includes(team.id));
  if (available.length === 0) return { teamId: null, rngState: state.rngState };
  const draw = nextPick(state.rngState, available);
  return { teamId: draw.value.id, rngState: draw.state };
}

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      ...emptyRun(),
      soundOn: true,
      setup: DEFAULT_SETUP,
      entered: false,
      hall: loadHall(),

      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      resumeRun: () => set({ entered: true }),
      deleteSaved: (id) => set({ hall: removeFromHall(id) }),

      /** Tests may inject a run key; normal games always create one here. */
      startRun: ({ position, hardMode, era, seed }) => {
        const previous = get();
        if (previous.challenge && !previous.career) recordDaily({ attempt: previous.challenge.attempt ?? 1, date: previous.challenge.date, hardMode: previous.hardMode, era: previous.era, challenge: previous.challenge, complete: true, abandoned: true, won: false });
        const finalSeed = seed || makeSeed();
        set({
          ...emptyRun(),
          runId: `${Date.now().toString(36)}-${finalSeed}`,
          seed: finalSeed,
          rngState: hashSeed(finalSeed),
          position,
          hardMode,
          era,
          rerollsLeft: hardMode ? REROLLS_HARD : REROLLS_NORMAL,
          phase: 'ready',
          startedAt: Date.now(),
          entered: true,
          // Remember only player-facing setup choices for the next visit.
          setup: { position, hardMode, era },
        });
      },

      startDaily: ({ era = 'current' } = { era: 'current' }) => {
        const hardMode = false;
        const today = dailyChallenge();
        const attempts = dailyAttempts(today.date, era, hardMode);
        if (attempts.length >= DAILY_ATTEMPT_LIMIT) return;
        const challenge = { ...today, hardMode, era, attempt: attempts.length + 1 };
        // Preserve an unfinished ordinary run instead of silently replacing it.
        if (get().hasSavedRun() && get().phase !== 'results') return;
        get().startRun({ position: challenge.position, hardMode, era });
        set({ challenge });
        recordDaily({ attempt: challenge.attempt, date: challenge.date, hardMode, era, challenge, complete: false });
      },

      spin: () => {
        const state = get();
        if (state.phase !== 'ready') return;

        const { teamId, rngState } = drawTeam(state);
        if (!teamId) {
          set({
            phase: 'stuck',
            lastEventMessage: 'No franchise has a roster for this position. Sorry.',
          });
          return;
        }

        set({
          rngState,
          currentTeamId: teamId,
          phase: 'spinning',
          spinNonce: state.spinNonce + 1,
          repeatVisit: false,
          lastEventMessage: null,
        });
      },

      /** Called by the reel when the animation finishes. */
      landSpin: () => {
        const state = get();
        if (state.phase !== 'spinning' || !state.currentTeamId) return;
        const seenBefore = state.visitedTeamIds.includes(state.currentTeamId);
        set({
          phase: 'picking',
          repeatVisit: seenBefore,
          visitedTeamIds: seenBefore
            ? state.visitedTeamIds
            : [...state.visitedTeamIds, state.currentTeamId],
        });
      },

      reroll: () => {
        const state = get();
        if (state.phase !== 'picking' || state.rerollsLeft <= 0) return;
        set({
          rerollsLeft: state.rerollsLeft - 1,
          phase: 'ready',
          currentTeamId: null,
          lastEventMessage: null,
        });
        get().spin();
      },

      takeAttribute: (playerId, attribute) => {
        const state = get();
        if (state.phase !== 'picking') return;
        if (state.slots[attribute]) return;
        if (state.usedPlayerIds.includes(playerId) || Object.values(state.slots).some((slot) => slot?.playerId === playerId)) return;

        const player = getPool(state.position, state.currentTeamId ?? '', state.era).find((p) => p.id === playerId);
        if (!player) return;
        const value = player.attributes[attribute];
        if (typeof value !== 'number') return;

        const slots = {
          ...state.slots,
          [attribute]: {
            attribute,
            value,
            playerId: player.id,
            playerName: player.name,
            teamId: player.teamId,
          },
        };
        const filled = ATTRIBUTE_SETS[state.position].every((k) => slots[k]);

        set({
          slots,
          pickOrder: [...state.pickOrder, attribute],
          usedPlayerIds: [...state.usedPlayerIds, player.id],
          phase: filled ? 'complete' : 'ready',
          currentTeamId: filled ? state.currentTeamId : null,
          lastEventMessage: null,
        });
      },

      /**
       * Rolls the career ONCE and freezes the result in persisted state.
       *
       * This must never live in a useEffect on the results screen. StrictMode fires
       * effects twice in dev, which would consume two draws and desync dev from prod
       * for the same seed. Worse, a reload on the results screen would re-roll — so
       * anyone who lost a ring could refresh until they won one. Rolling here, guarded
       * on `career` already being set, makes the outcome final the moment it happens.
       */
      runSimulation: () => {
        const state = get();
        if (state.phase !== 'complete' || state.career) return;

        const build: Partial<Record<AttributeKey, number>> = {};
        for (const key of ATTRIBUTE_SETS[state.position]) {
          build[key] = state.slots[key]?.value ?? 0;
        }

        const career = simulateCareer(state.position, build, state.seed, state.era);
        if (state.challenge) recordDaily({ attempt: state.challenge.attempt ?? 1, date: state.challenge.date, hardMode: state.hardMode, era: state.era, challenge: state.challenge, complete: true, ...dailyOutcome(state.challenge, career) });
        set({ career, phase: 'results' });
      },

      /**
       * NAMING IS SAVING.
       *
       * A tester asked to name his player and keep him, named one, and then lost him to
       * the next tap, because the name field wrote to a run that BUILD ANOTHER PLAYER
       * deletes. Rather than adding a save button he has to notice, the act of naming
       * him is the act of keeping him: every keystroke upserts the finished career into
       * the hall under this run's id, and emptying the field takes him back out again,
       * which doubles as the undo.
       *
       * Only ever on a finished run. A name typed mid build has nothing to save yet,
       * and half a player in the hall would be worse than none.
       */
      setCreationName: (name) => {
        const state = get();
        const creationName = name.slice(0, 28);
        set({ creationName });

        if (state.phase !== 'results' || !state.career) return;
        const trimmed = creationName.trim();
        set({
          hall: trimmed
            ? saveToHall({
                challenge: state.challenge,
                id: state.runId,
                name: trimmed,
                position: state.position,
                hardMode: state.hardMode,
                era: state.era,
                seed: state.seed,
                savedAt: Date.now(),
                pickOrder: state.pickOrder,
                slots: state.slots,
                career: state.career,
              })
            : removeFromHall(state.runId),
        });
      },

      abandonRun: () => {
        const state = get();
        if (state.challenge && !state.career) recordDaily({ attempt: state.challenge.attempt ?? 1, date: state.challenge.date, hardMode: state.hardMode, era: state.era, challenge: state.challenge, complete: true, abandoned: true, won: false });
        set({ ...emptyRun(), entered: false });
      },
      clearEvent: () => set({ lastEventMessage: null }),

      remainingSlots: () => {
        const s = get();
        return ATTRIBUTE_SETS[s.position].filter((k) => !s.slots[k]);
      },
      currentPool: () => {
        const s = get();
        return s.currentTeamId ? getPool(s.position, s.currentTeamId, s.era).filter((player) =>
          !s.usedPlayerIds.includes(player.id) && !Object.values(s.slots).some((slot) => slot?.playerId === player.id)) : [];
      },
      hasSavedRun: () => {
        const s = get();
        return s.phase !== 'setup' && s.runId !== '';
      },
    }),
    {
      /**
       * DO NOT RENAME THIS KEY. The game is called Build a 99 now and this still says
       * megatron, on purpose: the key is the address of everybody's autosaved run, and
       * changing it would strand every half finished player currently sitting in a
       * browser. A storage key is not player-facing copy, it is a pointer, and pointers
       * do not get renamed for taste. `megatron.hall.v1` is left alone for the same
       * reason, and it now holds saved players people intend to keep.
       */
      name: 'megatron.run.v1',
      storage: createJSONStorage(() => safeStorage),
      // Autosave the run itself; UI-only flags stay out except the sound preference.
      partialize: (s) => ({
        challenge: s.challenge,
        runId: s.runId, seed: s.seed, rngState: s.rngState, position: s.position,
        hardMode: s.hardMode, era: s.era, slots: s.slots, pickOrder: s.pickOrder,
        usedPlayerIds: s.usedPlayerIds, visitedTeamIds: s.visitedTeamIds,
        rerollsLeft: s.rerollsLeft, phase: s.phase, currentTeamId: s.currentTeamId,
        repeatVisit: s.repeatVisit,
        startedAt: s.startedAt, soundOn: s.soundOn, setup: s.setup,
        creationName: s.creationName, career: s.career,
      }),
      onRehydrateStorage: () => (state) => {
        // A reload mid-spin would otherwise resume into a reel that never lands.
        if (state && state.phase === 'spinning') state.phase = 'picking';
        // An autosave written before the second dataset existed has no era on it, and
        // every one of those runs was played against the all-time pools. Without this a
        // half finished player comes back with `undefined` where his league should be,
        // every pool lookup returns nothing, and the wheel spins onto empty rosters.
        if (state && !state.era) state.era = 'alltime';
        // Same shape of problem one field along. An autosave written before the start
        // screen remembered anything has no setup on it, and a start screen reading
        // `undefined.position` renders nothing at all.
        if (state && !state.setup) state.setup = DEFAULT_SETUP;
      },
    },
  ),
);
