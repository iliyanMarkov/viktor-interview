"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconUsers,
  IconShip,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutDashboard,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/seafarers", label: "Seafarers", icon: IconUsers },
  { href: "/ships", label: "Ships", icon: IconShip },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside
      style={{
        width: expanded ? 220 : 64,
        minWidth: expanded ? 220 : 64,
        transition: "width 0.22s ease, min-width 0.22s ease",
        background: "#0a2540",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflow: "hidden",
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: expanded ? 10 : 0,
          padding: expanded ? "20px 20px 18px" : "20px 0 18px",
          justifyContent: expanded ? "flex-start" : "center",
          textDecoration: "none",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        {/* Wordmark — always visible */}
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.5px",
            whiteSpace: "nowrap",
          }}
        >
          Se<span style={{ color: "#22d3ee" }}>AI</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={!expanded ? label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: expanded ? 10 : 0,
                padding: expanded ? "9px 12px" : "9px 0",
                justifyContent: expanded ? "flex-start" : "center",
                borderRadius: 8,
                textDecoration: "none",
                background: active
                  ? "rgba(46,124,196,0.22)"
                  : "transparent",
                color: active ? "#93c5fd" : "rgba(255,255,255,0.6)",
                fontSize: 14,
                fontWeight: active ? 500 : 400,
                transition: "background 0.15s, color 0.15s",
                whiteSpace: "nowrap",
                overflow: "hidden",
                borderLeft: active ? "3px solid #2e7cc4" : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
              }}
            >
              <Icon
                size={18}
                style={{ flexShrink: 0, marginLeft: active ? -3 : 0 }}
              />
              <span
                style={{
                  opacity: expanded ? 1 : 0,
                  width: expanded ? "auto" : 0,
                  overflow: "hidden",
                  transition: "opacity 0.15s ease, width 0.22s ease",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Toggle button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "12px",
          background: "none",
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          color: "rgba(255,255,255,0.4)",
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "inherit",
          transition: "color 0.15s",
          flexShrink: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")
        }
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {expanded ? (
          <>
            <IconChevronLeft size={16} />
            <span style={{ opacity: expanded ? 1 : 0, transition: "opacity 0.15s" }}>
              Collapse
            </span>
          </>
        ) : (
          <IconChevronRight size={16} />
        )}
      </button>
    </aside>
  );
}
