import { useEffect, useState } from 'react';
import type { Era } from '../data';
import { DAILY_ATTEMPT_LIMIT, dailyAttempts, dailyChallenge, dailyGoal, dailyOutcome, dailyShareText, dailyStats, dailyCompletionStats, dailyPersonalBest, secondsUntilDailyReset } from '../lib/daily';
import type { DailyChallenge } from '../lib/daily';
import type { CareerResult } from '../lib/scoring';

function ShareDaily({ challenge, score, won }: { challenge: DailyChallenge; score: number; won: boolean }) {
  const [message, setMessage] = useState('');
  const text = dailyShareText(challenge, score, won);
  return <div className="mt-4">
    <button title="Copy your daily result and game link to paste into a message or post" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/5" onClick={async () => {
      try {
        await navigator.clipboard.writeText(`${text}\n${window.location.origin}`);
        setMessage('Result and link copied');
      } catch { setMessage('Copy the result below'); }
    }}>Copy result to share</button>
    {message && <p role="status" className="mt-2 text-sm text-white/70">{message}</p>}
    {message === 'Copy the result below' && <textarea aria-label="Daily result to copy" readOnly value={`${text}\n${window.location.origin}`} className="mt-2 h-32 w-full rounded bg-turf-900 p-2 text-sm" onFocus={(event) => event.target.select()} />}
  </div>;
}

function DailyResult({ challenge, score, won }: { challenge: DailyChallenge; score: number; won: boolean }) {
  const personal = dailyPersonalBest(challenge, score);
  const completion = dailyCompletionStats();
  const unit = challenge.kind === 'worst' ? 'OVR' : 'yards';
  return <div role="status" className={`mt-4 rounded-xl border-2 p-4 sm:p-5 ${won ? 'border-green-400/50 bg-green-400/10' : 'border-red-400/50 bg-red-400/10'}`}>
    <p className={`font-display text-3xl uppercase sm:text-4xl ${won ? 'text-green-400' : 'text-red-400'}`}>{won ? 'Challenge passed' : 'Challenge failed'}</p>
    <div className="mt-4 grid grid-cols-2 gap-4">
      <div><p className="text-xs text-white/60">Your career</p><strong className="font-stat text-3xl tabular-nums">{score.toLocaleString('en-US')}</strong><span className="ml-1 text-xs text-white/60"> {unit}</span></div>
      <div><p className="text-xs text-white/60">{challenge.kind === 'worst' ? 'Maximum allowed' : 'Score to beat'}</p><strong className="font-stat text-3xl tabular-nums">{challenge.target.toLocaleString('en-US')}</strong><span className="ml-1 text-xs text-white/60"> {unit}</span></div>
    </div>
    {!won && challenge.kind === 'rival' && <p className="mt-3 text-sm text-white/70">You needed {(challenge.target + 1 - score).toLocaleString('en-US')} more career yards to pass. A tie does not count; you needed {(challenge.target + 1).toLocaleString('en-US')}.</p>}
    <div className="mt-4 rounded-lg bg-white/5 p-3 text-sm text-white/80">
      <p>Daily completed. Finishing counts toward your completion streak, win or lose.</p>
      <p className="mt-1">Completion streak: {completion.current} day{completion.current === 1 ? '' : 's'} · Best: {completion.best}</p>
      <p className="mt-2">{personal.previous === null ? 'First completed daily for this position and mode. Your personal best starts here.' : personal.isBest ? `New personal best! Previous best: ${personal.previous.toLocaleString('en-US')} ${unit}.` : personal.tied ? 'You matched your personal best for this position and mode.' : `Previous personal best for this position and mode: ${personal.previous.toLocaleString('en-US')} ${unit}.`}</p>
      <p className="mt-1 text-xs text-white/50">History is saved on this device.</p>
    </div>
    <ShareDaily challenge={challenge} score={score} won={won} />
  </div>;
}

