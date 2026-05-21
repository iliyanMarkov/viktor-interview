export function getTimeParts(
  tz: string,
  d: Date,
): { hh: string; mm: string; ss: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  const ss = parts.find((p) => p.type === "second")?.value ?? "00";
  return { hh: hh === "24" ? "00" : hh, mm, ss };
}

export function getTimeNumbers(
  tz: string,
  d: Date,
): { h: number; m: number; s: number } {
  const p = getTimeParts(tz, d);
  return {
    h: parseInt(p.hh, 10),
    m: parseInt(p.mm, 10),
    s: parseInt(p.ss, 10),
  };
}

export function fmtDate(tz: string, d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}
