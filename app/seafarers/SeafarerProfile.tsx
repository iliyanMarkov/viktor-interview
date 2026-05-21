"use client";

import "./seafarers.css";
import { useState, useRef, useEffect } from "react";
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
  IconAnchor,
  IconFlag,
  IconShip,
  IconUser,
  IconBriefcase,
  IconCalendarEvent,
  IconAlertCircle,
  IconUserCheck,
  IconBell,
  IconEdit,
  IconFileImport,
  IconMail,
  IconTrendingUp,
  IconPhone,
  IconMapPin,
  IconCake,
  IconPlane,
  IconCash,
  IconChartLine,
  IconChevronDown,
} from "@tabler/icons-react";
import {
  type Seafarer,
  STATUS_GRADIENT,
  getInitials,
  MONTHS,
  SERIES_DATA,
} from "@/lib/seafarers";
import StatusBadge from "@/components/StatusBadge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

const COLORS = {
  performance: "#2563eb",
  salary: "#0891b2",
  contract: "#7c3aed",
  travelTime: "#d97706",
  travelCost: "#dc2626",
  home: "#059669",
  risk: "#db2777",
};
type SeriesKey = keyof typeof COLORS;

const SERIES_META: Record<
  SeriesKey,
  {
    label: string;
    format: (v: number) => string;
    normalize: (v: number) => number;
    summary: string;
  }
> = {
  performance: {
    label: "Performance",
    format: (v) => `${v} / 100`,
    normalize: (v) => v,
    summary: "87 / 100",
  },
  salary: {
    label: "Salary",
    format: (v) => `$${v.toLocaleString("en-US")} /mo`,
    normalize: (v) => Math.round(((v - 4000) / 1000) * 50 + 40),
    summary: "$4,850 /mo",
  },
  contract: {
    label: "Contract",
    format: (v) => `${v.toFixed(1)} months`,
    normalize: (v) => Math.round(((v - 4) / 4) * 60 + 30),
    summary: "6.2 months",
  },
  travelTime: {
    label: "Travel time",
    format: (v) => `${v.toFixed(1)} hrs`,
    normalize: (v) => Math.round(((v - 8) / 16) * 60 + 20),
    summary: "14.5 hrs",
  },
  travelCost: {
    label: "Travel cost",
    format: (v) => `$${v.toLocaleString("en-US")}`,
    normalize: (v) => Math.round(((v - 800) / 1200) * 60 + 20),
    summary: "$1,420",
  },
  home: {
    label: "Home duration",
    format: (v) => `${v} days`,
    normalize: (v) => Math.round(((v - 30) / 90) * 60 + 30),
    summary: "94 days",
  },
  risk: {
    label: "Risk factor",
    format: (v) => `${v}%`,
    normalize: (v) => v,
    summary: "12% · Low",
  },
};

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "personal", label: "Personal" },
  { key: "employment", label: "Employment" },
  { key: "performance", label: "Performance" },
  { key: "agent", label: "Agent" },
] as const;
type SectionKey = (typeof SECTIONS)[number]["key"];

