// Storm Zone data layer — localStorage persistence
import { v4 as uuidv4 } from 'uuid';

export interface StormZone {
  id: string;
  name: string;
  polygonCoords: [number, number][]; // [lat, lng][]
  active: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'cc_storm_zones';
const SEEDED_KEY = 'cc_storm_zones_seeded';

function load(): StormZone[] {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; }
  catch { return []; }
}
function save(zones: StormZone[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(zones)); }

export function getStormZones(): StormZone[] { return load(); }
export function saveStormZones(zones: StormZone[]) { save(zones); }

export function addStormZone(name: string, polygonCoords: [number, number][]): StormZone {
  const zones = load();
  const z: StormZone = { id: uuidv4(), name, polygonCoords, active: true, createdAt: Date.now() };
  zones.push(z);
  save(zones);
  return z;
}

export function updateStormZone(id: string, updates: Partial<Pick<StormZone, 'name' | 'polygonCoords' | 'active'>>) {
  const zones = load();
  const idx = zones.findIndex(z => z.id === id);
  if (idx === -1) return;
  Object.assign(zones[idx], updates);
  save(zones);
}

export function deleteStormZone(id: string) {
  const zones = load().filter(z => z.id !== id);
  save(zones);
}

export function seedStormZones() {
  if (localStorage.getItem(SEEDED_KEY)) return;
  const demo: StormZone = {
    id: 'sz-hue-demo',
    name: 'Vùng bão Huế',
    polygonCoords: [
      [16.55, 107.45],
      [16.55, 107.80],
      [16.20, 107.90],
      [16.10, 107.50],
    ],
    active: true,
    createdAt: Date.now(),
  };
  save([demo]);
  localStorage.setItem(SEEDED_KEY, 'true');
}
