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
        {/* Search hint */}
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid rgba(15,52,96,0.1)",
            background: "#f8fafc",
            color: "#94a3b8",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <IconSearch size={14} />
          <span>Search…</span>
          <kbd
            style={{
              fontSize: 11,
              padding: "1px 5px",
              borderRadius: 4,
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              color: "#94a3b8",
              marginLeft: 4,
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            border: "1px solid rgba(15,52,96,0.1)",
            background: "#f8fafc",
            color: "#475569",
            cursor: "pointer",
            position: "relative",
          }}
          aria-label="Notifications"
        >
          <IconBell size={17} />
          <span
            style={{
              position: "absolute",
              top: 7,
              right: 7,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#2e7cc4",
              border: "1.5px solid #fff",
            }}
          />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "rgba(15,52,96,0.08)" }} />

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
          AD
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
