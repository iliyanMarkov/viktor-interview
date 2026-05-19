"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconChevronRight,
  IconChevronDown,
  IconLayoutDashboard,
} from "@tabler/icons-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { getSeafarer } from "@/lib/seafarers";

interface Crumb {
  label: string;
  href?: string;
}

function buildCrumbs(pathname: string, ids: string | null): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Dashboard", href: "/" }];

  if (pathname.startsWith("/seafarers")) {
    crumbs.push({ label: "Seafarers", href: "/seafarers" });
    if (ids) {
      const seafarer = getSeafarer(ids);
      crumbs.push({
        label: seafarer ? `${seafarer.firstName} ${seafarer.lastName}` : ids,
      });
    }
  } else if (pathname.startsWith("/ships")) {
    crumbs.push({ label: "Ships" });
  }

  return crumbs;
}

function BreadcrumbsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids");
  const crumbs = buildCrumbs(pathname, ids);

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentCrumb = crumbs[crumbs.length - 1];

  return (
    <nav aria-label="Breadcrumb">
      {/* ── Mobile dropdown ── */}
      <div className="flex md:hidden" ref={containerRef} style={{ position: "relative" }}>
        <button
          onClick={crumbs.length > 1 ? () => setOpen((v) => !v) : undefined}
          aria-haspopup={crumbs.length > 1 ? "listbox" : undefined}
          aria-expanded={crumbs.length > 1 ? open : undefined}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 13,
            color: "#0a2540",
            fontWeight: 600,
            padding: "2px 0",
            border: "none",
            background: "transparent",
            cursor: crumbs.length > 1 ? "pointer" : "default",
          }}
        >
          {currentCrumb.label}
          {crumbs.length > 1 && (
            <IconChevronDown
              size={13}
              style={{
                color: "#94a3b8",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.15s",
              }}
            />
          )}
        </button>

        {open && (
          <ul
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              minWidth: 160,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: "4px 0",
              margin: 0,
              listStyle: "none",
              zIndex: 50,
            }}
          >
            {crumbs.map((crumb, i) => {
              const isLast = i === crumbs.length - 1;
              const isFirst = i === 0;
              return (
                <li key={i} role="option" aria-selected={isLast}>
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      onClick={() => setOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: "#475569",
                        textDecoration: "none",
                        padding: "6px 12px",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "#eff6ff";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {isFirst && <IconLayoutDashboard size={13} />}
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: "#0a2540",
                        fontWeight: 600,
                        padding: "6px 12px",
                      }}
                    >
                      {isFirst && <IconLayoutDashboard size={13} />}
                      {crumb.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Desktop trail ── */}
      <div className="hidden md:flex" style={{ alignItems: "center", gap: 4 }}>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          const isFirst = i === 0;

          return (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {i > 0 && (
                <IconChevronRight
                  size={13}
                  style={{ color: "#94a3b8", flexShrink: 0 }}
                />
              )}

              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 13,
                    color: "#475569",
                    textDecoration: "none",
                    fontWeight: 400,
                    padding: "2px 6px",
                    borderRadius: 6,
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#eff6ff";
                    el.style.color = "#144272";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.color = "#475569";
                  }}
                >
                  {isFirst && <IconLayoutDashboard size={13} />}
                  {crumb.label}
                </Link>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 13,
                    color: isLast ? "#0a2540" : "#475569",
                    fontWeight: isLast ? 600 : 400,
                    padding: "2px 6px",
                  }}
                >
                  {isFirst && <IconLayoutDashboard size={13} />}
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </nav>
  );
}

export default function Breadcrumbs() {
  return (
    <Suspense fallback={<span style={{ fontSize: 13, color: "#475569" }}>…</span>}>
      <BreadcrumbsInner />
    </Suspense>
  );
}
