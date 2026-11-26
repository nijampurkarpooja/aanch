# Requirements: Aanch

Checkpoint 2. **Status: approved 26 Nov 2026.** Brand, catalogue and design: [concept.md](concept.md).

## Problem and goal

People who cook Indian food at home can't easily buy good handmade tableware shaped for it, and
online they can't judge depth, scale or glaze. Aanch is a demo store that solves this with a
coherent shop and a studio admin that runs it. As a portfolio piece, success means a reviewer can
use both halves end to end and find them believable, secure and pleasant.

## Success measures

- **Early (end of the commerce-core milestone):** a first-time reviewer goes from the homepage to
  a paid test order on a phone in under 3 minutes without help, and the order shows the correct
  GST split (intra- vs inter-state) on its invoice.
- **Final (before calling it done):**
  - every Must-have below passes its "done when"
  - Lighthouse mobile performance is 90 or above on home, listing and product pages
  - no serious or critical axe violations
  - all end-to-end journeys pass
  - the security review finds nothing high or critical

## Users and roles

| Role | Can |
|---|---|
| Visitor | Browse, search, cart, check out as a guest (tracking by signed link only), notify-me |
| Customer | All of the above, plus addresses, order history, tracking, shelf, returns and breakage claims, data export and account deletion |
| Owner (staff) | Everything, including staff, roles, settings, the email allowlist and the audit log |
| Operations (staff) | Catalogue, product lifecycle, firings, stock, fulfilment |
| Support (staff) | Orders, cancellations, refunds up to ₹3,000 per order in total, claims, returns, customers |
| Demo admin (staff) | Every workflow on demo data, with customer details masked; no staff, roles, settings or allowlist. Shared login shown on About this demo. |

Staff permissions are checked on the server for every request. The UI hiding a button is never
the control.

## Features

### Must have

**Storefront**
- Home with *the table from above* (four meal tables with hotspots and quick add): done when every
  hotspot opens a working quick view, and the hero works by keyboard and with reduced motion.
- Shop menu, collection and listing pages with filters (meal, piece, finish, capacity, price, in
  stock) and sort: done when filters are in the URL, combine, and the empty result offers to clear them.
- Search by name, piece, finish and meal, tolerant of small typos: done when "katoris", "katori"
  and "katroi" all find Katori.
- Product page: finish swatches that swap the gallery, sizes, a real stock state and firing,
  *Will it hold?*, the use profile, and a delivery estimate by PIN code. Also the legal details
  (maker name and address, country of origin, MRP incl. taxes, net quantity). Done when an
  unavailable finish × size combination can't be added.
- Kiln calendar and **Notify me next firing** on sold-out variants: done when receiving a firing
  sends the notify-me emails for its variants exactly once.
- Cart (drawer and page) that persists for guests and accounts, and merges on sign-in: done when
  price and stock changes since adding are shown before payment.
- Checkout: guest or account, PIN-first Indian address, shipping, a discount code, gift options,
  test-mode prepaid payment or COD. Done when payment is confirmed only on the server (a verified
  webhook or a server-side status check, never the browser), and a repeated webhook changes nothing.
- Order confirmation, tracking timeline, and the emails for each order event (demo inbox, plus
  real delivery for allowlisted addresses).
- Account: sign up, sign in, sign out, addresses, order history, invoice download, cancellation
  before packing, returns, breakage claims with photos, data export and account deletion.
- Demo notice in its three places, and Use sample details on the address and sign-up forms.

**Admin**
- **Today:** orders to pack, COD orders to confirm, open claims and returns, low stock, firing status.
- Catalogue: products, variants, finishes, collections, images, profile data with a live drawing.
  Draft, Active and Archived states, with delete only when never ordered.
- Firings: plan the stage dates, receive actual quantities (adds stock and triggers notify-me),
  plus adjustments with a reason and the stock ledger.
- Orders: list with filters, detail, packing slip, mock carrier booking and tracking, status
  changes, cancellation, full or partial refunds, COD collection.
