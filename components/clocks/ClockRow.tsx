"use client";

import { useEffect, useRef, useState } from "react";
import { IconClock, IconPlus, IconX } from "@tabler/icons-react";
import { CLOCK, type ClockEntry } from "./constants";
import { fmtDate, getTimeNumbers, getTimeParts } from "./utils";

export { DEFAULT_CLOCKS, EXTRA_CLOCK_OPTIONS } from "./constants";

function ClockFlipStyles() {
  return (
    <style>{`
        @keyframes flipDown {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-90deg); }
        }
        @keyframes flipUp {
          0%   { transform: rotateX(90deg); }
          100% { transform: rotateX(0deg); }
        }
      `}</style>
  );
}

function ClockCardShell({
  city,
  onRemove,
  children,
  width = 160,
}: {
  city: string;
  onRemove: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width,
        background: "#fff",
        border: CLOCK.border,
        borderRadius: CLOCK.radius,
        boxShadow: hovered ? CLOCK.shadowHover : CLOCK.shadow,
        padding: "10px 12px",
        transition: "box-shadow 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            minWidth: 0,
          }}
        >
          <IconClock size={13} style={{ color: CLOCK.muted, flexShrink: 0 }} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: CLOCK.navy,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {city}
          </span>
        </div>
        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: hovered ? CLOCK.muted : "transparent",
            padding: 2,
            lineHeight: 1,
            flexShrink: 0,
            transition: "color 0.15s ease",
          }}
          aria-label={`Remove ${city} clock`}
        >
          <IconX size={12} />
        </button>
      </div>
      {children}
    </div>
  );
}

function ClockDate({ tz, now }: { tz: string; now: Date | null }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: CLOCK.slate,
        marginTop: 6,
        textAlign: "center",
      }}
    >
      {now ? fmtDate(tz, now) : "–––"}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   1) FLIP DIGIT — split-flap
