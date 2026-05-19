export type SeafarerStatus = "Onboard" | "Available" | "On leave" | "Training";

export interface Seafarer {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  rank: string;
  nationality: string;
  status: SeafarerStatus;
  dateOfBirth: string;
  placeOfBirth: string;
  vesselType: string;
  lastVessel: string;
  currentVessel?: string;
  nextVessel?: string;
  availableFrom: string;
  assignmentDate: string;
  agent: string;
  phone?: string;
  email?: string;
  airport: string;
  salary: number;
  address?: string;
  age: number;
  promotions: number;
  performanceScore: number;
}

export const SEAFARERS: Seafarer[] = [
  {
    id: "S0000099",
    firstName: "Arthur",
    lastName: "Simmons",
    rank: "Second Engineer",
    nationality: "Bulgarian",
    status: "Onboard",
    dateOfBirth: "12 Mar 1989",
    placeOfBirth: "Varna, Bulgaria",
    vesselType: "Bulk carrier",
    lastVessel: "MSC Stella",
    currentVessel: "ZIM Atlantic",
    nextVessel: "MSC Aurora",
    availableFrom: "15 Aug 2026",
    assignmentDate: "26 Apr 2026",
    agent: "Polishmar Manning",
    airport: "VAR — Varna",
    salary: 4850,
    age: 36,
    promotions: 2,
    performanceScore: 87,
  },
  {
    id: "S0000112",
    firstName: "Elena",
    lastName: "Vasquez",
    rank: "Chief Officer",
    nationality: "Filipino",
    status: "Available",
    dateOfBirth: "05 Jul 1985",
    placeOfBirth: "Manila, Philippines",
    vesselType: "Container ship",
    lastVessel: "CMA CGM Liberty",
    nextVessel: "Ever Given II",
    availableFrom: "01 Jun 2026",
    assignmentDate: "01 Jun 2026",
    agent: "Maersk Manning",
    email: "e.vasquez@example.com",
    phone: "+63 912 345 6789",
    airport: "MNL — Manila Ninoy Aquino",
    salary: 6200,
    age: 40,
    promotions: 3,
    performanceScore: 92,
  },
  {
    id: "S0000078",
    firstName: "Dmitri",
    lastName: "Volkov",
    rank: "Master",
    nationality: "Russian",
    status: "On leave",
    dateOfBirth: "22 Feb 1975",
    placeOfBirth: "St. Petersburg, Russia",
    vesselType: "Tanker",
    lastVessel: "Orion Spirit",
    nextVessel: "Nordic Eagle",
    availableFrom: "10 Sep 2026",
    assignmentDate: "10 Sep 2026",
    agent: "Sovcomflot Agency",
    email: "d.volkov@example.com",
    airport: "LED — St. Petersburg Pulkovo",
    salary: 9800,
    age: 50,
    promotions: 5,
    performanceScore: 94,
  },
  {
    id: "S0000145",
    firstName: "James",
    lastName: "Okafor",
    rank: "AB Seaman",
    nationality: "Nigerian",
    status: "Onboard",
    dateOfBirth: "14 Nov 1998",
    placeOfBirth: "Lagos, Nigeria",
    vesselType: "Bulk carrier",
    lastVessel: "Pacific Horizon",
    currentVessel: "Atlantic Pioneer",
    availableFrom: "20 Oct 2026",
    assignmentDate: "20 Apr 2026",
    agent: "Stolt Manning",
    airport: "LOS — Lagos Murtala Muhammed",
    salary: 1850,
    age: 27,
    promotions: 0,
    performanceScore: 78,
  },
  {
    id: "S0000061",
    firstName: "Maria",
    lastName: "Santos",
    rank: "Chief Cook",
    nationality: "Filipino",
    status: "Training",
    dateOfBirth: "30 Aug 1990",
    placeOfBirth: "Cebu City, Philippines",
    vesselType: "Cruise ship",
    lastVessel: "Diamond Princess",
    nextVessel: "Symphony of the Seas",
    availableFrom: "15 Jul 2026",
    assignmentDate: "15 Jul 2026",
    agent: "V.Ships Leisure",
    email: "m.santos@example.com",
    phone: "+63 917 654 3210",
    airport: "CEB — Cebu Mactan",
    salary: 2400,
    age: 35,
    promotions: 1,
    performanceScore: 88,
  },
  {
    id: "S0000203",
    firstName: "Nikos",
    lastName: "Papadopoulos",
    rank: "Chief Engineer",
    nationality: "Greek",
    status: "Available",
    dateOfBirth: "18 Jan 1980",
    placeOfBirth: "Piraeus, Greece",
    vesselType: "VLCC Tanker",
    lastVessel: "Hercules Titan",
    nextVessel: "Poseidon Glory",
    availableFrom: "01 Jun 2026",
    assignmentDate: "01 Jun 2026",
    agent: "Angelakos Manning",
    email: "n.papadopoulos@example.com",
    airport: "ATH — Athens Eleftherios Venizelos",
    salary: 8500,
    age: 45,
    promotions: 4,
    performanceScore: 91,
  },
  {
    id: "S0000187",
    firstName: "Yuki",
    lastName: "Tanaka",
    rank: "Second Officer",
    nationality: "Japanese",
    status: "Onboard",
    dateOfBirth: "03 Apr 1993",
    placeOfBirth: "Yokohama, Japan",
    vesselType: "Car carrier",
    lastVessel: "Euphony Ace",
    currentVessel: "Courageous Leader",
    nextVessel: "Trans Future 7",
    availableFrom: "30 Nov 2026",
    assignmentDate: "30 May 2026",
    agent: "NYK Shipmanagement",
    email: "y.tanaka@example.com",
    phone: "+81 45 123 4567",
    airport: "HND — Tokyo Haneda",
    salary: 5100,
    age: 32,
    promotions: 1,
    performanceScore: 85,
  },
  {
    id: "S0000254",
    firstName: "Carlos",
    lastName: "Reyes",
    rank: "Bosun",
    nationality: "Colombian",
    status: "On leave",
    dateOfBirth: "25 Jun 1987",
    placeOfBirth: "Cartagena, Colombia",
    vesselType: "Container ship",
    lastVessel: "MSC Ambra",
    nextVessel: "MSC Ambra",
    availableFrom: "05 Aug 2026",
    assignmentDate: "05 Aug 2026",
    agent: "Navesco S.A.",
    phone: "+57 315 987 6543",
    airport: "CTG — Cartagena Rafael Núñez",
    salary: 2200,
    age: 38,
    promotions: 1,
    performanceScore: 82,
  },
];

export function getSeafarer(id: string): Seafarer | undefined {
  return SEAFARERS.find((s) => s.id === id);
}

export function getInitials(s: Seafarer): string {
  return `${s.firstName[0]}${s.lastName[0]}`;
}

export const MONTHS = [
  "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",
  "Dec", "Jan", "Feb", "Mar", "Apr", "May",
];

export const SERIES_DATA = {
  performance: [78, 82, 80, 85, 83, 86, 88, 84, 87, 89, 86, 87],
  salary: [4200, 4200, 4400, 4400, 4400, 4600, 4600, 4600, 4850, 4850, 4850, 4850],
  contract: [5.5, 5.5, 6.0, 6.0, 6.0, 6.2, 6.2, 6.2, 6.2, 6.5, 6.5, 6.2],
  travelTime: [18, 16, 15, 14, 16, 15, 13, 14, 14, 15, 14, 14.5],
  travelCost: [1650, 1580, 1520, 1480, 1510, 1490, 1380, 1420, 1410, 1450, 1440, 1420],
  home: [62, 78, 85, 90, 88, 92, 96, 94, 95, 98, 92, 94],
  risk: [22, 20, 18, 16, 18, 15, 14, 12, 13, 12, 11, 12],
};
