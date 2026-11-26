# Testing guide: Aanch

Checkpoint 4. **Status: approved 26 Nov 2026.** Sources: the "done when" lines in [requirements.md](requirements.md),
the edge paths in [app-flow.md](app-flow.md), and the security table (S1–S28) in
[architecture.md](architecture.md).

## What we test, and where

Most tests sit low in the pyramid; only the journeys that matter most run in a browser.

| Level | What | Tool | Database |
|---|---|---|---|
| **Unit** | Pure rules in `domain/`: money, tax, discounts, shipping, state transitions, permissions map, IST date windows, masking, PIN lookup | Vitest | None |
| **Integration** | Domain functions and server actions against real Postgres: locking, reservations, ledger, RLS policies, role grants, webhook idempotency, outbox, refunds, invoice counter | Vitest | Postgres: your local Homebrew Postgres (a throwaway `aanch_test` database), a service container in CI. Migrations run first, as the real roles. |
| **End to end** | The main journeys on both hosts, at 1440 px and 390 px, with axe on every page | Playwright + @axe-core/playwright | Seeded test database; Razorpay test mode with signed sample webhooks |
| **Performance** | Home, listing and product pages on a production build | Lighthouse CI (mobile) | Seeded |

**Rules for tests**
- Test behaviour, not implementation. A refactor that keeps behaviour shouldn't break a test.
- Every bug fix starts with a failing test.
- Security requirements are tested by ID: the test name starts with the ID (for example
  `S5: customer B gets 404 for customer A's order`), so coverage of S1–S28 can be listed with one
  grep.
- No test hits real external services. Razorpay is called in test mode only in the E2E payment
  journey; everything else uses a recorded fake. Email delivery is faked; the outbox is real.
- Times are injected (a clock parameter), so expiry, 48 h and 7-day windows, and the financial year
  boundary are tested without waiting.

## Tools and commands

Exact scripts are written when the project is scaffolded.

| Command | Runs |
|---|---|
| `pnpm check` | **The check command:** format check, lint, typecheck, unit and integration tests. Must pass at every commit. |
| `pnpm test` | Unit and integration tests (watch mode with `--watch`) |
| `pnpm test:e2e` | Playwright on a local production build, both hosts |
| `pnpm test:lh` | Lighthouse CI against the local production build |
| `pnpm db:test` | Recreates the local `aanch_test` database and runs migrations as the real roles |

CI (GitHub Actions) runs `pnpm check` on every push, and E2E plus Lighthouse on pull requests.

## Critical cases

**Money and tax**
- [ ] A Karnataka delivery splits tax into CGST + SGST; Maharashtra gets IGST. Totals match a
  hand-worked invoice to the paisa.
- [ ] A discount spreads across lines before tax; the rounded lines add up to the invoice total.
- [ ] Shipping is free at exactly ₹2,500 after discount, and ₹149 at ₹2,499.
- [ ] COD is offered at ₹5,000, refused at ₹5,001 and on non-COD PINs; the ₹99 fee is shown before Pay.
- [ ] A Seconds line ignores a discount code.

**Stock and checkout**
- [ ] Two parallel checkouts for the last piece: one reserves it, the other is told it's gone.
- [ ] A multi-line cart reserves in id order (no deadlock under parallel load).
- [ ] A reservation expires at 30 minutes; the effective status shows expired before the sweep runs.
- [ ] A late payment with stock left proceeds; without stock it's refunded automatically and emailed.
- [ ] A price change between cart and checkout is shown before payment.
- [ ] An archived product in the cart is flagged and blocked at checkout.

**Payments (S13, S14)**
- [ ] A bad webhook signature gets 401; a replayed event changes nothing; a tampered amount
  doesn't mark the order paid; an unknown order gets 200 and is ignored.
- [ ] A crash between recording the event and applying it can't leave the order unpaid on retry
  (one transaction).
- [ ] A tampered cart price in the request doesn't change the Razorpay amount.
- [ ] Without a webhook, the confirmation page's server-side status check confirms payment.

