import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/server/auth";

export default async function CentralDashboardLayout({ children }: LayoutProps<"/central">) {
  const user = await requireRole("CENTRAL_ADMIN");
  return <AppShell user={user}>{children}</AppShell>;
}
