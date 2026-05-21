export type ClockEntry = { city: string; tz: string };

export const DEFAULT_CLOCKS: ClockEntry[] = [
  { city: "HONG KONG", tz: "Asia/Hong_Kong" },
  { city: "MUMBAI", tz: "Asia/Kolkata" },
  { city: "SYDNEY", tz: "Australia/Sydney" },
  { city: "LONDON", tz: "Europe/London" },
  { city: "MANILA", tz: "Asia/Manila" },
  { city: "PRINCE RUPERT", tz: "America/Vancouver" },
];

export const EXTRA_CLOCK_OPTIONS: ClockEntry[] = [
  { city: "SINGAPORE", tz: "Asia/Singapore" },
  { city: "TOKYO", tz: "Asia/Tokyo" },
  { city: "DUBAI", tz: "Asia/Dubai" },
  { city: "COPENHAGEN", tz: "Europe/Copenhagen" },
  { city: "ROTTERDAM", tz: "Europe/Amsterdam" },
  { city: "NEW YORK", tz: "America/New_York" },
  { city: "HAMBURG", tz: "Europe/Berlin" },
  { city: "ATHENS", tz: "Europe/Athens" },
];

export const CLOCK = {
  navy: "#0a2540",
  slate: "#475569",
  muted: "#94a3b8",
  blue: "#2563eb",
  surface: "#f1f5f9",
  surfaceAlt: "#f8fafc",
  border: "1px solid rgba(15,52,96,0.08)",
  radius: 10,
  shadow: "0 1px 2px rgba(15,52,96,0.04)",
  shadowHover: "0 4px 12px rgba(15,52,96,0.08)",
};
