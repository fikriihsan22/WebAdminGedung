---
name: access-control
description: Safely change Admin Gedung authentication, opaque sessions, role checks, record scoping, and server mutations.
---

# Access Control

Read this before changing login, logout, route guards, server actions, or data access boundaries.

## Canonical files

| Concern | Files |
| --- | --- |
| Authentication and roles | `src/lib/server/auth.ts` |
| Session lifecycle and cookie handling | `src/lib/server/session.ts` |
| Login action and rate limiting | `src/app/login/actions.ts`, `src/lib/server/login-rate-limit.ts` |
| Logout | `src/app/logout/actions.ts` |
| Root routing | `src/app/page.tsx` |
| Models | `prisma/schema.prisma` |

## Security contract

- `BUILDING_ADMIN` may read and mutate only its session-derived `buildingId`.
- `CENTRAL_ADMIN` may read cross-building dashboard data but must not mutate it.
- UI visibility is not authorization. Every action authenticates, authorizes, validates, and re-reads the target with permitted scope.
- Sessions last 30 days. The browser receives an opaque token; only its hash is stored.
- Keep credentials, PINs, session tokens, and database URLs out of client output, logs, test fixtures, and production documentation.
- The login limit is in-memory (five failures per username in fifteen minutes); treat it as single-instance MVP protection unless deliberately replacing it with shared storage.

## Change checklist

1. Prefer `requireUser`, `requireRole`, and `requireBuildingAccess` from the canonical helpers over new ad-hoc checks.
2. Never accept role, building ID, record ownership, or permission decisions from the client as trusted data.
3. Exercise both allowed and denied paths in tests when access behavior changes.
