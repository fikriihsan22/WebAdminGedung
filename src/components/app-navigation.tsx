"use client";

import Link from "next/link";
import { Building2, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type AppNavigationProps = {
  role: "CENTRAL_ADMIN" | "BUILDING_ADMIN";
  variant: "desktop" | "mobile";
};

export function AppNavigation({ role, variant }: AppNavigationProps) {
  const pathname = usePathname();
  const href = role === "CENTRAL_ADMIN" ? "/central" : "/dashboard";
  const label = role === "CENTRAL_ADMIN" ? "Dashboard Pusat" : "Dashboard Gedung";
  const Icon = role === "CENTRAL_ADMIN" ? Building2 : LayoutDashboard;
  const isActive = pathname === href;

  if (variant === "desktop") {
    return (
      <nav aria-label="Navigasi utama" className="border-r bg-card p-3">
        <Link
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
            isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          )}
          href={href}
        >
          <Icon aria-hidden className="size-4" />
          {label}
        </Link>
      </nav>
    );
  }

  return (
    <nav aria-label="Navigasi mobile" className="fixed inset-x-0 bottom-0 z-10 border-t bg-card px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
      <Link className={cn("mx-auto flex w-fit flex-col items-center gap-1 rounded-lg px-5 py-1 text-xs font-medium text-muted-foreground", isActive && "text-primary")} href={href}>
        <Icon aria-hidden className="size-5" />
        {label.replace("Dashboard ", "")}
      </Link>
    </nav>
  );
}
