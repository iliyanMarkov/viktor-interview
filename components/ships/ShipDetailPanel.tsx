import {
  IconBriefcase,
  IconCalendar,
  IconGlobe,
  IconMapPin,
  IconNavigation,
  IconUsers,
  IconWind,
  IconX,
} from "@tabler/icons-react";
import { STATUS_THEME, type Ship } from "@/lib/ships";

export function StatusPill({ status }: { status: Ship["status"] }) {
  const t = STATUS_THEME[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 20,
        background: t.bg,
        color: t.text,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: t.dot,
          display: "inline-block",
        }}
      />
      {t.label}
    </span>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid rgba(15,52,96,0.08)",
        borderRadius: 10,
        padding: "12px 14px",
        flex: 1,
        minWidth: 140,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <Icon size={13} style={{ color: "#2e7cc4" }} />
        <span
          style={{
            fontSize: 10,
            color: "#64748b",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#0a2540",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function crewInitials(name: string) {
  return name
    .split(" ")
    .filter((p) => !["Captain", "Dr."].includes(p) && !p.includes("."))
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export interface ShipDetailPanelProps {
  ship: Ship;
  onClose?: () => void;
}

export default function ShipDetailPanel({ ship, onClose }: ShipDetailPanelProps) {
  return (
    <>
      <style>{`.sm-crew-card:hover { background: #f8fafc !important; }`}</style>

      <div
        style={{
          padding: "20px 24px",
          borderBottom: onClose ? "1px solid rgba(15,52,96,0.08)" : undefined,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              marginBottom: 4,
              letterSpacing: "0.04em",
            }}
          >
            {ship.id}
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#0a2540",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {ship.name}
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 12, color: "#475569" }}>{ship.type}</span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <span style={{ fontSize: 12, color: "#475569" }}>
              Flag: {ship.flag}
            </span>
            <span style={{ color: "#cbd5e1" }}>·</span>
            <StatusPill status={ship.status} />
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "1px solid rgba(15,52,96,0.12)",
              borderRadius: 8,
              cursor: "pointer",
              padding: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
            aria-label="Clear selection"
          >
            <IconX size={16} />
          </button>
        )}
      </div>

      <div style={{ padding: "20px 24px 24px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <StatBlock
            icon={IconNavigation}
            label="Speed"
            value={`${ship.speed} kts`}
          />
          <StatBlock
            icon={IconWind}
            label="Heading"
            value={`${String(ship.heading).padStart(3, "0")}°`}
          />
          <StatBlock
            icon={IconMapPin}
            label="Destination"
            value={ship.destination}
          />
          <StatBlock icon={IconCalendar} label="ETA" value={ship.eta} />
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <StatBlock
            icon={IconGlobe}
            label="Coordinates"
            value={`${Math.abs(ship.lat).toFixed(2)}° ${ship.lat >= 0 ? "N" : "S"} · ${Math.abs(ship.lon).toFixed(2)}° ${ship.lon >= 0 ? "E" : "W"}`}
          />
          <StatBlock
            icon={IconBriefcase}
            label="Cargo Manifest"
            value={ship.cargo}
          />
        </div>

        <div
          style={{
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <IconUsers size={15} style={{ color: "#2e7cc4" }} />
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#0a2540",
              margin: 0,
            }}
          >
            Crew Roster
          </h3>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "1px 7px",
              borderRadius: 20,
            }}
          >
            {ship.crew.length} personnel
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              background: "rgba(15,52,96,0.08)",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 10,
          }}
        >
          {ship.crew.map((member, idx) => (
            <div
              key={idx}
              className="sm-crew-card"
              style={{
                background: "#fff",
                border: "1px solid rgba(15,52,96,0.08)",
                borderRadius: 10,
                padding: 14,
                transition: "background 0.12s",
              }}
            >
              <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg, #144272 0%, #2e7cc4 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {crewInitials(member.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0a2540",
                      lineHeight: 1.3,
                    }}
                  >
                    {member.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#2e7cc4",
                      marginTop: 2,
                      fontWeight: 500,
                    }}
                  >
                    {member.role}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {[
                  ["Nationality", member.nationality],
                  ["Age", String(member.age)],
                  ["Experience", member.exp],
                  ["Contact", member.contact],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{ display: "flex", gap: 6, fontSize: 11 }}
                  >
                    <span
                      style={{
                        color: "#94a3b8",
                        minWidth: 72,
                        flexShrink: 0,
                      }}
                    >
                      {k}
                    </span>
                    <span
                      style={{
                        color: "#334155",
                        wordBreak: "break-all",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