══════════════════════════════════════════════════════════ */
function FlipDigit({
  value,
  size = "lg",
}: {
  value: string;
  size?: "lg" | "sm";
}) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      setCurrent(value);
      return;
    }
    if (value !== current) {
      setPrevious(current);
      setCurrent(value);
      setFlipping(true);
      const t = setTimeout(() => setFlipping(false), 600);
      return () => clearTimeout(t);
    }
  }, [value, current]);

  const isLg = size === "lg";
  const W = isLg ? 26 : 16;
  const H = isLg ? 38 : 22;
  const FONT = isLg ? 30 : 18;
  const RADIUS = isLg ? 4 : 3;

  const TOP_BG = CLOCK.surfaceAlt;
  const BOT_BG = CLOCK.surface;
  const TEXT = CLOCK.navy;

  const halfStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    width: W,
    height: H / 2,
    overflow: "hidden",
  };

  const numeralFull: React.CSSProperties = {
    position: "absolute",
    width: W,
    height: H,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Helvetica Neue', 'Arial Narrow', sans-serif",
    fontSize: FONT,
    fontWeight: 700,
    color: TEXT,
    lineHeight: 1,
    letterSpacing: "-0.02em",
  };

  return (
    <div
      style={{ position: "relative", width: W, height: H, perspective: 200 }}
    >
      <div
        style={{
          ...halfStyle,
          top: 0,
          background: TOP_BG,
          borderTopLeftRadius: RADIUS,
          borderTopRightRadius: RADIUS,
          borderBottom: "1px solid rgba(15,52,96,0.1)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <div style={{ ...numeralFull, top: 0, left: 0 }}>{current}</div>
      </div>
      <div
        style={{
          ...halfStyle,
          top: H / 2,
          background: BOT_BG,
          borderBottomLeftRadius: RADIUS,
          borderBottomRightRadius: RADIUS,
          boxShadow: "inset 0 -1px 0 rgba(15,52,96,0.04)",
        }}
      >
        <div style={{ ...numeralFull, top: -H / 2, left: 0 }}>{current}</div>
      </div>
      {flipping && (
        <div
          key={`prev-${previous}-${current}`}
          style={{
            ...halfStyle,
            top: 0,
            background: TOP_BG,
            borderTopLeftRadius: RADIUS,
            borderTopRightRadius: RADIUS,
            borderBottom: "1px solid rgba(15,52,96,0.1)",
            transformOrigin: "bottom center",
            animation: "flipDown 0.3s cubic-bezier(0.4, 0, 0.7, 1) forwards",
            backfaceVisibility: "hidden",
            zIndex: 2,
          }}
        >
          <div style={{ ...numeralFull, top: 0, left: 0 }}>{previous}</div>
        </div>
      )}
      {flipping && (
        <div
          key={`new-${previous}-${current}`}
          style={{
            ...halfStyle,
            top: H / 2,
            background: BOT_BG,
            borderBottomLeftRadius: RADIUS,
            borderBottomRightRadius: RADIUS,
            transformOrigin: "top center",
            animation: "flipUp 0.3s cubic-bezier(0.3, 0, 0.6, 1) 0.3s forwards",
            transform: "rotateX(90deg)",
            backfaceVisibility: "hidden",
            zIndex: 2,
          }}
        >
          <div style={{ ...numeralFull, top: -H / 2, left: 0 }}>{current}</div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: H / 2 - 0.5,
          left: 0,
          width: W,
          height: 1,
          background: "rgba(15,52,96,0.12)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ── Flip clock card ────────────────────────────────────── */
function FlipClockCard({
  city,
  tz,
  now,
  onRemove,
}: {
  city: string;
  tz: string;
  now: Date | null;
  onRemove: () => void;
}) {
  const parts = now ? getTimeParts(tz, now) : { hh: "––", mm: "––", ss: "––" };

  return (
    <ClockCardShell city={city} onRemove={onRemove}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          height: 38,
        }}
      >
        {now ? (
          <>
            <FlipDigit value={parts.hh[0]} />
            <FlipDigit value={parts.hh[1]} />
            <span style={flipSeparator}>:</span>
            <FlipDigit value={parts.mm[0]} />
            <FlipDigit value={parts.mm[1]} />
            <span style={flipSeparator}>:</span>
            <FlipDigit value={parts.ss[0]} size="sm" />
            <FlipDigit value={parts.ss[1]} size="sm" />
          </>
        ) : (
          <div
            style={{
              color: CLOCK.navy,
              fontSize: 14,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            ––:––:––
          </div>
        )}
      </div>
      <ClockDate tz={tz} now={now} />
    </ClockCardShell>
  );
}

const flipSeparator: React.CSSProperties = {
  color: CLOCK.muted,
  fontSize: 20,
  fontWeight: 700,
  margin: "0 1px",
  paddingBottom: 4,
  lineHeight: 1,
};

/* ══════════════════════════════════════════════════════════
   2) CHRONOGRAPH — seven-segment LED
══════════════════════════════════════════════════════════ */
const SEG_MAP: Record<string, number[]> = {
  "0": [1, 1, 1, 1, 1, 1, 0],
  "1": [0, 1, 1, 0, 0, 0, 0],
  "2": [1, 1, 0, 1, 1, 0, 1],
  "3": [1, 1, 1, 1, 0, 0, 1],
  "4": [0, 1, 1, 0, 0, 1, 1],
  "5": [1, 0, 1, 1, 0, 1, 1],
  "6": [1, 0, 1, 1, 1, 1, 1],
  "7": [1, 1, 1, 0, 0, 0, 0],
  "8": [1, 1, 1, 1, 1, 1, 1],
  "9": [1, 1, 1, 1, 0, 1, 1],
};

const SEG_ON = CLOCK.blue;
const SEG_OFF = "rgba(15,52,96,0.06)";

function SevenSeg({
  digit,
  w = 14,
  h = 26,
}: {
  digit: string;
  w?: number;
  h?: number;
}) {
  const segs = SEG_MAP[digit] || [0, 0, 0, 0, 0, 0, 0];
  const stroke = 2.2;
  const inset = 1.6;

  const segStyle = (on: number): React.CSSProperties => ({
    position: "absolute",
    background: SEG_ON,
    opacity: on ? 1 : 0.08,
    transition: "opacity 0.15s",
  });

  // horizontal: a (top), g (mid), d (bottom)
  const horizClip =
    "polygon(0% 50%, 8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%)";
  const vertClip =
    "polygon(50% 0%, 100% 8%, 100% 92%, 50% 100%, 0% 92%, 0% 8%)";

  return (
    <div style={{ position: "relative", width: w, height: h }}>
      {/* a — top */}
      <div
        style={{
          ...segStyle(segs[0]),
          top: 0,
          left: inset,
          right: inset,
          height: stroke,
          clipPath: horizClip,
          width: w - inset * 2,
        }}
      />
      {/* b — top right */}
      <div
        style={{
          ...segStyle(segs[1]),
          top: inset + 1,
          right: 0,
          width: stroke,
          height: h / 2 - inset - 2,
          clipPath: vertClip,
        }}
      />
      {/* c — bottom right */}
      <div
        style={{
          ...segStyle(segs[2]),
          bottom: inset + 1,
          right: 0,
          width: stroke,
          height: h / 2 - inset - 2,
          clipPath: vertClip,
        }}
      />
      {/* d — bottom */}
      <div
        style={{
          ...segStyle(segs[3]),
          bottom: 0,
          left: inset,
          right: inset,
          height: stroke,
          clipPath: horizClip,
          width: w - inset * 2,
        }}
      />
      {/* e — bottom left */}
      <div
        style={{
          ...segStyle(segs[4]),
          bottom: inset + 1,
          left: 0,
          width: stroke,
          height: h / 2 - inset - 2,
          clipPath: vertClip,
        }}
      />
      {/* f — top left */}
      <div
        style={{
          ...segStyle(segs[5]),
          top: inset + 1,
          left: 0,
          width: stroke,
          height: h / 2 - inset - 2,
          clipPath: vertClip,
        }}
      />
      {/* g — middle */}
      <div
        style={{
          ...segStyle(segs[6]),
          top: "50%",
          marginTop: -stroke / 2,
          left: inset,
          right: inset,
          height: stroke,
          clipPath: horizClip,
          width: w - inset * 2,
        }}
      />
    </div>
  );
}

function SegColon({ on }: { on: boolean }) {
  const dot: React.CSSProperties = {
    width: 3,
    height: 3,
    borderRadius: "50%",
    background: SEG_ON,
    opacity: on ? 1 : 0.15,
    transition: "opacity 0.2s",
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 7,
        height: 26,
        padding: "0 1px",
      }}
    >
      <span style={dot} />
      <span style={dot} />
    </div>
  );
}

/* ── Chronograph clock card ─────────────────────────────── */
function ChronoClockCard({
  city,
  tz,
  now,
  onRemove,
}: {
  city: string;
  tz: string;
  now: Date | null;
  onRemove: () => void;
}) {
  const parts = now ? getTimeParts(tz, now) : { hh: "––", mm: "––", ss: "––" };
  const nums = now ? getTimeNumbers(tz, now) : { h: 0, m: 0, s: 0 };
  const blink = nums.s % 2 === 0;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,52,96,0.06)",
        borderRadius: 8,
        padding: "8px 10px 7px",
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: CLOCK.navy,
          overflow: "visible",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          alignItems: "center",
          position: "absolute",
          top: 1,
          left: "50%",
          transform: "translateX(-50%) translateY(-100%)",
          display: "flex",
          gap: 2,
        }}
      >
        {city}
        <button
          onClick={onRemove}
          style={{
            marginRight: -12,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: CLOCK.muted,
            lineHeight: 1,
            flexShrink: 0,
            transition: "color 0.15s ease",
          }}
          aria-label={`Remove ${city} clock`}
        >
          <IconX size={12} />
        </button>
      </span>

      <span
        style={{
          fontSize: 9,
          color: CLOCK.muted,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          alignItems: "center",
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%) translateY(100%)",
        }}
      >
        {now ? fmtDate(tz, now) : "–––"}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {now ? (
          <>
            <SevenSeg digit={parts.hh[0]} />
            <SevenSeg digit={parts.hh[1]} />
            <SegColon on={blink} />
            <SevenSeg digit={parts.mm[0]} />
            <SevenSeg digit={parts.mm[1]} />
            <SegColon on={blink} />
            <SevenSeg digit={parts.ss[0]} w={10} h={20} />
            <SevenSeg digit={parts.ss[1]} w={10} h={20} />
          </>
        ) : (
          <div
            style={{
              color: CLOCK.navy,
              fontSize: 14,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            ––:––:––
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3) COMPASS — analog nautical face
══════════════════════════════════════════════════════════ */

/** Round SVG coords so SSR (Node) and client (browser) produce identical attributes. */
function svgCoord(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function compassPolar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: svgCoord(cx + Math.sin(rad) * r),
    y: svgCoord(cy - Math.cos(rad) * r),
  };
}

const COMPASS_TICK_LINES = Array.from({ length: 60 }, (_, i) => {
  const isHour = i % 5 === 0;
  const r1 = isHour ? 72 : 80;
  const r2 = 86;
  const p1 = compassPolar(100, 100, r1, i * 6);
  const p2 = compassPolar(100, 100, r2, i * 6);
  return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, isHour };
});

const COMPASS_HOUR_LABELS = Array.from({ length: 12 }, (_, i) => {
  const p = compassPolar(100, 100, 60, i * 30);
  return { num: i === 0 ? 12 : i, x: p.x, y: svgCoord(Number(p.y) + 4) };
});

const COMPASS_CARDINAL_LABELS = [
  { l: "N", d: 0 },
  { l: "E", d: 90 },
  { l: "S", d: 180 },
  { l: "W", d: 270 },
].map((c) => {
  const p = compassPolar(100, 100, 40, c.d);
  return { l: c.l, x: p.x, y: svgCoord(Number(p.y) + 3) };
});

function CompassClockCard({
  city,
  tz,
  now,
  onRemove,
}: {
  city: string;
  tz: string;
  now: Date | null;
  onRemove: () => void;
}) {
  const nums = now ? getTimeNumbers(tz, now) : { h: 0, m: 0, s: 0 };
  const h = nums.h % 12;
  const m = nums.m;
  const s = nums.s;
  const hourDeg = (h + m / 60) * 30;
  const minDeg = (m + s / 60) * 6;
  const secDeg = s * 6;

  return (
    <ClockCardShell city={city} onRemove={onRemove} width={160}>
      <div
        style={{
          width: "100%",
          aspectRatio: "1 / 1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 200 200"
          width="100%"
          height="100%"
          style={{ filter: "drop-shadow(0 2px 6px rgba(15,52,96,0.06))" }}
        >
          <circle
            cx="100"
            cy="100"
            r="96"
            fill={CLOCK.surfaceAlt}
            stroke="rgba(15,52,96,0.12)"
            strokeWidth="1.5"
          />
          <circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="rgba(15,52,96,0.08)"
            strokeWidth="0.5"
          />

          {COMPASS_TICK_LINES.map((tick, i) => (
            <line
              key={i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.isHour ? CLOCK.muted : "#cbd5e1"}
              strokeWidth={tick.isHour ? 1.4 : 0.4}
              strokeLinecap="round"
              opacity={tick.isHour ? 1 : 0.7}
            />
          ))}

          {COMPASS_HOUR_LABELS.map((label) => (
            <text
              key={label.num}
              x={label.x}
              y={label.y}
              fill={CLOCK.slate}
              fontSize="10"
              fontWeight="500"
              textAnchor="middle"
            >
              {label.num}
            </text>
          ))}

          {COMPASS_CARDINAL_LABELS.map((c) => (
            <text
              key={c.l}
              x={c.x}
              y={c.y}
              fill={CLOCK.blue}
              fontSize="8"
              fontWeight="700"
              textAnchor="middle"
              letterSpacing="0.2em"
            >
              {c.l}
            </text>
          ))}

          <polygon
            points="100,68 104,100 100,132 96,100"
            fill="rgba(37,99,235,0.08)"
          />
          <polygon
            points="68,100 100,96 132,100 100,104"
            fill="rgba(15,52,96,0.05)"
          />

          <line
            x1="100"
            y1="100"
            x2="100"
            y2="52"
            stroke={CLOCK.navy}
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              transform: `rotate(${hourDeg}deg)`,
              transformOrigin: "100px 100px",
              transition: "transform 0.4s cubic-bezier(0.4, 2, 0.6, 1)",
            }}
          />
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="32"
            stroke={CLOCK.navy}
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{
              transform: `rotate(${minDeg}deg)`,
              transformOrigin: "100px 100px",
              transition: "transform 0.3s cubic-bezier(0.4, 2, 0.6, 1)",
            }}
          />
          <g
            style={{
              transform: `rotate(${secDeg}deg)`,
              transformOrigin: "100px 100px",
            }}
          >
            <line
              x1="100"
              y1="108"
              x2="100"
              y2="24"
              stroke={CLOCK.blue}
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <circle cx="100" cy="40" r="2.5" fill={CLOCK.blue} />
          </g>

          <circle
            cx="100"
            cy="100"
            r="3.5"
            fill="#fff"
            stroke={CLOCK.navy}
            strokeWidth="0.5"
          />
          <circle cx="100" cy="100" r="1.3" fill={CLOCK.blue} />
        </svg>
      </div>
      <ClockDate tz={tz} now={now} />
    </ClockCardShell>
  );
}

