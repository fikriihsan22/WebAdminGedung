import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireBuildingAdmin } from "@/lib/server/auth";

import { EventForm } from "./event-form";

export default async function NewEventPage() {
  await requireBuildingAdmin();

  return (
    <div className="space-y-6">
      <div><Link className="text-sm font-medium text-primary hover:underline" href="/dashboard">← Kembali ke daftar</Link><h1 className="mt-3 text-2xl font-semibold">Tambah acara</h1><p className="mt-2 text-sm text-muted-foreground">Gedung ditentukan otomatis dari akun Anda.</p></div>
      <Card><CardHeader><h2 className="font-semibold">Data acara</h2></CardHeader><CardContent><EventForm /></CardContent></Card>
    </div>
  );
}
