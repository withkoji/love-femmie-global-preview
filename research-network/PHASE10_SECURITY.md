# Phase 10 — security and integration verification

This phase adds negative-case JWT tests and a static Stripe checkout regression guard. Neither substitutes for real staging integration tests.

## Required external staging validation
1. Provision managed PostgreSQL and execute reviewed schema migration in isolated staging; capture migration status, backup and restore evidence.
2. Validate TLS certificate chain, database permissions, network isolation and restart persistence.
3. Integrate a trusted identity provider. Current verifier supports HS256 only; do not use RS256/ES256 tokens without vetted JWKS validation. Verify trusted admin role mapping and revocation.
4. Exercise anonymous, member and admin APIs against the actual staging database, including consent withdrawal, transaction rollback and audit events.
5. Run Stripe test-mode subscription checkout, redirect and billing regressions with test credentials; do not use live payments for validation.
6. Verify CI, rate limiting, monitoring, privacy controls and rollback plan before requesting merge or deployment.

## Safety
No secrets are stored in this repository. Do not mount the demo router. Do not enable the secure Research route in production until staging evidence and approvals are complete.
