import { useState } from 'react';
import { CITIES, PREVIEW_NOTICE, upcomingDate, sriLankaDate } from '../services/demoService';
import type { OfferInput } from '../services/demoService';
export function PostRideWizard({ onCreate, onCancel }: { onCreate: (input: OfferInput) => void; onCancel: () => void }) {
  const [input, setInput] = useState<OfferInput>({ origin: 'Colombo', destination: 'Kandy', date: upcomingDate(), time: '08:30', seats: 3, fare: 700, luggage: 'Small bag', quiet: false, womenOnly: false });
  const [error, setError] = useState('');
  const update = (key: keyof OfferInput, value: string | number | boolean) => setInput({ ...input, [key]: value });
  return <section className="workspace-section"><div className="section-heading"><h1>Room for one more?</h1><button className="text-button" onClick={onCancel}>Back to rides</button></div><p className="lead">Try offering a seat on a journey you already plan to make.</p><p className="notice">{PREVIEW_NOTICE}</p>
    <div className="offer-layout"><form className="offer-form" onSubmit={e => { e.preventDefault(); try { onCreate(input); } catch (err) { setError((err as Error).message); } }}>
      <div className="form-grid"><label>Leaving from<select value={input.origin} onChange={e => update('origin', e.target.value)}>{CITIES.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Going to<select value={input.destination} onChange={e => update('destination', e.target.value)}>{CITIES.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Departure date<input type="date" required min={sriLankaDate()} value={input.date} onChange={e => update('date', e.target.value)} /></label>
      <label>Time in Sri Lanka<input type="time" required value={input.time} onChange={e => update('time', e.target.value)} /></label>
      <label>Seats to share<select value={input.seats} onChange={e => update('seats', Number(e.target.value))}>{[1,2,3,4].map(n => <option key={n}>{n}</option>)}</select></label>
      <label>Sample fare per seat (LKR)<input type="number" required min={100} max={10000} step={1} value={input.fare} onChange={e => update('fare', Number(e.target.value))} /></label>
      <label>Luggage per passenger<select value={input.luggage} onChange={e => update('luggage', e.target.value)}><option>Small bag</option><option>Medium bag</option></select></label></div>
      <div className="search-options"><label><input type="checkbox" checked={input.quiet} onChange={e => update('quiet', e.target.checked)} />Quiet ride</label><label><input type="checkbox" checked={input.womenOnly} onChange={e => update('womenOnly', e.target.checked)} />Women only</label></div>
      <p className="muted">The full sample fare is shown as fuel share. No toll estimate is added. Meeting points are sample station forecourts.</p>
      {error && <p role="alert" className="error">{error}</p>}<button className="primary" type="submit">Add demo ride</button>
    </form><aside className="offer-advice"><h2>A good journey starts with clarity.</h2><p>Agree on a public meeting point, luggage space, and the total cost before travelling.</p><p>Offer only the seats you can safely accommodate. Allow time for pickup and breaks.</p><p className="muted">This form creates a sample ride in this browser tab. Nobody else sees it. No licence, number plate, name, or contact details are needed.</p></aside></div>
  </section>;
}
