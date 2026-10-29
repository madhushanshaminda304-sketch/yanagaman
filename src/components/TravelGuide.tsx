import type { City } from '../services/demoService';
export function TravelGuide({ onRoute, onOffer }: { onRoute: (origin: City, destination: City) => void; onOffer: () => void }) {
  return <>
    <section className="how-section container" id="how-it-works" aria-labelledby="how-title">
      <div className="guide-heading"><h2 id="how-title">A shared road.<br />A simpler journey.</h2><p>Already going that way? Make room for a little company.</p></div>
      <ol className="how-steps"><li><h3>Find your direction</h3><p>Choose your route, date, and seats. Compare the pickup point and luggage space.</p></li><li><h3>Know the details</h3><p>Review the journey and cost breakdown. Try a demo booking without paying.</p></li><li><h3>See it in My Trips</h3><p>Keep sample bookings together, or offer a demo ride of your own.</p></li></ol>
      <button className="text-button" onClick={onOffer}>Explore offering a ride</button>
    </section>
    <section className="route-guide container" id="route-guide" aria-labelledby="route-title"><div className="guide-heading"><h2 id="route-title">From coast to hill country.</h2><p>Start with a route. Confirm the exact meeting point before any real journey.</p></div>
      <div className="route-guide-list">{[
        { city: 'Kandy' as City, title: 'Into the hills', note: 'Agree on luggage space for winding roads and a clear arrival meeting point.' },
        { city: 'Galle' as City, title: 'Down to the coast', note: 'Check whether pickup is in the city or near an expressway interchange.' },
        { city: 'Ella' as City, title: 'Take the scenic way', note: 'Discuss breaks and bag sizes before a longer hill-country journey.' },
      ].map(r => <button className="route-guide-row" key={r.city} onClick={() => onRoute('Colombo', r.city)}><span><span className="route-place">Colombo to {r.city}</span><strong>{r.title}</strong></span><span className="route-guide-note">{r.note}</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 12h16m-5-5 5 5-5 5" /></svg></button>)}</div>
    </section>
    <section className="safety-band" id="safety" aria-labelledby="safety-title"><div className="container safety-inner"><div><h2 id="safety-title">Good journeys start<br />with good judgement.</h2><p>Carpooling is personal. Take time to agree on the details.</p></div><ul><li>Meet in a public, well-lit place.</li><li>Agree on the total cost before setting off.</li><li>Share your plans with someone you trust.</li><li>If something feels wrong, do not travel.</li></ul><p className="safety-disclosure">This preview provides no identity checks, emergency response, or live tracking.</p></div></section>
    <section className="faq-section container" id="questions" aria-labelledby="faq-title"><div><h2 id="faq-title">A few things<br />to know.</h2><p className="muted">A clear start, before you go.</p></div><div className="faq-list">
      <details><summary>Can I book a real journey?</summary><p>No. Every ride is a sample. Demo bookings stay in your browser tab and do not reserve a real seat.</p></details>
      <details><summary>How are the prices worked out?</summary><p>Sample rides show a fuel share and, where applicable, a toll share per seat. They are illustrative amounts, not current quotes. Your demo offers use the amount you enter as the fuel share.</p></details>
      <details><summary>Is anyone verified?</summary><p>No. There are no real driver profiles or identity checks in this preview. A women-only filter demonstrates a preference; it does not verify eligibility or guarantee safety.</p></details>
      <details><summary>Can I bring luggage?</summary><p>Each sample ride shows an allowance. On a real journey, agree on the size and number of bags with the driver first.</p></details>
      <details><summary>Can I cancel a demo booking?</summary><p>Yes. Open My Trips and cancel it. The sample seats become available again. There are no charges.</p></details>
      <details><summary>What happens to my demo data?</summary><p>It stays in this browser tab's session storage. Refreshing keeps it; Reset demo removes your sample bookings and offers. Browser session restoration may retain it after a tab is closed.</p></details>
    </div></section>
  </>;
}
