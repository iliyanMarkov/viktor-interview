import type { SeafarerStatus } from "@/lib/seafarers";

interface StatusConfig {
  lightBg: string;
  lightText: string;
  darkBg: string;
  darkText: string;
  dot: string;
}

const CONFIG: Record<SeafarerStatus, StatusConfig> = {
  Onboard:    { lightBg: "#dcfce7", lightText: "#166534", darkBg: "rgba(34,197,94,0.2)",   darkText: "#86efac", dot: "#22c55e" },
  Available:  { lightBg: "#dbeafe", lightText: "#1e40af", darkBg: "rgba(59,130,246,0.2)",  darkText: "#93c5fd", dot: "#3b82f6" },
  "On leave": { lightBg: "#fef3c7", lightText: "#92400e", darkBg: "rgba(251,191,36,0.2)",  darkText: "#fcd34d", dot: "#f59e0b" },
  Training:   { lightBg: "#f3e8ff", lightText: "#6b21a8", darkBg: "rgba(167,139,250,0.2)", darkText: "#c4b5fd", dot: "#a855f7" },
};

interface Props {
  status: SeafarerStatus;
  /** "light" for white/light backgrounds (table, info card). "dark" for coloured/dark backgrounds (profile header, card overlay). */
  variant?: "light" | "dark";
  /** Renders a subtle border derived from the dot colour. */
  border?: boolean;
  /** "sm" shrinks font + padding slightly for tight spaces (e.g. carousel card overlay). */
  size?: "sm" | "md";
}

export default function StatusBadge({
  status,
  variant = "light",
  border = false,
  size = "md",
}: Props) {
  const cfg = CONFIG[status];
  const isLight = variant === "light";
  const isSm = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSm ? 4 : 5,
        padding: isSm ? "2px 8px" : "3px 11px",
        borderRadius: 999,
        fontSize: isSm ? 10 : 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        lineHeight: 1.5,
        background: isLight ? cfg.lightBg : cfg.darkBg,
        color: isLight ? cfg.lightText : cfg.darkText,
        border: border ? `1px solid ${cfg.dot}4d` : "none",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: isSm ? 5 : 6,
          height: isSm ? 5 : 6,
          borderRadius: "50%",
          background: cfg.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}
