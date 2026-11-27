@AGENTS.md

# Aanch

A demo e-commerce store and studio admin for Aanch, a fictional Bengaluru stoneware studio. One
Next.js app serves two hosts: the store and the admin desk. Portfolio project, ₹0 budget, public repo.

**Mode: Drive.** Claude builds; the owner reviews every PR. Work follows [docs/plan.md](docs/plan.md).

## Stack

Next.js 16 (App Router, React 19, strict TypeScript) on Vercel Hobby · Tailwind v4 plus plain CSS
Modules for motion · Zod · Vitest · Prettier and ESLint · pnpm 12, Node 24.
Coming in later PRs (approved in [architecture.md](docs/architecture.md)): Neon Postgres with
Drizzle, Better Auth (two realms), Razorpay test mode, Neon Object Storage, React Email with
Nodemailer, Playwright with axe, Lighthouse CI, Sentry.

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Dev server: store at `localhost:3000`, admin at `admin.localhost:3000` |
| `pnpm check` | **The check command.** Format check, lint, typecheck, tests. Must pass at every commit. |
| `pnpm format` | Prettier, writing changes |
| `pnpm test` | Vitest once (`pnpm vitest` to watch) |
| `pnpm build` | Production build |

Later: `pnpm test:e2e`, `pnpm test:lh`, `pnpm db:test` ([testing.md](docs/testing.md)).

## Structure

Target layout ([architecture.md](docs/architecture.md), section 3). Today only `src/app`,
`src/lib` and `src/proxy.ts` exist.

- `src/proxy.ts`: prefixes every path by host (`/store/…` or `/admin/…`), so cross-host paths 404.
- `src/app/store`, `src/app/admin`: each host's routes and root layout. Public URLs drop the prefix
  (`app/store/cart` is `/cart`). Webhooks and cron live in `src/app/store/api`.
- `public/store`, `public/admin`: each host's static files (`public/store/logo.svg` is `/logo.svg`
  on the store). Files in `public/` itself are unreachable: the proxy prefixes their paths too.
  Anything in `public/admin` is public to anyone; private files never go there.
- `src/domain/<area>`: business rules and queries, no UI. Routes and actions stay thin.
- `src/db`: Drizzle schema, migrations, seed. `src/auth`: the two realms and permissions.
- `src/ui`: tokens, components, motifs. `src/lib`: env, money, logging, rate limit, storage.

## Conventions

- Money is integer paise; prices include GST. Times are worked out in IST.
- Env vars are read only through `env()` in `src/lib/env.ts` (Zod-validated). Add new ones to the
  schema and to `.env.example` with placeholder values.
- Security requirements have IDs (S1–S28, [architecture.md](docs/architecture.md), section 6).
  Tests for them start with the ID: `S5: customer B gets 404 for customer A's order`.
- Tests test behaviour. Times are injected, never read from the wall clock in domain code.
- Site words follow the vocabulary in [concept.md](docs/concept.md) (firings, finishes, Seconds…).
- Markdown is not run through Prettier (`.prettierignore`): docs are wrapped by hand.
- Database changes go forward only; undo one with a new migration.
- Neon project `bold-fire-79020398` (Singapore): branches `main`, `preview`, `dev`. Roles and their
  variables: [architecture.md](docs/architecture.md), section 8. Never create roles with Neon's
  role API (it makes them `neon_superuser`, which bypasses RLS).
- Absolute URLs (emails, payment callbacks, canonical links) come from `env().STORE_HOST` or
  `ADMIN_HOST`, never the request's Host header: any host reaches the store.
- The proxy is routing, not auth: every admin page, action and query checks the staff session itself.

## Git

- One branch and PR per feature set (`feat/m2-catalogue-admin`); fixes can be one-commit PRs.
- Commits are logical units: each passes `pnpm check` and can be reverted on its own.
- Never push or open a PR without the owner's say-so. Deploy only from `main`, after confirmation.
- Once a PR is open, bind it to the session and turn on Auto-fix (CI failures, conflicts, review
  comments). The owner asked for this on every PR.

## Traps

- `AGENTS.md` is written by `next dev`. Leave it in place and commit it.
- After moving or deleting routes, stale types in `.next/dev/types` break `pnpm typecheck`; delete
  that folder (it's regenerated).
- Local dev needs `.env.local` (copy `.env.example`): the proxy validates the hosts on every request.
- In the sandbox, `pnpm install` fails on pnpm's store lock; the owner runs installs.
- In the sandbox, `next dev` dies (Turbopack can't start its file watcher). To look at pages, run
  `pnpm build`, then `next start` with `STORE_HOST`/`ADMIN_HOST` set inline. Postgres is reachable
  over TCP (`127.0.0.1`), not its Unix socket.
- The sandbox can't read real env files (`.env`, `.env.local`, `.env.*.local`); `.env.example`
  is readable. Prettier ignores `.env*` (it has no parser for them).
- The demo notice appears in three places only, never twice on one screen ([concept.md](docs/concept.md), section 14).

## Docs

[concept](docs/concept.md) · [requirements](docs/requirements.md) · [app flow](docs/app-flow.md) ·
[architecture](docs/architecture.md) · [testing](docs/testing.md) · [plan](docs/plan.md) ·
[art direction](docs/art-direction.md) · [e-commerce checklist](docs/ecommerce-checklist.md) ·
[decisions](DECISIONS.md)
