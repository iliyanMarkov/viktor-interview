"use client";

import { useEffect, useState } from "react";
import { IconAnchor } from "@tabler/icons-react";

export default function AppLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1200);
    const hideTimer = setTimeout(() => setVisible(false), 1700);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f3460",
        transition: "opacity 0.5s ease",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "all",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          animation: "loaderPulse 1.4s ease-in-out infinite",
        }}
      >
        <IconAnchor size={40} color="#ffffff" stroke={1.5} />
      </div>

      {/* Brand name */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: "#ffffff",
          marginBottom: 6,
        }}
      >
        Se<span style={{ color: "#22d3ee" }}>AI</span>
      </div>
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
          marginBottom: 48,
        }}
      >
        Marine Operations
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 180,
          height: 3,
          borderRadius: 2,
          background: "rgba(255,255,255,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "#2e7cc4",
            borderRadius: 2,
            animation: "loaderBar 1.2s ease-out forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes loaderPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes loaderBar {
          0% { width: 0%; }
          60% { width: 75%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
