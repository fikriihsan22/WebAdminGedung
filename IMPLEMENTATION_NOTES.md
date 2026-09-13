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

## Fase 1 — Bootstrap dan Fondasi Teknis

### Implementasi

- Menambahkan script `typecheck`, `db:generate`, `db:migrate`, dan `db:seed`.
- `db:generate` menggunakan `prisma contract emit`, sesuai workflow Prisma Next yang dipakai repository ini.
- Menambahkan validasi `DATABASE_URL` di `src/lib/server/env.ts` tanpa mengekspos secret ke client bundle.
- Menambahkan fondasi validasi umum di `src/validation/index.ts`.
- Mengganti halaman awal Next.js dengan shell Admin Gedung yang responsif dan menambahkan route `/health` untuk memeriksa routing/styling.
- Menambahkan `scripts/db-seed.mjs` sebagai entrypoint seed yang aman; seed domain ditunda ke Fase 2.

### Open Decisions

- Migration database belum dijalankan dan belum dibuat ulang karena definisi schema/domain adalah scope Fase 2.
- Seed domain belum dibuat; `pnpm db:seed` hanya memberi pesan penundaan sampai Fase 2.
- Peringatan CLI Prisma tentang skills yang out of date tetap ada dan tidak memblokir build atau contract generation.

## Fase 2 — Data Model, Migration, dan Seed

### Implementasi

- Menyelaraskan `prisma/schema.prisma` dengan domain MVP: `User`, `Building`, dan `Event`.
- Menambahkan enum `UserRole`, `EventSession`, `PaymentStatus`, dan `EventStatus`.
- Menambahkan `totalAmount` dan aturan pembayaran yang disepakati: `downPayment + finalPayment` menentukan status.
- Menambahkan relasi pembuat event (`createdBy`) dan unique constraint gedung–tanggal–sesi–status.
- Menghasilkan contract Prisma baru dengan storage hash `67c99ae905eaa5326c284502bd81ff53ebbb3dd77c1f66e10c31f8d77bd1740e`.
- Membuat migration greenfield `migrations/app/20260912T1418_phase2_data_model` dengan 12 operasi additive.
- Membuat seed idempotent menggunakan ID deterministik dan bcrypt hash untuk tiga akun development.

### Verifikasi

- `pnpm check` berhasil.
- `pnpm exec prisma migration check` berhasil.
- `pnpm exec prisma migration show 20260912T1418_phase2_data_model` berhasil dan menunjukkan 12 operasi.
- Seed script lolos Node syntax check dan TypeScript typecheck.
- `git diff --check` berhasil.

### Open Decisions / Blocker

- `pnpm db:migrate` belum dapat diterapkan ke database lokal karena marker database masih menunjuk contract draft lama (`4bf8...`), sementara graph sekarang dimulai dari empty ke contract Fase 2. Tidak ada reset database yang dilakukan.
- Sebelum memakai database lokal tersebut, perlu dipilih salah satu: reset database development yang memang boleh dihapus, atau buat migration legacy dari contract lama ke contract Fase 2 dengan aturan backfill data. Ini tidak aman untuk diputuskan diam-diam.
- Unique constraint saat ini mencakup `eventStatus`, sehingga menjamin tidak ada dua event `ACTIVE` pada slot yang sama. Reuse slot setelah event dibatalkan tetap perlu duplicate check server-side pada fase mutation.

### Resolusi database lokal

- Database development lokal `admin_gedung` telah direset setelah diverifikasi kosong, lalu migration Fase 2 berhasil diterapkan.
- `pnpm db:seed` berhasil dijalankan dua kali tanpa menambah data duplikat.
- Prisma membutuhkan `temporal-polyfill` pada Node yang belum menyediakan `Temporal`; polyfill sekarang dimuat sebelum database client dibuat.
- Nilai `eventDate` pada seed menggunakan `Temporal.Instant`, sesuai codec Prisma Next untuk PostgreSQL `timestamptz`.
- `pnpm exec prisma db verify` menyatakan marker dan schema database cocok dengan contract Fase 2.

## Fase 3 — Auth, Session, dan Guard Dasar

### Implementasi

- Menambahkan model `Session` yang terhubung ke `User`, dengan token hash unik dan masa berlaku 30 hari.
- Login menggunakan username dan PIN bcrypt, mengembalikan pesan generik untuk kredensial salah maupun akun nonaktif.
- Token sesi acak hanya disimpan sebagai hash SHA-256 di database; cookie berisi token opaque dengan `httpOnly`, `sameSite=lax`, `secure` pada production, dan path `/`.
- Menambahkan logout yang menghapus sesi database saat ini dan cookie browser.
- Menambahkan helper server-side `requireUser`, `requireRole`, dan `requireBuildingAccess` untuk proteksi route dan isolasi gedung.
- Route `/` mengarahkan pengguna ke `/login`, `/dashboard`, atau `/central` berdasarkan sesi dan peran; dashboard pusat tidak menyediakan mutation pada fase ini.
- Membuat migration `20260913T0706_add_server_sessions` dengan empat operasi additive.

