"use client";

import { useState, useRef, useEffect } from "react";
import { IconLayoutGrid, IconTable, IconFilter } from "@tabler/icons-react";
import SeafarerCarousel from "@/components/SeafarerCarousel";
import SeafarersList, { COLUMNS } from "./SeafarersList";

type View = "carousel" | "table";

export default function SeafarersView() {
  const [view, setView]           = useState<View>("carousel");
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [dataOpen, setDataOpen]   = useState(false);
  const dataRef = useRef<HTMLDivElement>(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (dataRef.current && !dataRef.current.contains(e.target as Node)) {
        setDataOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  function toggleCol(key: string) {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const visibleCount = COLUMNS.length - hiddenCols.size;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── Toolbar row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px 0",
          flexShrink: 0,
        }}
      >
        {/* Left: Data filter */}
        <div ref={dataRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDataOpen((v) => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: dataOpen ? "#eff6ff" : "#ffffff",
              color: "#475569",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.15s",
            }}
          >
            <IconFilter size={15} />
            Data
            {hiddenCols.size > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  background: "#2e7cc4",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "0 5px",
                  lineHeight: "16px",
                }}
              >
                {visibleCount}/{COLUMNS.length}
              </span>
            )}
          </button>

          {dataOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                minWidth: 170,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "6px 0",
                zIndex: 30,
              }}
            >
              {COLUMNS.map((col) => {
                const isHidden = hiddenCols.has(col.key);
                const locked = !!col.alwaysVisible;
                return (
                  <label
                    key={col.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 14px",
                      fontSize: 13,
                      color: locked ? "#94a3b8" : "#0f172a",
                      cursor: locked ? "default" : "pointer",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!locked) (e.currentTarget as HTMLElement).style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!isHidden}
                      disabled={locked}
                      onChange={() => !locked && toggleCol(col.key)}
                      style={{ accentColor: "#2e7cc4" }}
                    />
                    {col.label}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Carousel / Table toggle */}
        <div
          style={{
            display: "inline-flex",
            background: "#e2e8f0",
            borderRadius: 10,
            padding: 3,
            gap: 2,
          }}
        >
          {(["carousel", "table"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                background: view === v ? "#ffffff" : "transparent",
                color: view === v ? "#0f3460" : "#64748b",
                boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {v === "carousel" ? <IconLayoutGrid size={15} /> : <IconTable size={15} />}
              {v === "carousel" ? "Carousel" : "Table"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {view === "carousel" ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <SeafarerCarousel hiddenCols={hiddenCols} />
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0 }}>
          <SeafarersList hiddenCols={hiddenCols} />
        </div>
      )}
    </div>
  );
}
