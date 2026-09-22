import { useEffect, useState } from 'react';
import type { Era } from '../data';
import { dailyAttempt, dailyChallenge, dailyGoal, dailyOutcome, dailyShareText, dailyStats, secondsUntilDailyReset } from '../lib/daily';
import type { DailyChallenge } from '../lib/daily';
import type { CareerResult } from '../lib/scoring';

function ShareDaily({ challenge, score, won }: { challenge: DailyChallenge; score: number; won: boolean }) {
  const [message, setMessage] = useState('');
  const text = dailyShareText(challenge, score, won);
  return <div className="mt-3">
    <button className="rounded border border-hazard/50 px-3 py-2 font-display uppercase text-hazard" onClick={async () => {
      try {
        await navigator.clipboard.writeText(`${text}\n${window.location.origin}`);
        setMessage('Result copied');
      } catch { setMessage('Copy the result below'); }
    }}>Copy daily result</button>
    {message && <p role="status" className="mt-2 text-sm text-white/70">{message}</p>}
    {message === 'Copy the result below' && <textarea aria-label="Daily result to copy" readOnly value={`${text}\n${window.location.origin}`} className="mt-2 h-32 w-full rounded bg-turf-900 p-2 text-sm" onFocus={(event) => event.target.select()} />}
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
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  const scheduled = dailyChallenge(now);
  const attempt = dailyAttempt(scheduled.date, era);
  const challenge = attempt?.challenge ?? scheduled;
  const legacyAttempt = !!attempt && !attempt.challenge;
  const stats = dailyStats(now);
  const seconds = secondsUntilDailyReset(now);
  const countdown = `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;
  return (
    <section className="mb-8 rounded-xl border-2 border-hazard/60 bg-hazard/10 p-5">
      <p className="font-mono text-[10px] tracking-widest text-hazard">DAILY CHALLENGE · {challenge.date}</p>
      <h2 className="mt-2 font-display text-3xl uppercase">{legacyAttempt ? 'Earlier daily attempt' : challenge.title}</h2>
      <p className="mt-2 text-sm text-white/75">{legacyAttempt ? 'This attempt belongs to the previous daily rules. Your saved build keeps its original target.' : dailyGoal(challenge)}</p>
      <div className="mt-4">
        <label className="text-sm text-white/70">League
          <select aria-label="Daily league" value={era} onChange={(event) => setEra(event.target.value as Era)} className="mt-1 block w-full rounded bg-turf-900 p-2 text-white">
            <option value="current">Current</option><option value="alltime">All-Time</option>
          </select>
        </label>
      </div>
      <p className="mt-3 font-mono text-[11px] text-white/55">Normal mode. Visible ratings. Two rerolls. One Current attempt and one All-Time attempt per day. Your spins and career are random. Quitting uses that league’s attempt.</p>
      {attempt ? (
        <div className="mt-4">
          <p className="font-display text-xl text-hazard">
            {attempt.abandoned ? 'Attempt used. Try the other league or come back tomorrow.' : attempt.complete ? `${attempt.won ? 'Challenge cleared' : 'Challenge finished'} · ${attempt.score?.toLocaleString('en-US')} ${legacyAttempt ? 'score' : challenge.kind === 'worst' ? 'OVR' : 'yards'}` : 'Attempt started. Resume your saved build below.'}
          </p>
          {attempt.complete && !attempt.abandoned && !legacyAttempt && attempt.score !== undefined && <ShareDaily challenge={{ ...challenge, hardMode: false, era: attempt.era ?? 'alltime' }} score={attempt.score} won={!!attempt.won} />}
        </div>
      ) : (
        <button onClick={() => onStart({ era })} disabled={canResume} className="mt-4 w-full rounded-lg bg-hazard px-4 py-3 font-display text-xl text-turf-950 uppercase disabled:opacity-40">
          {canResume ? 'Finish or quit your saved run first' : `Play daily · ${era === 'current' ? 'Current' : 'All-Time'}`}
        </button>
      )}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/15 pt-3 text-center">
        <div><strong className="text-xl text-hazard">{stats.current}</strong><p className="text-xs text-white/60">Day streak</p></div>
        <div><strong className="text-xl text-hazard">{stats.best}</strong><p className="text-xs text-white/60">Best streak</p></div>
        <div><strong className="text-xl text-hazard">{stats.wins}/{stats.played}</strong><p className="text-xs text-white/60">Days won / played</p></div>
      </div>
      <p className="mt-3 font-mono text-[11px] text-white/45">Finish either league to keep your streak. Saved on this browser; clearing site data removes your history.</p>
      <p className="mt-3 font-mono text-[11px] text-white/45">Next challenge in {countdown} · Resets at 12 AM on your device</p>
    </section>
  );
}

export function DailyProgress({ challenge, career }: { challenge: DailyChallenge; career: CareerResult | null }) {
  const outcome = career ? dailyOutcome(challenge, career) : null;
  return (
    <section className="mb-5 rounded-lg border border-hazard/50 bg-hazard/10 p-4" aria-live="polite">
      <h2 className="font-display text-xl uppercase">Daily · {challenge.title}</h2>
      <p className="mt-1 text-sm text-white/70">{dailyGoal(challenge)}</p>
      {outcome && <>
        <p className="mt-2 font-display text-2xl text-hazard">{outcome.won ? 'Challenge cleared' : 'Challenge finished'} · {outcome.score.toLocaleString('en-US')} {challenge.kind === 'worst' ? 'OVR' : 'yards'}</p>
        <ShareDaily challenge={challenge} score={outcome.score} won={outcome.won} />
      </>}
    </section>
  );
}
