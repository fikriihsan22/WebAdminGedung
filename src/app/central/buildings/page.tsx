import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireCentralAdminCapability } from "@/lib/server/auth";
import { listCentralBuildings } from "@/lib/server/buildings";
import { BuildingManager } from "./building-manager";

export default async function CentralBuildingsPage() {
  await requireCentralAdminCapability("MANAGE_BUILDINGS");
  const buildings = await listCentralBuildings();
  const buildingProps = buildings.map((building) => ({
    id: building.id,
    name: building.name,
    isActive: building.isActive,
    spaces: building.spaces.map((space) => ({
      id: space.id,
      name: space.name,
      isActive: space.isActive,
    })),
    admins: building.admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      username: admin.username,
      isActive: admin.isActive,
    })),
  }));

  return <div className="space-y-6"><div><p className="text-sm font-medium text-primary">Master data</p><h1 className="mt-1 text-2xl font-semibold">Kelola Gedung</h1><p className="mt-2 text-sm text-muted-foreground">Atur gedung, ruang booking, dan admin gedung.</p></div><Card><CardHeader><h2 className="font-semibold">Daftar gedung</h2></CardHeader><CardContent><BuildingManager buildings={buildingProps} /></CardContent></Card></div>;
}
