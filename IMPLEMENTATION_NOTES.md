# Implementation Notes

## Fase 0 — Discovery dan Baseline Repository

Tanggal: 2026-09-11  
Repository: `admin-gedung-web`

### Ringkasan discovery

- Project Next.js sudah ada dan menggunakan App Router melalui `src/app`.
- Versi utama yang terdeteksi: Next.js `16.3.3`, React `19.2.8`, TypeScript `^5`, dan pnpm `11.24.0`.
- Tailwind CSS v4, shadcn/ui, React Hook Form, Zod, bcrypt, dan Prisma/PostgreSQL sudah tercantum sebagai dependency.
- Prisma menggunakan konfigurasi Prisma Composer/Postgres (`prisma.config.ts`) dan menghasilkan typed contract ke `prisma/schema.json` serta `prisma/schema.d.ts`.
- Halaman yang tersedia masih berupa shell halaman awal Next.js; komponen UI yang sudah ada adalah `Button` dan helper `cn`.
- `.env.example` tersedia dan hanya berisi placeholder `DATABASE_URL`; `.env` di-ignore oleh Git.
- Project sudah memiliki `README.md`, `AGENTS.md`, dan konfigurasi lint/TypeScript/Next yang perlu dipertahankan.

### Keputusan bootstrap

Project tidak perlu dibuat dari awal. Fase berikutnya dapat melanjutkan fondasi repository yang sudah ada, dengan perhatian khusus pada penyesuaian schema dan script terhadap keputusan MVP.

### Script dan command yang tersedia

| Command | Status baseline | Catatan |
| --- | --- | --- |
| `pnpm dev` | Tersedia | Menjalankan Next.js development server |
| `pnpm build` | Berhasil | `next build --webpack` berhasil |
| `pnpm start` | Tersedia | Menjalankan hasil production build |
| `pnpm lint` | Berhasil | ESLint selesai tanpa error |
| `pnpm exec tsc --noEmit` | Berhasil setelah build | Typecheck awal sempat gagal karena dijalankan paralel sebelum `.next/types` dibuat |
| `pnpm contract:emit` | Berhasil | Contract Prisma berhasil di-emit; CLI memberi peringatan skills Prisma out of date |
| `pnpm test` | Tidak tersedia | Tidak ada test runner atau script `test` di `package.json` |
| `pnpm check` | Belum dijalankan sebagai satu command | Secara isi menjalankan lint, typecheck, contract emit, lalu build |

### Kondisi Git dan perubahan lokal

Repository sudah memiliki perubahan lokal sebelum fase ini dijalankan, termasuk perubahan pada `README.md`, `package.json`, `pnpm-lock.yaml`, konfigurasi lint/TypeScript/Tailwind, serta file Prisma dan komponen baru yang belum tracked. Perubahan tersebut tidak diubah atau dihapus selama discovery.

Validasi `git diff --check` berhasil.

### Temuan untuk fase berikutnya

Schema saat ini belum sama dengan keputusan domain pada execution plan, antara lain masih menggunakan `SUPER_ADMIN` alih-alih `CENTRAL_ADMIN`, field pembayaran/status yang berbeda, dan belum menunjukkan constraint event aktif berdasarkan gedung/tanggal/sesi. Ini dicatat sebagai pekerjaan fase 1–2, bukan diimplementasikan pada fase discovery.

Belum ditemukan migration SQL siap pakai; yang tersedia saat discovery adalah snapshot/contract di bawah `migrations/` dan output contract Prisma. Database migration perlu ditentukan dan diverifikasi pada fase data model.

### Kesimpulan fase

Acceptance criteria fase 0 terpenuhi: struktur project, command operasional, asset/config yang ada, status Git, dan baseline command sudah diidentifikasi. Repository sudah berupa aplikasi Next.js yang bisa di-build dan di-typecheck, sehingga fase berikutnya adalah bootstrap/fondasi teknis dan penyelarasan schema MVP.
