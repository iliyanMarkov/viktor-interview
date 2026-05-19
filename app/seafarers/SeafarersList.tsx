"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  IconColumns,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";
import { SEAFARERS, type Seafarer, type SeafarerStatus } from "@/lib/seafarers";

const STATUS_STYLES: Record<SeafarerStatus, { bg: string; text: string }> = {
  Onboard:    { bg: "bg-green-100",  text: "text-green-800"  },
  Available:  { bg: "bg-blue-100",   text: "text-blue-800"   },
  "On leave": { bg: "bg-amber-100",  text: "text-amber-800"  },
  Training:   { bg: "bg-purple-100", text: "text-purple-800" },
};

const STATUS_DOT: Record<SeafarerStatus, string> = {
  Onboard:    "bg-green-500",
  Available:  "bg-blue-500",
  "On leave": "bg-amber-500",
  Training:   "bg-purple-500",
};

const COLUMNS = [
  { key: "name",      label: "Seafarer",       defaultWidth: 200, alwaysVisible: true },
  { key: "id",        label: "ID",             defaultWidth: 100 },
  { key: "rank",      label: "Rank",           defaultWidth: 170 },
  { key: "nat",       label: "Nationality",    defaultWidth: 120 },
  { key: "status",    label: "Status",         defaultWidth: 110 },
  { key: "vessel",    label: "Vessel",         defaultWidth: 160 },
  { key: "available", label: "Available from", defaultWidth: 130 },
];

const MONTH_IDX: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4,  Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseDateVal(s: string): number {
  const [day, mon, year] = s.split(" ");
  return new Date(+year, MONTH_IDX[mon] ?? 0, +day).getTime();
}

function getSortValue(s: Seafarer, key: string): string | number {
  switch (key) {
    case "name":      return `${s.firstName} ${s.lastName}`;
    case "id":        return s.id;
    case "rank":      return s.rank;
    case "nat":       return s.nationality;
    case "status":    return s.status;
    case "vessel":    return s.currentVessel ?? "";
    case "available": return parseDateVal(s.availableFrom);
    default:          return "";
  }
}

function getInitials(s: Seafarer) {
  return `${s.firstName[0]}${s.lastName[0]}`;
}

