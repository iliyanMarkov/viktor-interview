"use client";

import { useEffect, useState } from "react";
import {
  IconUsers,
  IconShip,
  IconAlertTriangle,
  IconBriefcase,
  IconFileText,
  IconWorld,
  IconClock,
  IconPlus,
  IconX,
  IconChevronDown,
} from "@tabler/icons-react";

/* ── World clocks ───────────────────────────────────────── */
const DEFAULT_CLOCKS = [
  { city: "HONG KONG",     tz: "Asia/Hong_Kong"    },
  { city: "MUMBAI",        tz: "Asia/Kolkata"       },
  { city: "SYDNEY",        tz: "Australia/Sydney"   },
  { city: "LONDON",        tz: "Europe/London"      },
  { city: "MANILA",        tz: "Asia/Manila"        },
  { city: "PRINCE RUPERT", tz: "America/Vancouver"  },
];

function fmtTime(tz: string, d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  }).format(d);
}
function fmtDate(tz: string, d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz, month: "short", day: "numeric", year: "numeric",
  }).format(d);
}

/* ── KPI data ───────────────────────────────────────────── */
const KPI = [
  { label: "Total Seafarers",  value: 130, sub: "Total crew members",     icon: IconUsers,         color: "#2563eb" },
  { label: "Vessels Managed",  value: 9,   sub: "Total vessels in fleet",  icon: IconShip,          color: "#4f46e5" },
  { label: "Documents",        value: 107, sub: "Total documents",         icon: IconAlertTriangle, color: "#ca8a04" },
  { label: "Active Contracts", value: 52,  sub: "Active voyages",          icon: IconBriefcase,     color: "#059669" },
];

/* ── Document status ────────────────────────────────────── */
const DOC_STATUS = [
  { label: "Valid",                   count: 77,  pct: 72,  color: "#22c55e" },
  { label: "Expired",                 count: 21,  pct: 20,  color: "#ef4444" },
  { label: "Expiring in 6 Months",    count: 5,   pct: 5,   color: "#f97316" },
  { label: "Expiring in 6–12 Months", count: 4,   pct: 4,   color: "#eab308" },
];

/* ── Manning agents ─────────────────────────────────────── */
const MANNING = [
  { label: "Polishmar Manning",        count: 70, pct: 62 },
  { label: "Mumbai - Deli Cooperation",count: 23, pct: 20 },
  { label: "Duraen Filippines",        count: 13, pct: 12 },
  { label: "SEAI Manning Agent",       count: 7,  pct: 6  },
];

/* ── Nationalities ──────────────────────────────────────── */
const NATS = [
  { label: "BULGARIAN",  count: 88, pct: 69 },
  { label: "FILIPINO",   count: 15, pct: 12 },
  { label: "ROMANIAN",   count: 5,  pct: 4  },
  { label: "BRITISH",    count: 4,  pct: 3  },
  { label: "INDIAN",     count: 4,  pct: 3  },
  { label: "FIJIAN",     count: 3,  pct: 2  },
  { label: "DUTCH",      count: 2,  pct: 2  },
  { label: "TURKISH",    count: 2,  pct: 2  },
  { label: "DOMINICAN",  count: 1,  pct: 1  },
  { label: "ESTONIAN",   count: 1,  pct: 1  },
  { label: "POLISH",     count: 1,  pct: 1  },
  { label: "BAHRAINI",   count: 1,  pct: 1  },
  { label: "ETHIOPIAN",  count: 1,  pct: 1  },
];

