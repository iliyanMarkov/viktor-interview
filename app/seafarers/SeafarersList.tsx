"use client";

import { useRouter } from "next/navigation";
import { IconUsers, IconSearch, IconChevronRight } from "@tabler/icons-react";
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

function getInitials(s: Seafarer) {
  return `${s.firstName[0]}${s.lastName[0]}`;
}

export default function SeafarersList() {
  const router = useRouter();

  function handleRowClick(id: string) {
    router.push(`/seafarers?ids=${id}`);
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <IconUsers size={24} className="text-[#144272]" />
            <div>
              <h1 className="text-xl font-semibold text-[#0a2540]">Seafarers</h1>
              <p className="text-sm text-[#475569]">{SEAFARERS.length} crew members</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[rgba(15,52,96,0.1)] text-[#475569] text-sm">
            <IconSearch size={15} />
            <span>Search seafarers…</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[rgba(15,52,96,0.1)] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(15,52,96,0.08)] bg-[#f8fafc]">
                {["Seafarer", "ID", "Rank", "Nationality", "Status", "Vessel", "Available from", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-[#475569] uppercase tracking-wider first:px-5">
                    {h}
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
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#144272] to-[#2e7cc4] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {getInitials(s)}
                        </div>
                        <span className="font-medium text-[#0a2540]">
                          {s.firstName} {s.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#475569] font-mono text-xs">{s.id}</td>
                    <td className="px-4 py-3.5 text-[#0f172a]">{s.rank}</td>
                    <td className="px-4 py-3.5 text-[#0f172a]">{s.nationality}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s.status]}`} />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#0f172a]">
                      {s.currentVessel ?? <span className="text-[#94a3b8]">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-[#0f172a]">{s.availableFrom}</td>
                    <td className="px-4 py-3.5">
                      <IconChevronRight size={16} className="text-[#94a3b8]" />
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
