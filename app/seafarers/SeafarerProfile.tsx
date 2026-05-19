"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  IconArrowLeft,
  IconAnchor,
  IconFlag,
  IconShip,
  IconId,
  IconChartLine,
  IconUser,
  IconBriefcase,
  IconCalendarEvent,
  IconHistory,
  IconAlertCircle,
  IconAlertTriangle,
  IconUserCheck,
  IconBell,
  IconEdit,
  IconFileImport,
  IconMail,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  type Seafarer,
  type SeafarerStatus,
  getInitials,
  MONTHS,
  SERIES_DATA,
} from "@/lib/seafarers";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const COLORS = {
  performance: "#1e5a96",
  salary:      "#0891b2",
  contract:    "#7c3aed",
  travelTime:  "#d97706",
  travelCost:  "#dc2626",
  home:        "#059669",
  risk:        "#db2777",
};
type SeriesKey = keyof typeof COLORS;

const SERIES_META: Record<SeriesKey, {
  label: string;
  format: (v: number) => string;
  normalize: (v: number) => number;
  summary: string;
}> = {
  performance: { label: "Performance",         format: (v) => `${v} / 100`,                normalize: (v) => v,                                   summary: "87 / 100"   },
  salary:      { label: "Salary ($)",           format: (v) => `$${v.toLocaleString("en-US")} /mo`, normalize: (v) => Math.round(((v-4000)/1000)*50+40),  summary: "$4,850 /mo" },
  contract:    { label: "Contract (months)",    format: (v) => `${v.toFixed(1)} months`,     normalize: (v) => Math.round(((v-4)/4)*60+30),        summary: "6.2 months" },
  travelTime:  { label: "Travel time (hrs)",    format: (v) => `${v.toFixed(1)} hrs`,        normalize: (v) => Math.round(((v-8)/16)*60+20),       summary: "14.5 hrs"   },
  travelCost:  { label: "Travel cost ($)",      format: (v) => `$${v.toLocaleString("en-US")}`,     normalize: (v) => Math.round(((v-800)/1200)*60+20),   summary: "$1,420"     },
  home:        { label: "Home duration (days)", format: (v) => `${v} days`,                  normalize: (v) => Math.round(((v-30)/90)*60+30),      summary: "94 days"    },
  risk:        { label: "Risk factor",          format: (v) => `${v}% (${v<15?"Low":v<25?"Moderate":"High"})`, normalize: (v) => v,               summary: "Low (12%)"  },
};

const TABS = ["Personal","Additional","Voyages","Experience","Certificates","Next of kin","Travel","Appraisals","Performance","Payroll","Emergencies"];

const STATUS_PILL: Record<SeafarerStatus, { bg: string; textColor: string; dotColor: string }> = {
  Onboard:    { bg: "rgba(34,197,94,0.2)",   textColor: "#86efac", dotColor: "#22c55e" },
  Available:  { bg: "rgba(59,130,246,0.2)",  textColor: "#93c5fd", dotColor: "#3b82f6" },
  "On leave": { bg: "rgba(251,191,36,0.2)",  textColor: "#fcd34d", dotColor: "#f59e0b" },
  Training:   { bg: "rgba(167,139,250,0.2)", textColor: "#c4b5fd", dotColor: "#8b5cf6" },
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;
}

