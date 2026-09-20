---
name: admin-gedung
description: Route work in the Admin Gedung Next.js MVP to the smallest relevant project skill. Use for any task in this repository.
---

# Admin Gedung Router

Use this as the entry point for work in this repository. Read `AGENTS.md` before changing application code; for Next.js behavior, read the relevant local guide under `node_modules/next/dist/docs/` first.

## Project facts that always apply

- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Zod, Prisma/PostgreSQL, pnpm 11.
- Roles: `BUILDING_ADMIN` works only within the building derived from the server session. `CENTRAL_ADMIN` can read cross-building data and has no mutations.
- Preserve unrelated working-tree changes. Keep mutations server-authorized and server-scoped; browser values are not authority.
- Reuse existing code before adding a new abstraction. The primary directories are `src/app`, `src/components`, `src/lib`, `src/validation`, `prisma`, and `tests`.

## Route work narrowly

| Work | Read first |
| --- | --- |
| Event creation, details, payment, cancellation, active-slot conflicts | `../event-management/SKILL.md` |
| Login, session, roles, record ownership, access control | `../access-control/SKILL.md` |
| `/central`, dashboard filters, cross-building reporting, completion sync | `../central-dashboard/SKILL.md` |
| Pages, layouts, forms, components, responsive behavior, visual states | `../frontend-ui/SKILL.md` |
| Prisma, migrations, seed data, tests, environment, release safety | `../data-quality/SKILL.md` |

For a cross-cutting change, read only the skills whose boundaries the change crosses. Read `IMPLEMENTATION_NOTES.md` only when a current business decision or historical implementation detail remains unclear.

## Delivery discipline

- Keep the requested scope; do not deploy, apply a database migration, or broaden product behavior without authorization.
- Pair a changed mutation or domain rule with the corresponding validation and the smallest relevant test coverage.
- Report outcome, changed files, verification run, and genuine follow-ups.