/* ══════════════════════════════════════════════════════════
   Clock Row — renders one row of any clock variant
══════════════════════════════════════════════════════════ */
type ClockVariant = "flip" | "chrono" | "compass";

export default function ClockRow({
  variant,
  clocks,
  now,
  onRemove,
  onAdd,
  canAdd = true,
}: {
  variant: ClockVariant;
  clocks: ClockEntry[];
  now: Date | null;
  onRemove: (idx: number) => void;
  onAdd?: () => void;
  canAdd?: boolean;
}) {
  const CardComp =
    variant === "flip"
      ? FlipClockCard
      : variant === "chrono"
        ? ChronoClockCard
        : CompassClockCard;

  return (
    <div style={{ marginBottom: 16 }}>
      {variant === "flip" && <ClockFlipStyles />}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          columnGap: 10,
          rowGap: 30,
          alignItems: "center",
        }}
      >
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            disabled={!canAdd}
            aria-label="Add clock"
            style={{
              margin: "0 36px",
              width: 48,
              height: 48,
              flexShrink: 0,
              background: canAdd ? "#fff" : CLOCK.surfaceAlt,
              border: `1px dashed ${canAdd ? "rgba(37,99,235,0.35)" : "rgba(15,52,96,0.12)"}`,
              borderRadius: "50%",
              boxShadow: CLOCK.shadow,
              padding: 0,
              cursor: canAdd ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: canAdd ? CLOCK.blue : CLOCK.muted,
              transition: "box-shadow 0.2s ease, border-color 0.2s ease",
            }}
          >
            <IconPlus size={20} />
          </button>
        )}
        {clocks.map((c, i) => (
          <CardComp
            key={`${variant}-${c.tz}-${i}`}
            city={c.city}
            tz={c.tz}
            now={now}
            onRemove={() => onRemove(i)}
          />
        ))}
      </div>
    </div>
  );
}
