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
  /** Optional portrait photo URL — used as card background in the carousel */
  photo?: string;
}

import { SEAFARERS } from "@/api/seafarerData";
export { SEAFARERS };

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