const MOBILE_BP = 768;

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid rgba(15,52,96,0.08)",
  borderRadius: 12,
  boxShadow: "0 1px 2px rgba(15,52,96,0.04)",
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function HeroAvatar({
  seafarer,
  isMobile = false,
}: {
  seafarer: Seafarer;
  isMobile?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const photo = seafarer.photo;
  const showMeta = isMobile || hovered;

  if (isMobile) {
    return (
      <div style={{ ...cardStyle, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            gap: 14,
            padding: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              flexShrink: 0,
              overflow: "hidden",
              position: "relative",
              background: photo
                ? `url(${photo}) center / cover no-repeat`
                : STATUS_GRADIENT[seafarer.status],
            }}
          >
            {!photo && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.02em",
                }}
              >
                {getInitials(seafarer)}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: "#0f3460",
                    fontWeight: 700,
                    fontSize: 16,
                    lineHeight: 1.2,
                    marginBottom: 2,
                  }}
                >
                  {seafarer.firstName} {seafarer.lastName}
                </div>
                <div style={{ color: "#64748b", fontSize: 13 }}>
                  {seafarer.rank}
                </div>
              </div>
              <StatusBadge status={seafarer.status} size="sm" />
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              ID: {seafarer.id}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px 16px",
            padding: "12px 16px 16px",
            borderTop: "1px solid rgba(15,52,96,0.08)",
          }}
        >
          <MetaItem
            icon={<IconFlag size={14} />}
            label="Nationality"
            value={seafarer.nationality}
          />
          <MetaItem
            icon={<IconShip size={14} />}
            label="Vessel"
            value={seafarer.currentVessel ?? "—"}
          />
          <MetaItem
            icon={<IconUser size={14} />}
            label="Age"
            value={`${seafarer.age}`}
          />
          <MetaItem
            icon={<IconTrendingUp size={14} />}
            label="Promotions"
            value={`${seafarer.promotions}`}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        aspectRatio: "3 / 4",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        background: photo
          ? `url(${photo}) center / cover no-repeat`
          : STATUS_GRADIENT[seafarer.status],
      }}
    >
      {photo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55) 100%)",
            pointerEvents: "none",
          }}
        />
      )}

      {!photo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 160,
              height: 160,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "28%",
              left: -50,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
            }}
          />
        </div>
      )}

      {!photo && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -62%)",
            padding: 14,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "clamp(22px, 6vw, 32px)",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "0.02em",
            backdropFilter: "blur(4px)",
          }}
        >
          {getInitials(seafarer)}
        </div>
      )}
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: "rgba(255,255,255,0.75)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          position: "absolute",
          top: 19,
          left: 10,
        }}
      >
        ID: {seafarer.id}
      </div>
      <div style={{ position: "absolute", top: 12, right: 10 }}>
        <StatusBadge status={seafarer.status} variant="dark" size="sm" />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
        }}
      >
        <div style={{ padding: "20px 16px 16px" }}>
          <div
            style={{
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "clamp(16px, 4vw, 20px)",
              lineHeight: 1.2,
              marginBottom: 4,
            }}
          >
            {seafarer.firstName} {seafarer.lastName}
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
            {seafarer.rank}
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateRows: showMeta ? "1fr" : "0fr",
            transition: "grid-template-rows 0.35s ease-in-out",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                padding: "0px 16px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                transform: showMeta ? "translateY(0)" : "translateY(100%)",
                opacity: showMeta ? 1 : 0,
                transition:
                  "transform 0.35s ease-in-out, opacity 0.35s ease-in-out",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px 16px",
                }}
              >
                <MetaItem
                  variant="dark"
                  icon={<IconFlag size={14} />}
                  label="Nationality"
                  value={seafarer.nationality}
                />
                <MetaItem
                  variant="dark"
                  icon={<IconShip size={14} />}
                  label="Vessel"
                  value={seafarer.currentVessel ?? "—"}
                />
                <MetaItem
                  variant="dark"
                  icon={<IconUser size={14} />}
                  label="Age"
                  value={`${seafarer.age}`}
                />
                <MetaItem
                  variant="dark"
                  icon={<IconTrendingUp size={14} />}
                  label="Promotions"
                  value={`${seafarer.promotions}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SeafarerProfile({ seafarer }: { seafarer: Seafarer }) {
  const [section, setSection] = useState<SectionKey>("overview");
  const [sectionOpen, setSectionOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeKeys, setActiveKeys] = useState<Set<SeriesKey>>(
    new Set(["performance"]),
  );
  const [reminderOn, setReminderOn] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const chartRef = useRef<ChartJS<"line"> | null>(null);

  const activeSection = SECTIONS.find((s) => s.key === section) ?? SECTIONS[0];

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < MOBILE_BP);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (
        sectionRef.current &&
        !sectionRef.current.contains(e.target as Node)
      ) {
        setSectionOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

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
        label: cfg.label,
        data: raw.map(cfg.normalize),
        rawData: raw,
        formatter: cfg.format,
        borderColor: color,
        backgroundColor: hexToRgba(color, 0.12),
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
        tension: 0.45,
        fill: true,
        cubicInterpolationMode: "monotone" as const,
      };
    });
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0a2540",
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(46,124,196,0.4)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 4,
        titleFont: { size: 13, weight: 600 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx: TooltipItem<"line">) => {
            const ds = ctx.dataset as unknown as {
              rawData: number[];
              formatter: (v: number) => string;
              label: string;
            };
            const raw = ds.rawData[ctx.dataIndex];
            return `  ${ds.label}: ${ds.formatter(raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#94a3b8",
          font: { size: 11 },
        },
        border: { color: "#e2e8f0" },
      },
      y: {
        beginAtZero: false,
        min: 0,
        max: 100,
        grid: { color: "rgba(15,52,96,0.06)" },
        ticks: { display: false },
        border: { display: false },
      },
    },
  };

  return (
    <div
      className="seafarer-profile-bg"
      style={{
        flex: 1,
        height: "100%",
        overflow: isMobile ? "auto" : "hidden",
        display: "flex",
        flexDirection: "column",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          display: isMobile ? "flex" : "grid",
          flexWrap: isMobile ? "wrap" : undefined,
          gridTemplateColumns: isMobile
            ? undefined
            : "minmax(220px, 300px) 1fr",
          gap: 20,
        }}
      >
        {/* Left: photo card */}
        <div
          style={
            isMobile
              ? { flex: "1 1 100%", minWidth: 0, width: "100%" }
              : undefined
          }
        >
          <HeroAvatar seafarer={seafarer} isMobile={isMobile} />
        </div>

        {/* Right: details */}
        <main
          style={{
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            padding: "20px 24px",
            ...(isMobile
              ? { flex: "1 1 100%", minWidth: 0, width: "100%" }
              : {}),
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap-reverse",
              marginBottom: 16,
            }}
          >
            <div ref={sectionRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setSectionOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={sectionOpen}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: sectionOpen ? "#eff6ff" : "#ffffff",
                  color: "#0f3460",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  minWidth: 160,
                  justifyContent: "space-between",
                }}
              >
                {activeSection.label}
                <IconChevronDown
                  size={14}
                  style={{
                    color: "#64748b",
                    transition: "transform 0.2s ease",
                    transform: sectionOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {sectionOpen && (
                <div
                  role="listbox"
                  aria-label="Profile section"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    minWidth: "100%",
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    padding: "4px 0",
                    zIndex: 30,
                  }}
                >
                  {SECTIONS.map((s) => {
                    const active = section === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setSection(s.key);
                          setSectionOpen(false);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "8px 14px",
                          border: "none",
                          background: active ? "#eff6ff" : "transparent",
                          color: active ? "#0f3460" : "#0f172a",
                          fontSize: 13,
                          fontWeight: active ? 600 : 400,
                          textAlign: "left",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ActionBtn icon={<IconEdit size={15} />} label="Edit" />
              <ActionBtn icon={<IconFileImport size={15} />} label="Sync" />
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            {section === "overview" && <OverviewView seafarer={seafarer} />}
            {section === "personal" && <PersonalView seafarer={seafarer} />}
            {section === "employment" && <EmploymentView seafarer={seafarer} />}
            {section === "performance" && (
              <PerformanceView
                activeKeys={activeKeys}
                toggleSeries={toggleSeries}
                buildDatasets={buildDatasets}
                chartOptions={chartOptions}
                chartRef={chartRef}
              />
            )}
            {section === "agent" && (
              <AgentView
                seafarer={seafarer}
                reminderOn={reminderOn}
                setReminderOn={setReminderOn}
              />
            )}
          </div>
        </main>
        {isMobile && (
          <div
            style={{
              height: 1,
              width: "100%",
            }}
          ></div>
        )}
      </div>
    </div>
  );
}

function OverviewView({ seafarer }: { seafarer: Seafarer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          padding: "16px 18px",
          background: "#f8fafc",
          borderRadius: 8,
        }}
      >
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            margin: 0,
            color: "#475569",
          }}
        >
          {seafarer.rank} aboard {seafarer.currentVessel ?? "shore leave"} —{" "}
          {seafarer.promotions} promotion{seafarer.promotions === 1 ? "" : "s"}{" "}
          earned, available from {seafarer.availableFrom}.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard label="Last vessel" value={seafarer.lastVessel ?? "—"} />
        <StatCard label="Next vessel" value={seafarer.nextVessel ?? "—"} />
        <StatCard label="Vessel type" value={seafarer.vesselType} />
        <StatCard
          label="Salary"
          value={`$${seafarer.salary.toLocaleString("en-US")}`}
          suffix="/mo"
        />
        <StatCard label="Available from" value={seafarer.availableFrom} />
        <StatCard
          label="Assignment"
          value={seafarer.assignmentDate}
          warning="Date has passed"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          padding: "16px 18px",
          background: "#f8fafc",
          borderRadius: 8,
          border: "1px solid rgba(15,52,96,0.06)",
        }}
      >
        <ContactRow
          icon={<IconPhone size={15} />}
          value={seafarer.phone ?? "—"}
        />
        <ContactRow
          icon={<IconMail size={15} />}
          value={seafarer.email ?? "—"}
        />
        <ContactRow
          icon={<IconPlane size={15} />}
          value={seafarer.airport ?? "—"}
        />
      </div>
    </div>
  );
}