function renderCell(
  s: Seafarer,
  key: string,
  statusStyle: { bg: string; text: string }
) {
  switch (key) {
    case "name":
      return (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#144272] to-[#2e7cc4] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {getInitials(s)}
          </div>
          <span className="font-medium text-[#0a2540] truncate">
            {s.firstName} {s.lastName}
          </span>
        </div>
      );
    case "id":
      return <span className="text-[#475569] font-mono text-xs">{s.id}</span>;
    case "rank":
      return <span className="text-[#0f172a]">{s.rank}</span>;
    case "nat":
      return <span className="text-[#0f172a]">{s.nationality}</span>;
    case "status":
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[s.status]}`} />
          {s.status}
        </span>
      );
    case "vessel":
      return s.currentVessel
        ? <span className="text-[#0f172a]">{s.currentVessel}</span>
        : <span className="text-[#94a3b8]">—</span>;
    case "available":
      return <span className="text-[#0f172a]">{s.availableFrom}</span>;
    default:
      return null;
  }
}

export default function SeafarersList() {
  const router = useRouter();

  const [colWidths, setColWidths] = useState<Record<string, number>>(
    Object.fromEntries(COLUMNS.map((c) => [c.key, c.defaultWidth]))
  );
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey]       = useState<string | null>(null);
  const [sortDir, setSortDir]       = useState<"asc" | "desc">("asc");
  const [colsOpen, setColsOpen]     = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);

  const dragging = useRef<{ colKey: string; startX: number; startW: number } | null>(null);

  const visibleColumns = COLUMNS.filter((c) => !hiddenCols.has(c.key));

  const sortedSeafarers = [...SEAFARERS].sort((a, b) => {
    if (!sortKey) return 0;
    const va = getSortValue(a, sortKey);
    const vb = getSortValue(b, sortKey);
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ?  1 : -1;
    return 0;
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colsRef.current && !colsRef.current.contains(e.target as Node)) {
        setColsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const onResizeStart = useCallback(
    (e: React.MouseEvent, colKey: string) => {
      e.preventDefault();
      dragging.current = { colKey, startX: e.clientX, startW: colWidths[colKey] };

      function onMove(ev: MouseEvent) {
        if (!dragging.current) return;
        const delta = ev.clientX - dragging.current.startX;
        const newW = Math.max(60, dragging.current.startW + delta);
        setColWidths((prev) => ({ ...prev, [dragging.current!.colKey]: newW }));
      }

      function onUp() {
        dragging.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      }

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [colWidths]
  );

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleCol(key: string) {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleRowClick(id: string) {
    router.push(`/seafarers?ids=${id}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 24, boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>

        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <div ref={colsRef} style={{ position: "relative" }}>
            <button
              onClick={() => setColsOpen((v) => !v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: colsOpen ? "#eff6ff" : "#ffffff",
                color: "#475569",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
            >
              <IconColumns size={15} />
              Columns
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
                  {COLUMNS.length - hiddenCols.size}/{COLUMNS.length}
                </span>
              )}
            </button>

            {colsOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  right: 0,
                  minWidth: 160,
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  padding: "6px 0",
                  zIndex: 20,
                }}
              >
                {COLUMNS.map((col) => {
                  const isHidden = hiddenCols.has(col.key);
                  const locked = col.alwaysVisible;
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
                        transition: "background 0.1s",
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
        </div>

        {/* Scrollable table wrapper — fills remaining height */}
        <div
          className="bg-white rounded-2xl border border-[rgba(15,52,96,0.1)] shadow-sm"
          style={{ flex: 1, minHeight: 0, overflow: "auto", WebkitOverflowScrolling: "touch" as const }}
        >
          <table
            style={{
              width: "max-content",
              minWidth: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <colgroup>
              {visibleColumns.map((col) => (
                <col key={col.key} style={{ width: colWidths[col.key] }} />
              ))}
            </colgroup>

            <thead>
              <tr className="border-b border-[rgba(15,52,96,0.08)] bg-[#f8fafc]">
                {visibleColumns.map((col, i) => {
                  const isSorted = sortKey === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        width: colWidths[col.key],
                        padding: i === 0 ? "10px 16px 10px 20px" : "10px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 500,
                        color: isSorted ? "#144272" : "#475569",
                        background: "#f8fafc",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        boxShadow: "0 1px 0 rgba(15,52,96,0.08)",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {col.label}
                        {isSorted ? (
                          sortDir === "asc"
                            ? <IconChevronUp size={12} />
                            : <IconChevronDown size={12} />
                        ) : (
                          <IconSelector size={12} style={{ color: "#cbd5e1" }} />
                        )}
                      </span>

                      {/* Resize handle — not on last visible column */}
                      {i < visibleColumns.length - 1 && (
                        <span
                          onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, col.key); }}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: 6,
                            height: "100%",
                            cursor: "col-resize",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1,
                          }}
                        >
                          <span
                            style={{
                              width: 1,
                              height: "60%",
                              background: "rgba(15,52,96,0.15)",
                              borderRadius: 1,
                              transition: "background 0.15s",
                            }}
                          />
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {sortedSeafarers.map((s, i) => {
                const statusStyle = STATUS_STYLES[s.status];
                return (
                  <tr
                    key={s.id}
                    onClick={() => handleRowClick(s.id)}
                    className={`cursor-pointer hover:bg-[#eff6ff] transition-colors border-b border-[rgba(15,52,96,0.06)] last:border-0 ${
                      i % 2 === 1 ? "bg-[#f8fafc]" : "bg-white"
                    }`}
                  >
                    {visibleColumns.map((col, ci) => (
                      <td
                        key={col.key}
                        style={{
                          padding: ci === 0 ? "10px 16px 10px 20px" : "10px 16px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {renderCell(s, col.key, statusStyle)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
