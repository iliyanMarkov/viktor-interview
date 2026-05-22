"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import ShipMonitorOverlay from "@/components/ships/ShipMonitorOverlay";
import ShipFleetTicker from "@/components/interactiveMap/ShipFleetTicker";
import { SHIPS, latLonToPercent, type Ship } from "@/lib/ships";
import "./interactive-map.css";

const TOOLBAR_HEIGHT = 50;

type MapBounds = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export interface InteractiveMapProps {
  selectedShip?: Ship | null;
  onSelectedShipChange?: (ship: Ship | null) => void;
}

export default function InteractiveMap({
  selectedShip: selectedShipProp,
  onSelectedShipChange,
}: InteractiveMapProps = {}) {
  const monitorRef = useRef<HTMLDivElement>(null);
  const mapInnerRef = useRef<HTMLDivElement>(null);
  const [internalSelectedShip, setInternalSelectedShip] = useState<Ship | null>(null);
  const selectedShip = selectedShipProp ?? internalSelectedShip;
  const setSelectedShip = onSelectedShipChange ?? setInternalSelectedShip;
  const [hoveredShip, setHoveredShip] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

  const updateMapBounds = useCallback(() => {
    const monitor = monitorRef.current;
    const mapInner = mapInnerRef.current;
    if (!monitor || !mapInner) return;

    const monitorRect = monitor.getBoundingClientRect();
    const mapRect = mapInner.getBoundingClientRect();

    setMapBounds({
      top: mapRect.top - monitorRect.top,
      left: mapRect.left - monitorRect.left,
      width: mapRect.width,
      height: mapRect.height,
    });
  }, []);

  useEffect(() => {
    updateMapBounds();
    window.addEventListener("resize", updateMapBounds);

    const monitor = monitorRef.current;
    const mapInner = mapInnerRef.current;
    const observer = new ResizeObserver(updateMapBounds);
    if (monitor) observer.observe(monitor);
    if (mapInner) observer.observe(mapInner);

    return () => {
      window.removeEventListener("resize", updateMapBounds);
      observer.disconnect();
    };
  }, [updateMapBounds]);

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

  const handleTickerHighlight = (shipId: string) => {
    setHoveredShip(shipId);
    setHoverPosition(resolveShipHoverPosition(shipId));
  };

  const handleTickerClearHighlight = () => {
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
          mapBounds={mapBounds}
          showSelectionModal={!onSelectedShipChange}
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

        <ShipFleetTicker
          hoveredShip={hoveredShip}
          onHighlight={handleTickerHighlight}
          onClearHighlight={handleTickerClearHighlight}
          onSelect={setSelectedShip}
        />
      </div>
    </section>
  );
}
