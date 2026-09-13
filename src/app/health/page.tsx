import Link from "next/link";

export default function HealthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-5 py-10">
      <section className="w-full max-w-lg rounded-xl border bg-background p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-primary">Routing check</p>
        <h1 className="mt-2 text-2xl font-semibold">Aplikasi berjalan</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Route App Router dan styling Tailwind berhasil dirender.
        </p>
        <Link className="mt-6 inline-block text-sm font-medium underline underline-offset-4" href="/">
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