function PersonalView({ seafarer }: { seafarer: Seafarer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle
        icon={<IconUser size={18} />}
        title="Personal information"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px 28px",
        }}
      >
        <DataField label="First name" value={seafarer.firstName} />
        <DataField label="Middle name" value={seafarer.middleName} />
        <DataField label="Last name" value={seafarer.lastName} />
        <DataField
          label="Date of birth"
          value={seafarer.dateOfBirth}
          icon={<IconCake size={14} />}
        />
        <DataField label="Place of birth" value={seafarer.placeOfBirth} />
        <DataField
          label="Nationality"
          value={seafarer.nationality}
          icon={<IconFlag size={14} />}
        />
        <DataField
          label="Phone"
          value={seafarer.phone}
          icon={<IconPhone size={14} />}
        />
        <DataField
          label="Email"
          value={seafarer.email}
          icon={<IconMail size={14} />}
        />
        <DataField
          label="Airport"
          value={seafarer.airport}
          icon={<IconPlane size={14} />}
        />
      </div>
      <DataField
        label="Address"
        value={seafarer.address}
        icon={<IconMapPin size={14} />}
        fullWidth
      />
    </div>
  );
}

function EmploymentView({ seafarer }: { seafarer: Seafarer }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle
        icon={<IconBriefcase size={18} />}
        title="Employment & vessel"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px 28px",
        }}
      >
        <DataField
          label="Rank"
          value={seafarer.rank}
          icon={<IconAnchor size={14} />}
        />
        <DataField
          label="Vessel type"
          value={seafarer.vesselType}
          icon={<IconShip size={14} />}
        />
        <DataField label="Last vessel" value={seafarer.lastVessel} />
        <DataField
          label="Current vessel"
          value={seafarer.currentVessel ?? "Not assigned"}
          accent={!!seafarer.currentVessel}
        />
        <DataField label="Next vessel" value={seafarer.nextVessel ?? "—"} />
        <DataField
          label="Salary"
          value={`$${seafarer.salary.toLocaleString("en-US")} /mo`}
          icon={<IconCash size={14} />}
        />
      </div>

      <div
        style={{
          padding: "16px 18px",
          background: "#f8fafc",
          border: "1px solid rgba(15,52,96,0.06)",
          borderRadius: 8,
        }}
      >
        <SectionTitle
          icon={<IconCalendarEvent size={18} />}
          title="Availability"
          compact
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px 24px",
            marginTop: 12,
          }}
        >
          <DataField label="Available from" value={seafarer.availableFrom} />
          <div>
            <FieldLabel>Assignment date</FieldLabel>
            <p style={{ fontSize: 14, color: "#0f172a", margin: "4px 0 0" }}>
              {seafarer.assignmentDate}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#ca8a04",
                margin: "4px 0 0",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <IconAlertCircle size={12} />
              Date has passed
            </p>
          </div>
          <DataField label="Agent" value={seafarer.agent} />
        </div>
      </div>
    </div>
  );
}

