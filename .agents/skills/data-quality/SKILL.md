---
name: data-quality
description: Safely change Admin Gedung Prisma data contracts, migrations, seed data, tests, environment handling, and verification workflows.
---

# Data Quality

Read this before changing Prisma, database behavior, tests, environment handling, or release-related code. For any Prisma work, read `../prisma-composer/SKILL.md` before editing Prisma files.

## Canonical files and commands

| Concern | Files / commands |
| --- | --- |
| Data contract | `prisma/schema.prisma`, generated `prisma/schema.json`, `prisma/schema.d.ts` |
| Database client | `prisma/db.ts` |
| Seed data | `scripts/db-seed.ts` |
| Environment validation | `src/lib/server/env.ts` |
| E2E suite/helpers | `tests/mvp.spec.ts`, `tests/database.ts` |
| Standard verification | `pnpm check` |

## Safety contract

- Treat `DATABASE_URL` as secret. Use a development database locally; do not use a production database for tests.
- Generate the database contract with `pnpm db:generate`. Inspect the migration plan before applying it; apply migrations only with authorization for the development database.
- Server-side timestamps use `Temporal.Instant`; load/maintain the required polyfill through established database code.
- E2E runs on a production build at port 3001, is explicitly enabled for a development DB, and may create only `E2E Test ` events. Those events are cleaned after scenarios.

## Verification matrix

| Change | Minimum verification |
| --- | --- |
| Styling/component only | `pnpm check` |
| Action, access, event/payment behavior | `pnpm test` and `pnpm check` |
| Prisma schema/migration | `pnpm db:generate`, `pnpm exec prisma migration check`, `pnpm exec prisma db verify`, `pnpm test`, `pnpm check` |

Run the smallest set covering the change, and report precisely what passed or could not run.
