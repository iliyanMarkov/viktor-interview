"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  IconUsers,
  IconShip,
  IconChevronLeft,
  IconChevronRight,
  IconLayoutDashboard,
  IconX,
  IconMenu2,
} from "@tabler/icons-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/seafarers", label: "Seafarers", icon: IconUsers },
  { href: "/ships", label: "Ships", icon: IconShip },
];

const MOBILE_BP = 768;

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  /* Detect mobile on mount and on resize */
  useEffect(() => {
    function onResize() {
      const mobile = window.innerWidth < MOBILE_BP;
      setIsMobile(mobile);
      if (mobile) setExpanded(false);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* Collapse sidebar when navigating on mobile */
  useEffect(() => {
    if (isMobile) setExpanded(false);
  }, [pathname, isMobile]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const sidebarWidth = isMobile
    ? expanded ? "100vw" : 0
    : expanded ? 220 : 64;

  const sidebarVisible = !isMobile || expanded;

  return (
    <>
      {/* Mobile hamburger button — shown only on mobile when collapsed */}
      {isMobile && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          aria-label="Open menu"
          style={{
            position: "fixed",
            top: 10,
            left: 12,
            zIndex: 50,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a2540",
            border: "none",
            borderRadius: 8,
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          <IconMenu2 size={20} />
        </button>
      )}

      {/* Backdrop — mobile only */}
      {isMobile && expanded && (
        <div
          onClick={() => setExpanded(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 39,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          transition: isMobile
            ? "width 0.25s ease"
            : "width 0.22s ease, min-width 0.22s ease",
          background: "#0a2540",
          display: sidebarVisible ? "flex" : "none",
          flexDirection: "column",
          height: "100vh",
          position: isMobile ? "fixed" : "sticky",
          top: 0,
          left: 0,
          overflow: "hidden",
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            height: 56,
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
                  padding: expanded ? "11px 12px" : "11px 0",
                  justifyContent: expanded ? "flex-start" : "center",
                  borderRadius: 8,
                  textDecoration: "none",
                  background: active ? "rgba(46,124,196,0.22)" : "transparent",
                  color: active ? "#93c5fd" : "rgba(255,255,255,0.6)",
                  fontSize: isMobile ? 16 : 14,
                  fontWeight: active ? 500 : 400,
                  transition: "background 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  borderLeft: active ? "3px solid #2e7cc4" : "3px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon size={isMobile ? 22 : 18} style={{ flexShrink: 0, marginLeft: active ? -3 : 0 }} />
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

        {/* Mobile close — top-right X */}
        {isMobile && (
          <button
            onClick={() => setExpanded(false)}
            aria-label="Close menu"
            style={{
              position: "absolute",
              top: 12,
              right: 14,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              borderRadius: 8,
            }}
          >
            <IconX size={22} />
          </button>
        )}

        {/* Desktop toggle button */}
        {!isMobile && (
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
                <span style={{ opacity: 1, transition: "opacity 0.15s" }}>Collapse</span>
              </>
            ) : (
              <IconChevronRight size={16} />
            )}
          </button>
        )}
      </aside>
    </>
  );
}
