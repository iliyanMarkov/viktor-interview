"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  type Seafarer,
  type SeafarerStatus,
  getInitials,
} from "@/lib/seafarers";
import StatusBadge from "@/components/StatusBadge";

/* ── Status gradient (card background when no photo) ─── */
const STATUS_GRADIENT: Record<SeafarerStatus, string> = {
  Onboard: "linear-gradient(160deg, #0f3460 0%, #065f46 100%)",
  Available: "linear-gradient(160deg, #0f3460 0%, #1d4ed8 100%)",
  "On leave": "linear-gradient(160deg, #0f3460 0%, #92400e 100%)",
  Training: "linear-gradient(160deg, #0f3460 0%, #5b21b6 100%)",
};

/* ── Responsive layout tiers ───────────────────────────── */
type Layout = {
  cardW: number;
  cardH: number;
  trackH: number;
  x1: number;
  x2: number;
  showOuter: boolean;
  gridCols: number;
};

function getLayout(w: number): Layout {
  if (w < 520)
    return {
      cardW: 180,
      cardH: 260,
      trackH: 285,
      x1: 110,
      x2: 0,
      showOuter: false,
      gridCols: 2,
    };
  if (w < 800)
    return {
      cardW: 210,
      cardH: 300,
      trackH: 325,
      x1: 155,
      x2: 280,
      showOuter: true,
      gridCols: 2,
    };
  return {
    cardW: 260,
    cardH: 360,
    trackH: 360,
    x1: 220,
    x2: 420,
    showOuter: true,
    gridCols: 3,
  };
}

/* ── Carousel position logic ────────────────────────────── */
function getCardStyle(
  offset: number,
  total: number,
  layout: Layout,
): { transform: string; zIndex: number; opacity: number; filter: string } {
  const { x1, x2, showOuter } = layout;
  if (offset === 0)
    return {
      transform: "translateX(0px) scale(1.1) translateZ(0px)",
      zIndex: 10,
      opacity: 1,
      filter: "none",
    };
  if (offset === 1)
    return {
      transform: `translateX(${x1}px) scale(0.9) translateZ(-100px)`,
      zIndex: 5,
      opacity: 1,
      filter: "grayscale(70%)",
    };
  if (offset === 2)
    return {
      transform: `translateX(${x2}px) scale(0.8) translateZ(-300px)`,
      zIndex: 1,
      opacity: showOuter ? 1 : 0,
      filter: "grayscale(100%)",
    };
  if (offset === total - 1)
    return {
      transform: `translateX(-${x1}px) scale(0.9) translateZ(-100px)`,
      zIndex: 5,
      opacity: 1,
      filter: "grayscale(70%)",
    };
  if (offset === total - 2)
    return {
      transform: `translateX(-${x2}px) scale(0.8) translateZ(-300px)`,
      zIndex: 1,
      opacity: showOuter ? 1 : 0,
      filter: "grayscale(100%)",
    };
  return {
    transform: "translateX(0px) scale(0.7) translateZ(-600px)",
    zIndex: 0,
    opacity: 0,
    filter: "grayscale(100%)",
  };
}

