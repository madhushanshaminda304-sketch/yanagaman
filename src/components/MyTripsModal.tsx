import { currency, displayDate, displayTime, PREVIEW_NOTICE } from '../services/demoService';
import type { DemoState } from '../services/demoService';
export function MyTripsModal({ state, onBrowse, onCancel }: { state: DemoState; onBrowse: () => void; onCancel: (id: string) => void }) {
  const offers = state.rides.filter(r => r.offered);
  return <section className="workspace-section"><div className="section-heading"><h1>Your journeys, together.</h1><button className="text-button" onClick={onBrowse}>Find a ride</button></div><p className="notice">{PREVIEW_NOTICE}</p>
    <h2>Demo bookings</h2>{state.bookings.length === 0 ? <div className="empty-state"><h3>Your next journey starts here.</h3><p>Try a sample booking to see how My Trips works.</p><button className="primary" onClick={onBrowse}>Browse sample rides</button></div> : <div className="trip-list">{state.bookings.map(b => { const ride = state.rides.find(r => r.id === b.rideId)!; return <article className="trip-row" key={b.id}><div><span className="muted">Demo booking</span><h3>{ride.origin} to {ride.destination}</h3><p>{displayDate(ride.departure)}, {displayTime(ride.departure)} (Sri Lanka)</p><p className="muted">{b.seats} {b.seats === 1 ? 'seat' : 'seats'} / {currency(b.total)} sample total</p></div><button className="secondary" onClick={() => onCancel(b.id)}>Cancel demo booking</button></article>; })}</div>}
    <h2 className="offers-heading">Your demo offers</h2>{offers.length === 0 ? <p className="muted">No sample rides offered yet.</p> : offers.map(r => <article className="trip-row" key={r.id}><div><h3>{r.origin} to {r.destination}</h3><p>{displayDate(r.departure)}, {displayTime(r.departure)} (Sri Lanka)</p></div><span>{r.availableSeats} sample seats</span></article>)}
  </section>;
}
