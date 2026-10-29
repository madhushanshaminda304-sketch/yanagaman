import { useState } from 'react';
import { currency, displayDate, displayTime, fareFor, PREVIEW_NOTICE } from '../services/demoService';
import type { DemoRide } from '../services/demoService';
// Kept at the original component path; details are inline for accessible mobile navigation.
export function RideDetailsModal({ ride, seats: initialSeats, onClose, onBook }: { ride: DemoRide; seats: number; onClose: () => void; onBook: (seats: number) => void }) {
  const [seats, setSeats] = useState(initialSeats);
  const [error, setError] = useState('');
  return <section className="details-panel" aria-labelledby="ride-detail-title">
    <div className="section-heading"><h3 id="ride-detail-title" tabIndex={-1}>{ride.origin} to {ride.destination}</h3><button className="text-button" onClick={onClose}>Close details</button></div>
    <p className="notice">{PREVIEW_NOTICE}</p>
    <div className="details-grid"><div><h4>Meet, then travel</h4><dl className="detail-list"><div><dt>Pickup</dt><dd>{ride.pickup}</dd></div><div><dt>Drop-off</dt><dd>{ride.dropoff}</dd></div><div><dt>Departure</dt><dd>{displayDate(ride.departure)}, {displayTime(ride.departure)} (Sri Lanka)</dd></div><div><dt>Luggage</dt><dd>{ride.luggage} per passenger</dd></div></dl><p className="muted">These are sample meeting points. Do not travel to them based on this preview.</p></div>
    <div><h4>Understand the sample fare</h4><dl className="detail-list"><div><dt>Fuel share per seat</dt><dd>{currency(ride.fuelShare)}</dd></div><div><dt>Toll share per seat</dt><dd>{currency(ride.tollShare)}</dd></div><div className="fare-total"><dt>Total for {seats} {seats === 1 ? 'seat' : 'seats'}</dt><dd>{currency(fareFor(ride) * seats)}</dd></div></dl><p className="muted">Illustrative amounts only. No payment or legal fare assessment.</p>
    {ride.womenOnly && <p className="muted">Women-only preference is demonstrated here; no identity or eligibility check occurs.</p>}
    <form onSubmit={e => { e.preventDefault(); try { onBook(seats); } catch (err) { setError((err as Error).message); } }}><div className="booking-controls"><label>Sample seats<select value={seats} onChange={e => setSeats(Number(e.target.value))}>{[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}</select></label><button className="primary" disabled={ride.availableSeats === 0 || ride.offered}>Try demo booking</button></div>{ride.offered && <p className="muted">Your own demo ride cannot be booked.</p>}{error && <p className="error" role="alert">{error}</p>}</form>
    </div></div>
  </section>;
}
