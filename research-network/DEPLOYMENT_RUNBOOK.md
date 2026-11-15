# Phase 6 — Production readiness and controlled deployment

## Current state
This repository contains a Research + Network secure API and preview frontend. **It is not production-ready, deployed, or verified.** Stripe checkout remains separate and must be regression-tested.

## Before deploying
1. Choose a trusted identity provider and confirm the actual token algorithm and claims. The current verifier supports HS256 only. For an OIDC provider using RS256 or ES256, integrate a vetted JWKS-based verifier and verify issuer, audience, expiry and server-authorized admin roles.
2. Provision managed PostgreSQL with encryption, backups, least-privilege application credentials and restricted network access.
3. Apply `research-network/secure/schema.sql` using a migration process. Record the migration version and test rollback/recovery in staging.
4. Configure server-side `DATABASE_URL`, `FEMMIE_JWT_HS256_SECRET`, `FEMMIE_JWT_ISSUER`, `FEMMIE_JWT_AUDIENCE` only where applicable. Never commit secrets.
5. Mount `createSecureRouter()` under `/api/research-network` in the backend **after** infrastructure and identity are ready. Do not mount the old demo router.
6. Integrate the actual sign-in SDK with the secure member and admin pages. The preview event contract is not a production credential handoff.
7. Add HTTPS, strict CORS, security headers/CSP, request rate limits, log redaction, operational alerts, retention controls and account deletion/export procedures.
8. Restrict staff accounts to trusted server-side role assignments; verify role revocation. Test consent withdrawal and private profile isolation.
9. Execute CI plus integration tests against a temporary PostgreSQL database; verify anonymous, member and admin paths, restart persistence, publication audit and concurrency.
10. Regression-test Stripe subscription checkout, redirects, membership billing, and secrets handling.
11. Stage deployment, smoke-test member and admin UI, then deploy with monitored rollback plan.

## Required acceptance evidence
- CI run URL and passing checks
- Staging backend URL and database migration result
- Identity provider verification and role mapping
- Unauthorized access, consent withdrawal, and publishing approval test results
- Stripe regression result
- Production deployment URL, version and rollback reference

## Rollback
Disable Research + Network route at the edge or app configuration; roll back the backend and frontend release. Preserve PostgreSQL records and backups; do not reverse migrations without a reviewed data-preserving plan. Stripe must continue operating independently.

## Important limitation
The static CI guard checks file presence and unsafe demo-router mounting. It does **not** establish runtime security, production readiness, or successful deployment. Production enablement requires the remaining acceptance evidence.
