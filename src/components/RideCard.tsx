import { currency, displayDate, displayTime, fareFor } from '../services/demoService';
import type { DemoRide } from '../services/demoService';
export function RideCard({ ride, onSelect }: { ride: DemoRide; onSelect: (ride: DemoRide) => void }) {
  return <article className="ride-card">
    <div className="ride-topline"><span>{ride.offered ? 'Your demo offer' : 'Sample ride'}</span><span>{displayDate(ride.departure)}</span></div>
    <h3>{ride.origin}<span className="route-connector" aria-label="to"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 12h16m-5-5 5 5-5 5" /></svg></span>{ride.destination}</h3>
    <div className="ride-time">{displayTime(ride.departure)}<span>Sri Lanka time</span></div>
    <p className="pickup-line">{ride.pickup}</p>
    <ul className="ride-preferences"><li>{ride.availableSeats} seats left</li><li>{ride.luggage}</li>{ride.quiet && <li>Quiet ride</li>}{ride.expressway && <li>Expressway</li>}{ride.womenOnly && <li>Women only</li>}</ul>
    <div className="ride-bottom"><div><strong>{currency(fareFor(ride))}</strong><span>Sample fare / seat</span></div><button className="secondary" onClick={() => onSelect(ride)}>View ride</button></div>
  </article>;
}
