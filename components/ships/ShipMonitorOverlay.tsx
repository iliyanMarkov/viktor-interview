"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  IconAnchor,
  IconNavigation,
  IconUsers,
  IconWind,
  IconX,
  IconMapPin,
  IconCalendar,
  IconBriefcase,
  IconGlobe,
  IconShip,
  IconSatellite,
  IconWifi,
  IconCloudRain,
  IconLock,
} from "@tabler/icons-react";
import { SHIPS, STATUS_THEME, type Ship } from "@/lib/ships";

function StatCard({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(15,52,96,0.08)",
        borderRadius: 10,
        padding: "14px 16px",
        boxShadow: "0 1px 2px rgba(15,52,96,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: color ?? "#0a2540",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Ship["status"] }) {
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

type HoverBounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function computeClampedTooltipPosition(
  anchor: { x: number; y: number },
  card: { width: number; height: number },
  bounds: HoverBounds,
  offset = 14,
  padding = 8,
) {
  const boundRight = bounds.left + bounds.width;
  const boundBottom = bounds.top + bounds.height;

  let left = anchor.x + offset;
  let top = anchor.y + offset;

  if (left + card.width + padding > boundRight) {
    left = anchor.x - card.width - offset;
  }
  if (top + card.height + padding > boundBottom) {
    top = anchor.y - card.height - offset;
  }

  left = Math.max(
    bounds.left + padding,
    Math.min(left, boundRight - card.width - padding),
  );
  top = Math.max(
    bounds.top + padding,
    Math.min(top, boundBottom - card.height - padding),
  );

  return { left, top };
}

function ShipHoverTooltip({
  ship,
  anchor,
  bounds,
}: {
  ship: Ship;
  anchor: { x: number; y: number };
  bounds: HoverBounds;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(() => ({
    left: anchor.x + 14,
    top: anchor.y + 14,
  }));

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const { width, height } = card.getBoundingClientRect();
    setPosition(
      computeClampedTooltipPosition(anchor, { width, height }, bounds),
    );
  }, [
    anchor.x,
    anchor.y,
    bounds.top,
    bounds.left,
    bounds.width,
    bounds.height,
    ship.id,
  ]);

  return (
    <div
      ref={cardRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        background: "#fff",
        border: "1px solid rgba(15,52,96,0.12)",
        borderRadius: 10,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        padding: "10px 14px",
        pointerEvents: "none",
        animation: "sm-fadein 0.15s ease",
        minWidth: 160,
        zIndex: 25,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#64748b",
          marginBottom: 2,
          letterSpacing: "0.04em",
        }}
      >
        {ship.id}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#0a2540",
          marginBottom: 4,
        }}
      >
        {ship.name}
      </div>
      <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>
        {ship.type}
      </div>
      <StatusPill status={ship.status} />
    </div>
  );
}

export interface ShipMonitorOverlayProps {
  selectedShip: Ship | null;
  setSelectedShip: (ship: Ship | null) => void;
  hoveredShip: string | null;
  setHoveredShip: (id: string | null) => void;
  /** When set, the hover card follows the cursor (map dot hover). */
  hoverPosition?: { x: number; y: number } | null;
  setHoverPosition?: (position: { x: number; y: number } | null) => void;
  /** Renders a top toolbar strip (map layout) with toggle buttons inside it. */
  toolbarHeight?: number;
  /** Map layout: place hover card at the ship dot for list item hovers. */
  resolveShipHoverPosition?: (
    shipId: string,
  ) => { x: number; y: number } | null;
  /** Map layout: clamp hover card within the visible map area. */
  mapBounds?: HoverBounds | null;
}

