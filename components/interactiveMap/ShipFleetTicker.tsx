"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { SHIPS, STATUS_THEME, type Ship } from "@/lib/ships";

function TickerStatusPill({ status }: { status: Ship["status"] }) {
  const t = STATUS_THEME[status];
  return (
    <span
      className="interactive-map__ticker-status"
      style={{ background: t.bg, color: t.text }}
    >
      <span className="interactive-map__ticker-status-dot" style={{ background: t.dot }} />
      {t.label}
    </span>
  );
}

function ShipTickerCard({
  ship,
  isHighlighted,
  onSelect,
  onHighlight,
  onClearHighlight,
}: {
  ship: Ship;
  isHighlighted: boolean;
  onSelect: (ship: Ship) => void;
  onHighlight: (shipId: string) => void;
  onClearHighlight: () => void;
}) {
  return (
    <button
      type="button"
      className={`interactive-map__ticker-card${isHighlighted ? " interactive-map__ticker-card--active" : ""}`}
      onClick={() => onSelect(ship)}
      onMouseEnter={() => onHighlight(ship.id)}
      onMouseLeave={onClearHighlight}
      aria-label={`${ship.name}, ${ship.type}, ${STATUS_THEME[ship.status].label}`}
    >
      <span className="interactive-map__ticker-id">{ship.id}</span>
      <span className="interactive-map__ticker-name">{ship.name}</span>
      <span className="interactive-map__ticker-type">{ship.type}</span>
      <TickerStatusPill status={ship.status} />
    </button>
  );
}

function TickerGroup({
  groupRef,
  ariaHidden,
  hoveredShip,
  onSelect,
  onHighlight,
  onClearHighlight,
}: {
  groupRef?: RefObject<HTMLDivElement | null>;
  ariaHidden?: boolean;
  hoveredShip: string | null;
  onSelect: (ship: Ship) => void;
  onHighlight: (shipId: string) => void;
  onClearHighlight: () => void;
}) {
  return (
    <div
      ref={groupRef}
      className="interactive-map__ticker-group"
      aria-hidden={ariaHidden || undefined}
    >
      {SHIPS.map((ship) => (
        <ShipTickerCard
          key={ship.id}
          ship={ship}
          isHighlighted={hoveredShip === ship.id}
          onSelect={onSelect}
          onHighlight={onHighlight}
          onClearHighlight={onClearHighlight}
        />
      ))}
    </div>
  );
}

export interface ShipFleetTickerProps {
  hoveredShip: string | null;
  onHighlight: (shipId: string) => void;
  onClearHighlight: () => void;
  onSelect: (ship: Ship) => void;
}

export default function ShipFleetTicker({
  hoveredShip,
  onHighlight,
  onClearHighlight,
  onSelect,
}: ShipFleetTickerProps) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [loopWidth, setLoopWidth] = useState(0);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const measure = () => setLoopWidth(group.offsetWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(group);
    return () => observer.disconnect();
  }, []);

  const trackStyle: CSSProperties | undefined =
    loopWidth > 0
      ? {
          ["--ticker-loop-width" as string]: `${loopWidth}px`,
          animationDuration: `${Math.max(28, loopWidth / 45)}s`,
        }
      : undefined;

  return (
    <div className="interactive-map__ticker" aria-label="Fleet ship ticker">
      <div className="interactive-map__ticker-fade interactive-map__ticker-fade--left" aria-hidden />
      <div className="interactive-map__ticker-fade interactive-map__ticker-fade--right" aria-hidden />
      <div className="interactive-map__ticker-viewport">
        <div
          className={`interactive-map__ticker-track${loopWidth > 0 ? " interactive-map__ticker-track--ready" : ""}`}
          style={trackStyle}
        >
          <TickerGroup
            groupRef={groupRef}
            hoveredShip={hoveredShip}
            onSelect={onSelect}
            onHighlight={onHighlight}
            onClearHighlight={onClearHighlight}
          />
          <TickerGroup
            ariaHidden
            hoveredShip={hoveredShip}
            onSelect={onSelect}
            onHighlight={onHighlight}
            onClearHighlight={onClearHighlight}
          />
        </div>
      </div>
    </div>
  );
}
