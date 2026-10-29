import type { FormEvent } from 'react';
import { CITIES, sriLankaDate } from '../services/demoService';
import type { SearchFilters } from '../services/demoService';
export function HeroSearch({ filters, onChange, onSearch, error }: { filters: SearchFilters; onChange: (v: SearchFilters) => void; onSearch: () => void; error: string }) {
  const set = (key: keyof SearchFilters, value: string | number | boolean) => onChange({ ...filters, [key]: value });
  const submit = (e: FormEvent) => { e.preventDefault(); onSearch(); };
  return <form className="search-form" onSubmit={submit} aria-label="Find sample rides">
    <div className="search-fields">
      <label>Leaving from<select value={filters.origin} onChange={e => set('origin', e.target.value)}><option value="">Anywhere</option>{CITIES.map(c => <option key={c}>{c}</option>)}</select></label>
      <button className="swap-button" type="button" aria-label="Swap departure and destination" onClick={() => onChange({ ...filters, origin: filters.destination, destination: filters.origin })}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16m-4-4 4 4-4 4M20 17H4m4-4-4 4 4 4" /></svg></button>
      <label>Going to<select value={filters.destination} onChange={e => set('destination', e.target.value)}><option value="">Anywhere</option>{CITIES.map(c => <option key={c}>{c}</option>)}</select></label>
      <label>Departure date<input type="date" min={sriLankaDate()} value={filters.date} onChange={e => set('date', e.target.value)} /></label>
      <label>Passengers<select value={filters.seats} onChange={e => set('seats', Number(e.target.value))}>{[1,2,3,4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'seat' : 'seats'}</option>)}</select></label>
      <button className="primary search-button" type="submit">Find a ride</button>
    </div>
    <div className="search-options"><span>Make it your kind of ride</span>
      <label><input type="checkbox" checked={filters.expressway} onChange={e => set('expressway', e.target.checked)} />Expressway</label>
      <label><input type="checkbox" checked={filters.quiet} onChange={e => set('quiet', e.target.checked)} />Quiet ride</label>
      <label><input type="checkbox" checked={filters.womenOnly} onChange={e => set('womenOnly', e.target.checked)} />Women only</label>
    </div>
    {error && <p className="error" role="alert">{error}</p>}
  </form>;
}
