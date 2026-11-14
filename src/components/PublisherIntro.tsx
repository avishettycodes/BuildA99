import { pageContent } from '../lib/pageContent';

/** The same introduction is emitted in static HTML for readers without JavaScript. */
export function PublisherIntro() {
  return <section aria-labelledby="guide-heading" className="mx-auto max-w-4xl px-5 py-10 text-white/80">
    <h2 id="guide-heading" className="font-display text-3xl uppercase">Make every trait count</h2>
    <p className="mt-4 leading-relaxed">A great football build needs more than one spectacular rating. Each franchise gives you a decision: take its standout skill now, or cover a weak spot before the remaining choices narrow. Your seven picks determine the player; career simulation adds the uncertainty of a fictional football life.</p>
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      {['build-strategy', 'ratings-and-scoring'].map(id => <article key={id}>
        <h3 className="text-xl font-semibold"><a className="text-hazard underline" href={`/${id}/`}>{pageContent[id].title}</a></h3>
        <p className="mt-3 leading-relaxed">{pageContent[id].sections[1][1]}</p>
      </article>)}
    </div>
    <p className="mt-6 leading-relaxed">New to the game? <a className="text-hazard underline" href="/how-to-play/">Read the rules</a> for daily attempts, rerolls and saving your player. <a className="text-hazard underline" href="/about/">Learn about the project</a> or <a className="text-hazard underline" href="/contact/">send feedback</a> if something needs attention.</p>
  </section>;
}