export default function SeafarerProfile({ seafarer }: { seafarer: Seafarer }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Personal");
  const [activeKeys, setActiveKeys] = useState<Set<SeriesKey>>(new Set(["performance"]));
  const [reminderOn, setReminderOn] = useState(true);
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const pill = STATUS_PILL[seafarer.status];

  function toggleSeries(key: SeriesKey) {
    setActiveKeys((prev) => {
      if (prev.has(key) && prev.size === 1) return prev;
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function buildDatasets() {
    return Array.from(activeKeys).map((key) => {
      const cfg = SERIES_META[key];
      const raw = SERIES_DATA[key];
      const color = COLORS[key];
      return {
        label: cfg.label, data: raw.map(cfg.normalize),
        rawData: raw, formatter: cfg.format,
        borderColor: color, backgroundColor: hexToRgba(color, 0.15),
        borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5,
        pointHoverBackgroundColor: color, pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2, tension: 0.45, fill: true,
        cubicInterpolationMode: "monotone" as const,
      };
    });
  }

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f3460", titleColor: "#fff", bodyColor: "#fff",
        borderColor: "rgba(255,255,255,0.1)", borderWidth: 1,
        padding: 10, cornerRadius: 8, displayColors: true, boxPadding: 4,
        callbacks: {
          label: (ctx: TooltipItem<"line">) => {
            const ds = ctx.dataset as unknown as { rawData: number[]; formatter: (v: number) => string; label: string };
            const raw = ds.rawData[ctx.dataIndex];
            return `  ${ds.label}: ${ds.formatter(raw)}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#475569", font: { size: 11 } }, border: { display: false } },
      y: { beginAtZero: false, min: 0, max: 100, grid: { color: "rgba(15,52,96,0.08)" }, ticks: { display: false }, border: { display: false } },
    },
  };

  const initials = getInitials(seafarer);

  return (
    <div className="p-6">
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {/* Header strip */}
        <div style={{ display:"flex", alignItems:"center", gap:16, padding:"20px 22px", background:"linear-gradient(135deg,#0f3460 0%,#1e5a96 100%)", borderRadius:12, marginBottom:14, color:"#fff", boxShadow:"0 2px 8px rgba(15,52,96,0.12)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"relative" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, fontWeight:500, border:"1px solid rgba(255,255,255,0.2)" }}>
              {initials}
            </div>
            {seafarer.status === "Onboard" && (
              <div style={{ position:"absolute", bottom:-1, right:-1, width:14, height:14, borderRadius:"50%", background:"#22c55e", border:"2px solid #144272" }} />
            )}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <h1 style={{ fontSize:20, fontWeight:500, margin:0, color:"#fff" }}>{seafarer.firstName} {seafarer.lastName}</h1>
              <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:500, background:pill.bg, color:pill.textColor, border:`1px solid ${hexToRgba(pill.dotColor,0.3)}` }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:pill.dotColor }} />
                {seafarer.status}
              </span>
            </div>
            <div style={{ display:"flex", gap:14, marginTop:6, fontSize:12, color:"rgba(255,255,255,0.85)", flexWrap:"wrap" }}>
              <span><IconId size={13} style={{ verticalAlign:-2, marginRight:4 }} />{seafarer.id}</span>
              <span><IconAnchor size={13} style={{ verticalAlign:-2, marginRight:4 }} />{seafarer.rank}</span>
              <span><IconFlag size={13} style={{ verticalAlign:-2, marginRight:4 }} />{seafarer.nationality}</span>
              {seafarer.currentVessel && <span><IconShip size={13} style={{ verticalAlign:-2, marginRight:4 }} />{seafarer.currentVessel}</span>}
            </div>
          </div>
          <button onClick={() => router.push("/seafarers")} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:8, border:"0.5px solid rgba(255,255,255,0.2)", background:"rgba(255,255,255,0.12)", fontSize:13, cursor:"pointer", color:"#fff", fontFamily:"inherit" }}>
            <IconArrowLeft size={14} />Back
          </button>
        </div>

        {/* Career timeline */}
        <div style={{ background:"#fff", border:"0.5px solid rgba(15,52,96,0.1)", borderRadius:12, boxShadow:"0 1px 2px rgba(15,52,96,0.04)", marginBottom:14, overflow:"hidden" }}>
          <div style={{ height:3, background:"linear-gradient(90deg,#144272 0%,#2e7cc4 50%,#0891b2 100%)" }} />
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 12px", flexWrap:"wrap", gap:12 }}>
            <div>
              <h2 style={{ fontSize:14, fontWeight:500, margin:0, color:"#0f172a" }}>
                <IconChartLine size={14} style={{ verticalAlign:-2, marginRight:6, color:"#144272" }} />Career timeline
              </h2>
              <p style={{ fontSize:12, color:"#475569", margin:"2px 0 0" }}>Last 12 months — toggle metrics to overlay</p>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <span style={{ background:"#eff6ff", borderRadius:8, padding:"6px 10px", fontSize:12, display:"flex", alignItems:"center", gap:6, color:"#144272", border:"0.5px solid rgba(15,52,96,0.1)" }}>
                <IconUser size={12} />Age <strong>{seafarer.age}</strong>
              </span>
              <span style={{ background:"#eff6ff", borderRadius:8, padding:"6px 10px", fontSize:12, display:"flex", alignItems:"center", gap:6, color:"#144272", border:"0.5px solid rgba(15,52,96,0.1)" }}>
                <IconTrendingUp size={12} />Promotions <strong>{seafarer.promotions}</strong>
              </span>
              {seafarer.nextVessel && (
                <span style={{ background:"#eff6ff", borderRadius:8, padding:"6px 10px", fontSize:12, display:"flex", alignItems:"center", gap:6, color:"#144272", border:"0.5px solid rgba(15,52,96,0.1)" }}>
                  <IconShip size={12} />Next vessel <strong>{seafarer.nextVessel}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Filter chips */}
          <div style={{ display:"flex", gap:6, padding:"0 20px 14px", flexWrap:"wrap", borderBottom:"0.5px solid rgba(15,52,96,0.08)" }}>
            {(Object.keys(COLORS) as SeriesKey[]).map((key) => {
              const isActive = activeKeys.has(key);
              const color = COLORS[key];
              return (
                <button key={key} onClick={() => toggleSeries(key)} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 11px", borderRadius:999, fontSize:12, fontWeight:500, cursor:"pointer", border: isActive ? "1px solid transparent" : "1px solid rgba(15,52,96,0.1)", background: isActive ? color : "#fff", color: isActive ? "#fff" : color, fontFamily:"inherit", transition:"all 0.15s", whiteSpace:"nowrap" }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background: isActive ? "rgba(255,255,255,0.9)" : color, opacity: isActive ? 1 : 0.5 }} />
                  {SERIES_META[key].label}
                </button>
              );
            })}
          </div>

          {/* Chart */}
          <div style={{ padding:"16px 20px 20px" }}>
            <div style={{ position:"relative", height:220 }}>
              <Line ref={chartRef} data={{ labels:MONTHS, datasets:buildDatasets() }} options={chartOptions} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:8, marginTop:14, paddingTop:14, borderTop:"0.5px solid rgba(15,52,96,0.08)" }}>
              {(Object.keys(COLORS) as SeriesKey[]).map((key) => {
                if (!activeKeys.has(key)) return null;
                return (
                  <div key={key} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:3, height:28, borderRadius:2, background:COLORS[key] }} />
                    <div style={{ display:"flex", flexDirection:"column" }}>
                      <span style={{ fontSize:11, color:"#475569", textTransform:"uppercase", letterSpacing:"0.04em" }}>{SERIES_META[key].label}</span>
                      <span style={{ fontSize:14, fontWeight:500, color:"#0f172a" }}>{SERIES_META[key].summary}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab card */}
        <div style={{ background:"#fff", border:"0.5px solid rgba(15,52,96,0.1)", borderRadius:12, boxShadow:"0 1px 2px rgba(15,52,96,0.04)", overflow:"hidden" }}>
          <div style={{ height:3, background:"linear-gradient(90deg,#144272 0%,#2e7cc4 50%,#0891b2 100%)" }} />
          <div style={{ display:"flex", gap:4, padding:"0 16px", borderBottom:"0.5px solid rgba(15,52,96,0.08)", overflowX:"auto", background:"#f8fafc" }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              const isEmergency = tab === "Emergencies";
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: "flex", alignItems: "center", padding:"12px 4px", fontSize:13, color: isActive ? "#144272" : isEmergency ? "#92400e" : "#475569", cursor:"pointer", whiteSpace:"nowrap", background:"none", border:"none", borderBottom: isActive ? "2px solid #1e5a96" : "2px solid transparent", fontFamily:"inherit", fontWeight: isActive ? 500 : 400, transition:"color 0.15s,border-color 0.15s" }}>
                  {isEmergency && <IconAlertTriangle size={13} style={{ verticalAlign:-2, marginRight:4, color:"#92400e" }} />}
                  {tab}
                </button>
              );
            })}
          </div>
          <div style={{ padding:20 }}>
            {activeTab === "Personal"
              ? <PersonalTab seafarer={seafarer} reminderOn={reminderOn} setReminderOn={setReminderOn} />
              : <div style={{ padding:"40px 0", textAlign:"center", color:"#94a3b8", fontSize:14 }}>{activeTab} tab — content coming soon</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalTab({ seafarer, reminderOn, setReminderOn }: { seafarer: Seafarer; reminderOn: boolean; setReminderOn: (v: boolean) => void }) {
  const initials = getInitials(seafarer);
  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:24, marginBottom:20 }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center" }}>
          <div style={{ width:120, height:120, borderRadius:12, background:"linear-gradient(135deg,#144272 0%,#2e7cc4 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, fontWeight:500, color:"#fff", marginBottom:12, boxShadow:"0 2px 8px rgba(15,52,96,0.12)" }}>
            {initials}
          </div>
          <p style={{ fontSize:15, fontWeight:500, margin:0, color:"#0f172a" }}>{seafarer.firstName} {seafarer.lastName}</p>
          <p style={{ fontSize:12, color:"#475569", margin:"2px 0 10px" }}>ID {seafarer.id}</p>
          <StyledBtn icon={<IconEdit size={14}/>} label="Edit information" />
          <div style={{ marginTop:6, width:"100%" }}><StyledBtn icon={<IconFileImport size={14}/>} label="Update from app" /></div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <InfoCard>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <p style={{ margin:0, fontSize:12, color:"#144272", textTransform:"uppercase", letterSpacing:"0.04em", fontWeight:500 }}>
                <IconBriefcase size={13} style={{ verticalAlign:-2, marginRight:4 }} />Status &amp; employment
              </p>
              <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 10px", borderRadius:999, fontSize:12, fontWeight:500, background:"#dcfce7", color:"#166534" }}>Active</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
              <Field label="Last vessel" value={seafarer.lastVessel} />
              <Field label="Current vessel" value={seafarer.currentVessel ?? "—"} accent={!!seafarer.currentVessel} />
              <Field label="Next vessel" value={seafarer.nextVessel ?? "—"} />
            </div>
          </InfoCard>
          <InfoCard>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <p style={{ margin:0, fontSize:12, color:"#144272", textTransform:"uppercase", letterSpacing:"0.04em", fontWeight:500 }}>
                <IconCalendarEvent size={13} style={{ verticalAlign:-2, marginRight:4 }} />Availability &amp; assignment
              </p>
              <StyledBtn icon={<IconHistory size={13}/>} label="History" small />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
              <Field label="Available from" value={seafarer.availableFrom} />
              <div>
                <p style={{ fontSize:12, color:"#475569", margin:"0 0 4px" }}>Assignment date</p>
                <p style={{ fontSize:14, color:"#0f172a", margin:0 }}>{seafarer.assignmentDate}</p>
                <p style={{ fontSize:11, color:"#92400e", margin:"4px 0 0" }}><IconAlertCircle size={12} style={{ verticalAlign:-1, marginRight:2 }} />Date has passed</p>
              </div>
              <Field label="Agent" value={seafarer.agent} />
            </div>
          </InfoCard>
        </div>
      </div>

      <InfoCard style={{ marginBottom:14 }}>
        <h2 style={{ fontSize:13, fontWeight:500, margin:"0 0 14px", paddingBottom:10, borderBottom:"0.5px solid rgba(15,52,96,0.1)", color:"#144272" }}>
          <IconUser size={14} style={{ verticalAlign:-2, marginRight:6 }} />Personal information
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"16px 24px" }}>
          <Field label="First name" value={seafarer.firstName} />
          <Field label="Last name" value={seafarer.lastName} />
          <Field label="Middle name" value={seafarer.middleName} />
          <Field label="Nationality" value={seafarer.nationality} />
          <Field label="Date of birth" value={seafarer.dateOfBirth} />
          <Field label="Place of birth" value={seafarer.placeOfBirth} />
          <Field label="Rank" value={seafarer.rank} />
          <Field label="Vessel type" value={seafarer.vesselType} />
          <Field label="Phone" value={seafarer.phone} />
          <Field label="Email" value={seafarer.email} />
          <Field label="International airport" value={seafarer.airport} />
          <Field label="Salary" value={`$${seafarer.salary.toLocaleString("en-US")} /mo`} />
          <div style={{ gridColumn:"1 / -1" }}><Field label="Address" value={seafarer.address} /></div>
        </div>
      </InfoCard>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
        <InfoCard>
          <h2 style={{ fontSize:13, fontWeight:500, margin:"0 0 12px", paddingBottom:10, borderBottom:"0.5px solid rgba(15,52,96,0.1)", color:"#144272" }}>
            <IconUserCheck size={14} style={{ verticalAlign:-2, marginRight:6 }} />Assigned agent
          </h2>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"#eff6ff", color:"#144272", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:500 }}>
              {seafarer.agent.split(" ").map(w => w[0]).join("").slice(0,2)}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:500, margin:0, color:"#0f172a" }}>{seafarer.agent}</p>
              <p style={{ fontSize:12, color:"#475569", margin:0 }}>M2306872</p>
            </div>
            <StyledBtn icon={<IconMail size={13}/>} label="Contact" small />
          </div>
        </InfoCard>
        <InfoCard>
          <h2 style={{ fontSize:13, fontWeight:500, margin:"0 0 12px", paddingBottom:10, borderBottom:"0.5px solid rgba(15,52,96,0.1)", color:"#144272" }}>
            <IconBell size={14} style={{ verticalAlign:-2, marginRight:6 }} />Document reminders
          </h2>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:13, margin:0, color:"#0f172a" }}>Email reminders</p>
              <p style={{ fontSize:12, color:"#475569", margin:"2px 0 0" }}>Alert before document expiry</p>
            </div>
            <button onClick={() => setReminderOn(!reminderOn)} style={{ width:36, height:20, borderRadius:999, background: reminderOn ? "#1e5a96" : "#94a3b8", border:"none", position:"relative", cursor:"pointer", transition:"background 0.15s", flexShrink:0 }} aria-label="Toggle reminders">
              <span style={{ position:"absolute", top:2, left: reminderOn ? 18 : 2, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.15s" }} />
            </button>
          </div>
        </InfoCard>
      </div>
    </>
  );
}

function InfoCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"#fff", border:"0.5px solid rgba(15,52,96,0.1)", borderRadius:12, boxShadow:"0 1px 2px rgba(15,52,96,0.04)", padding:"14px 16px", ...style }}>
      {children}
    </div>
  );
}

function Field({ label, value, accent }: { label: string; value?: string; accent?: boolean }) {
  return (
    <div>
      <p style={{ fontSize:12, color:"#475569", margin:"0 0 4px" }}>{label}</p>
      <p style={{ fontSize:14, color: accent ? "#144272" : value ? "#0f172a" : "#94a3b8", margin:0, fontWeight: accent ? 500 : 400 }}>
        {value ?? "Not set"}
      </p>
    </div>
  );
}

function StyledBtn({ icon, label, small }: { icon: React.ReactNode; label: string; small?: boolean }) {
  return (
    <button style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, padding: small ? "4px 10px" : "7px 12px", borderRadius:8, border:"0.5px solid rgba(15,52,96,0.2)", background:"#fff", fontSize: small ? 12 : 13, cursor:"pointer", fontFamily:"inherit", color:"#0f172a", width: small ? undefined : "100%", transition:"background 0.15s" }}>
      {icon}{label}
    </button>
  );
}