export function DailyCard({ onStart, canResume }: { onStart: (opts: { era: Era }) => void; canResume: boolean }) {
  const [now, setNow] = useState(() => new Date());
  const [era, setEra] = useState<Era>('current');
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  const scheduled = dailyChallenge(now);
  const attempts = dailyAttempts(scheduled.date, era);
  const attempt = attempts.at(-1);
  const challenge = attempt?.challenge ?? scheduled;
  const legacyAttempt = !!attempt && !attempt.challenge;
  const stats = dailyStats(now);
  const completion = dailyCompletionStats(now);
  const remaining = Math.max(0, DAILY_ATTEMPT_LIMIT - attempts.length);
  const seconds = secondsUntilDailyReset(now);
  const countdown = `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;
  return (
    <section className="overflow-hidden rounded-2xl border border-white/15 bg-turf-900 shadow-lg">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60"><span>DAILY · {scheduled.date}</span><span>Next challenge in {countdown}</span></div>
      </div>
      <div className="p-5 sm:p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-hazard">Build a better career</p>
        <h2 className="font-display text-4xl uppercase sm:text-5xl">{legacyAttempt ? 'Earlier daily attempt' : challenge.title}</h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">{legacyAttempt ? 'Your saved build keeps its original target.' : dailyGoal(challenge)}</p>
        <div className="mt-5 grid grid-cols-2 gap-2" aria-label="Daily league">
          {(['current', 'alltime'] as const).map((value) => <button key={value} aria-pressed={era === value} onClick={() => setEra(value)} className={`rounded-lg border px-3 py-3 text-sm font-semibold ${era === value ? 'border-hazard bg-hazard/10' : 'border-white/15 text-white/60 hover:bg-white/5'}`}>
            {value === 'current' ? 'Current' : 'All-Time'}
          </button>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/60"><span>Normal · Visible ratings · 3 rerolls</span><span>{remaining ? '1 attempt available' : 'Attempt used'}</span></div>
        {attempt && <>
          {attempt.abandoned ? <p role="status" className="mt-4 rounded-lg border border-red-400/40 bg-red-400/10 p-4 font-display text-2xl uppercase text-red-400">Challenge failed · Run abandoned</p> : attempt.complete && attempt.score !== undefined && !legacyAttempt ? <DailyResult challenge={challenge} score={attempt.score} won={!!attempt.won} /> : <p className="mt-4 text-sm text-white/70">{attempt.complete ? 'Earlier attempt completed.' : 'Your attempt is in progress. Resume your saved build above.'}</p>}
          {attempts.length > 1 && <p className="mt-3 text-xs text-white/60">{attempts.map((entry, index) => `Attempt ${index + 1}: ${entry.won ? 'Passed' : entry.complete ? 'Failed' : 'In progress'}`).join(' · ')}</p>}
        </>}
        {remaining > 0 && (!attempt || attempt.complete) && <button onClick={() => onStart({ era })} disabled={canResume} className="mt-5 w-full rounded-xl bg-hazard px-4 py-4 font-display text-2xl text-turf-950 uppercase disabled:opacity-40 hover:brightness-105">
          {canResume ? 'Finish or quit your saved run first' : 'Play daily challenge'}
        </button>}
        {remaining === 0 && <p className="mt-4 text-sm text-white/70">Attempt used for {era === 'current' ? 'Current' : 'All-Time'} Normal. Try the other league or return tomorrow.</p>}
        <details className="mt-4 text-xs text-white/60"><summary className="cursor-pointer py-1">How it works</summary><p className="mt-2 leading-relaxed">One Normal attempt per league each day, with visible ratings and three rerolls. Every run gets fresh spins without repeat teams. Quitting uses your attempt and does not count as a completion. Finish either league to extend your completion streak. Win either league to extend your winning streak. Resets at 12 AM on your device.</p></details>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-white/10 bg-turf-800/60 px-4 py-4 text-center">
        <div><strong className="font-stat text-3xl">{completion.current}</strong><p className="text-xs text-white/60">Completion streak</p></div>
        <div><strong className="font-stat text-3xl">{completion.best}</strong><p className="text-xs text-white/60">Best completion streak</p></div>
        <div><strong className="font-stat text-3xl">{stats.current}</strong><p className="text-xs text-white/60">Days won in a row</p></div>
        <div><strong className="font-stat text-3xl">{stats.best}</strong><p className="text-xs text-white/60">Best win streak</p></div>
      </div>
    </section>
  );
}

export function DailyProgress({ challenge, career }: { challenge: DailyChallenge; career: CareerResult | null }) {
  const outcome = career ? dailyOutcome(challenge, career) : null;
  return (
    <section className="mb-5 rounded-xl border border-white/15 bg-turf-900 p-4 sm:p-5">
      <p className="mb-2 text-xs font-semibold text-white/60">DAILY · {(challenge.era ?? 'alltime') === 'current' ? 'CURRENT' : 'ALL-TIME'} · {(challenge.hardMode ?? true) ? 'HARD' : 'NORMAL'}</p>
      <h2 className="font-display text-2xl uppercase">{challenge.title}</h2>
      {outcome ? <DailyResult challenge={challenge} score={outcome.score} won={outcome.won} /> : <p className="mt-2 text-sm text-white/70">{dailyGoal(challenge)}</p>}
    </section>
  );
}
