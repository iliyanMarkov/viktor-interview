"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";
import ShipMonitorOverlay from "@/components/ships/ShipMonitorOverlay";
import { SHIPS, latLonToPercent, type Ship } from "@/lib/ships";
import "./interactive-map.css";

const TOOLBAR_HEIGHT = 50;

export default function InteractiveMap() {
  const monitorRef = useRef<HTMLDivElement>(null);
  const mapInnerRef = useRef<HTMLDivElement>(null);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [hoveredShip, setHoveredShip] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const resolveShipHoverPosition = useCallback((shipId: string) => {
    const ship = SHIPS.find((s) => s.id === shipId);
    const monitor = monitorRef.current;
    const mapInner = mapInnerRef.current;
    if (!ship || !monitor || !mapInner) return null;

    const monitorRect = monitor.getBoundingClientRect();
    const mapRect = mapInner.getBoundingClientRect();
    const { top, left } = latLonToPercent(ship.lat, ship.lon);

    return {
      x: mapRect.left - monitorRect.left + (parseFloat(left) / 100) * mapRect.width,
      y: mapRect.top - monitorRect.top + (parseFloat(top) / 100) * mapRect.height,
    };
  }, []);

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
        <ShipMonitorOverlay
          selectedShip={selectedShip}
          setSelectedShip={setSelectedShip}
          hoveredShip={hoveredShip}
          setHoveredShip={setHoveredShip}
          hoverPosition={hoverPosition}
          setHoverPosition={setHoverPosition}
          toolbarHeight={TOOLBAR_HEIGHT}
          resolveShipHoverPosition={resolveShipHoverPosition}
        />

        <div className="interactive-map__map">
          <div ref={mapInnerRef} className="interactive-map__inner">
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
        </div>
      </div>
    </section>
  );
}
