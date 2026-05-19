"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IconChevronRight, IconLayoutDashboard } from "@tabler/icons-react";
import { Suspense } from "react";
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
        label: seafarer
          ? `${seafarer.firstName} ${seafarer.lastName}`
          : ids,
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

  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
