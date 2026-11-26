# Implementation plan: Aanch

Checkpoint 4. **Status: approved 26 Nov 2026.** Work lands in moderate pull requests, one per
feature set. Inside each, the commits are logical units that work end to end (UI, server,
database). Milestones group PRs into something you can review as a whole.

## How we work

**Mode: Drive.** I build; you review every PR.

1. **Milestone start.** I post the milestone's PRs, the assets you'll need to generate for it
   (from [art-direction.md](art-direction.md)) and any decision that has come up. You confirm.
2. **One branch and PR per feature set**, off `main` (`feat/m2-catalogue-admin`). A fix can be a
   PR of one commit (`fix/…`).
3. **Commits are logical units.** Each one:
   - does one thing a reviewer can name in a line (a schema, a screen, a rule with its tests);
   - passes `pnpm check` on its own;
   - can be reverted without breaking the commits around it. Later commits build on earlier ones,
     never the other way, and nothing half-done is left for the next commit to finish.
   - Database changes go forward only (drizzle-kit has no down migrations): undoing one is a new
     migration, and a revert of the code keeps the schema working.
4. **Order inside a PR:** tests from the "done when" first, then the code, `pnpm check`, then a
   look in the browser at 1440 and 390 px.
5. **Review at the end of each PR:** the `code-reviewer` agent, plus `security-reviewer` where the
   PR touches auth, payments, input, uploads, roles or dependencies. Then I summarise it for you:
   what's in it, what I verified and how, what I didn't. I push and open the PR **only when you
   say so**. Merging into `main` is your call.
6. **Blockers** and any change to an approved decision come to you before I act. **Decisions** made
   during the build go into [DECISIONS.md](../DECISIONS.md) in one line.
7. **Learning.** Each PR ends with a short "Worth knowing".

## Riskiest unknowns first (milestone 0)

Each spike is a throwaway proof on its own branch, never merged; its result is recorded in
DECISIONS.md. If one fails, I bring you the fallback before building on it.

| # | Unknown | Proof | Fallback if it fails |
|---|---|---|---|
| R1 | Speed with a nonce CSP and cold starts | A product page with the nonce CSP and one DB read, deployed, idle for 10 min, then mobile Lighthouse | Static catalogue pages with a hash-based CSP; nonces only on checkout, account and admin |
| R2 | Two Better Auth instances in one app with custom table names | Sign in on both hosts locally, with separate cookies and tables | One instance with a `realm` column and separate cookie names per host, with the S27 tests unchanged |
| R3 | RLS with pooled connections and Drizzle transactions | The S28 tests pass against Neon's pooled connection string | Scoped queries only, with RLS kept on the admin side for the audit log |
| R4 | Neon Object Storage presigned uploads, and sharp on Vercel | Upload from a browser, process in a Vercel function, read via a signed URL | Cloudflare R2 behind the same adapter |
| R5 | Razorpay test webhooks reaching the production deployment | A test payment produces a verified webhook in production logs | Server-side status check only (already built in) |

## Milestone 0: Foundations

**First commit on `main` (boilerplate, after you approve the kickoff):** the docs, DECISIONS.md,
CLAUDE.md, the Next.js scaffold with strict TypeScript, Tailwind v4, Prettier and ESLint, Vitest,
env validation, `.env.example` and the launch config. Everything after that is on branches.

- **PR 0.1 Skeleton and CI.** `proxy.ts` host routing with hello pages on both hosts, CI running
  `pnpm check`, the Vercel project with both hostnames, the Neon project with the three roles and
  `preview`/`dev` branches, and the local `aanch_test` database.
  Done when: CI is green; both hosts are live and each 404s the other's paths.
- **Spikes R1–R5** on throwaway branches. Done when: each has a recorded result or an approved
  fallback.

## Milestone 1: Design system

- **PR 1.1 Design system and shell.** Commits:
  - Tokens and type: palette, Eczar and Anek self-hosted, type scale, spacing and radius in
    `@theme`, contrast checked.
  - Motifs and marks: the four Chhaap blocks as SVG with misregistration, the Bel border, the chop
    mark (with a live number), the turning-wheel loader.
  - The profile drawing: a product profile drawn from data, with dimensions, a capacity fill, and
    skeleton loaders shaped like the piece.
  - Components: shadcn themed to the system (button, input, select, dialog, popover, toast, tabs,
    table base) and the motion layer (hover, press, focus, reduced motion).
  - The shell: header, Shop menu, demo strip, footer (pallu), checkout's focused layout, 404, and
    the admin shell (sidebar, page header) on the admin host.
  - Review: a design-system page on both hosts, at desktop and phone widths.
- **Assets:** 3 finish swatches, 1 home table, the Thali master set.

## Milestone 2: Catalogue, both sides

