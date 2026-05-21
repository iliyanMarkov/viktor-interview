"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconLayoutGrid, IconTable, IconFilter, IconChevronDown } from "@tabler/icons-react";
import { SEAFARERS as ALL_SEAFARERS } from "@/lib/seafarers";
import SeafarerCarousel from "@/components/SeafarerCarousel";
import SeafarersList, { COLUMNS } from "./SeafarersList";

type View = "carousel" | "table";

const PAGE_SIZES = [5, 10, 20, 30] as const;

export default function SeafarersView() {
  const [view, setView]             = useState<View>("carousel");
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [dataOpen, setDataOpen]     = useState(false);
  const [pageSize, setPageSize]     = useState<number>(10);
  const [displayCount, setDisplayCount] = useState<number>(10);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [narrow, setNarrow]         = useState(false);
  const dataRef = useRef<HTMLDivElement>(null);
  const pageSizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function check() { setNarrow(window.innerWidth < 620); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const visibleSeafarers = ALL_SEAFARERS.slice(0, displayCount);
  const hasMore          = displayCount < ALL_SEAFARERS.length;
  const total            = ALL_SEAFARERS.length;

  const loadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + pageSize, total));
  }, [pageSize, total]);

  /* Reset to one page when page size changes */
  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setDisplayCount(size);
    setPageSizeOpen(false);
  }

  /* Close dropdowns on outside click */
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (dataRef.current && !dataRef.current.contains(target))
        setDataOpen(false);
      if (pageSizeRef.current && !pageSizeRef.current.contains(target))
        setPageSizeOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
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

      {/* ── Toolbar ── */}
      <div style={{ padding: "12px 16px 0", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Row 1: Data filter (left) + View toggle (right) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>

          {/* Data filter */}
          <div ref={dataRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDataOpen((v) => !v)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 500, padding: "6px 12px",
                borderRadius: 8, border: "1px solid #e2e8f0",
                background: dataOpen ? "#eff6ff" : "#ffffff",
                color: "#475569", cursor: "pointer", fontFamily: "inherit",
                transition: "background 0.15s",
              }}
            >
              <IconFilter size={15} />
              Data
              {hiddenCols.size > 0 && (
                <span style={{ fontSize: 11, fontWeight: 600, background: "#2e7cc4", color: "#fff", borderRadius: 10, padding: "0 5px", lineHeight: "16px" }}>
                  {visibleCount}/{COLUMNS.length}
                </span>
              )}
            </button>

            {dataOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, minWidth: 170, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: "6px 0", zIndex: 30 }}>
                {COLUMNS.map((col) => {
                  const locked = !!col.alwaysVisible;
                  return (
                    <label
                      key={col.key}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", fontSize: 13, color: locked ? "#94a3b8" : "#0f172a", cursor: locked ? "default" : "pointer", userSelect: "none" }}
                      onMouseEnter={(e) => { if (!locked) (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <input type="checkbox" checked={!hiddenCols.has(col.key)} disabled={locked} onChange={() => !locked && toggleCol(col.key)} style={{ accentColor: "#2e7cc4" }} />
                      {col.label}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div style={{ display: "inline-flex", background: "#e2e8f0", borderRadius: 10, padding: 3, gap: 2 }}>
            {(["carousel", "table"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: narrow ? 0 : 6,
                  padding: narrow ? "6px 10px" : "6px 14px",
                  borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  background: view === v ? "#ffffff" : "transparent",
                  color: view === v ? "#0f3460" : "#64748b",
                  boxShadow: view === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {v === "carousel" ? <IconLayoutGrid size={15} /> : <IconTable size={15} />}
                {!narrow && (v === "carousel" ? " Carousel" : " Table")}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Per-page dropdown + count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 2 }}>
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>Per page:</span>
          <div ref={pageSizeRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setPageSizeOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={pageSizeOpen}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: pageSizeOpen ? "#eff6ff" : "#ffffff",
                color: "#475569",
                cursor: "pointer",
                fontFamily: "inherit",
                justifyContent: "space-between",
              }}
            >
              {pageSize}
              <IconChevronDown
                size={14}
                style={{
                  transition: "transform 0.2s ease",
                  transform: pageSizeOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {pageSizeOpen && (
              <div
                role="listbox"
                aria-label="Seafarers per page"
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  minWidth: "100%",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  padding: "4px 0",
                  zIndex: 30,
                }}
              >
                {PAGE_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    aria-selected={pageSize === s}
                    onClick={() => handlePageSizeChange(s)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "8px 14px",
                      border: "none",
                      background: pageSize === s ? "#eff6ff" : "transparent",
                      color: pageSize === s ? "#0f3460" : "#0f172a",
                      fontSize: 13,
                      fontWeight: pageSize === s ? 600 : 400,
                      textAlign: "left",
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      if (pageSize !== s) (e.currentTarget as HTMLElement).style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        pageSize === s ? "#eff6ff" : "transparent";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>
            {displayCount} of {total}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      {view === "carousel" ? (
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <SeafarerCarousel
            seafarers={visibleSeafarers}
            hiddenCols={hiddenCols}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0 }}>
          <SeafarersList
            seafarers={visibleSeafarers}
            hiddenCols={hiddenCols}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>
      )}
    </div>
  );
}
