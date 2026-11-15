# LOVE FEMMIE GLOBAL

**Learn • Nourish • Love • Grow • Earn**

LOVE FEMMIE GLOBAL is a premium digital lifestyle, wellness, and education platform offering online courses, beauty, nutrition, family resources, FEMMIE TV, and Stripe-powered memberships.

**Website:** https://femmie.zite.so/

## About

LOVE FEMMIE GLOBAL brings learning, wellness, and everyday inspiration together in one welcoming digital experience. Planned features include:

- **FEMMIE Academy:** Courses, quizzes, learning progress, and certificates.
- **Recipes & Cooking:** International recipes and cooking lessons.
- **Beauty & Wellness:** Skincare, nutrition, self-care, and healthy routines.
- **Family & Home:** Parenting, family wellness, home care, and pet care.
- **FEMMIE TV:** Streaming content where licensing and availability permit.
- **Community & Rewards:** Member engagement and eligible referral rewards.

Content access and availability vary by membership tier.

## Memberships

| Plan | Monthly price (USD) | Planned access |
| --- | ---: | --- |
| Discover | Free | Introductory access |
| Essential | $4.00 | Up to 200 educational courses and lessons as available |
| Plus | $9.99 | Up to 400 courses as released |
| Elite | $19.99 | Up to 1,000 content items as published |

Paid plans are intended to renew monthly until canceled. A 14-day introductory trial may be offered to eligible new subscribers **only after it is configured and disclosed**.

## Stripe Checkout integration

This repository contains a **development starter** for Stripe-hosted subscription Checkout. It is **not deployed or production-ready**.

- `server.js` — Express endpoint for creating hosted Checkout Sessions.
- `public/index.html` — Membership selection and checkout preview.
- `public/success.html` — Checkout return page; **not** proof of payment or membership activation.
- `.env.example` — Example configuration without real credentials.
- `STRIPE_INTEGRATION_TODO.md` — **Single source of truth** for required setup, placeholders, security checks, and launch work.

### Local development

Requires Node.js and npm.

```bash
npm install
cp .env.example .env
# Fill .env with your own TEST-mode Stripe configuration; do not commit it.
npm start
```

Visit http://localhost:4242 to preview the membership page.

The server requires actual recurring Stripe Price IDs and a valid test credential to create Checkout Sessions. The `DOMAIN` variable must match the site origin used for redirects.

### Before accepting payments

Follow **[STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md)** before merging or deploying. In particular:

1. Rotate any previously exposed Stripe test credentials. Keep API keys in server-side secrets, never in Git.
2. Confirm the correct Stripe account and create recurring monthly Prices for each paid membership.
3. Verify Checkout Studio parameters against the Stripe API/SDK version in use.
4. Implement signature-verified webhooks, subscription lifecycle handling, and membership entitlement persistence. Do not grant access based on the success page.
5. Publish Terms of Service and Privacy Policy, and review applicable tax requirements.
6. Deploy a secure backend and connect the live Zite frontend; creating this repository does **not** modify https://femmie.zite.so/.

## Releases and packages

No release or published package is required for this initial development starter. Publish a versioned release after the Checkout integration is verified and ready for deployment.

## Project status

**In development.** Membership pricing and content descriptions are planned offerings; they do not establish that every feature is currently live.

## Support

Use the LOVE FEMMIE GLOBAL website for public updates. A verified customer-support address will be added before launch.