/* ── Component ──────────────────────────────────────────── */
interface Props {
  seafarers: Seafarer[];
  hiddenCols: Set<string>;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export default function SeafarerCarousel({
  seafarers,
  hiddenCols,
  hasMore = false,
  onLoadMore,
}: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [infoOpacity, setInfoOpacity] = useState(1);
  const [windowWidth, setWindowWidth] = useState(1200);
  const animating = useRef(false);
  const touchStartX = useRef(0);
  const total = seafarers.length;

  /* Track viewport width for responsive layout */
  useEffect(() => {
    function onResize() {
      setWindowWidth(window.innerWidth);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const layout = getLayout(windowWidth);

  /* Clamp current index when the list shrinks (page-size reduced) */
  useEffect(() => {
    if (total > 0 && current >= total) setCurrent(total - 1);
  }, [total, current]);

  /* Auto-load next page when the user reaches the last card */
  useEffect(() => {
    if (total > 0 && current === total - 1 && hasMore) onLoadMore?.();
  }, [current, total, hasMore, onLoadMore]);

  const [grabbing, setGrabbing] = useState(false);
  const mouseDownX = useRef(0);
  const dragMoved = useRef(false);

  function handleTrackMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    mouseDownX.current = e.clientX;
    dragMoved.current = false;
    setGrabbing(true);

    function onMove(ev: MouseEvent) {
      if (Math.abs(ev.clientX - mouseDownX.current) > 5)
        dragMoved.current = true;
    }
    function onUp(ev: MouseEvent) {
      const diff = mouseDownX.current - ev.clientX;
      if (Math.abs(diff) > 50) go(current + (diff > 0 ? 1 : -1));
      setGrabbing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const go = useCallback(
    (newIdx: number) => {
      if (animating.current) return;
      animating.current = true;
      setInfoOpacity(0);
      setTimeout(() => {
        setCurrent(((newIdx % total) + total) % total);
        setInfoOpacity(1);
        setTimeout(() => {
          animating.current = false;
        }, 500);
      }, 250);
    },
    [total],
  );

  /* Keyboard navigation */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(current - 1);
      if (e.key === "ArrowRight") go(current + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go]);

  const seafarer = seafarers[current] ?? seafarers[0];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "32px 0 24px",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── Carousel track ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1100,
          height: layout.trackH,
          perspective: "1000px",
        }}
      >
        {/* Left arrow */}
        <button
          onClick={() => go(current - 1)}
          onTouchStart={(e) => {
            touchStartX.current = e.changedTouches[0].screenX;
          }}
          style={arrowStyle("left")}
          aria-label="Previous"
        >
          ‹
        </button>

        {/* Cards */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: grabbing ? "grabbing" : "grab",
            userSelect: "none",
          }}
          onMouseDown={handleTrackMouseDown}
          onTouchStart={(e) => {
            touchStartX.current = e.changedTouches[0].screenX;
          }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) go(current + (diff > 0 ? 1 : -1));
          }}
        >
          {seafarers.map((s, i) => {
            const offset = (i - current + total) % total;
            const cs = getCardStyle(offset, total, layout);
            const isCenter = offset === 0;

            return (
              <div
                key={s.id}
                onClick={() => {
                  if (dragMoved.current) return;
                  isCenter ? router.push(`/seafarers?ids=${s.id}`) : go(i);
                }}
                style={{
                  position: "absolute",
                  width: layout.cardW,
                  height: layout.cardH,
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: isCenter
                    ? "0 28px 60px rgba(15,52,96,0.35)"
                    : "0 16px 32px rgba(0,0,0,0.18)",
                  transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  cursor: "pointer",
                  background: s.photo
                    ? `url(${s.photo}) center / cover no-repeat`
                    : STATUS_GRADIENT[s.status],
                  ...cs,
                }}
              >
                {/* Dark scrim for photo cards to ensure text contrast */}
                {s.photo && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.55) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Decorative circles — only on gradient cards */}
                {!s.photo && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      overflow: "hidden",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -60,
                        right: -60,
                        width: 220,
                        height: 220,
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: -30,
                        right: -30,
                        width: 160,
                        height: 160,
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 100,
                        left: -50,
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    />
                  </div>
                )}

                {/* Initials avatar — only on gradient (no photo) cards */}
                {!s.photo && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -65%)",
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                      border: "2px solid rgba(255,255,255,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "0.02em",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {getInitials(s)}
                  </div>
                )}

                {/* Bottom info overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "20px 18px 18px",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
                  }}
                >
                  {/* Status badge */}
                  <div style={{ marginBottom: 6 }}>
                    <StatusBadge status={s.status} variant="dark" size="sm" />
                  </div>
                  <div
                    style={{
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 15,
                      lineHeight: 1.2,
                      marginBottom: 3,
                    }}
                  >
                    {s.firstName} {s.lastName}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                    {s.rank}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => go(current + 1)}
          style={arrowStyle("right")}
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* ── Dots ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          marginTop: 28,
        }}
      >
        {seafarers.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to seafarer ${i + 1}`}
            style={{
              width: i === current ? 24 : 10,
              height: 10,
              borderRadius: 5,
              background:
                i === current ? "rgb(8, 42, 123)" : "rgba(8,42,123,0.2)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.35s ease",
              transform: i === current ? "scale(1.1)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* ── Info card ── */}
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          marginTop: 28,
          padding: "0 16px 8px",
          transition: "opacity 0.3s ease-out",
          opacity: infoOpacity,
        }}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1px solid rgba(15,52,96,0.1)",
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(15,52,96,0.07)",
            overflow: "hidden",
          }}
        >
          {/* Fields grid — driven by the same column keys as the table */}
          {(() => {
            const fields = [
              { key: "id", label: "ID", value: seafarer.id, mono: true },
              { key: "rank", label: "Rank", value: seafarer.rank },
              { key: "nat", label: "Nationality", value: seafarer.nationality },
              { key: "status", label: "Status", value: seafarer.status },
              {
                key: "vessel",
                label: "Vessel",
                value: seafarer.currentVessel ?? "—",
              },
              {
                key: "available",
                label: "Available From",
                value: seafarer.availableFrom,
              },
            ].filter((f) => !hiddenCols.has(f.key));

            if (fields.length === 0) return null;

            return (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${layout.gridCols}, 1fr)`,
                }}
              >
                {fields.map(({ key, label, value, mono }, idx) => (
                  <div
                    key={key}
                    style={{
                      padding: "10px 16px",
                      borderRight:
                        (idx + 1) % layout.gridCols !== 0
                          ? "1px solid rgba(15,52,96,0.06)"
                          : "none",
                      borderBottom:
                        idx <
                        fields.length -
                          (fields.length % layout.gridCols || layout.gridCols)
                          ? "1px solid rgba(15,52,96,0.06)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 4,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#0f172a",
                        fontFamily: mono ? "monospace" : "inherit",
                        fontWeight: mono ? 500 : 400,
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* ── Arrow button shared style ── */
function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    [side]: 12,
    transform: "translateY(-50%)",
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgba(8,42,123,0.65)",
    color: "#ffffff",
    border: "none",
    outline: "none",
    cursor: "pointer",
    zIndex: 20,
    fontSize: "1.6rem",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 3,
    transition: "background 0.25s ease, transform 0.25s ease",
  };
}
