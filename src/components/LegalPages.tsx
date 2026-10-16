import { useEffect, useRef } from 'react';

import { legalOwner, legalReady, contactEmail, validEmail } from '../lib/legal';

import { pageContent as content } from '../lib/pageContent';

export function LegalPage({ page }: { page: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const article = content[page];
  useEffect(() => {
    if (!article) return;
    const previous = document.title;
    document.title = `${article.title} | Build a 99`;
    heading.current?.focus();
    return () => { document.title = previous; };
  }, [article]);
  if (!article) return null;
  return <main className="mx-auto max-w-3xl px-5 py-8 text-white/85">
    <a href="/" className="text-hazard underline">Back to game</a>
    <h1 ref={heading} tabIndex={-1} className="mt-6 font-display text-4xl uppercase">{article.title}</h1>
    <p className="mt-2 text-sm text-white/60">Updated October 16, 2026</p>
    {!legalReady && <p role="status" className="mt-4 rounded-lg border border-amber-400/50 p-4 text-sm">Draft for review. Operator identity and contact details must be completed before public launch.</p>}
    {article.sections.map(([title, text]) => <section key={title} className="mt-6">
      <h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 leading-relaxed">{text}</p>
    </section>)}
    <section className="mt-8 border-t border-white/20 pt-5">
      <h2 className="text-xl font-semibold">Operator and contact</h2>
      <p className="mt-2">{legalOwner || 'Operator details pending.'}</p>
      {validEmail ? <a className="text-hazard underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> : <p>Contact address pending.</p>}
      {page === 'privacy-policy' && <p className="mt-3"><a className="text-hazard underline" href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noopener noreferrer">Vercel privacy notice</a></p>}
    </section>
  </main>;
}
