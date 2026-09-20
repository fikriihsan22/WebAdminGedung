---
name: central-dashboard
description: Safely change the read-only cross-building dashboard, its filters, summaries, and event-completion synchronization.
---

# Central Dashboard

Read this before changing `/central`, its filters, dashboard queries, or completion synchronization. Read `../access-control/SKILL.md` too if role checks or action boundaries change.

## Canonical files

| Concern | Files |
| --- | --- |
| Page and filter UI | `src/app/central/page.tsx`, `src/components/central-filters.tsx` |
| Actions and completion sync | `src/app/central/actions.ts`, `src/app/central/sync-events-button.tsx` |
| Dashboard query/summary | `src/lib/server/central-dashboard.ts` |
| Filter validation | `src/validation/dashboard.ts` |
| Layout and role gate | `src/app/central/layout.tsx` |
| Workflow tests | `tests/mvp.spec.ts` |

## Dashboard contract

- Only `CENTRAL_ADMIN` can access it; it is read-only except for the explicit completion synchronization action.
- Building, date range, session, event status, and payment status filters must drive both the list and every summary from the same query contract.
- Completion sync alone assigns `COMPLETED`: it changes `ACTIVE` events before the start of today in `Asia/Jakarta`, never events scheduled today.
- Do not infer completion in the browser or give building admins a path to assign it.

## Change checklist

1. Keep filters validated server-side and reflected consistently in query, counts, totals, and UI state.
2. Preserve the `Asia/Jakarta` day boundary in all date logic.
3. Keep all cross-building data paths role-checked in the server helper as well as the route boundary.
