import { useEffect, useState } from 'react';
import { dailyAttempt, dailyChallenge, dailyGoal, dailyOutcome, secondsUntilDailyReset } from '../lib/daily';
import type { DailyChallenge } from '../lib/daily';
import type { CareerResult } from '../lib/scoring';

export function DailyCard({ onStart, canResume }: { onStart: () => void; canResume: boolean }) {
  const [now, setNow] = useState(() => new Date());
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
  const challenge = dailyChallenge(now);
  const attempt = dailyAttempt(challenge.date);
  const seconds = secondsUntilDailyReset(now);
  const countdown = `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m`;
  return (
    <section className="mb-8 rounded-xl border-2 border-hazard/60 bg-hazard/10 p-5">
      <p className="font-mono text-[10px] tracking-widest text-hazard">DAILY CHALLENGE · {challenge.date}</p>
      <h2 className="mt-2 font-display text-3xl uppercase">{challenge.title}</h2>
      <p className="mt-2 text-sm text-white/75">{dailyGoal(challenge)}</p>
      <p className="mt-2 font-mono text-[11px] text-white/55">All-time · Hard mode · One attempt per day on this browser. Same spins for everyone on the same date. Quitting uses your attempt.</p>
      {attempt ? (
        <p className="mt-4 font-display text-xl text-hazard">
          {attempt.complete ? `${attempt.won ? 'Challenge cleared' : 'Challenge finished'} · ${attempt.score?.toLocaleString('en-US')} ${challenge.kind === 'worst' ? 'OVR' : 'yards'}` : 'Attempt started. Resume your build below if it is still saved.'}
        </p>
      ) : (
        <button onClick={onStart} disabled={canResume} className="mt-4 w-full rounded-lg bg-hazard px-4 py-3 font-display text-xl text-turf-950 uppercase disabled:opacity-40">
          {canResume ? 'Finish or quit your saved run first' : 'Play daily challenge'}
        </button>
      )}
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
      {outcome && <p className="mt-2 font-display text-2xl text-hazard">{outcome.won ? 'Challenge cleared' : 'Challenge finished'} · {outcome.score.toLocaleString('en-US')} {challenge.kind === 'worst' ? 'OVR' : 'yards'}. Come back tomorrow.</p>}
    </section>
  );
}