export default function ShipMonitorOverlay({
  selectedShip,
  setSelectedShip,
  hoveredShip,
  setHoveredShip,
  hoverPosition = null,
  setHoverPosition,
  toolbarHeight,
  resolveShipHoverPosition,
  mapBounds = null,
}: ShipMonitorOverlayProps) {
  const [time, setTime] = useState<Date | null>(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function onResize() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setLeftOpen(false);
        setRightOpen(false);
      }
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(
    () => ({
      total: SHIPS.length,
      underway: SHIPS.filter((s) => s.status === "underway").length,
      anchored: SHIPS.filter((s) => s.status === "anchored").length,
      inPort: SHIPS.filter((s) => s.status === "in-port").length,
      totalCrew: SHIPS.reduce((acc, s) => acc + s.crew.length, 0),
    }),
    [],
  );

  const hoveredShipData = hoveredShip
    ? SHIPS.find((s) => s.id === hoveredShip)
    : null;
  const utcTime = time
    ? `${time.toISOString().split("T")[1].split(".")[0]} UTC`
    : null;

  const closePanels = () => {
    setLeftOpen(false);
    setRightOpen(false);
  };

  const panelTop = isMobile ? 56 : (toolbarHeight ?? 0);

  const fleetOverviewButton = (
    <button
      type="button"
      className="sm-toggle-btn"
      onClick={() => {
        if (leftOpen) {
          setLeftOpen(false);
        } else {
          setLeftOpen(true);
          setRightOpen(false);
        }
      }}
      style={{
        ...(toolbarHeight
          ? {}
          : {
              position: "absolute",
              top: 16,
              left: !isMobile && leftOpen ? 272 : 16,
              transition: "left 0.25s ease",
            }),
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.92)",
        color: "#0a2540",
        border: "1px solid rgba(15,52,96,0.12)",
        borderRadius: 8,
        padding: "7px 12px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(15,52,96,0.10)",
        backdropFilter: "blur(6px)",
        zIndex: 20,
      }}
    >
      <IconAnchor size={13} />
      Fleet Overview
    </button>
  );

  const activeVesselsButton = (
    <button
      type="button"
      className="sm-toggle-btn"
      onClick={() => {
        if (rightOpen) {
          setRightOpen(false);
        } else {
          setRightOpen(true);
          setLeftOpen(false);
        }
      }}
      style={{
        ...(toolbarHeight
          ? {}
          : {
              position: "absolute",
              top: 16,
              right: !isMobile && rightOpen ? 312 : 16,
              transition: "right 0.25s ease",
            }),
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.92)",
        color: "#0a2540",
        border: "1px solid rgba(15,52,96,0.12)",
        borderRadius: 8,
        padding: "7px 12px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(15,52,96,0.10)",
        backdropFilter: "blur(6px)",
        zIndex: 20,
      }}
    >
      <IconShip size={13} />
      Active Vessels
    </button>
  );

  return (
    <>
      <style>{`
        .sm-ship-item:hover { background: #f8fafc !important; }
        .sm-crew-card:hover  { background: #f8fafc !important; }
        .sm-toggle-btn:hover { color: #0a2540 !important; background: #fff !important; box-shadow: 0 2px 8px rgba(15,52,96,0.12) !important; }
        @keyframes sm-live { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes sm-fadein { from{opacity:0} to{opacity:1} }
        @keyframes sm-slideup { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      {toolbarHeight ? (
        <div className="interactive-map__toolbar">
          {fleetOverviewButton}
          {activeVesselsButton}
        </div>
      ) : null}

      {hoveredShipData && hoverPosition && mapBounds ? (
        <ShipHoverTooltip
          ship={hoveredShipData}
          anchor={hoverPosition}
          bounds={mapBounds}
        />
      ) : null}

      {hoveredShipData && (!hoverPosition || !mapBounds) ? (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: leftOpen ? 280 : 16,
            transform: "translateY(-50%)",
            background: "#fff",
            border: "1px solid rgba(15,52,96,0.12)",
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            padding: "10px 14px",
            pointerEvents: "none",
            animation: "sm-fadein 0.15s ease",
            minWidth: 160,
            transition: "left 0.25s ease",
            zIndex: 15,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#64748b",
              marginBottom: 2,
              letterSpacing: "0.04em",
            }}
          >
            {hoveredShipData.id}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#0a2540",
              marginBottom: 4,
            }}
          >
            {hoveredShipData.name}
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 8 }}>
            {hoveredShipData.type}
          </div>
          <StatusPill status={hoveredShipData.status} />
        </div>
      ) : null}

      {(leftOpen || rightOpen) && (
        <div
          onClick={closePanels}
          aria-hidden
          style={{
            position: isMobile ? "fixed" : "absolute",
            top: panelTop,
            left: 0,
            right: 0,
            bottom: 0,
            background: isMobile ? "rgba(0,0,0,0.45)" : "transparent",
            zIndex: 19,
          }}
        />
      )}

      {!toolbarHeight ? fleetOverviewButton : null}

      {!toolbarHeight ? activeVesselsButton : null}

      <aside
        style={{
          position: isMobile ? "fixed" : "absolute",
          top: panelTop,
          left: 0,
          bottom: 0,
          width: isMobile ? "100vw" : 264,
          transform: leftOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          background: "#fff",
          borderRight: isMobile ? "none" : "1px solid rgba(15,52,96,0.10)",
          display: "flex",
          flexDirection: "column",
          zIndex: isMobile ? 40 : 25,
        }}
      >
        <div
          style={{
            padding: "14px 16px 10px",
            borderBottom: "1px solid rgba(15,52,96,0.06)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0a2540" }}>
              Fleet Overview
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "#64748b",
                }}
              >
                {utcTime ?? "––:––:––"}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 500,
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "2px 7px",
                  borderRadius: 20,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "inline-block",
                    animation: "sm-live 2s infinite",
                  }}
                />
                Live
              </span>
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setLeftOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    padding: 10,
                    display: "flex",
                    marginLeft: "auto",
                  }}
                >
                  <IconX size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <StatCard value={stats.total} label="Vessels" />
            <StatCard value={stats.underway} label="Underway" color="#16a34a" />
            <StatCard value={stats.anchored} label="Anchored" color="#d97706" />
            <StatCard value={stats.inPort} label="In Port" color="#2563eb" />
          </div>
          <StatCard value={stats.totalCrew} label="Total crew aboard" />

          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              System Status
            </p>
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(15,52,96,0.08)",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(15,52,96,0.04)",
              }}
            >
              {[
                { icon: IconSatellite, label: "Satellite", status: "Online" },
                { icon: IconWifi, label: "AIS Uplink", status: "Active" },
                {
                  icon: IconCloudRain,
                  label: "Weather Feed",
                  status: "Synced",
                },
                { icon: IconLock, label: "Encryption", status: "AES-256" },
              ].map(({ icon: Icon, label, status }, i, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 13px",
                    borderBottom:
                      i < arr.length - 1
                        ? "1px solid rgba(15,52,96,0.06)"
                        : "none",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    <Icon size={13} style={{ color: "#64748b" }} />
                    <span style={{ fontSize: 12, color: "#334155" }}>
                      {label}
                    </span>
                  </div>
                  <span
                    style={{ fontSize: 11, fontWeight: 500, color: "#16a34a" }}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
              }}
            >
              Vessel Status
            </p>
            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(15,52,96,0.08)",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(15,52,96,0.04)",
              }}
            >
              {(
                Object.entries(STATUS_THEME) as [
                  Ship["status"],
                  (typeof STATUS_THEME)[Ship["status"]],
                ][]
              ).map(([key, t], i, arr) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "9px 13px",
                    borderBottom:
                      i < arr.length - 1
                        ? "1px solid rgba(15,52,96,0.06)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: t.dot,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, color: "#334155" }}>
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <aside
        style={{
          position: isMobile ? "fixed" : "absolute",
          top: panelTop,
          right: 0,
          bottom: 0,
          width: isMobile ? "100vw" : 296,
          transform: rightOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.25s ease",
          background: "#fff",
          borderLeft: isMobile ? "none" : "1px solid rgba(15,52,96,0.10)",
          display: "flex",
          flexDirection: "column",
          zIndex: isMobile ? 40 : 25,
        }}
      >
        <div
          style={{
            padding: "14px 16px 10px",
            borderBottom: "1px solid rgba(15,52,96,0.06)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <IconShip size={15} style={{ color: "#2e7cc4" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0a2540" }}>
              Active Vessels
            </span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 500,
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "1px 7px",
                borderRadius: 20,
              }}
            >
              {SHIPS.length}
            </span>
            {isMobile && (
              <button
                type="button"
                onClick={() => setRightOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: 4,
                  display: "flex",
                }}
              >
                <IconX size={18} />
              </button>
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px" }}>
          {SHIPS.map((ship) => {
            const isHovered = hoveredShip === ship.id;
            return (
              <div
                key={ship.id}
                className="sm-ship-item"
                onClick={() => setSelectedShip(ship)}
                onMouseEnter={() => {
                  setHoveredShip(ship.id);
                  setHoverPosition?.(
                    resolveShipHoverPosition?.(ship.id) ?? null,
                  );
                }}
                onMouseLeave={() => {
                  setHoveredShip(null);
                  setHoverPosition?.(null);
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${isHovered ? "#bfdbfe" : "rgba(15,52,96,0.08)"}`,
                  background: isHovered ? "#eff6ff" : "#fff",
                  marginBottom: 6,
                  cursor: "pointer",
                  transition: "background 0.12s, border-color 0.12s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "#94a3b8",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {ship.id}
                  </span>
                  <StatusPill status={ship.status} />
                </div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#0a2540" }}
                >
                  {ship.name}
                </div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                  {ship.type} · {ship.flag}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {selectedShip && (
        <div
          onClick={() => setSelectedShip(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(10, 37, 64, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            animation: "sm-fadein 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              border: "1px solid rgba(15,52,96,0.10)",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              width: "100%",
              maxWidth: 900,
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              animation: "sm-slideup 0.25s ease",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(15,52,96,0.08)",
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
                  {selectedShip.id}
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
                  {selectedShip.name}
                </h2>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 6,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#475569" }}>
                    {selectedShip.type}
                  </span>
                  <span style={{ color: "#cbd5e1" }}>·</span>
                  <span style={{ fontSize: 12, color: "#475569" }}>
                    Flag: {selectedShip.flag}
                  </span>
                  <span style={{ color: "#cbd5e1" }}>·</span>
                  <StatusPill status={selectedShip.status} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShip(null)}
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
              >
                <IconX size={16} />
              </button>
            </div>

            <div
              style={{ overflowY: "auto", flex: 1, padding: "20px 24px 24px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 20,
                  justifyContent: "space-between",
                }}
              >
                {[
                  {
                    icon: IconNavigation,
                    label: "Speed",
                    value: `${selectedShip.speed} kts`,
                  },
                  {
                    icon: IconWind,
                    label: "Heading",
                    value: `${String(selectedShip.heading).padStart(3, "0")}°`,
                  },
                  {
                    icon: IconMapPin,
                    label: "Destination",
                    value: selectedShip.destination,
                  },
                  { icon: IconCalendar, label: "ETA", value: selectedShip.eta },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid rgba(15,52,96,0.08)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      flex: 1,
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
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginBottom: 24,
                  justifyContent: "space-between",
                }}
              >
                {[
                  {
                    icon: IconGlobe,
                    label: "Coordinates",
                    value: `${Math.abs(selectedShip.lat).toFixed(2)}° ${selectedShip.lat >= 0 ? "N" : "S"} · ${Math.abs(selectedShip.lon).toFixed(2)}° ${selectedShip.lon >= 0 ? "E" : "W"}`,
                  },
                  {
                    icon: IconBriefcase,
                    label: "Cargo Manifest",
                    value: selectedShip.cargo,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid rgba(15,52,96,0.08)",
                      borderRadius: 10,
                      padding: "12px 14px",
                      flex: 1,
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
                ))}
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
                  {selectedShip.crew.length} personnel
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
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  justifyContent: "space-between",
                }}
              >
                {selectedShip.crew.map((member, idx) => {
                  const initials = member.name
                    .split(" ")
                    .filter(
                      (p) =>
                        !["Captain", "Dr."].includes(p) && !p.includes("."),
                    )
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("");
                  return (
                    <div
                      key={idx}
                      className="sm-crew-card"
                      style={{
                        background: "#fff",
                        border: "1px solid rgba(15,52,96,0.08)",
                        borderRadius: 10,
                        padding: 14,
                        transition: "background 0.12s",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{ display: "flex", gap: 10, marginBottom: 10 }}
                      >
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
                          {initials}
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
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
