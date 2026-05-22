"use client";

import { useRef, useState, type MouseEvent } from "react";
import ShipMonitorOverlay from "@/components/ships/ShipMonitorOverlay";
import { SHIPS, latLonToPercent, type Ship } from "@/lib/ships";
import "./interactive-map.css";

export default function InteractiveMap() {
  const monitorRef = useRef<HTMLDivElement>(null);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [hoveredShip, setHoveredShip] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const updateHoverPosition = (e: MouseEvent) => {
    const rect = monitorRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHoverPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleDotEnter = (shipId: string, e: MouseEvent) => {
    setHoveredShip(shipId);
    updateHoverPosition(e);
  };

  const handleDotLeave = () => {
    setHoveredShip(null);
    setHoverPosition(null);
  };

  return (
    <section className="interactive-map" aria-label="Fleet ship locations">
      <div ref={monitorRef} className="interactive-map__monitor">
        <div className="interactive-map__inner">
          <img src="/world-map.png" alt="World map showing fleet ship locations" />
          {SHIPS.map((ship) => {
            const position = latLonToPercent(ship.lat, ship.lon);
            const isHovered = hoveredShip === ship.id;

            return (
              <button
                key={ship.id}
                type="button"
                className={`map-point${isHovered ? " map-point--hover" : ""}`}
                style={{ top: position.top, left: position.left }}
                aria-label={`${ship.name} — ${ship.type}`}
                onClick={() => setSelectedShip(ship)}
                onMouseEnter={(e) => handleDotEnter(ship.id, e)}
                onMouseMove={updateHoverPosition}
                onMouseLeave={handleDotLeave}
              />
            );
          })}
        </div>

        <ShipMonitorOverlay
          selectedShip={selectedShip}
          setSelectedShip={setSelectedShip}
          hoveredShip={hoveredShip}
          setHoveredShip={setHoveredShip}
          hoverPosition={hoverPosition}
          setHoverPosition={setHoverPosition}
        />
      </div>
    </section>
  );
}