- Claims and returns queue with photo review: approve as replacement or refund, or reject with a reason.
- Customers: list, detail, notes, orders; handle export and deletion requests.
- Discounts: create, edit, pause; usage shown.
- Reports: sales over time, by product and by finish; AOV; COD vs prepaid; refunds; RTO rate; and
  the GST summary by HSN and state, exportable as CSV.
- Staff and roles, the email allowlist, settings, and the audit log (Owner).

### Should have
- Shelf view (true-scale listing), the stamp interaction, and *Clay to table* scroll chapters.
- Your shelf (wishlist).
- Gift note preview as a printed card.
- Moving the light across the glaze on the close-up.
- Share images generated per product.

### Later (not in the first version)
- Product reviews (real ones need moderation; seeded ones would be fake)
- Subscriptions
- Store credit
- Hindi and Kannada versions
- The "try the block" print toy
- Seasonal theming
- A real carrier integration
- Wedding registry

## Business rules

**Money**
- All amounts are integer paise, and every price shown includes GST.
- Per line, taxable value = price ÷ (1 + rate) and tax = price − taxable value, rounded to the paisa.
  Invoice totals are the sum of the rounded lines.
- Place of supply is the delivery state. Karnataka gets CGST + SGST (half each); every other state
  gets IGST.
- A discount is spread over its eligible lines in proportion to their value, before tax is worked
  out.
- Shipping, the COD fee and gift wrap are charged with the goods and taxed at the order's main
  rate. Confirm this treatment at Checkpoint 3.

**Catalogue and stock**
- A variant is product × finish × size, with its own SKU, price, stock and status. Seconds are
  variants flagged *second*: their own stock, about 30% off, final sale, never discounted further.
- Stock on hand changes only through ledger entries: firing received, sold, returned to stock,
  adjustment (with a reason), studio breakage, demo top-up. It can never go below zero, and the
  database enforces it.
- Reservations are separate rows with an expiry. Two checkouts can never reserve the same last piece.
- Stock counts shown to shoppers are real. No invented scarcity, countdowns or "people viewing" (the
  dark-patterns guidelines).

**Cart and checkout**
- Carts last 30 days, with at most 10 of any one variant. Prices aren't locked in the cart; they're
  recalculated at checkout.
- Placing a prepaid order reserves its stock for 30 minutes. A successful payment turns the
  reservation into a sale; failure or expiry releases it and cancels the order. A payment that
  arrives after expiry takes the stock if it's still there; otherwise it's refunded automatically. COD orders take
  stock at placement.
- Shipping is free from ₹2,500 after discounts, otherwise ₹149.
- COD is available up to ₹5,000 on serviceable PINs, with a ₹99 fee.
- One discount code per order. Codes have a percentage or fixed value, a minimum order, an expiry,
  and usage limits (total, and per customer by email). They never apply to Seconds, shipping or fees.

**Orders: two separate tracks**
- Payment: `pending → paid → partially_refunded / refunded`, with `failed` and `expired`; COD
  orders go `cod_due → cod_collected`.
- Fulfilment: `placed → confirmed → packed → shipped → out_for_delivery → delivered`, with
  `cancelled` (allowed until packed) and `rto` (returned undelivered, back into stock).
- Every transition is server-side, allowed only from its listed previous states, and logged.

**After delivery**
- Breakage claim: within 48 h of delivery, with 1–4 photos. Approval creates a ₹0 replacement order
  (taking stock) or a refund.
- Return of unused pieces: within 7 days, with return shipping deducted from the refund, which is
  made when the pieces are received. Not allowed for Seconds.
- Refunds go back to the original payment method in test mode. COD refunds are recorded as paid
  outside the system (UPI), with a reference only: the store never asks for bank details.

**Invoices**
- Time windows (48 h, 7 days, the financial year) are worked out in IST.
- A tax invoice is issued when an order ships. It uses a sequential series per financial year
  (`AAN/2026-27/000123`), carries a clearly fake demo GSTIN, and can't be changed once issued.
- Refunds or returns after invoicing produce a credit note.
- Order lines keep a copy of the name, finish, SKU, HSN, rate and price, so catalogue edits never
  change past orders.

