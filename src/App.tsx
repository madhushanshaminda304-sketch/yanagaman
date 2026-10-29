import { useRef, useState } from 'react';
import { Navbar } from './components/Navbar';
import type { View } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { TrainCrunchBanner } from './components/TrainCrunchBanner';
import { RideCard } from './components/RideCard';
import { RideDetailsModal } from './components/RideDetailsModal';
import { PostRideWizard } from './components/PostRideWizard';
import { MyTripsModal } from './components/MyTripsModal';
import { TravelGuide } from './components/TravelGuide';
import { browserDemoService, searchRides, upcomingDate } from './services/demoService';
import type { City, SearchFilters, DemoRide } from './services/demoService';
import './App.css';
import './guide.css';
const freshFilters = (): SearchFilters => ({ origin: '', destination: '', date: upcomingDate(), seats: 1, expressway: false, womenOnly: false, quiet: false });
function initialView(): View { const v = new URLSearchParams(window.location.search).get('view'); return v === 'post' || v === 'bookings' ? v : 'search'; }
export default function App() {
  const [service] = useState(browserDemoService);
  const [state, setState] = useState(() => service.snapshot());
  const [view, setView] = useState<View>(initialView);
  const [filters, setFilters] = useState(freshFilters);
  const [applied, setApplied] = useState(freshFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resetPending, setResetPending] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);
  const selected = state.rides.find(r => r.id === selectedId);
  const rides = searchRides(state.rides, applied);
  const refresh = () => setState(service.snapshot());
  const go = (v: View) => {
    setView(v); setSelectedId(null); setError(''); setNotice('');
    const url = new URL(window.location.href); url.searchParams.set('view', v); url.hash = ''; window.history.replaceState(null, '', url);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => document.querySelector<HTMLElement>('#main')?.focus());
  };
  const search = (next = filters) => {
    try {
      searchRides(state.rides, next); setApplied({ ...next }); setFilters({ ...next }); setSelectedId(null); setError(''); setNotice('');
      requestAnimationFrame(() => { resultsRef.current?.scrollIntoView({ block: 'start' }); document.querySelector<HTMLElement>('#results-title')?.focus({ preventScroll: true }); });
    } catch (err) { setError((err as Error).message); }
  };
  const shortcut = (origin: City, destination: City) => search({ ...freshFilters(), origin, destination, date: '' });
  const openRide = (ride: DemoRide) => {
    setSelectedId(ride.id); setNotice('');
    requestAnimationFrame(() => { document.querySelector<HTMLElement>('#ride-detail-title')?.focus(); document.querySelector('.details-panel')?.scrollIntoView({ block: 'center' }); });
  };
  return <>
    <Navbar view={view} onView={go} state={state} />
    <main id="main" tabIndex={-1}>
      {service.storageWarning() && <p role="status" className="container notice">{service.storageWarning()}</p>}
      {notice && <p role="status" className="container success">{notice}</p>}
      {view === 'search' && <>
        <section className="hero container" aria-labelledby="hero-heading">
          <div className="hero-heading"><h1 id="hero-heading">Good company.<br />Better journeys.</h1><div className="hero-intro"><p>Share the journey. Split the cost.<br />See Sri Lanka along the way.</p><a className="hero-link" href="#how-it-works">A little company goes a long way<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></a></div></div>
          <div className="hero-image"><img src="/images/sri-lanka-road.webp" srcSet="/images/sri-lanka-road-small.webp 960w, /images/sri-lanka-road.webp 1920w" sizes="(max-width: 700px) 100vw, 1200px" width="1920" height="800" alt="Illustrative view of a car following a quiet road through Sri Lanka's green hill country" fetchPriority="high" /></div>
          <HeroSearch filters={filters} onChange={setFilters} onSearch={() => search()} error={error} />
          <TrainCrunchBanner onSelect={shortcut} />
        </section>
        <section className="results-section container" ref={resultsRef} aria-labelledby="results-title">
          <div className="section-heading"><div><h2 id="results-title" tabIndex={-1}>Find your way together.</h2><p className="muted">{rides.length} sample {rides.length === 1 ? 'ride' : 'rides'} matching your search. Times shown in Sri Lanka time.</p></div><button className="text-button" onClick={() => search({ ...freshFilters(), date: '' })}>Show all sample rides</button></div>
          {selected && <RideDetailsModal key={selected.id} ride={selected} seats={applied.seats} onClose={() => { setSelectedId(null); requestAnimationFrame(() => document.querySelector<HTMLElement>('#results-title')?.focus()); }} onBook={seats => { service.book(selected.id, seats); refresh(); go('bookings'); setNotice('Demo booking added to My Trips. No real seat was reserved and no payment was taken.'); }} />}
          {rides.length ? <div className="ride-grid">{rides.map(ride => <RideCard key={ride.id} ride={ride} onSelect={openRide} />)}</div> : <div className="empty-state"><h3>A different route might suit you.</h3><p>No sample rides match these filters. Try another date or clear your preferences.</p><button className="secondary" onClick={() => search({ ...freshFilters(), date: '' })}>Clear filters</button></div>}
        </section>
        <TravelGuide onRoute={shortcut} onOffer={() => go('post')} />
      </>}
      {view === 'post' && <div className="container"><PostRideWizard onCancel={() => go('search')} onCreate={input => { service.offer(input); refresh(); go('bookings'); setNotice('Demo offer added. It is saved only in this browser tab and is not publicly listed.'); }} /></div>}
      {view === 'bookings' && <div className="container"><MyTripsModal state={state} onBrowse={() => go('search')} onCancel={id => { try { service.cancel(id); refresh(); setNotice('Demo booking cancelled. Its sample seats are available again.'); } catch (err) { setNotice((err as Error).message); } }} /></div>}
    </main>
    <footer className="site-footer container"><div className="footer-brand"><strong>yanagaman</strong><p>Carpooling across Sri Lanka.</p></div><div className="footer-controls"><a href="#about">About</a><a href="#privacy">Privacy</a><a href="#preview-terms">Preview terms</a><button className="text-button" onClick={() => setResetPending(true)}>Reset demo</button>{resetPending && <div className="reset-confirm" role="group" aria-label="Confirm demo reset"><p>Remove this tab’s demo bookings and offers?</p><button className="secondary" onClick={() => { service.reset(); refresh(); setResetPending(false); setFilters(freshFilters()); setApplied(freshFilters()); go('search'); setNotice('Demo reset. Fresh sample rides are ready.'); }}>Reset now</button><button className="text-button" onClick={() => setResetPending(false)}>Keep them</button></div>}</div><div className="footer-information"><details id="about"><summary>About Yanagaman</summary><p>Yanagaman explores a simple idea: sharing a journey already being made. This independent Sri Lankan carpooling concept is a public preview, not an operating transport service. No companies or drivers shown elsewhere in earlier versions are affiliated with this preview.</p></details><details id="privacy"><summary>Preview privacy notice</summary><p>The app stores only sample ride offers, filters applied to searches, and demo bookings in your browser tab. Search filters stay in memory; offers and bookings use session storage. We do not request names, contact details, identity documents, location permission, or payments. There are no app analytics, advertising scripts, or app cookies. Fonts and imagery are served with the site.</p><p>Render serves the site and may process standard request information, such as IP addresses and browser details, under its own privacy policy. Reset demo replaces this tab’s saved demo data with fresh samples. Browser session restoration may retain session storage; use Reset demo to clear your changes explicitly.</p><a href="https://render.com/privacy">Read Render’s privacy policy</a></details><details id="preview-terms"><summary>Using this preview</summary><p>Use sample data only. No reservation, payment, transport agreement, verification, or emergency assistance is provided. Do not rely on sample times, meeting points, or fares to arrange a real journey. No real service availability is promised.</p></details></div><p className="footer-note">An independent concept preview. Travel image generated with AI. No real trips or identity checks.</p></footer>
  </>;
}