**Orders, refunds, invoices**
- [ ] Every disallowed status transition is refused; two racing transitions can't both apply.
- [ ] Cancel works until packed and fails after.
- [ ] Two concurrent refunds can't exceed the order total; Support can't exceed ₹3,000 across split
  refunds (S26).
- [ ] Invoice numbers are consecutive within a financial year and restart on 1 April IST; a rolled-back
  transaction leaves no gap.
- [ ] Editing a product after purchase doesn't change the order, invoice or report.

**Claims and returns**
- [ ] Breakage report is offered up to 48 h after delivery (IST) and refused after.
- [ ] A return is refused for Seconds and after 7 days.
- [ ] An approved breakage creates a ₹0 replacement order that takes stock.

**Access and privacy**
- [ ] S4: every admin action, as every role, is allowed or denied exactly as the permission map says.
- [ ] S5 and S28: customer B can't read A's order, address, claim, invoice or inbox (404); with RLS
  and no customer set, queries return nothing.
- [ ] S27: a customer cookie means nothing on the admin host; `/admin` paths 404 on the store host.
- [ ] S21: as Demo admin, HTML, CSV, PDFs and exports contain no unmasked personal data.
- [ ] Demo admin can't change its password or 2FA, upload, or touch staff, roles, settings or the
  allowlist.
- [ ] S22: password-reset emails never appear in any demo inbox; non-allowlisted addresses are never
  delivered.
- [ ] Account deletion anonymises the profile and keeps invoices; export contains only that customer.

**Uploads (S15)**
- [ ] An SVG or HTML file renamed `.jpg` is rejected and deleted from holding.
- [ ] EXIF GPS is gone from stored images; claim photo URLs expire after 5 minutes.

**Email**
- [ ] Each order event writes one outbox row in the same transaction; a failed send is retried by the
  daily job; receiving a firing sends each notify-me email once.

**Demo**
- [ ] The demo notice never appears twice on one screen (strip and footer on short pages, checkout).
- [ ] The daily reset removes visitor data, restores the baseline catalogue and stock, never resets
  the invoice counter, and writes an audit entry.

**Experience**
- [ ] Each signature interaction works by keyboard, with a screen reader, and with reduced motion.
- [ ] No horizontal scroll at 320 px; tap targets are at least 44 px.
- [ ] Lighthouse mobile ≥ 90 on home, listing and product; LCP < 2.5 s, CLS < 0.1.

## End-to-end journeys

1. Table hotspot → quick view → cart → guest checkout → test UPI payment → confirmation and inbox email.
2. Listing filters (in the URL) → shelf view → product page finish swap → Will it hold? → add.
3. Sold out → notify me → admin receives the firing → email in the inbox.
4. COD order → admin confirms, packs, ships → delivered → COD collected.
5. Delivered order → breakage claim with photos → Support approves a replacement.
6. Sign up → guest cart merges → order history → invoice PDF → data export → delete account.
7. Admin: create a draft product with variants, profile and images → activate → archive.
8. Admin roles: Support refund over the limit asks for an Owner; Demo admin sees masked data.

## Before merging

- `pnpm check` passes at every commit. E2E and Lighthouse pass on the pull request.
- UI changes are looked at in the browser at 1440 px and 390 px; new screens get a `ui-review`.
- The `code-reviewer` agent reviews every change. The `security-reviewer` agent reviews anything
  touching auth, payments, user input, uploads, roles or dependencies.
- New or changed security behaviour has its S-ID test.

## Test data

- `db/seed`: the 17-product catalogue, finishes, collections, firings, staff (Owner, Operations,
  Support, Demo admin) and a handful of fake customers and orders in every status.
- **Use sample details** and the test factories generate fake Indian names, addresses and PINs. No
  real customer data, ever.
- Razorpay test cards and UPI IDs come from Razorpay's test docs, and are shown at the payment step.
- `scripts/sign-webhook` signs sample Razorpay payloads with the test secret for local and CI runs.
