"use client";

import { IconPlus, IconX } from "@tabler/icons-react";
import { CLOCK, type ClockEntry } from "./constants";
import { fmtDate, getTimeNumbers, getTimeParts } from "./utils";

export { DEFAULT_CLOCKS, EXTRA_CLOCK_OPTIONS } from "./constants";

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
  const stroke = h * (2.2 / 26);
  const inset = h * (1.6 / 26);

  const segStyle = (on: number): React.CSSProperties => ({
    position: "absolute",
    background: SEG_ON,
    opacity: on ? 1 : 0.08,
    transition: "opacity 0.15s",
  });

  const horizClip =
    "polygon(0% 50%, 8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%)";
  const vertClip =
    "polygon(50% 0%, 100% 8%, 100% 92%, 50% 100%, 0% 92%, 0% 8%)";

  return (
    <div style={{ position: "relative", width: w, height: h }}>
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

function SegColon({ on, h = 26 }: { on: boolean; h?: number }) {
  const dotSize = h * (3 / 26);
  const gap = h * (7 / 26);
  const dot: React.CSSProperties = {
    width: dotSize,
    height: dotSize,
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
        gap,
        height: h,
        padding: "0 1px",
      }}
    >
      <span style={dot} />
      <span style={dot} />
    </div>
  );
}

const CHRONO_BASE = {
  digitW: 11,
  digitH: 20,
  secW: 8,
  secH: 15,
  borderRadius: 6,
  paddingTop: 5,
  paddingX: 8,
  paddingBottom: 4,
  cityFont: 10,
  dateFont: 8,
  placeholderFont: 11,
  iconSize: 10,
  digitGap: 1,
  removeMargin: -10,
  rowGap: 30,
  addButtonSize: 24,
  addButtonMargin: 36,
  addIconSize: 15,
} as const;

function getChronoDimensions(size: number) {
  return {
    digitW: CHRONO_BASE.digitW * size,
    digitH: CHRONO_BASE.digitH * size,
    secW: CHRONO_BASE.secW * size,
    secH: CHRONO_BASE.secH * size,
    borderRadius: CHRONO_BASE.borderRadius * size,
    padding: `${CHRONO_BASE.paddingTop * size}px ${CHRONO_BASE.paddingX * size}px ${CHRONO_BASE.paddingBottom * size}px`,
    cityFont: CHRONO_BASE.cityFont * size,
    dateFont: CHRONO_BASE.dateFont * size,
    placeholderFont: CHRONO_BASE.placeholderFont * size,
    iconSize: CHRONO_BASE.iconSize * size,
    digitGap: CHRONO_BASE.digitGap * size,
    removeMargin: CHRONO_BASE.removeMargin * size,
    rowGap: CHRONO_BASE.rowGap * size,
    addButtonSize: CHRONO_BASE.addButtonSize * size,
    addButtonMargin: CHRONO_BASE.addButtonMargin * size,
    addIconSize: CHRONO_BASE.addIconSize * size,
  };
}

function ChronoClockCard({
  city,
  tz,
  now,
  onRemove,
  size = 1,
}: {
  city: string;
  tz: string;
  now: Date | null;
  onRemove: () => void;
  size?: number;
}) {
  const dims = getChronoDimensions(size);
  const parts = now ? getTimeParts(tz, now) : { hh: "––", mm: "––", ss: "––" };
  const nums = now ? getTimeNumbers(tz, now) : { h: 0, m: 0, s: 0 };
  const blink = nums.s % 2 === 0;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(15,52,96,0.06)",
        borderRadius: dims.borderRadius,
        padding: dims.padding,
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: dims.cityFont,
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
            marginRight: dims.removeMargin,
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
          <IconX size={dims.iconSize} />
        </button>
      </span>

      <span
        style={{
          fontSize: dims.dateFont,
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
          gap: dims.digitGap,
        }}
      >
        {now ? (
          <>
            <SevenSeg digit={parts.hh[0]} w={dims.digitW} h={dims.digitH} />
            <SevenSeg digit={parts.hh[1]} w={dims.digitW} h={dims.digitH} />
            <SegColon on={blink} h={dims.digitH} />
            <SevenSeg digit={parts.mm[0]} w={dims.digitW} h={dims.digitH} />
            <SevenSeg digit={parts.mm[1]} w={dims.digitW} h={dims.digitH} />
            <SegColon on={blink} h={dims.secH} />
            <SevenSeg digit={parts.ss[0]} w={dims.secW} h={dims.secH} />
            <SevenSeg digit={parts.ss[1]} w={dims.secW} h={dims.secH} />
          </>
        ) : (
          <div
            style={{
              color: CLOCK.navy,
              fontSize: dims.placeholderFont,
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

export default function ClockRow({
  clocks,
  now,
  onRemove,
  onAdd,
  canAdd = true,
  size = 1,
}: {
  clocks: ClockEntry[];
  now: Date | null;
  onRemove: (idx: number) => void;
  onAdd?: () => void;
  canAdd?: boolean;
  /** Scale factor for clocks and add button. `1` is the default size. */
  size?: number;
}) {
  const dims = getChronoDimensions(size);

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          columnGap: 10,
          rowGap: dims.rowGap,
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
              margin: `0 ${dims.addButtonMargin}px`,
              width: dims.addButtonSize,
              height: dims.addButtonSize,
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
            <IconPlus size={dims.addIconSize} />
          </button>
        )}
        {clocks.map((c, i) => (
          <ChronoClockCard
            key={`${c.tz}-${i}`}
            city={c.city}
            tz={c.tz}
            now={now}
            onRemove={() => onRemove(i)}
            size={size}
          />
        ))}
      </div>
    </div>
  );
}