- **PR 2.1 Data, staff sign-in and audit.** Schema and RLS for products, variants, finishes,
  collections, profiles, firings, the stock ledger, roles and the audit log; the 17-product seed;
  the staff realm with invites from the seed, TOTP, 12 h sessions, the permission map and the audit
  log writer (S2–S4, S6, S17, S18).
- **PR 2.2 Catalogue admin.** Commits:
  - Product list and editor: variants, legal details, profile with a live drawing, the version check.
  - The lifecycle: Draft, Active, Archived, and delete if never ordered.
  - Image pipeline: browser shrink, presigned upload, server re-encode, three widths (S15).
  - Firings and stock: plan stages, receive quantities, adjustments, the ledger view.
- **PR 2.3 Storefront browse.** Commits:
  - Listing and search: collections, filters and sort in the URL, full-text and trigram search,
    empty states.
  - Product page: finish swap (the gallery changes), sizes, real stock and firing, Will it hold?,
    use profile, legal details, "No longer made", the PIN check (mock serviceability).
  - Home and kiln calendar: the table from above with hotspots and quick view (popover), shop by
    meal, the kiln calendar with the temperature curve, notify-me capture.
- **Assets:** lead-finish sets for the products seeded with images, plus the other home tables.

## Milestone 3: Commerce core

- **PR 3.1 Customer sign-in and cart.** Sign up (with Use sample details), sign in, sign out, reset
  (real email only), sessions, enumeration-safe responses (S1, S2, S12, S23, S27); guest and account
  carts, merge on sign-in, drawer and page, price and stock change notices, `useOptimistic`, the
  stamp (first version).
- **PR 3.2 Email.** The outbox, React Email templates, the demo inbox (scoped), Gmail delivery for
  the allowlist, guest order tokens (S5, S22).
- **PR 3.3 Checkout and payments.** Commits:
  - Tax and pricing: the `domain/tax` engine, shipping and COD rules, discounts with usage limits,
    and discount admin.
  - Checkout: contact, PIN-first address with Use sample details, delivery, gift options and note
    preview, the price breakdown, reservations with row locks.
  - Payments: Razorpay test checkout, the webhook with one-transaction idempotency, the status
    check, late payment handling, COD (S13, S14).
  - Orders in admin: order list and detail, COD confirmation, order events.
- **Early exam:** a first-time reviewer places a test order on a phone in under 3 minutes, and the
  invoice preview shows the right GST split. Fail means we fix checkout before moving on.

## Milestone 4: Fulfilment and after-sales

- **PR 4.1 Fulfilment and invoices.** The packing queue, packing slips, the mock carrier (AWB,
  tracking events), order tracking for customers; the per-year invoice counter, invoice and
  credit-note PDFs, issued at shipping.
- **PR 4.2 After-sales and account.** Commits:
  - Cancellations and refunds: customer and staff cancellation, refunds with locking and the
    per-order limit (S26).
  - Claims and returns: breakage claims with photos (private bucket), returns, the admin queue,
    replacement orders.
  - Account: orders, addresses, shelf, notify-me list, privacy (export and deletion), and notify-me
    emails when a firing is received.

## Milestone 5: Studio operations and the demo

- **PR 5.1 Studio operations.** Commits:
  - Today: the dashboard queues.
  - Customers and content: customer list and detail with notes; home tables and hotspots content;
    the firing note.
  - Staff and settings: staff and roles, the allowlist, settings, the audit log viewer, fresh
    sign-in for sensitive actions.
  - Reports: sales, AOV, COD vs prepaid, refunds, RTO, GST summary with CSV.
- **PR 5.2 The demo.** Commits:
  - Demo admin: the role, masking in the domain layer, the restrictions (S21).
  - Demo reset: the daily job, the baseline and Save as demo baseline, the expiry sweep and outbox
    retries.
  - Help and About this demo: policy and help pages, the grievance contact, About this demo.

## Milestone 6: Polish, hardening, launch

- **PR 6.1 Signature interactions, finished.** Shelf view, the stamp, Clay to table chapters, view
  transitions, light on the glaze, gift note card, share images.
- **PR 6.2 Performance and accessibility.** Lighthouse CI budget, image and JavaScript audit, video
  posters; an axe sweep, then keyboard and screen-reader passes on every journey.
- **PR 6.3 Security.** A full `security-reviewer` pass against S1–S28; every S-ID test present and
  green. Fixes found here may go in their own small PRs.
- **Final exam and launch.** All E2E journeys, success measures checked, then a production deploy
  from `main` after your confirmation.

## Status

- [ ] Milestone 0: Foundations
- [ ] Milestone 1: Design system
- [ ] Milestone 2: Catalogue
- [ ] Milestone 3: Commerce core (early exam)
- [ ] Milestone 4: Fulfilment and after-sales
- [ ] Milestone 5: Studio operations and the demo
- [ ] Milestone 6: Polish, hardening, launch (final exam)

## Open questions

None. Drive mode, and Prettier (with the Tailwind class-sorting plugin) plus Next's ESLint config,
were approved on 26 Nov 2026.
