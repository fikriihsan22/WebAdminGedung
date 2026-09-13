# Admin Gedung Web

Next.js application for the Admin Management Gedung MVP.

## Local setup

Requirements: Node.js compatible with the installed Next.js version, pnpm 11, and PostgreSQL 15 or newer.

```bash
pnpm install
cp .env.example .env
```

Set `DATABASE_URL` in `.env` to a development PostgreSQL database, then generate the typed database contract:

```bash
pnpm db:generate
```

Start development:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm check
pnpm exec prisma migration status
```

Database commands are available through `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:seed`. The development seed creates two buildings, three users, and two events; all development accounts use PIN `123456`. Do not use a production database during local development.

The database client installs the required Temporal polyfill automatically before Prisma queries run. Event timestamps use `Temporal.Instant` in server-side code and seed scripts.

`pnpm check` runs linting, Next.js route type generation, TypeScript checking, Prisma contract generation, and a production build.

## End-to-end testing

The E2E suite uses Playwright against a production build on port `3001`. It uses the development seed accounts and creates only events whose client name starts with `E2E Test `; those events are removed automatically after every scenario.

```bash
pnpm db:seed
pnpm test
```

The test command explicitly enables development-database access. Never run it with a production `DATABASE_URL`.

## Deployment readiness

Before deployment, configure `DATABASE_URL` for the target environment, run `pnpm db:migrate` through the deployment pipeline, and verify it with `pnpm exec prisma db verify`. Create operational accounts outside the development seed, rotate the documented development PIN, and keep the deployment database separate from local development and E2E testing.

<!-- Legacy create-next-app instructions removed; use the setup above. -->

<!-- Legacy create-next-app instructions retained below only for reference.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