function PerformanceView({
  activeKeys,
  toggleSeries,
  buildDatasets,
  chartOptions,
  chartRef,
}: {
  activeKeys: Set<SeriesKey>;
  toggleSeries: (k: SeriesKey) => void;
  buildDatasets: () => ReturnType<typeof Object>;
  chartOptions: object;
  chartRef: React.MutableRefObject<ChartJS<"line"> | null>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <SectionTitle
          icon={<IconChartLine size={18} />}
          title="Career timeline"
        />
        <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
          Last 12 months · toggle metrics to overlay
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(Object.keys(COLORS) as SeriesKey[]).map((key) => {
          const active = activeKeys.has(key);
          const color = COLORS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleSeries(key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                border: active ? `1px solid ${color}` : "1px solid #e2e8f0",
                background: active ? hexToRgba(color, 0.1) : "#ffffff",
                color: active ? "#0f172a" : "#64748b",
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: color,
                  opacity: active ? 1 : 0.4,
                }}
              />
              {SERIES_META[key].label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          background: "#f8fafc",
          border: "1px solid rgba(15,52,96,0.06)",
          borderRadius: 8,
          padding: "16px 18px",
        }}
      >
        <div style={{ position: "relative", height: 200 }}>
          <Line
            ref={chartRef}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={{ labels: MONTHS, datasets: buildDatasets() as any }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options={chartOptions as any}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
        }}
      >
        {(Object.keys(COLORS) as SeriesKey[]).map((key) => {
          if (!activeKeys.has(key)) return null;
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                background: "#f8fafc",
                border: "1px solid rgba(15,52,96,0.06)",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  width: 3,
                  alignSelf: "stretch",
                  background: COLORS[key],
                  borderRadius: 2,
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 500,
                  }}
                >
                  {SERIES_META[key].label}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0a2540",
                    marginTop: 2,
                  }}
                >
                  {SERIES_META[key].summary}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentView({
  seafarer,
  reminderOn,
  setReminderOn,
}: {
  seafarer: Seafarer;
  reminderOn: boolean;
  setReminderOn: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionTitle icon={<IconUserCheck size={18} />} title="Assigned agent" />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "18px 20px",
          background: "#f8fafc",
          border: "1px solid rgba(15,52,96,0.06)",
          borderRadius: 8,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #144272 0%, #2e7cc4 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {seafarer.agent
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              margin: 0,
              color: "#0a2540",
            }}
          >
            {seafarer.agent}
          </p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
            Agent ID · M2306872
          </p>
        </div>
        <ActionBtn icon={<IconMail size={15} />} label="Contact" />
      </div>

      <SectionTitle icon={<IconBell size={18} />} title="Document reminders" />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          background: "#f8fafc",
          border: "1px solid rgba(15,52,96,0.06)",
          borderRadius: 8,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              margin: 0,
              color: "#0f172a",
            }}
          >
            Email reminders
          </p>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
            Alert before document expiry
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReminderOn(!reminderOn)}
          style={{
            width: 40,
            height: 22,
            borderRadius: 999,
            background: reminderOn ? "#2e7cc4" : "#cbd5e1",
            border: "none",
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
          aria-label="Toggle reminders"
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: reminderOn ? 20 : 2,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#ffffff",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }}
          />
        </button>
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
  variant = "light",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: isDark ? "rgba(255,255,255,0.55)" : "#94a3b8",
          fontSize: 10,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 3,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: isDark ? "#ffffff" : "#0f172a",
          fontWeight: 500,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  warning,
}: {
  label: string;
  value: string;
  suffix?: string;
  warning?: string;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: "#f8fafc",
        border: "1px solid rgba(15,52,96,0.06)",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#0a2540",
            lineHeight: 1.2,
          }}
        >
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{suffix}</span>
        )}
      </div>
      {warning && (
        <div
          style={{
            fontSize: 11,
            color: "#ca8a04",
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          <IconAlertCircle size={11} />
          {warning}
        </div>
      )}
    </div>
  );
}