### Verifikasi

- `pnpm exec prisma migration check` berhasil.
- `pnpm db:migrate` menerapkan satu migration sesi.
- `pnpm exec prisma db verify` berhasil dan menyatakan schema database sesuai contract.
- `pnpm check` berhasil: lint, typecheck, contract generation, dan production build.
- Halaman `/login` pada server lokal merespons `200 OK` serta memuat field username dan PIN.

### Open Decisions

- Tidak ada signup mandiri: akun tetap dibuat dan dikelola admin, sesuai scope MVP.
- Sesi memakai hash token opaque, sehingga tidak memerlukan `SESSION_SECRET`; secret baru diperlukan bila kelak menggunakan token yang ditandatangani atau cookie terenkripsi sendiri.
- Helper `requireBuildingAccess` siap dipakai pada route/mutation event Fase 5; belum ada halaman atau mutation event pada Fase 3 untuk diuji melalui UI.

## Fase 4 — Shared UI dan Navigation

### Implementasi

- Menambahkan `AppShell` responsif dengan sidebar ringkas pada desktop dan bottom navigation pada mobile.
- Menampilkan nama pengguna, role, dan konteks gedung (atau semua gedung bagi admin pusat) di header.
- Navigasi hanya menampilkan tujuan yang dapat diakses oleh peran aktif.
- Menambahkan komponen reusable: `Card`, `Input`, `Select`, status badge acara/pembayaran, empty state, loading state, error state, dan confirmation dialog.
- Menambahkan format tanggal serta mata uang Rupiah berbasis locale `id-ID`.
- Menambahkan loading dan error boundary untuk dashboard gedung maupun pusat.

### Verifikasi

- `pnpm typecheck` berhasil.
- `pnpm lint` berhasil.

### Open Decisions

- Navigasi hanya menampilkan dashboard yang sudah tersedia. Menu acara dan dashboard lintas gedung akan ditambahkan bersama route nyata pada Fase 5 dan Fase 8, agar tidak menghasilkan link buntu.

## Fase 5 — Daftar Acara Admin Gedung

### Implementasi

- Mengganti halaman dashboard gedung menjadi daftar acara mobile-first, diurutkan berdasarkan tanggal acara terdekat.
- Menampilkan nama client, tanggal, sesi, status acara, dan status pembayaran pada setiap kartu acara.
- Menambahkan detail acara baca-saja di `/dashboard/events/[eventId]`.
- Seluruh daftar dan detail memakai `buildingId` dari sesi server. Detail mencari kombinasi `id` dan `buildingId`, lalu memberikan not-found untuk event gedung lain atau ID tidak valid.
- Menggunakan empty state pada gedung tanpa acara serta badge status reusable untuk membedakan event aktif/dibatalkan dan status pembayaran.

### Verifikasi

- `pnpm check` berhasil: lint, typecheck, contract generation, dan production build.
- Query read-only database lokal menunjukkan Gedung Alpha dan Beta masing-masing hanya mengembalikan event miliknya.
- `git diff --check` berhasil.

### Open Decisions

- Detail tetap read-only dalam Fase 5. Aksi pelunasan dan cancel secara eksplisit ditunda ke Fase 7.

## Fase 6 — Tambah Acara dan Input Pembayaran Awal

### Implementasi

- Menambahkan halaman dan form `/dashboard/events/new` untuk admin gedung.
- Form memvalidasi nama client, tanggal, sesi, total tagihan, DP, dan pelunasan opsional pada browser maupun server menggunakan schema Zod yang sama.
- Gedung dan pembuat acara selalu diambil dari sesi server; keduanya tidak dapat dikirim atau diubah melalui form.
- Menambahkan fungsi domain tunggal untuk menentukan `UNPAID`, `DP_PAID`, atau `PAID` dari total tagihan, DP, dan pelunasan.
- Pembuatan acara menggunakan transaction dan mengecek konflik event aktif pada gedung, tanggal, serta sesi yang sama.
- Tombol submit dinonaktifkan selama penyimpanan dan pengguna diarahkan ke detail acara dengan feedback sukses.

### Verifikasi

- Uji aturan pembayaran mencakup `UNPAID`, `DP_PAID`, dan `PAID`.
- Uji validasi menolak nama client kosong dan nominal negatif.
- `pnpm check` berhasil: lint, typecheck, contract generation, dan production build.
- `git diff --check` berhasil.

