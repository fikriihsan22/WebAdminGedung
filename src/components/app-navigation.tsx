"use client";

import Link from "next/link";
import { Building2, CalendarDays, LayoutDashboard, Settings2 } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type AppNavigationProps = {
  role: "CENTRAL_ADMIN" | "BUILDING_ADMIN";
  variant: "desktop" | "mobile";
};

export function AppNavigation({ role, variant }: AppNavigationProps) {
  const pathname = usePathname();
  const dashboard = role === "CENTRAL_ADMIN"
    ? { href: "/central", label: "Dashboard Pusat", mobileLabel: "Pusat", Icon: Building2 }
    : { href: "/dashboard", label: "Dashboard Gedung", mobileLabel: "Dashboard", Icon: LayoutDashboard };
  const calendarHref = role === "CENTRAL_ADMIN" ? "/central/calendar" : "/dashboard/calendar";
  const items = [
    dashboard,
    { href: calendarHref, label: "Calendar", mobileLabel: "Calendar", Icon: CalendarDays },
    ...(role === "CENTRAL_ADMIN" ? [{ href: "/central/buildings", label: "Kelola Gedung", mobileLabel: "Gedung", Icon: Settings2 }] : []),
  ];

  if (variant === "desktop") {
    return (
      <nav aria-label="Navigasi utama" className="border-r bg-card p-3">
        <div className="space-y-1">
          {items.map(({ href, label, Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
                href={href}
                key={href}
              >
                <Icon aria-hidden className="size-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label="Navigasi mobile" className="fixed inset-x-0 bottom-0 z-10 border-t bg-card px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      <div className={cn("mx-auto grid max-w-sm", role === "CENTRAL_ADMIN" ? "grid-cols-3" : "grid-cols-2")}>
        {items.map(({ href, mobileLabel, Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn("flex min-w-0 flex-col items-center gap-1 rounded-lg px-3 py-1 text-xs font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring", isActive && "text-primary")}
              href={href}
              key={href}
            >
              <Icon aria-hidden className="size-5" />
              {mobileLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
