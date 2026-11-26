# Architecture and security: Aanch

Checkpoint 3. **Status: approved 26 Nov 2026.** What it must do: [requirements.md](requirements.md).
Versions are checked against the registry when the project is scaffolded.

## 1. Shape

One Next.js application (a modular monolith) serving **two hosts**: the storefront and the admin
desk. They share one codebase and one domain layer, but each host has its own sign-in realm and its
own database role (section 4, Two hosts). There are no microservices, no
separate API server and no queue. Background work runs after the response (`after()`), lazily when
data is next read, or in one daily scheduled job.

```
Browser ──▶ store host ─┐
Browser ──▶ admin host ─┴▶ Next.js on Vercel (proxy.ts routes by host: server components, server actions)
               │  domain layer: catalogue · stock · cart · checkout · orders · tax · claims · email
               ├──▶ Neon Postgres (Drizzle, TLS)       roles: store (with RLS) · admin · migrate
               ├──▶ Object storage (S3 API)            public: product images · private: claim photos
               ├──▶ Razorpay test mode ◀── webhooks (signed, idempotent)
               ├──▶ Gmail SMTP (allowlisted recipients only, from the outbox)
               └──  Mock carrier + India PIN dataset (in-repo)
Daily job (Vercel cron): store expired statuses · retry outbox · demo reset · tracking simulation
```

## 2. Stack

Each choice must fit the ₹0 budget.

