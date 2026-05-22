"use client";

import { useEffect, useState } from "react";
import {
  ClockRow,
  DEFAULT_CLOCKS,
  EXTRA_CLOCK_OPTIONS,
} from "@/components/clocks";
import InteractiveMap from "@/components/interactiveMap";
import ShipDetailPanel from "@/components/ships/ShipDetailPanel";
import type { Ship } from "@/lib/ships";

/* ── Card shell ─────────────────────────────────────────── */
function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        height: "fit-content",
        background: "#fff",
        border: "1px solid rgba(15,52,96,0.08)",
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(15,52,96,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [now, setNow] = useState<Date | null>(null);
  const [clocks, setClocks] = useState(DEFAULT_CLOCKS);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  function removeClock(idx: number) {
    setClocks((prev) => prev.filter((_, i) => i !== idx));
  }

  function addClock() {
    setClocks((prev) => {
      const used = new Set(prev.map((c) => c.tz));
      const next = EXTRA_CLOCK_OPTIONS.find((c) => !used.has(c.tz));
      return next ? [...prev, next] : prev;
    });
  }

  const canAddClock = EXTRA_CLOCK_OPTIONS.some(
    (c) => !clocks.some((existing) => existing.tz === c.tz),
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: 18 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#0a2540",
              margin: 0,
            }}
          >
            Welcome Viktor Dukov
          </h1>
        </div>

        {/* ── World clocks ── */}
        <ClockRow
          clocks={clocks}
          now={now}
          onRemove={removeClock}
          onAdd={addClock}
          canAdd={canAddClock}
          size={1.1}
        />

        <InteractiveMap
          selectedShip={selectedShip}
          onSelectedShipChange={setSelectedShip}
        />

        {selectedShip && (
          <Card style={{ marginTop: 20 }}>
            <ShipDetailPanel
              ship={selectedShip}
              onClose={() => setSelectedShip(null)}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
