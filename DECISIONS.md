# Decisions

Decisions that shape the build and aren't obvious from the docs. One entry each.

- **AI-generated imagery.** Images in ChatGPT and video in Google Flow, made when a milestone needs
  them, with one master per product and every other shot edited from it. *Why:* there's no photo
  budget, and consistency is the main risk. *Impact:* disclosed in the footer; prompts in
  [art-direction.md](docs/art-direction.md).
- **Demo status and notices.** A demo notice in three places only (above the header, the footer,
  the payment step), never twice on one screen. Payments run in test mode, and forms offer sample
  details. *Why:* it's honest and keeps real personal data out. *Impact:* a focused checkout layout
  ([concept.md](docs/concept.md), section 14).
- **₹0 budget.** Free tiers, test modes or mocks only; no custom domain. *Why:* it's a portfolio
  demo. *Impact:* every service choice at Checkpoint 3 must fit.
- **Email: demo inbox plus allowlisted delivery.** Every email is stored and shown in an in-app
  demo inbox. Only addresses on an admin-managed allowlist also get it for real, sent over SMTP
  from a dedicated project Gmail. *Why:* real emails at ₹0 without an open relay or a paid domain.
  *Impact:* an outbox table with a send step, and a provider adapter (swap to Resend if a domain
  is ever added).