| Concern | Choice | Why | Considered |
|---|---|---|---|
| Framework | **Next.js 16**, App Router, React 19, TypeScript strict | Server rendering for SEO and speed, server actions for mutations, one deployable; the React ecosystem fits shadcn, ReUI and Bklit | React Router 7 (less integrated hosting), SvelteKit (loses the React component refs) |
| Hosting | **Vercel Hobby** | Free, preview deploys per branch, first-class Next.js. Hobby is for non-commercial personal use, which a portfolio demo is. | Cloudflare Workers via OpenNext (free, more friction) |
| Database | **Neon Postgres, free plan** | 1 GB per project, scale to zero, a branch per preview and test run | Supabase free (pauses idle projects, which is bad for a portfolio link) |
| Data access | **Drizzle ORM and drizzle-kit migrations**, over **node-postgres (`pg`)** with Neon's pooled connection string | Typed SQL, parameterised by default; `pg` supports the locking transactions (Neon's HTTP driver doesn't) and lets CI use a plain Postgres container | Prisma (heavier, more magic) |
| Auth | **Better Auth, self-hosted** in our database | Email and password, database sessions in secure cookies, TOTP two-factor, built-in rate limits; the code and data are ours to learn from | Auth.js (v5 still beta), Clerk (hosted, customer data leaves the system), Neon Auth (managed Better Auth, less to learn from) |
| Validation | **Zod** at every boundary | One schema for forms, actions, webhooks and env | n/a |
| Payments | **Razorpay test mode** | Available right after signup without KYC; UPI, cards, netbanking, wallets; HMAC-signed webhooks; refund API | Cashfree, PhonePe PG (thinner docs) |
| Files | **Neon Object Storage** (S3-compatible, 5 GB free per project, in beta) behind one storage adapter | One vendor; the adapter keeps a switch to R2 cheap if the beta changes | Cloudflare R2 (needs a card on file), Vercel Blob |
| Images | **Resized at upload** with sharp: 3 widths, WebP | No runtime image-optimisation quota; also strips metadata | `next/image` on Vercel (Hobby quota) |
| Email | **React Email** templates, an **outbox table**, **Nodemailer** over Gmail SMTP for allowlisted addresses | Decided in DECISIONS.md | n/a |
| Search | **Postgres full-text search plus pg_trgm** | Typo tolerance with no extra service | Algolia or Meilisearch (another vendor) |
| Rate limits | **One limiter in Postgres** (sliding window table), also plugged into Better Auth as its storage | No extra service; it holds across serverless instances (Better Auth's default in-memory store doesn't) | Upstash Redis (free tier, one more vendor) |
| Styling | **Tailwind CSS v4** for layout, spacing and tokens; **plain CSS** (CSS Modules in `@layer`) for motion and the signature interactions | See section 5 | Plain CSS only (we'd lose shadcn, ReUI and Bklit, which are written in Tailwind) |
| Components | **shadcn/ui** (accessible primitives, copied in); **ReUI** data grid; **Bklit** charts | One design system, components we own | n/a |
| Motion | **Native CSS first** (view transitions, scroll-driven animations, `@starting-style`); the **Motion** library only for gestures and springs | See section 5 | Motion for everything (more JavaScript) |
| Client state | **React state, the URL and `useOptimistic`**; **Zustand** only if the trigger in section 5 is hit | Most state lives on the server | Zustand from day one |
| PDFs | **@react-pdf/renderer** for invoices and credit notes | Runs in a serverless function | Headless Chrome (too heavy for Hobby) |
| Errors and logs | Structured JSON logs (request id, no personal data) in Vercel logs; **Sentry free plan** for errors | Free, enough for a demo | n/a |
| Tests | **Vitest**, **Playwright** with **axe**, **Lighthouse CI** | Detail at Checkpoint 4 | n/a |
| CI | **GitHub Actions** with a Postgres service container for tests; Vercel previews sharing one Neon `preview` branch | Free, and stays well under Neon's 10-branch cap | n/a |

New dependencies beyond this list still need your approval.

## 3. Code structure

```
src/
  proxy.ts               prefixes every path by host: store host → /store/…, admin host → /admin/…
  app/store/...          storefront routes          app/admin/... admin routes (staff layout guard)
  app/store/api/webhooks Razorpay webhooks          app/store/api/cron the daily job (secret-protected)
  app/global-not-found   the 404 for both hosts (each host has its own root layout)
  domain/<area>/         catalogue, stock, cart, checkout, orders, tax, invoices, claims, firings,
                         discounts, email, carrier, reports: pure rules plus queries, no UI
  db/                    Drizzle schema, migrations, seed
  auth/                  two Better Auth realms (customer, staff), session helpers, permissions
  ui/                    design tokens, shadcn components, motifs, profile drawing
  lib/                   env (Zod-validated), money, logging, rate limit, storage adapter
```

Rules live in `domain/`, so they can be tested without the UI. Routes and actions stay thin: they
validate, authorise, call the domain, and return.

## 4. Key designs

**Money and tax.**
- Integer paise everywhere, using the `money` helpers only (never raw floats).
- `domain/tax` computes each line's taxable value and tax, spreads the discount, and chooses
  CGST + SGST or IGST by delivery state. It's unit-tested against hand-worked invoices.
- Shipping, the COD fee and gift wrap are a composite supply with the goods, so they take the goods'
  rate. Every product is 5%, and the code asserts a single rate per order. Splitting charges across
  mixed rates gets built only if a second rate ever appears.

**Time.** Vercel runs in UTC, but every business window is worked out in IST: the financial year,
the 48 h claim window, the 7-day return window, report days.

**Stock and reservations.**
- `on_hand` changes only through ledger entries (firing, sale, return, adjustment, breakage, demo
  top-up), and `CHECK (on_hand >= 0)` guards it.
- Reservations are separate rows with an `expires_at`, and
  `available = on_hand − active reservations`.
- Reserving checks out in one transaction:
  1. Lock the cart's variant rows with `SELECT … FOR UPDATE`, in id order so multi-line carts
     can't deadlock.
  2. Recompute what's available.
  3. Insert the reservations.

  Two checkouts can't both reserve the last piece. Discount usage limits are checked under the same
  lock, counting only redemptions from orders that haven't expired.
- One SQL view gives every order its **effective status**: a pending order past its expiry counts as
  expired. Today, reports, stock and discount counts all read that view. Nothing writes to the
  database while a page renders, and the daily sweep stores the final status.

**Order state machines.** Payment and fulfilment each have a transition table in `domain/orders`.
A transition is a conditional update (`WHERE status = <expected previous>`), so two racing
requests can't both win. Every transition writes an order event, and staff ones also write the
audit log. Products carry a `version` column, so a stale admin save is refused.

**Payment flow.**
1. The server creates a Razorpay order from a **server-computed** total. Checkout's `timeout` is
   set to 25 minutes, under the 30-minute reservation.
2. The browser opens Razorpay Checkout. On return, the browser's signature is verified only to
   show a "confirming" state.
3. Payment is confirmed only on the server: by the **webhook**, or by a **server-side status
   check** with Razorpay when the confirmation page polls (previews and local dev get no webhooks).
4. Confirmation is one transaction: insert the event id (unique, so a repeat does nothing), check
   the amount and currency, then apply the transition. A crash between those steps can't swallow a
   retry.
5. **Late payment.** A payment arriving for an expired order takes the stock if it's still there and
   proceeds normally. Otherwise it's refunded automatically, the order is cancelled as *paid after
   expiry, out of stock*, and the shopper is emailed. This path has its own test.
6. Production's webhook answers 200 and ignores orders it doesn't know (preview orders send their
   webhooks there), so Razorpay never disables it. A local script signs sample payloads for
   development and tests.

**Refunds.** In one transaction: lock the order, check the amount still refundable, check the
staff member's limit, and write the refund row as *pending*. Only then call Razorpay, and settle the
row when it answers. A double click can't refund twice. Support's ₹3,000 limit is **per order,
cumulative**, so a larger refund can't be split; above it, an Owner approves.

**Invoices.** Invoice numbers come from a counter row per financial year, updated inside the
invoice transaction, so the series has no gaps (Postgres sequences can skip numbers). The demo reset
deletes visitor orders and their invoices but never resets the counter, so a number is never
reused. That's a demo-only exception to "issued invoices are never deleted".

**Email outbox.**
1. A domain event writes an outbox row in the same transaction as the change.
2. After the response, `after()` renders and delivers it if the recipient is allowlisted.
   Otherwise it's marked `demo_only`.
3. The daily job retries failures.
4. The demo inbox reads rows scoped to the signed-in customer, or to a guest order's token.
   Security templates are never readable there.

**Guest order access.** The confirmation link carries a random token (32 bytes). Only its hash is
stored. It expires after 90 days and is revoked when the guest signs up or asks.

**Carrier mock.** A `Carrier` interface with serviceability, booking and tracking. The mock uses the
in-repo PIN dataset (India Post open data: PIN to district, state and delivery zone) and generates
an AWB number. Tracking events are simulated from the booking time, and admin can advance them.
A real aggregator would be a second implementation.

**Files** (Vercel functions accept at most 4.5 MB per request, so files never pass through them).
1. **Shrink in the browser.** The browser decodes the file, scales it down (2400 px long side for
   products, 1600 px for claim photos) and encodes WebP at about 0.85 quality, or JPEG where the
   browser can't encode WebP. A 6 MB PNG becomes roughly 300–500 KB, and iPhone HEIC photos are
   converted on decode. This needs no library: `createImageBitmap` and a canvas.
2. The browser asks for a presigned upload URL into a `holding/` prefix, with size and type limits
   in the URL policy, then uploads straight to Neon Object Storage.
3. The server never trusts the browser's work. It fetches the file, checks the magic bytes,
   re-encodes it with sharp to WebP (stripping EXIF and GPS), writes the final sizes under random
   keys, and deletes the original.
- Product images: 480, 960 and 1600 px wide, in the public bucket.
- Claim photos: one 1280 px size, at most 4 per claim, in a **private** bucket. They're shown only
  through signed URLs that expire in 5 minutes, to the claim's owner and to staff.

**Demo admin.**
- It's a shared login, so it's exempt from TOTP. It can't change its own email, password or
  two-factor settings, and its sign-in limit is keyed on account plus IP, so one person can't lock
  everyone out.
- It can't upload files, send real email, or touch staff, roles, settings or the allowlist.
- Customer details reach it already masked. The domain layer masks them, so pages, CSVs, PDFs and
  exports are all covered.

**Demo reset (daily).**
1. Deletes visitor-made data: customers who aren't staff or allowlisted, and their carts, orders,
   invoices, claims, notify-me requests and outbox rows.
2. Restores the catalogue, content and stock from the **demo baseline**. The baseline is the seed,
   and the Owner can refresh it from admin ("Save as demo baseline") after making changes worth
   keeping.

So the Owner's changes survive and Demo admin's are undone. The reset is written to the audit log.

**Two hosts, one app.**

| | Store | Admin desk |
|---|---|---|
| Free now (₹0) | `aanch.vercel.app` | `aanch-admin.vercel.app` |
| With a domain later | `aanch.in` | `admin.aanch.in` |
| Local | `localhost:3000` | `admin.localhost:3000` |

- Both names are attached to the **same** Vercel project. `proxy.ts` reads the host: admin
  requests are served from `app/admin`, all others from `app/store`. Every path is prefixed,
  never filtered, so a cross-host path (`/admin/x` on the store) simply doesn't exist there: 404.
- The admin host sends `X-Robots-Tag: noindex` and has its own, stricter CSP.
- A true `admin.` subdomain needs a domain you own. Free `vercel.app` names can't be nested
  (`admin.aanch.vercel.app` isn't possible), so the free setup uses a sibling name. Moving to
  `admin.aanch.in` later is configuration only.

**Two sign-in realms.** Customers and staff are separate Better Auth instances with separate
tables (`customer_*`, `staff_*`), separate host-only `__Host-` cookies, and different policies:

| | Customers (store host) | Staff (admin host) |
|---|---|---|
| Joining | Sign up | Invite only; no public sign-up |
| Two-factor | Optional | TOTP required (Demo admin: see Demo admin above) |
| Session | 30 days | 12 hours, fresh sign-in for sensitive actions |
| Shopping | Yes | No: staff who shop use a separate customer account |

A stolen or forged customer session can never reach the admin, because the admin host doesn't
read customer cookies and the staff tables don't know customers exist. Running two Better Auth
instances in one app, with custom table names, is checked when we scaffold, before anything is
built on it.

**Database roles, row-level security and TLS.**
- `aanch_migrate` owns the schema and runs migrations in CI only.
- `aanch_store` serves the store host. It has no access at all to staff, audit, allowlist or
  settings tables. Its customer-owned tables (orders, addresses, carts, claims, shelf, notify-me,
  outbox) have **row-level security (RLS)**: each request runs in a transaction that sets
  `app.customer_id` (or a guest order's token hash) with `set_config(…, true)`, and the policies
  return only matching rows. An IDOR bug in our code then returns nothing instead of someone
  else's order. The settings are transaction-local, so they're safe with Neon's pooled connections.
- `aanch_admin` serves the admin host, webhooks and the daily job. It has broad data rights and
  only `INSERT` and `SELECT` on the audit log. Staff permissions are enforced in the app (S4).
- **TLS everywhere in transit.** HTTPS with HSTS to the browser; `sslmode=verify-full` and
  `channel_binding=require` to Neon; implicit TLS (port 465) to Gmail SMTP; HTTPS to Razorpay and
  object storage. Neon encrypts data at rest (to confirm in Neon's docs at setup).

## 5. Front end: styling, motion and state

**Tailwind or plain CSS: both, each where it's strongest.**

| Job | Tailwind v4 | Plain CSS |
|---|---|---|
| Layout, spacing, type scale, colours | Best: fast, consistent, tokens via `@theme` | Fine, but slower to write and easier to drift |
| States (hover, focus, `:has`, container queries, `@starting-style`) | Good: built-in variants | Good |
| Keyframes, scroll timelines, view-transition names, anchor positioning | Awkward: arbitrary values and long class strings | Best: readable and reviewable |
| Our component libraries (shadcn, ReUI, Bklit) | Required | Would mean rewriting them |

So we use **Tailwind for layout and tokens**, and **plain CSS Modules for the motion system** (the
stamp, swatch swaps, the kiln curve, the drawer, the chapters). Tokens are defined once in
Tailwind's `@theme`, which turns them into CSS variables both sides use.

**Modern CSS we'll use**, and its browser support from the web-platform guidance (Nov 2026):

| Feature | Where in Aanch | Support | Approach |
|---|---|---|---|
| View transitions (same document) | Listing card to product page image morph, finish swap, cart line removal | Baseline since Oct 2025 (Chrome, Firefox 144, Safari 18) | React's `<ViewTransition>` through Next's view-transition option if stable in the installed versions; otherwise `document.startViewTransition` around navigations. Instant change where unsupported. |
| Scroll-driven animations | Clay to table chapters (the one scroll story) | Baseline since Oct 2026 (Firefox 159) | `@supports` gate; decorative, so no fallback script |
| Popover API | Hotspot quick view, swatch info, the cart's stock notices | Baseline since Jan 2025 | Native `popover`; shadcn/Radix for menus and dialogs |
| Anchor positioning | Tethering hotspot cards to their pot, swatch tooltips | Chrome and Safari; **not Firefox** | `@supports` gate; without it, the card opens as a centred sheet, which is fine |
| `@starting-style`, `transition-behavior: allow-discrete` | Entry of drawers, toasts, the stamp | Baseline since Aug 2024 | Exit animations in the top layer need the guidance's `data-closing` fallback (Firefox, Safari) |
| `interpolate-size` / `calc-size()` | Accordions (care, shipping), filter panels | Chrome only | Progressive: instant open elsewhere |
| Container queries, `:has()`, `@property` | Product cards, the profile drawing, the kiln curve | Widely available | Use freely |

**Motion rules.** Animate only `transform`, `opacity`, `clip-path` and filters (kept on the
compositor). Every animation has a `prefers-reduced-motion` version. The Motion library is used
only where CSS can't do it: drag on the glaze close-up, and spring physics on the stamp if CSS
easing doesn't feel right.

**Client state: no Zustand to start.**
- Server data comes from server components.
- Changes go through server actions, with `useOptimistic` for instant feedback (add to cart, save
  to shelf).
- Filters, sort and the shelf view live in the URL, so they're shareable and survive a refresh.
- Drawers and dialogs use local state, plus one small context for the cart summary and the stamp
  event shared by the header and the page.
- **Add Zustand** (already approved) when several distant components write the same client state,
  or a context's re-renders show up in INP. That's most likely to happen with the admin's packing
  batch selection.

## 6. Security requirements

Each item is a build task with a test that must pass. IDs are referenced in the plan and in tests.

| ID | Requirement | Implementation | Acceptance test |
|---|---|---|---|
| S1 | Passwords | Better Auth scrypt hashing (its default); minimum 10 characters; checked against a common-password list | A stored hash isn't the plain text; "password123" is rejected |
| S2 | Sessions | Database sessions; host-only cookies with `HttpOnly`, `Secure`, `SameSite=Lax` and the `__Host-` prefix; rotated at sign-in; customers 30 days, staff 12 h | Cookie flags asserted in E2E; a staff session older than 12 h is refused |
| S3 | Staff two-factor | TOTP is required before any `/admin` route or staff action, for every staff role except the shared Demo admin, which instead can't change its own credentials or 2FA. Sensitive actions (role changes, refunds over the limit, allowlist, settings) need a sign-in within the last 15 minutes. | Staff without TOTP are redirected to set it up; a stale session gets a re-auth prompt for a role change; Demo admin's password and 2FA changes fail |
| S4 | Authorisation | One permission map per role. Every server action and route handler calls `require(permission)`. The UI hiding a control is never the check. | A table-driven test runs every admin action as every role and expects allow or deny exactly |
| S5 | No IDOR | Customer data is read only by queries scoped to the session's customer id, or by a guest order token (random, stored hashed, expiring, revocable). Order URLs don't use sequential numbers. A wrong owner gets a 404. | Customer B requesting customer A's order, address, claim, invoice or inbox gets 404; an expired or revoked token gets 404 |
| S6 | Privilege escalation | Role changes are Owner-only and audited. The last Owner can't be demoted. Demo admin can never gain permissions. Client-sent role fields are ignored. | Support and Demo admin attempts at a role change fail; mass assignment of `role` in a profile update is ignored |
| S7 | Input validation | A Zod schema on every action, route and webhook. Strings have length caps; PIN, phone and GSTIN have formats. | Fuzzed invalid payloads get 400 with field errors and no stack trace |
| S8 | SQL injection | Drizzle query builder only. Raw `sql` only with bound parameters, and a lint rule bans string-built SQL. | Lint passes; an injection string in search returns ordinary results |
| S9 | XSS | React escaping. No `dangerouslySetInnerHTML` outside trusted in-repo MDX. Gift messages and notes are rendered as text. A CSP with nonces. | `<script>` in a gift message renders as text; the CSP header is present; there are no inline scripts without a nonce |
| S10 | CSRF | Server actions' origin check; Better Auth origin checks; `SameSite=Lax`; webhooks authenticated by signature, never by cookie | A cross-origin form post to a server action is rejected |
| S11 | Security headers | HSTS, CSP (Razorpay's checkout hosts allowed explicitly), `frame-ancestors 'none'`, nosniff, Referrer-Policy, Permissions-Policy | A header test on the home, checkout and admin pages |
| S12 | Rate limits | Sign-in and reset: 5 per 15 min, keyed on account plus IP, so nobody can lock out a shared account from elsewhere. Checkout creation, notify-me, claims, discount checks: per IP and per session. A 429 with a retry time. | The 6th attempt in the window gets a 429; a second IP can still sign in |
| S13 | Webhooks | HMAC-SHA256 over the raw body, constant-time comparison; the event id is recorded and the transition applied in one transaction; amount and currency checked; unknown orders get 200 and are ignored | A bad signature gets 401; a replayed event changes nothing; a tampered amount doesn't mark the order paid; a late payment on an out-of-stock expired order is refunded |
| S14 | Payment integrity | Totals are computed on the server only; client prices are ignored; Razorpay amount = server total | A tampered cart price in the request has no effect on the charged amount |
| S15 | Uploads | Presigned direct upload to a holding prefix with size and type limits; then a server-side magic-byte check, sharp re-encode, move to a random key; private bucket for claims; signed URLs that expire in 5 min; no uploads for Demo admin | An SVG or HTML file renamed to `.jpg` is rejected and deleted; EXIF GPS is gone; an expired URL fails; Demo admin can't get an upload URL |
| S16 | Secrets | Env vars only, validated with Zod at boot; `.env.example` with placeholders; GitHub secret scanning and push protection; separate test and preview secrets | The app fails to start with a missing secret; no secret patterns in the repo |
| S17 | Database access | The `aanch_store` and `aanch_admin` roles have data rights only (no DDL), and `aanch_admin` has only `INSERT` and `SELECT` on the audit table. Migrations run as `aanch_migrate` in CI. TLS with `verify-full` is required. | Neither app role can `DROP` or `ALTER`; neither can `UPDATE`, `DELETE` or `TRUNCATE` the audit log; a non-TLS connection is refused |
| S18 | Audit log | Append-only (privileges per S17, plus a trigger). It records staff, action, target, time and IP. Before and after values are stored for catalogue, price, stock, settings and roles; for personal data, only the field names, so account deletion isn't blocked. | Every audited action writes an entry; a customer edit's entry contains no personal values |
| S19 | Errors | Generic message plus a reference id for users; details in server logs only; no stack traces or SQL in responses | A forced error returns the reference id and nothing internal |
| S20 | Logs and privacy | No passwords, tokens, full emails, phones or addresses in logs (redacted); request ids | A log redaction test |
| S21 | Personal data | Minimal fields. Masking for Demo admin happens in the domain layer. Export as JSON. Deletion anonymises and keeps invoices. Marketing is a separate opt-in. | As Demo admin, rendered HTML, CSV exports, PDFs and data exports contain no unmasked email, phone or address; an export contains only that customer's data |
| S22 | Email safety | Real delivery only to allowlisted addresses. Security emails are never in the demo inbox. Inbox reads are scoped. | A reset email is absent from every inbox view; a non-allowlisted address is never delivered |
| S23 | Account enumeration | Sign-in and reset give the same response and timing whether or not an account exists. Sign-up does reveal an existing email: hiding it needs a real email to the owner, which demo visitors can't receive. This is a stated limit. | A test compares known and unknown email responses for sign-in and reset |
| S24 | Dependencies | Lockfile committed, `pnpm audit` in CI, Dependabot alerts | CI fails on a critical advisory |
| S25 | Backups and restore | Neon's built-in restore window plus a re-runnable seed; restore drill documented | The seed rebuilds a working demo on an empty branch |
| S26 | Refund integrity | Lock the order, check what's refundable and the staff limit (per order, cumulative), write the refund as pending, then call Razorpay | Two concurrent refunds on one order can't exceed its total; Support can't exceed ₹3,000 across split refunds |
| S27 | Realm separation | Separate auth instances, tables and cookies per host; `proxy.ts` 404s cross-host paths | A customer cookie on the admin host gets the staff sign-in page; `/admin` paths on the store host return 404 |
| S28 | Row-level security | `aanch_store` role with RLS on customer-owned tables; no grants on staff, audit, allowlist or settings | As `aanch_store` with customer A set, B's rows return 0; with no customer set, 0; selecting from staff tables is denied |

**Known limits, stated plainly.**
- There's no WAF or bot management on the free tier.
- Rate limits are kept in the database, so they hold across serverless instances, but they aren't
  edge-level DDoS protection.
- Neon free restore history is short.
- It's a demo with fake data, so these are acceptable, and they'd be the first things to upgrade for
  a real store.

## 7. Compliance as built

| Rule | How it shows up |
|---|---|
| GST | 5% (HSN 6912); CGST + SGST or IGST by place of supply; per-FY invoice series; credit notes; GSTR-1 style summary; a clearly fake demo GSTIN |
| E-Commerce Rules 2020 | Seller details, grievance contact, return and refund policy, full price breakdown before Pay |
| Legal Metrology | MRP incl. taxes, country of origin, maker name and address, net quantity on every product page |
| Dark-patterns guidelines | Real stock counts only; no countdowns, pre-ticked add-ons or hidden fees |
| DPDP Act and Rules 2025 | Core duties apply from 13 May 2027; built now: notice at collection, export, deletion, grievance contact, breach notes in the runbook |
| Gift parcels | Shipping is simulated. Gift parcels carry a price-free packing slip, and the invoice is emailed to the buyer. Revisit if it ever ships for real. |

## 8. Environments

| Env | Hosting | Database | Payments | Email |
|---|---|---|---|---|
| Local | `next dev` | Neon dev branch | Razorpay test keys | Outbox only (no sending) |
| Preview (per PR) | Vercel preview | Shared Neon `preview` branch | Test keys (status check, no webhooks) | Outbox only |
| Production demo | Vercel, `main` only, deployed after your confirmation; store and admin hosts | Neon main branch | Test keys | Allowlisted delivery |

## 9. Riskiest unknown: speed with a nonce CSP

A CSP with nonces forces every page to render per request, so catalogue pages can't be static. The
first visit after an idle spell then waits for a function cold start plus Neon waking up, which
puts LCP < 2.5 s and Lighthouse ≥ 90 at risk.

**Settled in the first slice:** deploy a product page with the nonce CSP and one database read,
leave it idle for 10 minutes, then run mobile Lighthouse. If it fails, catalogue pages get a
hash-based CSP and static rendering with revalidation, and nonces stay on checkout, account and admin.

## 10. Open questions

None. Neon Object Storage and a public repository were chosen on 26 Nov 2026.
