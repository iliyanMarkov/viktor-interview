"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useCallback, useEffect } from "react";
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";
import { type Seafarer, getInitials } from "@/lib/seafarers";
import StatusBadge from "@/components/StatusBadge";

export const COLUMNS = [
  { key: "name", label: "Seafarer", defaultWidth: 200, alwaysVisible: true },
  { key: "id", label: "ID", defaultWidth: 100 },
  { key: "rank", label: "Rank", defaultWidth: 170 },
  { key: "nat", label: "Nationality", defaultWidth: 120 },
  { key: "status", label: "Status", defaultWidth: 110 },
  { key: "vessel", label: "Vessel", defaultWidth: 160 },
  { key: "available", label: "Available from", defaultWidth: 130 },
];

const MONTH_IDX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

function parseDateVal(s: string): number {
  const [day, mon, year] = s.split(" ");
  return new Date(+year, MONTH_IDX[mon] ?? 0, +day).getTime();
}

function getSortValue(s: Seafarer, key: string): string | number {
  switch (key) {
    case "name":
      return `${s.firstName} ${s.lastName}`;
    case "id":
      return s.id;
    case "rank":
      return s.rank;
    case "nat":
      return s.nationality;
    case "status":
      return s.status;
    case "vessel":
      return s.currentVessel ?? "";
    case "available":
      return parseDateVal(s.availableFrom);
    default:
      return "";
  }
}

function renderCell(s: Seafarer, key: string) {
  switch (key) {
    case "name":
      return (
        <div className="flex items-center gap-3">
          <div
            className={`size-9 shrink-0 rounded-full overflow-hidden ${
              s.photo
                ? ""
                : "bg-gradient-to-br from-[#144272] to-[#2e7cc4] flex items-center justify-center text-white text-xs font-medium"
            }`}
            style={
              s.photo
                ? {
                    background: `url(${s.photo}) center / cover no-repeat`,
                  }
                : undefined
            }
          >
            {!s.photo && getInitials(s)}
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
      return <StatusBadge status={s.status} variant="light" />;
    case "vessel":
      return s.currentVessel ? (
        <span className="text-[#0f172a]">{s.currentVessel}</span>
      ) : (
        <span className="text-[#94a3b8]">—</span>
      );
    case "available":
      return <span className="text-[#0f172a]">{s.availableFrom}</span>;
    default:
      return null;
  }
}

export default function SeafarersList({
  seafarers,
  hiddenCols,
  hasMore = false,
  onLoadMore,
}: {
  seafarers: Seafarer[];
  hiddenCols: Set<string>;
  hasMore?: boolean;
  onLoadMore?: () => void;
}) {
  const router = useRouter();

  const [colWidths, setColWidths] = useState<Record<string, number>>(
    Object.fromEntries(COLUMNS.map((c) => [c.key, c.defaultWidth])),
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  /* Intersection observer — load more when sentinel enters the viewport */
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const dragging = useRef<{
    colKey: string;
    startX: number;
    startW: number;
  } | null>(null);

  const visibleColumns = COLUMNS.filter((c) => !hiddenCols.has(c.key));

  const sortedSeafarers = [...seafarers].sort((a, b) => {
    if (!sortKey) return 0;
    const va = getSortValue(a, sortKey);
    const vb = getSortValue(b, sortKey);
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const onResizeStart = useCallback(
    (e: React.MouseEvent, colKey: string) => {
      e.preventDefault();
      dragging.current = {
        colKey,
        startX: e.clientX,
        startW: colWidths[colKey],
      };

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
    [colWidths],
  );

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleRowClick(id: string) {
    router.push(`/seafarers?ids=${id}`);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Scrollable table wrapper — fills remaining height */}
        <div
          className="bg-white rounded-2xl border border-[rgba(15,52,96,0.1)] shadow-sm"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            WebkitOverflowScrolling: "touch" as const,
          }}
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
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {col.label}
                        {isSorted ? (
                          sortDir === "asc" ? (
                            <IconChevronUp size={12} />
                          ) : (
                            <IconChevronDown size={12} />
                          )
                        ) : (
                          <IconSelector
                            size={12}
                            style={{ color: "#cbd5e1" }}
                          />
                        )}
                      </span>

                      {/* Resize handle — not on last visible column */}
                      {i < visibleColumns.length - 1 && (
                        <span
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeStart(e, col.key);
                          }}
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
                          padding:
                            ci === 0 ? "10px 16px 10px 20px" : "10px 16px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {renderCell(s, col.key)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Sentinel + load-more indicator */}
          {hasMore && (
            <div
              ref={sentinelRef}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "16px 0",
                color: "#94a3b8",
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid #e2e8f0",
                  borderTopColor: "#2e7cc4",
                  animation: "spin 0.7s linear infinite",
                  display: "inline-block",
                }}
              />
              Loading more…
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
