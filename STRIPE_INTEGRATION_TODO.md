# LOVE FEMMIE GLOBAL — Stripe Integration TODO

**Status: development starter only. Not deployed, not production-ready.** This file is the single source of truth for remaining setup.

## Scenario detection
The newly created repository contained only a README and Node .gitignore. No existing Checkout Session API call or server framework was present; **Scenario B** was applied. The app uses Node.js/Express, Stripe SDK `^23.0.0`, and hosted Checkout.

## Values to Replace

**Files containing placeholders:**
- [server.js](server.js)
- [.env.example](.env.example)

| Field | Current value | What to set |
|---|---|---|
| mode | subscription | Confirm all three Price IDs are recurring monthly; keep subscription for memberships. |
| success_url | `DOMAIN/success.html?session_id={CHECKOUT_SESSION_ID}` | Deploy a real success page and set DOMAIN to its publicly accessible origin. Keep session ID template. |
| cancel_url | `DOMAIN/` | Deploy the pricing/return page at this URL or change to its real location. |
| line_items[].price | `STRIPE_PRICE_ESSENTIAL`, `STRIPE_PRICE_PLUS`, `STRIPE_PRICE_ELITE` with `price_replace_*` examples | Set real recurring Stripe Price IDs for $4, $9.99 and $19.99 monthly. |
| STRIPE_SECRET_KEY | `replace_with_restricted_test_key` | Rotate the previously exposed test key. Store a restricted Stripe key server-side in deployment secrets, not Git. |
| STRIPE_WEBHOOK_SECRET | `replace_with_webhook_signing_secret` | Configure signed webhook endpoint before activating subscriptions. |
| DOMAIN | `http://localhost:4242` | Public HTTPS application origin when deployed. |

## Configured Parameters

**Files containing these parameters:**
- [server.js](server.js)

| Parameter | Value |
|---|---|
| ui_mode | hosted_page (Stripe Node SDK >=21) |
| billing_address_collection | required |
| phone_number_collection | enabled: true |
| automatic_tax | enabled: false |
| allow_promotion_codes | false |
| payment_method_collection | always (subscription only) |
| submit_type | auto |
| tax_id_collection | enabled: true, required: if_supported |
| consent_collection | terms_of_service: required |
| custom_text.terms_of_service_acceptance.message | Exact supplied LOVE FEMMIE terms message |
| integration_identifier | hosted_web_0002 |
| origin_context | web |
| branding_settings | background #5f963a; button #2f6127; default font; rounded border; file_1UbgWwQ6WV33OqxE5xgqwYYF |

## Setup and Next Steps

1. **Security:** Rotate the test secret key exposed in the conversation. Use least-privilege restricted keys in a server-side secret manager. Never expose keys in the browser or commit `.env`.
2. **Stripe account:** Confirm the Stripe account is specifically authorized for LOVE FEMMIE and that the referenced branding logo file exists in that account and mode.
3. **Prices:** Create or confirm separate recurring monthly Products and Price IDs for Essential ($4), Plus ($9.99), Elite ($19.99); free Discover stays in the app.
4. **Local test:** Run `npm install`, copy `.env.example` to `.env`, set test credentials and real test Price IDs, then `npm start`. Visit `http://localhost:4242`.
5. **Webhook required before launch:** Implement a signature-verified endpoint with raw request body, idempotency and persistent membership mapping. Handle checkout.session.completed, checkout.session.async_payment_succeeded/failed, customer.subscription.created/updated/deleted, invoice.paid/payment_failed, charge.refunded, charge.dispute.created and radar.early_fraud_warning.created as applicable. Do not grant access from the success page.
6. **Membership:** Associate Stripe customer/subscription IDs with authenticated FEMMIE user records using the app's real datastore. The new repository has no existing auth/database pattern; none was invented.
7. **Trial:** The 14-day trial is not configured in this starter. Configure only after confirming trial eligibility and renewal disclosures.
8. **Terms:** Publish and verify a Terms of Service URL and Privacy Policy URL in Stripe public details. The draft URLs are not assumed live.
9. **Tax:** automatic_tax is intentionally false as supplied. Review applicable sales tax/VAT/GST registration obligations before launch; Stripe Tax requires active registrations where applicable.
10. **API compatibility:** Verify the fixed Studio parameters, especially branding_settings, integration_identifier, origin_context and tax_id_collection.required, against the actual Stripe API version and account. Do not remove user-fixed settings silently; resolve unsupported parameters before production.
11. **Test:** Use Stripe test mode and card `4242 4242 4242 4242` with a future expiration and any CVC; verify successful and declined flows, webhook signatures, retries, subscription renewal/cancellation and access revocation. Never test with real card numbers.
12. **Deploy:** Configure an HTTPS Node.js host and connect FEMMIE's Zite frontend to the deployed checkout endpoint. Creating this GitHub repo does not automatically deploy or change femmie.zite.so.

## Project structure
- [package.json](package.json) — Node/Express and Stripe dependencies
- [server.js](server.js) — hosted Checkout endpoint
- [public/index.html](public/index.html) — membership preview and tier forms
- [public/success.html](public/success.html) — confirmation page (not fulfillment)
- [.env.example](.env.example) — non-secret environment template
- [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md) — remaining steps

## Flow
Member chooses a tier → server selects a trusted Price ID → Stripe-hosted Checkout → browser returns to confirmation page. **Payment fulfillment and subscription activation are not implemented** until the verified webhook and datastore integration are completed.

## Resources
- https://support.stripe.com
- https://docs.stripe.com/mcp
- https://docs.stripe.com/billing/subscriptions/webhooks
- https://docs.stripe.com/keys-best-practices
