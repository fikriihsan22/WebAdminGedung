---
name: frontend-ui
description: Build or adjust Admin Gedung pages and components using the established App Router and reusable UI patterns.
---

# Frontend UI

Read this before changing pages, layouts, forms, components, or styling. Read the relevant local Next.js 16 documentation before changing framework behavior.

## Reuse first

| Need | Canonical code |
| --- | --- |
| Role-aware shell/navigation | `src/components/app-shell.tsx`, `app-navigation.tsx` |
| Buttons, inputs, selects, cards | `src/components/ui/` |
| Event/payment/session presentation | `status-badge.tsx`, `event-session.tsx` |
| Empty, loading, error | `src/components/states.tsx`, route `loading.tsx`/`error.tsx` |
| Consequential confirmation | `src/components/confirmation-dialog.tsx` |
| Indonesian formatting | `src/lib/format.ts` |

## UI conventions

- Keep pages mobile-first and role-appropriate; route navigation must not expose inaccessible destinations.
- Prefer server components by default. Add client boundaries only for browser interaction, form state, or client hooks.
- For a new user-facing route, provide appropriate loading, empty, and error feedback and validate its small-screen layout.
- Keep business authorization and sensitive queries in server code; client components should render and submit, not decide access.
- Extend an existing pattern before creating a new primitive. Avoid abstractions needed only once.

## Verification

For visual-only changes, run `pnpm check` and inspect the affected responsive UI when practical.
