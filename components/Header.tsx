"use client";

import { usePathname } from "next/navigation";
import { IconLogout, IconBell, IconSearch } from "@tabler/icons-react";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/seafarers": "Seafarers",
  "/ships": "Ships",
};

function getTitle(pathname: string) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith("/seafarers")) return "Seafarers";
  if (pathname.startsWith("/ships")) return "Ships";
  return "Marine Operations";
}

export default function Header() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header
      className="app-header"
      style={{
        height: 56,
        background: "#ffffff",
        borderBottom: "1px solid rgba(15,52,96,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        zIndex: 30,
      }}
    >
      {/* Left: page title */}
      <h2
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#0a2540",
          margin: 0,
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </h2>

      {/* Right: actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* User avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #144272 0%, #2e7cc4 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          VD
        </div>

        {/* Logout */}
        <button
          onClick={() => alert("Logged out")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 13px",
            borderRadius: 8,
            border: "1px solid rgba(15,52,96,0.12)",
            background: "#fff",
            color: "#475569",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background 0.15s, border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "#fef2f2";
            el.style.borderColor = "#fca5a5";
            el.style.color = "#dc2626";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "#fff";
            el.style.borderColor = "rgba(15,52,96,0.12)";
            el.style.color = "#475569";
          }}
        >
          <IconLogout size={15} />
          Logout
        </button>
      </div>
    </header>
  );
}
