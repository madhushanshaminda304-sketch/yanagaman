import { describe, it, expect } from 'vitest';
import { createDemoService, seedDemo, searchRides, sriLankaDate, upcomingDate, STORAGE_KEY } from '../src/services/demoService';
import type { OfferInput, SearchFilters } from '../src/services/demoService';
const now = new Date('2026-10-29T20:00:00Z');
const clock = () => now;
const filters: SearchFilters = { origin: '', destination: '', date: '', seats: 1, expressway: false, womenOnly: false, quiet: false };
function storage() { const entries = new Map<string,string>(); return { getItem: (k:string) => entries.get(k) ?? null, setItem: (k:string,v:string) => {entries.set(k,v);}, removeItem: (k:string) => {entries.delete(k);} }; }
const offer: OfferInput = { origin: 'Colombo', destination: 'Kandy', date: upcomingDate(1, now), time: '08:30', seats: 3, fare: 700, luggage: 'Small bag', quiet: true, womenOnly: false };
describe('Preview date and search', () => {
  it('uses Sri Lanka calendar dates across the UTC day boundary', () => { expect(sriLankaDate(now)).toBe('2026-10-30'); expect(upcomingDate(1, now)).toBe('2026-10-31'); });
  it('filters by date, direction, and seats', () => { const rides = seedDemo(now).rides; expect(searchRides(rides,{...filters, date:'2026-10-31'},now)).toHaveLength(3); expect(searchRides(rides,{...filters,origin:'Colombo',destination:'Galle'},now).map(r=>r.id)).toEqual(['sample-1']); expect(searchRides(rides,{...filters,seats:4},now)).toEqual([]); });
  it('combines actual ride preferences', () => { expect(searchRides(seedDemo(now).rides,{...filters,expressway:true,womenOnly:true},now).map(r=>r.id)).toEqual(['sample-1']); expect(searchRides(seedDemo(now).rides,{...filters,expressway:true,quiet:true},now).map(r=>r.id)).toEqual(['sample-4']); });
  it('excludes past departures and rejects invalid searches', () => { expect(searchRides(seedDemo(now).rides,filters,new Date('2027-01-01'))).toEqual([]); expect(()=>searchRides([], {...filters,seats:-1})).toThrow(); expect(()=>searchRides([], {...filters,origin:'Galle',destination:'Galle'})).toThrow(); });
});
describe('Demo booking integrity and session persistence', () => {
  it.each([-1,0,1.5,5,NaN,Infinity])('rejects invalid seat count %s without mutation', seats => { const s=createDemoService(storage(),clock); expect(()=>s.book('sample-0',seats)).toThrow(); expect(s.snapshot().rides[0].availableSeats).toBe(3); expect(s.snapshot().bookings).toHaveLength(0); });
  it('prevents overbooking and restores seats on cancellation', () => { const s=createDemoService(storage(),clock); const b=s.book('sample-0',2); expect(b.total).toBe(1400); expect(()=>s.book('sample-0',2)).toThrow(); expect(s.snapshot().rides[0].availableSeats).toBe(1); s.cancel(b.id); expect(s.snapshot().rides[0].availableSeats).toBe(3); expect(()=>s.cancel(b.id)).toThrow(); });
  it('survives refresh and resets bookings and offers', () => { const st=storage(); const a=createDemoService(st,clock); a.book('sample-0',1); a.offer(offer); const b=createDemoService(st,clock); expect(b.snapshot().bookings).toHaveLength(1); expect(b.snapshot().rides).toHaveLength(7); b.reset(); expect(createDemoService(st,clock).snapshot().bookings).toHaveLength(0); expect(b.snapshot().rides).toHaveLength(6); });
  it('recovers from malformed or invalid saved data', () => { const st=storage(); st.setItem(STORAGE_KEY,'broken'); expect(createDemoService(st,clock).snapshot().rides).toHaveLength(6); const bad=seedDemo(now); bad.rides[0].availableSeats=-1; st.setItem(STORAGE_KEY,JSON.stringify(bad)); const s=createDemoService(st,clock); expect(s.snapshot().rides[0].availableSeats).toBe(3); expect(s.storageWarning()).not.toBe(''); });
  it('continues in memory when storage fails', () => { const st={getItem(){throw Error();},setItem(){throw Error();},removeItem(){}}; const s=createDemoService(st,clock); s.book('sample-0',1); expect(s.snapshot().bookings).toHaveLength(1); expect(s.storageWarning()).toContain('storage'); });
  it('returns snapshots without leaking mutable state', () => { const s=createDemoService(storage(),clock); const snapshot=s.snapshot(); snapshot.rides[0].availableSeats=99; expect(s.snapshot().rides[0].availableSeats).toBe(3); });
  it('rejects missing and expired rides', () => { let date=now; const s=createDemoService(storage(),()=>date); expect(()=>s.book('missing',1)).toThrow(); date=new Date('2027-01-01'); expect(()=>s.book('sample-0',1)).toThrow('departed'); });
});
describe('Demo offers', () => {
  it('adds an offer without personal data and prevents self-booking', () => { const s=createDemoService(storage(),clock); const r=s.offer(offer); expect(r.offered).toBe(true); expect(r.tollShare).toBe(0); expect(r.pickup).toContain('forecourt'); expect(()=>s.book(r.id,1)).toThrow('own'); expect(JSON.stringify(r)).not.toMatch(/email|phone|nicNumber|licensePlate/); });
  it.each([{destination:'Colombo'},{date:'2026-01-01'},{date:'2027-02-30'},{time:'25:00'},{seats:-1},{seats:2.5},{fare:-200},{fare:10001},{fare:1.5}])('rejects invalid offer %j', change => { const s=createDemoService(storage(),clock); expect(()=>s.offer({...offer,...change} as OfferInput)).toThrow(); expect(s.snapshot().rides).toHaveLength(6); });
});
