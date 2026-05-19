"use client";

import { useEffect, useRef, useState } from "react";
import {
  IconSettings,
  IconHelp,
  IconLogout,
  IconChevronDown,
} from "@tabler/icons-react";
import Breadcrumbs from "@/components/Breadcrumbs";

const MENU_ITEMS = [
  {
    icon: IconSettings,
    label: "Settings",
    onClick: () => alert("Settings"),
  },
  {
    icon: IconHelp,
    label: "Help & Support",
    onClick: () => alert("Help & Support"),
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      {/* Left: breadcrumbs */}
      <Breadcrumbs />

      {/* Right: avatar dropdown */}
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 24,
            border: `1px solid ${open ? "#bfdbfe" : "none"}`,
            background: open ? "#fff" : "linear-gradient(135deg, #144272 0%, #2e7cc4 100%)",
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
            position: "relative",
            overflow: "visible",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: open ? "#fff" : "linear-gradient(135deg, #144272 0%, #2e7cc4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: open ? "#0a2540" : "#fff",
              flexShrink: 0,
            }}
          >
            VD
          </div>


          <IconChevronDown
            size={13}
            style={{
              position: "absolute",
              right: -3,
              bottom: -3,
              color: open ? "#0a2540" : "#fff",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.15s",
              border: open ? "1px solid #bfdbfe"  : "1px solid #fff",
              borderRadius: "50%",
              background: open ? "#fff" : "linear-gradient(135deg, #144272 0%, #2e7cc4 100%)",
            }}
          />
        </button>

        {open && (
          <div
            role="menu"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              width: 220,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              padding: "6px 0",
              zIndex: 50,
            }}
          >
            {/* User info block */}
            <div
              style={{
                padding: "10px 14px 12px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #144272 0%, #2e7cc4 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  VD
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0a2540" }}>
                    Viktor Dimitrov
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    Fleet Manager
                  </div>
                </div>
              </div>
            </div>

            {/* Action items */}
            {MENU_ITEMS.map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                role="menuitem"
                onClick={() => { setOpen(false); onClick(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 14px",
                  background: "transparent",
                  border: "none",
                  fontSize: 13,
                  color: "#334155",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon size={16} style={{ color: "#64748b", flexShrink: 0 }} />
                {label}
              </button>
            ))}

            {/* Divider + Logout */}
            <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 4, paddingTop: 4 }}>
              <button
                role="menuitem"
                onClick={() => { setOpen(false); alert("Logged out"); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 14px",
                  background: "transparent",
                  border: "none",
                  fontSize: 13,
                  color: "#dc2626",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#fef2f2";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <IconLogout size={16} style={{ flexShrink: 0 }} />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
