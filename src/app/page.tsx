import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

const foundationItems = [
  { label: "Next.js App Router", status: "Siap" },
  { label: "TypeScript", status: "Siap" },
  { label: "Tailwind CSS", status: "Siap" },
  { label: "Prisma + PostgreSQL", status: "Terkonfigurasi" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-1 items-center bg-muted/40 px-5 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Admin Management Gedung</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Fondasi aplikasi siap digunakan</h1>
            <p className="max-w-2xl text-muted-foreground">
              Shell awal untuk memvalidasi routing, styling, dan kesiapan toolchain MVP.
            </p>
          </div>
          <Link className={buttonVariants({ size: "lg" })} href="/health">
            Cek status aplikasi
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Status fondasi teknis">
          {foundationItems.map((item) => (
            <article key={item.label} className="rounded-xl border bg-background p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-3 text-lg font-semibold">{item.status}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border bg-background p-6 shadow-sm">
          <p className="text-sm font-medium text-primary">Fase 1</p>
          <h2 className="mt-2 text-xl font-semibold">Bootstrap dan fondasi teknis</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Fitur bisnis, autentikasi, dan data seed belum diaktifkan pada fase ini. Halaman ini hanya menjadi
            titik awal yang stabil untuk implementasi fase berikutnya.
          </p>
        </section>
      </div>
    </main>
  );
}
