# Phase 8 — controlled staging integration

This branch contains staging **preflight validation only**. It does not provision PostgreSQL, configure a real identity provider, mount the API in the Stripe application, or deploy.

## Operator checklist

1. Provision isolated managed PostgreSQL with verified TLS, network restrictions, backups and a least-privilege application user. Store credentials in a secret manager, never in Git.
2. Choose an actual identity provider. The current API supports HS256 only; do not accept third-party RS256/ES256 tokens without implementing a vetted JWKS verifier and mapping trusted server-side administrator roles.
3. Set `DATABASE_URL`, `FEMMIE_JWT_HS256_SECRET`, `FEMMIE_JWT_ISSUER`, and `FEMMIE_JWT_AUDIENCE` in staging secrets. Keep `FEMMIE_RESEARCH_ENABLED=false`.
4. Run `node scripts/check-research-staging.js` in a controlled staging environment. This only validates configuration shape and does not test connectivity or certificate trust.
5. Apply `research-network/secure/schema.sql` using a tracked migration process. Confirm tables, least-privilege access, backup and restore.
6. Run API integration tests against isolated PostgreSQL, verify identity signature and role revocation, consent withdrawal, publication audit, persistence, and concurrent editing.
7. Regression-test Stripe checkout before enabling any new API route. Existing `server.js` remains untouched.
8. Review rate limiting, CSP, log redaction, privacy deletion/export, alerts, and rollback before any production release.

## Release gate

Do not enable or deploy Research + Network until a real CI run passes, the staging migration and security tests pass, and the Stripe regression report is reviewed. The existing demo router must never be mounted in production.
