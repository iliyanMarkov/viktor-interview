export interface CrewMember {
  name: string;
  role: string;
  nationality: string;
  exp: string;
  age: number;
  contact: string;
}

export interface Ship {
  id: string;
  name: string;
  type: string;
  flag: string;
  lat: number;
  lon: number;
  status: "underway" | "anchored" | "in-port";
  speed: number;
  heading: number;
  destination: string;
  eta: string;
  cargo: string;
  crew: CrewMember[];
}

export const STATUS_THEME = {
  underway: { dot: "#22c55e", bg: "#dcfce7", text: "#166534", label: "Underway", globe: 0x22c55e },
  anchored: { dot: "#f59e0b", bg: "#fef3c7", text: "#92400e", label: "Anchored", globe: 0xf59e0b },
  "in-port": { dot: "#3b82f6", bg: "#dbeafe", text: "#1e40af", label: "In Port", globe: 0x3b82f6 },
} as const;

export const STATUS_COLORS: Record<Ship["status"], number> = {
  underway: STATUS_THEME.underway.globe,
  anchored: STATUS_THEME.anchored.globe,
  "in-port": STATUS_THEME["in-port"].globe,
};

export const SHIPS: Ship[] = [
  {
    id: "MV-AURORA-7",
    name: "MV Aurora",
    type: "Container Vessel",
    flag: "Panama",
    lat: 35.6,
    lon: 139.6,
    status: "underway",
    speed: 18.4,
    heading: 247,
    destination: "Singapore",
    eta: "2026-05-22 14:30Z",
    cargo: "Electronics / 4,200 TEU",
    crew: [
      { name: "Captain Hiroshi Tanaka", role: "Master", nationality: "Japan", exp: "22 yrs", age: 54, contact: "tanaka@mv-aurora.mar" },
      { name: "Elena Vostrikova", role: "Chief Officer", nationality: "Russia", exp: "14 yrs", age: 41, contact: "e.vostrikova@mv-aurora.mar" },
      { name: "Marco Bianchi", role: "Chief Engineer", nationality: "Italy", exp: "18 yrs", age: 47, contact: "m.bianchi@mv-aurora.mar" },
      { name: "Priya Raman", role: "Second Officer", nationality: "India", exp: "8 yrs", age: 32, contact: "p.raman@mv-aurora.mar" },
      { name: "Kwame Asante", role: "Bosun", nationality: "Ghana", exp: "11 yrs", age: 38, contact: "k.asante@mv-aurora.mar" },
    ],
  },
  {
    id: "BC-NORTHWIND-3",
    name: "BC Northwind",
    type: "Bulk Carrier",
    flag: "Norway",
    lat: 60.4,
    lon: 5.3,
    status: "anchored",
    speed: 0.2,
    heading: 0,
    destination: "Rotterdam",
    eta: "2026-05-20 09:00Z",
    cargo: "Iron Ore / 82,000 DWT",
    crew: [
      { name: "Captain Lars Eriksen", role: "Master", nationality: "Norway", exp: "26 yrs", age: 58, contact: "l.eriksen@northwind.mar" },
      { name: "Sofia Lindqvist", role: "Chief Officer", nationality: "Sweden", exp: "12 yrs", age: 39, contact: "s.lindqvist@northwind.mar" },
      { name: "Diego Fernandez", role: "Chief Engineer", nationality: "Spain", exp: "20 yrs", age: 51, contact: "d.fernandez@northwind.mar" },
      { name: "Yuki Sato", role: "Radio Officer", nationality: "Japan", exp: "9 yrs", age: 34, contact: "y.sato@northwind.mar" },
    ],
  },
  {
    id: "TK-SEAHORSE-12",
    name: "TK Seahorse",
    type: "Oil Tanker",
    flag: "Liberia",
    lat: 25.3,
    lon: 55.3,
    status: "underway",
    speed: 14.1,
    heading: 102,
    destination: "Mumbai",
    eta: "2026-05-21 22:15Z",
    cargo: "Crude Oil / 320,000 DWT",
    crew: [
      { name: "Captain Ahmed Al-Rashid", role: "Master", nationality: "UAE", exp: "24 yrs", age: 55, contact: "a.alrashid@seahorse.mar" },
      { name: "James O'Connor", role: "Chief Officer", nationality: "Ireland", exp: "15 yrs", age: 42, contact: "j.oconnor@seahorse.mar" },
      { name: "Wei Zhang", role: "Chief Engineer", nationality: "China", exp: "19 yrs", age: 48, contact: "w.zhang@seahorse.mar" },
      { name: "Catalina Reyes", role: "Second Officer", nationality: "Philippines", exp: "7 yrs", age: 30, contact: "c.reyes@seahorse.mar" },
      { name: "Hassan Mwangi", role: "Pumpman", nationality: "Kenya", exp: "10 yrs", age: 36, contact: "h.mwangi@seahorse.mar" },
      { name: "Anders Holm", role: "Third Officer", nationality: "Denmark", exp: "5 yrs", age: 28, contact: "a.holm@seahorse.mar" },
    ],
  },
  {
    id: "CV-MERIDIAN-9",
    name: "CV Meridian",
    type: "Cruise Vessel",
    flag: "Bahamas",
    lat: 25.7,
    lon: -80.2,
    status: "in-port",
    speed: 0,
    heading: 0,
    destination: "Cozumel",
    eta: "2026-05-19 07:00Z",
    cargo: "3,840 passengers",
    crew: [
      { name: "Captain Marcus Thornton", role: "Master", nationality: "UK", exp: "28 yrs", age: 59, contact: "m.thornton@meridian.mar" },
      { name: "Isabella Costa", role: "Staff Captain", nationality: "Brazil", exp: "16 yrs", age: 44, contact: "i.costa@meridian.mar" },
      { name: "Henrik Pedersen", role: "Chief Engineer", nationality: "Denmark", exp: "21 yrs", age: 52, contact: "h.pedersen@meridian.mar" },
      { name: "Amélie Dubois", role: "Hotel Director", nationality: "France", exp: "13 yrs", age: 41, contact: "a.dubois@meridian.mar" },
      { name: "Olu Adebayo", role: "Security Officer", nationality: "Nigeria", exp: "11 yrs", age: 37, contact: "o.adebayo@meridian.mar" },
    ],
  },
  {
    id: "RV-POLARIS-2",
    name: "RV Polaris",
    type: "Research Vessel",
    flag: "Iceland",
    lat: -54.8,
    lon: -68.3,
    status: "underway",
    speed: 9.7,
    heading: 180,
    destination: "Antarctic Peninsula",
    eta: "2026-05-23 16:45Z",
    cargo: "Scientific Equipment",
    crew: [
      { name: "Captain Gunnar Sigurdsson", role: "Master", nationality: "Iceland", exp: "19 yrs", age: 46, contact: "g.sigurdsson@polaris.mar" },
      { name: "Dr. Mei Lin Chen", role: "Chief Scientist", nationality: "Taiwan", exp: "15 yrs", age: 43, contact: "m.chen@polaris.mar" },
      { name: "Rafael Santos", role: "Chief Engineer", nationality: "Portugal", exp: "17 yrs", age: 45, contact: "r.santos@polaris.mar" },
      { name: "Ingrid Berg", role: "Marine Biologist", nationality: "Sweden", exp: "8 yrs", age: 33, contact: "i.berg@polaris.mar" },
    ],
  },
  {
    id: "FT-KESTREL-5",
    name: "FT Kestrel",
    type: "Fishing Trawler",
    flag: "Iceland",
    lat: 64.1,
    lon: -21.9,
    status: "underway",
    speed: 11.2,
    heading: 315,
    destination: "Fishing Grounds",
    eta: "2026-05-19 04:00Z",
    cargo: "Empty / Fishing Op",
    crew: [
      { name: "Captain Bjørn Hansen", role: "Master", nationality: "Iceland", exp: "23 yrs", age: 51, contact: "b.hansen@kestrel.mar" },
      { name: "Pavel Novak", role: "First Mate", nationality: "Czech Rep.", exp: "12 yrs", age: 38, contact: "p.novak@kestrel.mar" },
      { name: "Mikhail Petrov", role: "Engineer", nationality: "Russia", exp: "14 yrs", age: 40, contact: "m.petrov@kestrel.mar" },
    ],
  },
  {
    id: "CV-LEVIATHAN-4",
    name: "CV Leviathan",
    type: "Container Vessel",
    flag: "Germany",
    lat: -33.9,
    lon: 18.4,
    status: "underway",
    speed: 21.3,
    heading: 78,
    destination: "Hamburg",
    eta: "2026-05-30 11:20Z",
    cargo: "Mixed / 18,000 TEU",
    crew: [
      { name: "Captain Klaus Werner", role: "Master", nationality: "Germany", exp: "25 yrs", age: 56, contact: "k.werner@leviathan.mar" },
      { name: "Aisha Mbeki", role: "Chief Officer", nationality: "South Africa", exp: "13 yrs", age: 40, contact: "a.mbeki@leviathan.mar" },
      { name: "Lars Müller", role: "Chief Engineer", nationality: "Germany", exp: "22 yrs", age: 53, contact: "l.muller@leviathan.mar" },
      { name: "Carmen Vega", role: "Second Officer", nationality: "Mexico", exp: "9 yrs", age: 34, contact: "c.vega@leviathan.mar" },
      { name: "Daniel Okafor", role: "Bosun", nationality: "Nigeria", exp: "15 yrs", age: 42, contact: "d.okafor@leviathan.mar" },
    ],
  },
  {
    id: "OS-TRIDENT-8",
    name: "OS Trident",
    type: "Offshore Supply",
    flag: "UK",
    lat: 56.5,
    lon: 3.2,
    status: "anchored",
    speed: 0.5,
    heading: 0,
    destination: "Aberdeen",
    eta: "2026-05-19 19:30Z",
    cargo: "Drilling Supplies",
    crew: [
      { name: "Captain William Hartley", role: "Master", nationality: "UK", exp: "20 yrs", age: 49, contact: "w.hartley@trident.mar" },
      { name: "Niamh O'Sullivan", role: "Chief Officer", nationality: "Ireland", exp: "10 yrs", age: 35, contact: "n.osullivan@trident.mar" },
      { name: "Erik Johansson", role: "Chief Engineer", nationality: "Sweden", exp: "16 yrs", age: 44, contact: "e.johansson@trident.mar" },
    ],
  },
];

/** Equirectangular projection for flat world-map.png */
export function latLonToPercent(lat: number, lon: number) {
  return {
    top: `${((90 - lat) / 180) * 100}%`,
    left: `${((lon + 180) / 360) * 100}%`,
  };
}
