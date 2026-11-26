# E-commerce checklist

For Aanch and any other store. **Part 1** is for every change. **Part 2** is for turning a demo
into a real store. India-specific items are marked 🇮🇳; skip or swap them for other markets.

## Part 1: every change

**Money**
- [ ] Amounts are in the smallest unit (paise or cents) as integers. No floats anywhere in the path.
- [ ] Totals, tax and discounts are worked out on the server; the browser's numbers are ignored.
- [ ] Rounding happens per line, the same way on screen, in the invoice and in reports.
- [ ] Refunds can never exceed what's left to refund, even with two clicks or two staff at once.

**Stock**
- [ ] Every stock change goes through the ledger, with a type and a reason.
- [ ] Concurrent buyers can't take the same last unit (locks or constraints, not hope).
- [ ] Reservations expire, and anything that counts stock uses the same "effective" status.

**Orders and states**
- [ ] A new status or transition is in the transition table, allowed only from named previous states.
- [ ] Anything that can be retried (webhooks, jobs, double submits) is idempotent.
- [ ] Anything shown on an invoice or order is copied at purchase, never read live from the catalogue.

**Access**
- [ ] A new admin action is in the permission map, checked on the server, and covered by the role test.
- [ ] Sensitive actions are written to the audit log.
- [ ] Customer data is read only through queries scoped to its owner (and RLS, where it exists).
- [ ] A wrong owner gets 404, not 403.

**Personal data**
- [ ] A new personal field is really needed.
- [ ] It's included in export, anonymised on deletion, masked for demo or limited roles, and kept
  out of logs.
- [ ] It never appears in URLs, analytics or error messages.

**Inputs and files**
- [ ] Every new input has a schema with length and format limits.
- [ ] Uploads check type by content, cap size, re-encode, and are stored under random keys.

**Customers see it**
- [ ] Loading, empty, error and success states exist and say what to do next.
- [ ] It works by keyboard, at 320 px, with reduced motion, and with a screen reader.
- [ ] Words match the site vocabulary, and the button, toast and email name the action the same way.
- [ ] Prices include tax where the law requires; no false urgency, pre-ticked add-ons or hidden
  fees (🇮🇳 dark-patterns guidelines).
- [ ] Emails for the event exist, read well on a phone, and go through the outbox.

**Speed**
- [ ] New images are sized and compressed; new JavaScript is justified.
- [ ] Key pages still meet LCP, CLS and INP on a mid-range phone.

**Database changes**
- [ ] Migrations are reviewed and can run on live data without locking big tables for long.
- [ ] Renames and removals are done in steps (add, backfill, switch, remove later).
- [ ] Seeds and fixtures are updated.

**Done**
- [ ] Unit tests for the rules, an integration test against a real database, and an E2E test if a
  main journey changed.
- [ ] The check command passes; the diff has been read as a reviewer would.
- [ ] Docs, the decision log (if it's a real decision) and the help pages are updated.
- [ ] You know how to roll it back.

## Part 2: from demo to a real store

### Business and legal
- [ ] Legal entity, bank account and 🇮🇳 GSTIN registered; trademark search done for the name.
- [ ] Terms, privacy, shipping, returns and refund policies reviewed by a lawyer. Each policy
  change is dated and announced.
- [ ] 🇮🇳 E-Commerce Rules: seller details and a named grievance officer, with contact details
  and response times.
- [ ] 🇮🇳 Legal Metrology: MRP, net quantity, country of origin, maker name and address, consumer
  care details on listings and packaging.
- [ ] Product safety evidence: for tableware, food-contact testing (lead and cadmium release), plus
  any 🇮🇳 BIS quality-control order that applies.
- [ ] Transit insurance and product liability cover.

### Payments
- [ ] Live account activated (🇮🇳 KYC), and fees and settlement cycles understood.
- [ ] Payment methods chosen; refund timelines published.
- [ ] Chargeback and dispute process defined.
- [ ] Hosted checkout only, so card data never touches your servers (keeps PCI DSS scope minimal).
  🇮🇳 No stored card numbers (RBI tokenisation).
- [ ] Live keys and webhook secrets in the production environment only, with a rotation plan.
  Test keys removed from production.
- [ ] COD: carrier remittance reconciled against orders; RTO costs tracked.

### Tax and invoicing 🇮🇳
- [ ] HSN codes and rates confirmed by a CA, including shipping, gift wrap and fees.
- [ ] Real GSTIN on invoices; a consecutive series per financial year.
- [ ] GSTR-1 and GSTR-3B filing process set up; records kept 72 months.
- [ ] E-way bill for consignments over ₹50,000. E-invoicing if B2B and turnover crosses the
  threshold (₹5 crore at the time of writing).
- [ ] If you also sell on marketplaces: TCS reconciliation.

### Shipping and returns
- [ ] Carrier or aggregator contract; real serviceability and rates by PIN, weight and volume.
- [ ] Packaging tested for the product (drop tests for ceramics); real breakage claim process.
- [ ] Non-delivery reports (NDR) and RTO handled; labels and manifests printed from admin.
- [ ] Returns inspection and restock rules.

### Operations and support
- [ ] Opening stock counted and entered through the ledger; low-stock thresholds set.
- [ ] Support channels (email, phone, WhatsApp) and response times defined; replies templated.
- [ ] Staff accounts are personal (no shared logins), on least privilege, with an offboarding
  checklist.

### Security
- [ ] An independent security review or penetration test before launch.
- [ ] Edge protection: WAF, bot management and rate limits at the CDN, not just in the app.
- [ ] Two-factor on every vendor dashboard (hosting, database, payments, email, DNS, GitHub).
- [ ] Secrets rotated from anything used in the demo; dependency alerts acted on.
- [ ] Backups with a tested restore, and a written incident response plan.
- [ ] 🇮🇳 CERT-In: cyber incidents reported within 6 hours; logs kept for 180 days.

### Privacy 🇮🇳 DPDP
- [ ] Notices at every collection point; consent records; marketing as a separate opt-in.
- [ ] A retention schedule, with deletion jobs that follow it.
- [ ] Contracts with every processor (hosting, email, payments, analytics).
- [ ] Breach notification to the Data Protection Board and affected people.
- [ ] Rules for children's data (verifiable parental consent) if under-18s can buy.
- [ ] Analytics and cookies only with consent where required.

### Infrastructure
- [ ] Commercial-use plans: Vercel Hobby forbids commercial use, so move to Pro. A Neon paid plan
  ends cold starts and gives a longer restore window.
- [ ] Own domain, with email authenticated (SPF, DKIM, DMARC) through a transactional email provider.
- [ ] Uptime monitoring, error alerts that reach a person, log retention that meets the law.

### Quality
- [ ] Real photography where it matters, or AI images clearly disclosed.
- [ ] Core Web Vitals checked on real devices and real networks.
- [ ] Accessibility audit with real assistive technology.
- [ ] Analytics and conversion tracking; Search Console, sitemap, structured data validated;
  redirects for any old URLs.

### Remove the demo scaffolding (Aanch)
- [ ] Demo strip, footer demo line, payment-step test notice, About this demo page.
- [ ] Use sample details buttons, the demo inbox, and the email allowlist (all customers get real email).
- [ ] Demo admin role and login, the daily demo reset, and the demo baseline.
- [ ] Fake GSTIN, seeded customers and orders, test payment keys.

### Launch
- [ ] A soft launch with real orders placed by staff, refunded end to end.
- [ ] A rollback plan, and someone watching errors and orders for the first week.