### Open Decisions

- `totalAmount` menjadi field wajib pada form, mengikuti schema dan keputusan pembayaran Fase 2 meskipun daftar field lama di execution plan belum mencantumkannya.

## Fase 7 — Detail Acara, Pelunasan, dan Cancel

### Implementasi

- Menambahkan form pelunasan pada detail event aktif. Nilainya merupakan nilai pelunasan akhir tunggal, lalu status pembayaran dihitung ulang secara atomik.
- Menolak pelunasan pada event yang telah dibatalkan.
- Menambahkan cancel dengan confirmation dialog; cancel mengubah status menjadi `CANCELLED` tanpa menghapus event atau nominal pembayaran.
- Cancel berulang aman dan memberi feedback bahwa event sudah dibatalkan.
- Detail, pembayaran, dan cancel selalu mengambil event dengan kombinasi ID event dan `buildingId` dari sesi server.
- Menghapus unique constraint yang sebelumnya membatasi histori cancelled; event aktif tetap dicek di transaction saat dibuat, sehingga slot dapat digunakan ulang setelah cancel dan beberapa histori cancelled tetap tersimpan.
- Memperbaiki referensi graph migrasi agar contract sesi Fase 3 menjadi titik awal migration Fase 7.

### Verifikasi

- `pnpm exec prisma migration check` berhasil.
- Migration `20260913T1041_allow_cancelled_event_history` berhasil diterapkan dan database terverifikasi sesuai contract.
- Uji transaction rollback membuktikan dua event cancelled pada slot yang sama dapat dibuat tanpa meninggalkan data uji.
- Uji validasi pelunasan dan perhitungan status pembayaran berhasil.
- `pnpm check` dan `git diff --check` berhasil.

### Open Decisions

- Slot setelah cancel dapat digunakan ulang, dan histori cancel lebih dari satu dipertahankan, sesuai keputusan bisnis yang disetujui.

## Fase 8 — Dashboard Admin Pusat

### Implementasi

- Mengganti placeholder dashboard pusat dengan summary lintas gedung, daftar event, dan ringkasan per gedung yang bersifat read-only.
- Menambahkan filter GET untuk gedung, rentang tanggal, sesi, status acara, dan status pembayaran.
- Semua summary dan daftar event dihitung dari query filter yang sama.
- Menambahkan dua index event untuk pola query dashboard: gedung–tanggal serta tanggal–sesi–status.
- Menambahkan migration `20260913T1057_add_event_dashboard_indexes` dan memperbarui referensi graph migrasi.

### Verifikasi

- Migration index berhasil diterapkan dan `prisma db verify` menyatakan schema sesuai contract.
- Uji query read-only memastikan hasil Gedung Alpha hanya berisi event Alpha dan total status konsisten dengan total event.
- `pnpm check` dan `git diff --check` berhasil.

### Open Decisions

- Tidak ada. Dashboard pusat tetap tidak menyediakan mutation.

## Fase 9 — Security dan Quality Hardening

### Implementasi

- Menambahkan indeks unik parsial untuk slot event `ACTIVE` berdasarkan gedung, tanggal, dan sesi. Histori event `CANCELLED` tetap dapat lebih dari satu dan slot dapat dipakai kembali setelah cancel.
- Menangani konflik indeks saat pembuatan event sebagai pesan validasi yang ramah pengguna, termasuk pada request yang berjalan bersamaan.
- Memperketat validasi form event: nominal wajib tidak lagi mengubah input kosong menjadi `0`, dan tanggal harus merupakan tanggal kalender yang valid.
- Menambahkan rate limit login dalam memori: lima kegagalan per username dalam 15 menit, lalu percobaan berikutnya ditolak sementara. Login berhasil menghapus penghitung kegagalan.
- Menjadikan helper data dashboard pusat melakukan verifikasi peran `CENTRAL_ADMIN` sendiri, selain proteksi route yang sudah ada.
- Menambahkan migration `20260913T1115_enforce_active_event_slot` dan memperbarui referensi graph migrasi.

### Verifikasi

- Migration indeks unik parsial berhasil diterapkan ke database development.
- Verifikasi database, pemeriksaan graph migrasi, uji rollback konflik slot aktif, serta `pnpm check` dijalankan pada Fase 9.

### Open Decisions

- Rate limit login memakai memori proses dan cukup untuk satu instance MVP. Saat deployment memakai beberapa instance atau membutuhkan proteksi lintas restart, pindahkan counter ke penyimpanan bersama seperti Redis atau database dengan TTL.