/* ── Ranks ──────────────────────────────────────────────── */
const RANKS = [
  { label: "Master (MST)",                     count: 18, pct: 15 },
  { label: "Second Officer (2/O)",             count: 9,  pct: 7  },
  { label: "Fitter (FTR)",                     count: 9,  pct: 7  },
  { label: "Chief Engineer (C/E)",             count: 9,  pct: 7  },
  { label: "Chief Officer (C/O)",              count: 8,  pct: 7  },
  { label: "Able Seaman (AB)",                 count: 8,  pct: 7  },
  { label: "Second Engineer (2/E)",            count: 8,  pct: 7  },
  { label: "Boatswain (BSN)",                  count: 7,  pct: 6  },
  { label: "Third Engineer (3/E)",             count: 6,  pct: 5  },
  { label: "Electro-Technical Officer (ETO)",  count: 6,  pct: 5  },
  { label: "Third Officer (3/O)",              count: 6,  pct: 5  },
  { label: "Cook (CHCK)",                      count: 5,  pct: 4  },
  { label: "Ordinary Seaman (OS)",             count: 5,  pct: 4  },
  { label: "Oiler (OLR)",                      count: 3,  pct: 2  },
  { label: "Motorman (M/M)",                   count: 3,  pct: 2  },
  { label: "Electrical Cadet (EEC)",           count: 2,  pct: 2  },
  { label: "Electrician (River)",              count: 2,  pct: 2  },
  { label: "First Engineer (1/E)",             count: 2,  pct: 2  },
  { label: "Deck Cadet (D/C)",                 count: 1,  pct: 1  },
  { label: "Cabin Steward / Stewardess",       count: 1,  pct: 1  },
  { label: "Officer Of Watch (OOW)",           count: 1,  pct: 1  },
  { label: "Messman (MSMN)",                   count: 1,  pct: 1  },
  { label: "Electro-Technical Rating (ETR)",   count: 1,  pct: 1  },
];

/* ── Progress bar ───────────────────────────────────────── */
function Bar({ pct, color = "#3b82f6" }: { pct: number; color?: string }) {
  return (
    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.4s ease" }} />
    </div>
  );
}