**Email**
- Every email goes to an outbox and appears in the demo inbox of the account or guest order it
  belongs to.
- Only allowlisted addresses are also sent for real.
- Security emails (password reset, email change) are never shown in the demo inbox. They're
  delivered only for real, so they can't be read by anyone else.

## Quality requirements

- **Accessibility:** WCAG 2.2 AA. Every signature interaction has a keyboard path, a text
  equivalent and a reduced-motion version.
- **Performance (mobile, simulated 4G):** LCP under 2.5 s, CLS under 0.1, INP under 200 ms on home,
  listing and product pages. Video is lazy, poster first, and off under Data Saver.
- **Devices and browsers:** 320–1920 px wide; the last two versions of Chrome, Safari (iOS 16+),
  Firefox, Edge and Samsung Internet.
- **SEO:** server-rendered pages, Product and Offer structured data, a sitemap, canonical URLs.
  Archived products return a "No longer made" page.
- **Locale:** English (en-IN), Indian digit grouping (₹1,00,000), dates like 4 Dec 2026, IST.
- **Security:** to be made concrete at Checkpoint 3. At minimum it covers:
  - hashed passwords and secure session cookies
  - two-factor authentication for staff
  - server-side permission checks, with no access to another user's orders, addresses or claims
    (the IDOR class of bug)
  - validation of every input
  - protection against cross-site form submission (CSRF) and injected scripts (XSS)
  - rate limits on sign-in, checkout, notify-me and claims
  - type and size checks on uploads, with image metadata stripped
  - signed, idempotent webhooks
  - an append-only audit log
  - error messages that never leak internal details

## Constraints

- ₹0 spend, and a demo: test-mode payments, a mocked carrier, no custom domain ([DECISIONS.md](../DECISIONS.md)).
- Indian rules the store follows as if it were real (exact specifics to confirm at Checkpoint 3):
  - **Consumer Protection (E-Commerce) Rules 2020:** seller details, a grievance contact, a
    return and refund policy, and a price breakdown before payment.
  - **CCPA dark-patterns guidelines 2023:** no false urgency or hidden charges.
  - **Legal Metrology:** MRP inclusive of taxes, country of origin, maker details.
  - **GST** invoicing.
  - **DPDP Act 2023:** consent, data export, deletion.
- Tax records outlive account deletion: deleting an account anonymises the profile and addresses,
  and keeps invoice copies.

## Tech choices

See [architecture.md](architecture.md): the stack, key designs, security requirements (S1–S28) and environments.

## Data sketch

```
Product 1─* Variant (finish, size, SKU, price, status, is_second)
Product *─* Collection        Product ─ Category (piece)     Product ── Profile (shape points)
Finish (glaze | print) 1─* Variant
Variant 1─* StockEntry (type, qty, reason, firing?, order?, staff?)
Firing 1─* FiringLine (variant, expected, received) ; Firing 1─* FiringStage (stage, planned, actual)
Variant 1─* NotifyRequest (email, sent_at)
Customer 1─* Address ; Customer 1─* ShelfItem ; Customer 1─1 Cart 1─* CartLine
Order 1─* OrderLine (snapshot: name, finish, sku, hsn, rate, price) ; Order ── Address (snapshot)
Order 1─* Payment / Refund ; Order 1─* Shipment (AWB, events) ; Order 1─1 Invoice 1─* CreditNote
Order 1─* Claim (breakage | return) 1─* ClaimPhoto
Discount 1─* DiscountRedemption
Staff ── Role ; AuditEntry (staff, action, target, before, after, at, ip)
OutboxEmail (to, template, data, status, delivered_at) ; AllowlistEmail
```

## Out of scope

Marketplace or multiple sellers, B2B and GST-registered buyers (no input-credit invoices),
international shipping, real carrier booking, real payments, an SMS or WhatsApp channel, and a
native app.

## Open questions

None. Demo admin role, guest checkout and leaving reviews out were approved on 26 Nov 2026.
