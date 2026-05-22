"use client";

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
  const items = [...SHIPS, ...SHIPS];

  return (
    <div className="interactive-map__ticker" aria-label="Fleet ship ticker">
      <div className="interactive-map__ticker-fade interactive-map__ticker-fade--left" aria-hidden />
      <div className="interactive-map__ticker-fade interactive-map__ticker-fade--right" aria-hidden />
      <div className="interactive-map__ticker-viewport">
        <div className="interactive-map__ticker-track">
          {items.map((ship, index) => (
            <ShipTickerCard
              key={`${ship.id}-${index}`}
              ship={ship}
              isHighlighted={hoveredShip === ship.id}
              onSelect={onSelect}
              onHighlight={onHighlight}
              onClearHighlight={onClearHighlight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