/* ── Card shell ─────────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(15,52,96,0.08)", borderRadius: 12, boxShadow: "0 1px 2px rgba(15,52,96,0.04)", ...style }}>
      {children}
    </div>
  );
}

/* ── Section title ──────────────────────────────────────── */
function SectionTitle({ icon: Icon, color, title, sub }: { icon: React.ElementType; color: string; title: string; sub: string }) {
  return (
    <div style={{ padding: "18px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Icon size={18} style={{ color }} />
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#0a2540" }}>{title}</h3>
      </div>
      <p style={{ fontSize: 12, color: "#475569", margin: "0 0 14px" }}>{sub}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [now, setNow] = useState(() => new Date());
  const [clocks, setClocks] = useState(DEFAULT_CLOCKS);
  const [lastUpdated] = useState(() => new Date().toLocaleString("en-US"));
  const [seafarersOpen, setSeafarersOpen] = useState(false);

  /* Tick every second */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function removeClock(idx: number) {
    setClocks((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* ── Header row ── */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0a2540", margin: "0 0 2px" }}>Welcome Viktor Dukov</h1>
          </div>

          {/* World clocks */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, }}>
            {clocks.map((c, i) => (
              <div key={i} style={{ width: 160, background: "#fff", border: "1px solid rgba(15,52,96,0.08)", borderRadius: 10, boxShadow: "0 1px 2px rgba(15,52,96,0.04)" }}>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <IconClock size={13} style={{ color: "#94a3b8" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#0a2540" }}>{c.city}</span>
                      </div>
                    </div>
                    <button onClick={() => removeClock(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 2, lineHeight: 1 }}>
                      <IconX size={12} />
                    </button>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#0a2540", letterSpacing: "0.04em" }}>
                    {fmtTime(c.tz, now)}
                  </div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>
                    {fmtDate(c.tz, now)}
                  </div>
                </div>
              </div>
            ))}
            <button
              style={{ width: 160,  background: "#fff", border: "1px dashed rgba(15,52,96,0.2)", borderRadius: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: "#475569", fontSize: 12 }}
              onClick={() => alert("Add world clock — coming soon")}
            >
              <IconPlus size={16} />
              Add World Clock
            </button>
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>

          {/* Total Seafarers — expandable */}
          <Card>
            <div style={{ padding: "14px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#475569", margin: 0 }}>Total Seafarers</p>
              <button
                onClick={() => setSeafarersOpen((v) => !v)}
                style={{ background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex", alignItems: "center", borderRadius: 4 }}
                aria-label={seafarersOpen ? "Collapse" : "Expand"}
              >
                <IconChevronDown
                  size={16}
                  style={{
                    color: "#2563eb",
                    transform: seafarersOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>
            </div>
            <div style={{ padding: "0 16px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <p style={{ fontSize: 28, fontWeight: 700, color: "#0a2540", margin: "0 0 2px", lineHeight: 1 }}>130</p>
                  <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Total crew members</p>
                </div>
                <IconUsers size={18} style={{ color: "#2563eb", flexShrink: 0 }} />
              </div>

              {/* Dropdown breakdown */}
              {seafarersOpen && (
                <div style={{ marginTop: 14, borderTop: "1px solid rgba(15,52,96,0.08)", paddingTop: 12 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <tbody>
                      {[
                        { label: "At Home",  value: 53 },
                        { label: "On Board", value: 53 },
                        { label: "Assigned", value: 12 },
                      ].map((row) => (
                        <tr
                          key={row.label}
                          style={{ borderBottom: "1px solid rgba(15,52,96,0.06)", cursor: "default" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <td style={{ padding: "8px 0", fontWeight: 500, color: "#0f172a" }}>{row.label}</td>
                          <td style={{ padding: "8px 0", textAlign: "right", color: "#0f172a" }}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          {/* Remaining KPI cards */}
          {KPI.slice(1).map((k) => (
            <Card key={k.label} style={{ padding: "16px 18px", height: "fit-content" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#475569", margin: 0 }}>{k.label}</p>
                <k.icon size={18} style={{ color: k.color }} />
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: "#0a2540", margin: "0 0 4px", lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{k.sub}</p>
            </Card>
          ))}
        </div>

        {/* ── Row 3: Document Status + Manning Agents ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16, marginBottom: 16 }}>

          {/* Document Status */}
          <Card>
            <SectionTitle icon={IconFileText} color="#dc2626" title="Document Status" sub="Certificate validity overview" />
            <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {DOC_STATUS.map((d) => (
                <div key={d.label} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#0f172a" }}>{d.label} <span style={{ fontSize: 11, color: "#94a3b8" }}>({d.count})</span></span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{d.pct}%</span>
                  </div>
                  <Bar pct={d.pct} color={d.color} />
                </div>
              ))}
            </div>
          </Card>

          {/* Manning Agents */}
          <Card>
            <SectionTitle icon={IconBriefcase} color="#7c3aed" title="Manning Agents" sub="Distribution by manning agent" />
            <div style={{ padding: "0 20px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
              {MANNING.map((m) => (
                <div key={m.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#0f172a" }}>{m.label} <span style={{ fontSize: 11, color: "#94a3b8" }}>({m.count})</span></span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{m.pct}%</span>
                  </div>
                  <Bar pct={m.pct} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Row 4: Nationalities + Ranks ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Nationalities */}
          <Card>
            <SectionTitle icon={IconWorld} color="#2563eb" title="Nationalities" sub="Crew nationality distribution" />
            <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {NATS.map((n) => (
                <div key={n.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#0f172a" }}>{n.label} <span style={{ fontSize: 11, color: "#94a3b8" }}>({n.count})</span></span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{n.pct}%</span>
                  </div>
                  <Bar pct={n.pct} />
                </div>
              ))}
            </div>
          </Card>

          {/* Ranks */}
          <Card>
            <SectionTitle icon={IconBriefcase} color="#ca8a04" title="Ranks Distribution" sub="Crew by rank" />
            <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {RANKS.map((r) => (
                <div key={r.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#0f172a" }}>{r.label} <span style={{ fontSize: 11, color: "#94a3b8" }}>({r.count})</span></span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{r.pct}%</span>
                  </div>
                  <Bar pct={r.pct} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Last updated */}
        <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "right", margin: 0 }}>
          Last updated: {lastUpdated}
        </p>
      </div>
    </div>
  );
}
