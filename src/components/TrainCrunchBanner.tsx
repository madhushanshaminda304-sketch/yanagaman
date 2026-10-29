import type { City } from '../services/demoService';
export function TrainCrunchBanner({ onSelect }: { onSelect: (origin: City, destination: City) => void }) {
  return <div className="route-shortcuts"><span>Popular routes</span>{(['Kandy','Galle','Ella'] as City[]).map(city => <button key={city} className="route-shortcut" onClick={() => onSelect('Colombo', city)}>Colombo to {city}<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5" /></svg></button>)}</div>;
}
