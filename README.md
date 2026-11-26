# Aanch

A demo store and studio admin for Aanch, a fictional Bengaluru studio making stoneware for the
Indian table. Nothing here is fired, shipped or charged: payments run in test mode, and product
images are AI-generated.

Built with Next.js, Postgres and a lot of care about money, stock and security. The thinking is in
[docs/](docs/): start with [concept](docs/concept.md) and [architecture](docs/architecture.md).

## Run it

Needs Node 24 and pnpm 12.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The store is at http://localhost:3000 and the admin desk at http://admin.localhost:3000.
`pnpm check` runs formatting, lint, types and tests.
