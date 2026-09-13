import { AppNavigation } from "@/components/app-navigation";
import { LogoutButton } from "@/components/logout-button";

type AppShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    role: "CENTRAL_ADMIN" | "BUILDING_ADMIN";
    buildingName?: string | null;
  };
};

export function AppShell({ children, user }: AppShellProps) {
  const roleLabel = user.role === "CENTRAL_ADMIN" ? "Admin Pusat" : "Admin Gedung";
  const locationLabel = user.buildingName ?? (user.role === "CENTRAL_ADMIN" ? "Semua gedung" : "Gedung belum ditentukan");

  return (
    <div className="min-h-screen bg-muted/40 md:grid md:grid-cols-[15rem_1fr]">
      <aside className="hidden min-h-screen md:block">
        <div className="border-b bg-card px-5 py-5"><p className="text-base font-semibold">Admin Gedung</p><p className="mt-1 text-xs text-muted-foreground">Management acara</p></div>
        <AppNavigation role={user.role} />
      </aside>
      <div className="min-w-0 pb-20 md:pb-0">
        <header className="sticky top-0 z-10 border-b bg-background/95 px-5 py-3 backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-muted-foreground">{roleLabel} · {locationLabel}</p></div>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8">{children}</main>
      </div>
      <AppNavigation role={user.role} />
    </div>
  );
}