function ContactRow({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 13,
        color: "#0f172a",
      }}
    >
      <span style={{ color: "#2e7cc4", display: "flex" }}>{icon}</span>
      {value}
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  compact,
}: {
  icon: React.ReactNode;
  title: string;
  compact?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "#2e7cc4", display: "flex" }}>{icon}</span>
      <h2
        style={{
          fontSize: compact ? 14 : 15,
          fontWeight: 600,
          margin: 0,
          color: "#0a2540",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        fontWeight: 500,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

function DataField({
  label,
  value,
  accent,
  icon,
  fullWidth,
}: {
  label: string;
  value?: string;
  accent?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div style={{ gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          marginBottom: 4,
        }}
      >
        {icon && (
          <span style={{ color: "#94a3b8", display: "flex" }}>{icon}</span>
        )}
        <FieldLabel>{label}</FieldLabel>
      </div>
      <p
        style={{
          fontSize: 14,
          color: accent ? "#144272" : value ? "#0f172a" : "#94a3b8",
          margin: 0,
          fontWeight: accent ? 600 : 400,
          lineHeight: 1.35,
        }}
      >
        {value ?? "Not set"}
      </p>
    </div>
  );
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 500,
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        color: "#475569",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#f8fafc";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#ffffff";
      }}
    >
      {icon}
      {label}
    </button>
  );
}
