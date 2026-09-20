---
name: event-management
description: Safely change Admin Gedung event creation, details, payments, cancellation, validation, and active-slot behavior.
---

# Event Management

Read this before modifying event workflows. Also read `../access-control/SKILL.md` when the work changes a server action or record access.

## Canonical files

| Concern | Files |
| --- | --- |
| Payment calculation | `src/lib/domain/payment.ts` |
| Event queries and scoped helpers | `src/lib/server/events.ts` |
| Create-event validation | `src/validation/event.ts` |
| Create flow | `src/app/dashboard/events/new/actions.ts`, `event-form.tsx` |
| Detail, payment, cancellation | `src/app/dashboard/events/[eventId]/actions.ts`, `event-actions.tsx` |
| Database contract | `prisma/schema.prisma` |
| User workflow tests | `tests/mvp.spec.ts` |

## Domain contract

- `totalAmount` is required. Calculate payment status only with `src/lib/domain/payment.ts`; never trust a browser-supplied status.
- `UNPAID` means `downPayment + finalPayment === 0`; `DP_PAID` is below `totalAmount`; `PAID` is at least `totalAmount`.
- `finalPayment` is one absolute final-payment value, not a payment ledger.
- Event states are `ACTIVE`, `COMPLETED`, and `CANCELLED`. Only an active event can receive a payment update or cancellation.
- Cancellation preserves the record and payment amounts. A cancelled slot can be reused; cancelled history remains.
- At most one active event may occupy a building/date/session. Keep transaction-level conflict feedback in addition to the database constraint.
- Building and creator identity come from the server session, never from form input.

## Implementation checklist

1. Authenticate, authorize, validate, then re-read the target event under the session building scope before mutating.
2. Update shared Zod validation and the relevant domain/helper code with any changed business rule.
3. Use existing status badges, `ConfirmationDialog`, and `formatCurrency`/`formatDate` for presentation.
4. Add or adjust an E2E scenario when the user-visible workflow changes.
