"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useCallback } from "react";
import { IconUsers, IconSearch } from "@tabler/icons-react";
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
  { key: "name",      label: "Seafarer",       defaultWidth: 200 },
  { key: "id",        label: "ID",             defaultWidth: 100 },
  { key: "rank",      label: "Rank",           defaultWidth: 170 },
  { key: "nat",       label: "Nationality",    defaultWidth: 120 },
  { key: "status",    label: "Status",         defaultWidth: 110 },
  { key: "vessel",    label: "Vessel",         defaultWidth: 160 },
  { key: "available", label: "Available from", defaultWidth: 130 },
];

function getInitials(s: Seafarer) {
  return `${s.firstName[0]}${s.lastName[0]}`;
}

export default function SeafarersList() {
  const router = useRouter();

  const [colWidths, setColWidths] = useState<number[]>(
    COLUMNS.map((c) => c.defaultWidth)
  );

  const dragging = useRef<{ colIdx: number; startX: number; startW: number } | null>(null);

  const onResizeStart = useCallback(
    (e: React.MouseEvent, colIdx: number) => {
      e.preventDefault();
      dragging.current = { colIdx, startX: e.clientX, startW: colWidths[colIdx] };

      function onMove(ev: MouseEvent) {
        if (!dragging.current) return;
        const delta = ev.clientX - dragging.current.startX;
        const newW = Math.max(60, dragging.current.startW + delta);
        setColWidths((prev) => {
          const next = [...prev];
          next[dragging.current!.colIdx] = newW;
          return next;
        });
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

  function handleRowClick(id: string) {
    router.push(`/seafarers?ids=${id}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 24, boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>

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
              {colWidths.map((w, i) => (
                <col key={i} style={{ width: w }} />
              ))}
            </colgroup>

            <thead>
              <tr className="border-b border-[rgba(15,52,96,0.08)] bg-[#f8fafc]">
                {COLUMNS.map((col, i) => (
                  <th
                    key={col.key}
                    style={{
                      position: "relative",
                      width: colWidths[i],
                      padding: i === 0 ? "10px 16px 10px 20px" : "10px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.label}

                    {/* Resize handle — not on last column */}
                    {i < COLUMNS.length - 1 && (
                      <span
                        onMouseDown={(e) => onResizeStart(e, i)}
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
                ))}
              </tr>
            </thead>

            <tbody>
              {SEAFARERS.map((s, i) => {
                const statusStyle = STATUS_STYLES[s.status];
                return (
                  <tr
                    key={s.id}
                    onClick={() => handleRowClick(s.id)}
                    className={`cursor-pointer hover:bg-[#eff6ff] transition-colors border-b border-[rgba(15,52,96,0.06)] last:border-0 ${
                      i % 2 === 1 ? "bg-[#f8fafc]" : "bg-white"
                    }`}
                  >
                    {/* Seafarer */}
                    <td style={{ padding: "10px 16px 10px 20px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#144272] to-[#2e7cc4] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {getInitials(s)}
                        </div>
                        <span className="font-medium text-[#0a2540] truncate">
                          {s.firstName} {s.lastName}
                        </span>
                      </div>
                    </td>

                    {/* ID */}
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        className="text-[#475569] font-mono text-xs">
                      {s.id}
                    </td>

                    {/* Rank */}
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        className="text-[#0f172a]">
                      {s.rank}
                    </td>

                    {/* Nationality */}
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        className="text-[#0f172a]">
                      {s.nationality}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[s.status]}`} />
                        {s.status}
                      </span>
                    </td>

                    {/* Vessel */}
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        className="text-[#0f172a]">
                      {s.currentVessel ?? <span className="text-[#94a3b8]">—</span>}
                    </td>

                    {/* Available from */}
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        className="text-[#0f172a]">
                      {s.availableFrom}
                    </td>

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
