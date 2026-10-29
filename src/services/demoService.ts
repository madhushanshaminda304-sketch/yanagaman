/** Browser-only preview adapter. No identities, contacts, or network requests. */
export const PREVIEW_NOTICE = 'Preview only. Sample rides, no real reservations.';
export const STORAGE_KEY = 'yanagaman.preview.v1';
export const CITIES = ['Colombo', 'Kandy', 'Galle', 'Matara', 'Ella', 'Jaffna'] as const;
export type City = typeof CITIES[number];
export type DemoRide = {
  id: string; origin: City; destination: City; departure: string;
  pickup: string; dropoff: string; availableSeats: number; totalSeats: number;
  fuelShare: number; tollShare: number; luggage: 'Small bag' | 'Medium bag';
  expressway: boolean; womenOnly: boolean; quiet: boolean; offered: boolean;
};
export type DemoBooking = { id: string; rideId: string; seats: number; total: number };
export type DemoState = { version: 1; rides: DemoRide[]; bookings: DemoBooking[] };
export type SearchFilters = { origin: string; destination: string; date: string; seats: number; expressway: boolean; womenOnly: boolean; quiet: boolean };
export type OfferInput = { origin: City; destination: City; date: string; time: string; seats: number; fare: number; luggage: DemoRide['luggage']; quiet: boolean; womenOnly: boolean };
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const pickupPoints: Record<City, string> = { Colombo: 'Colombo Fort station forecourt', Kandy: 'Kandy railway station forecourt', Galle: 'Galle railway station forecourt', Matara: 'Matara railway station forecourt', Ella: 'Ella railway station forecourt', Jaffna: 'Jaffna railway station forecourt' };
export function sriLankaDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return ['year', 'month', 'day'].map(k => parts.find(p => p.type === k)!.value).join('-');
}
export function upcomingDate(days = 1, now = new Date()): string {
  const d = new Date(`${sriLankaDate(now)}T12:00:00+05:30`);
  d.setUTCDate(d.getUTCDate() + days);
  return sriLankaDate(d);
}
export const displayDate = (iso: string) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', month: 'short', day: 'numeric' }).format(new Date(iso));
export const displayTime = (iso: string) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(iso));
export const fareFor = (ride: DemoRide) => ride.fuelShare + ride.tollShare;
export const currency = (amount: number) => `LKR ${amount.toLocaleString('en-LK')}`;
export function seedDemo(now = new Date()): DemoState {
  const routes: [City, City, string, number, number, boolean][] = [
    ['Colombo', 'Kandy', '08:30', 700, 0, false], ['Colombo', 'Galle', '09:00', 650, 200, true],
    ['Colombo', 'Ella', '06:30', 1400, 0, false], ['Galle', 'Colombo', '16:00', 650, 200, true],
    ['Colombo', 'Matara', '07:30', 800, 250, true], ['Colombo', 'Jaffna', '05:30', 2200, 0, false],
  ];
  return { version: 1, bookings: [], rides: routes.map(([origin, destination, time, fuelShare, tollShare, expressway], i) => ({
    id: `sample-${i}`, origin, destination, departure: `${upcomingDate(i < 3 ? 1 : 2, now)}T${time}:00+05:30`,
    pickup: pickupPoints[origin], dropoff: pickupPoints[destination], totalSeats: 3, availableSeats: 3,
    fuelShare, tollShare, expressway, luggage: i === 2 ? 'Medium bag' : 'Small bag', womenOnly: i === 1, quiet: i % 2 === 0, offered: false,
  })) };
}
const isCity = (city: unknown): city is City => CITIES.includes(city as City);
function validateState(value: unknown): value is DemoState {
  if (!value || typeof value !== 'object') return false;
  const s = value as DemoState;
  if (s.version !== 1 || !Array.isArray(s.rides) || !Array.isArray(s.bookings) || s.rides.length > 200 || s.bookings.length > 500) return false;
  if (!s.rides.every(r => r && typeof r.id === 'string' && isCity(r.origin) && isCity(r.destination) && r.origin !== r.destination &&
    typeof r.departure === 'string' && Number.isFinite(Date.parse(r.departure)) && typeof r.pickup === 'string' && typeof r.dropoff === 'string' &&
    Number.isInteger(r.totalSeats) && r.totalSeats >= 1 && r.totalSeats <= 4 && Number.isInteger(r.availableSeats) && r.availableSeats >= 0 && r.availableSeats <= r.totalSeats &&
    Number.isInteger(r.fuelShare) && r.fuelShare >= 0 && Number.isInteger(r.tollShare) && r.tollShare >= 0 && fareFor(r) >= 100 && fareFor(r) <= 10000 &&
    ['Small bag', 'Medium bag'].includes(r.luggage) && ['expressway', 'womenOnly', 'quiet', 'offered'].every(k => typeof r[k as keyof DemoRide] === 'boolean'))) return false;
  if (new Set(s.rides.map(r => r.id)).size !== s.rides.length || new Set(s.bookings.map(b => b.id)).size !== s.bookings.length) return false;
  if (!s.bookings.every(b => b && typeof b.id === 'string' && Number.isInteger(b.seats) && b.seats > 0 && b.seats <= 4 && s.rides.some(r => r.id === b.rideId && b.total === fareFor(r) * b.seats))) return false;
  return s.rides.every(r => r.availableSeats + s.bookings.filter(b => b.rideId === r.id).reduce((sum, b) => sum + b.seats, 0) === r.totalSeats);
}
export function searchRides(rides: DemoRide[], filters: SearchFilters, now = new Date()): DemoRide[] {
  if (!Number.isInteger(filters.seats) || filters.seats < 1 || filters.seats > 4) throw new Error('Choose between 1 and 4 seats.');
  if (filters.origin && filters.origin === filters.destination) throw new Error('Choose different departure and destination cities.');
  return rides.filter(r => Date.parse(r.departure) > now.getTime() &&
    (!filters.origin || r.origin === filters.origin) && (!filters.destination || r.destination === filters.destination) &&
    (!filters.date || sriLankaDate(new Date(r.departure)) === filters.date) && r.availableSeats >= filters.seats &&
    (!filters.expressway || r.expressway) && (!filters.womenOnly || r.womenOnly) && (!filters.quiet || r.quiet))
    .sort((a, b) => Date.parse(a.departure) - Date.parse(b.departure));
}
export interface DemoService {
  snapshot(): DemoState;
  storageWarning(): string;
  book(rideId: string, seats: number): DemoBooking;
  offer(input: OfferInput): DemoRide;
  cancel(bookingId: string): void;
  reset(): void;
}
export function createDemoService(storage?: StorageLike, clock = () => new Date()): DemoService {
  let state = seedDemo(clock());
  let warning = '';
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = saved.length < 500000 ? JSON.parse(saved) : null;
      if (validateState(parsed)) state = parsed;
      else warning = 'Saved preview data could not be read. A fresh demo has been loaded.';
    }
  } catch { warning = 'Browser storage is unavailable or unreadable. Demo changes may not survive refresh.'; }
  const persist = () => {
    try { storage?.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { warning = 'Browser storage is full or unavailable. Changes work here but may not survive refresh.'; }
  };
  persist();
  return {
    snapshot: () => structuredClone(state), storageWarning: () => warning,
    book(rideId, seats) {
      if (!Number.isInteger(seats) || seats < 1 || seats > 4) throw new Error('Choose between 1 and 4 seats.');
      const ride = state.rides.find(r => r.id === rideId);
      if (!ride) throw new Error('This sample ride is no longer available. Search again.');
      if (ride.offered) throw new Error('You cannot book your own demo ride.');
      if (Date.parse(ride.departure) <= clock().getTime()) throw new Error('This sample ride has departed. Choose an upcoming ride.');
      if (ride.availableSeats < seats) throw new Error(`Only ${ride.availableSeats} sample seats remain. Choose fewer seats.`);
      if (state.bookings.length >= 500) throw new Error('This preview is full. Reset the demo to try again.');
      const booking = { id: crypto.randomUUID(), rideId, seats, total: fareFor(ride) * seats };
      ride.availableSeats -= seats;
      state.bookings.unshift(booking); persist(); return structuredClone(booking);
    },
    offer(input) {
      if (!isCity(input.origin) || !isCity(input.destination) || input.origin === input.destination) throw new Error('Choose two different cities from the list.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)) throw new Error('Enter a valid date and departure time.');
      const departure = `${input.date}T${input.time}:00+05:30`;
      if (!Number.isFinite(Date.parse(departure)) || sriLankaDate(new Date(departure)) !== input.date || Date.parse(departure) <= clock().getTime()) throw new Error('Choose a future departure date and time in Sri Lanka.');
      if (!Number.isInteger(input.seats) || input.seats < 1 || input.seats > 4) throw new Error('Offer between 1 and 4 seats.');
      if (!Number.isInteger(input.fare) || input.fare < 100 || input.fare > 10000) throw new Error('Enter a sample fare from LKR 100 to 10,000 in whole rupees.');
      if (!['Small bag', 'Medium bag'].includes(input.luggage)) throw new Error('Choose a luggage size.');
      if (state.rides.length >= 200) throw new Error('This preview is full. Reset the demo to try again.');
      const ride: DemoRide = { id: crypto.randomUUID(), origin: input.origin, destination: input.destination, departure,
        pickup: pickupPoints[input.origin], dropoff: pickupPoints[input.destination], availableSeats: input.seats, totalSeats: input.seats,
        fuelShare: input.fare, tollShare: 0, luggage: input.luggage, expressway: false, quiet: Boolean(input.quiet), womenOnly: Boolean(input.womenOnly), offered: true };
      state.rides.unshift(ride); persist(); return structuredClone(ride);
    },
    cancel(id) {
      const b = state.bookings.find(b => b.id === id);
      if (!b) throw new Error('This demo booking has already been removed.');
      const ride = state.rides.find(r => r.id === b.rideId)!;
      ride.availableSeats += b.seats; state.bookings = state.bookings.filter(b => b.id !== id); persist();
    },
    reset() { state = seedDemo(clock()); warning = ''; persist(); },
  };
}
export function browserDemoService(): DemoService {
  try { return createDemoService(window.sessionStorage); }
  catch { return createDemoService({ getItem() { throw new Error('Unavailable'); }, setItem() { throw new Error('Unavailable'); }, removeItem() {} }); }
}
