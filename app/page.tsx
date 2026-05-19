import Link from "next/link";
import { IconUsers, IconShip, IconArrowRight } from "@tabler/icons-react";
import { SEAFARERS } from "@/lib/seafarers";

const onboard = SEAFARERS.filter((s) => s.status === "Onboard").length;
const available = SEAFARERS.filter((s) => s.status === "Available").length;

export default function Home() {
  return (
    <div className="p-6" style={{ overflowY: "auto", flex: 1 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "#0a2540", margin: "0 0 4px" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "#475569", margin: 0 }}>
            Here&apos;s an overview of your marine operations today.
          </p>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <StatCard label="Total seafarers" value={SEAFARERS.length} color="#144272" />
          <StatCard label="Currently onboard" value={onboard} color="#059669" />
          <StatCard label="Available" value={available} color="#2e7cc4" />
          <StatCard
            label="On leave / Training"
            value={SEAFARERS.length - onboard - available}
            color="#d97706"
          />
        </div>

        {/* Quick nav */}
        <h2
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 12px",
          }}
        >
          Quick navigation
        </h2>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <NavCard
            href="/seafarers"
            icon={<IconUsers size={28} className="text-[#144272]" />}
            title="Seafarers"
            description="Manage crew profiles, assignments and certifications"
          />
          <NavCard
            href="/ships"
            icon={<IconShip size={28} className="text-[#144272]" />}
            title="Ships"
            description="View and manage the fleet"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid rgba(15,52,96,0.08)",
        padding: "16px 18px",
        boxShadow: "0 1px 2px rgba(15,52,96,0.04)",
      }}
    >
      <p style={{ fontSize: 12, color: "#475569", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0, lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

function NavCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="nav-card"
      style={{
        flex: "1 1 240px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 20px",
        background: "#fff",
        borderRadius: 12,
        border: "1px solid rgba(15,52,96,0.08)",
        boxShadow: "0 1px 2px rgba(15,52,96,0.04)",
        textDecoration: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        maxWidth: 360,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#0a2540", margin: "0 0 3px" }}>{title}</p>
        <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>{description}</p>
      </div>
      <IconArrowRight size={16} style={{ color: "#94a3b8", flexShrink: 0 }} />
    </Link>
  );
}
