import { useState } from 'react';
import type { DemoState } from '../services/demoService';
export type View = 'search' | 'post' | 'bookings';
export function Navbar({ view, onView, state }: { view: View; onView: (view: View) => void; state: DemoState }) {
  const [open, setOpen] = useState(false);
  const go = (next: View) => { setOpen(false); onView(next); };
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="preview-strip">Preview only. Sample rides, no real reservations.</div>
    <header className="site-header container">
      <button className="wordmark" onClick={() => go('search')} aria-label="Yanagaman home"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 5l12 14L28 5M16 19v9M9 5l7 8 7-8" /></svg>yanagaman</button>
      <button className="menu-toggle secondary" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
      <nav id="primary-nav" aria-label="Main navigation" className={open ? 'navigation open' : 'navigation'}>
        <button aria-current={view === 'search' ? 'page' : undefined} onClick={() => go('search')}>Find a ride</button>
        <button aria-current={view === 'bookings' ? 'page' : undefined} onClick={() => go('bookings')}>My trips{state.bookings.length > 0 ? ` (${state.bookings.length})` : ''}</button>
        <a href="#how-it-works" onClick={() => { setOpen(false); if (view !== 'search') onView('search'); }}>How it works</a>
        <button className="secondary" aria-current={view === 'post' ? 'page' : undefined} onClick={() => go('post')}>Offer a ride</button>
      </nav>
    </header>
  </>;
}
