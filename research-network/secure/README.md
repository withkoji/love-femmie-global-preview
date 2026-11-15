# Phase 4 — secure backend foundation

This is a separate, opt-in implementation. **Do not mount the original development router in production.**

## Prerequisites
- Node.js, Express, PostgreSQL, and `pg` dependency.
- Apply `schema.sql` to a protected PostgreSQL database.
- Configure `DATABASE_URL`, `FEMMIE_JWT_HS256_SECRET` (at least 32 bytes), `FEMMIE_JWT_ISSUER`, `FEMMIE_JWT_AUDIENCE` through server-side secrets.
- A trusted identity provider must issue HS256 JWTs with verified issuer, audience, subject, expiry, issued-at and admin role. **Do not invent a browser-side token or grant admin roles from form inputs.** For OIDC providers that issue RS256/ES256 tokens, replace the verifier with a standards-compliant JWKS validator rather than changing token algorithms.
- After identity integration, mount in the backend before static assets:
```js
app.use('/api/research-network', require('./research-network/secure/router').createSecureRouter());
```
- Require HTTPS, same-origin requests or restrictive CORS, rate limiting and monitoring before production launch.

## Security model
Public: `GET /topics`, `GET /news` (published only).
Authenticated: `GET/PUT /me/preferences`, `GET /matches` (server-derived identity and consent).
Admin only: `GET /admin/drafts`, `POST /admin/import`, `PATCH /admin/drafts/:id`.
Draft state changes are transactional and audited. SQL is parameterized. Database is persistent. No demo admin header is honored by the secure router.

## Remaining launch gates
- Wire the member and admin pages to real sign-in and the new authenticated endpoints. Existing preview pages still use the old demo contract.
- Provision database, apply migration, rotate and protect secrets, and connect actual issuer/roles.
- Add token rotation/revocation policy, rate limits, content security policy, CSRF protections where cookie auth is used, URL safety for outbound fetches, and privacy/retention policy.
- Run unit, integration, database-restart, and unauthorized-access tests in CI.
- Verify Stripe checkout and webhook behavior are unaffected.
- Deploy backend and Zite frontend separately; verify both before declaring live.
