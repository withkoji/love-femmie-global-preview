# Phase 9 — staging validation evidence

## Scope
This phase adds static schema tests and a validation checklist. No production database migration, external identity integration, Stripe transaction, or deployment is performed.

## Staging acceptance evidence
- GitHub Actions URL with a successful Research Network CI run.
- Isolated managed PostgreSQL endpoint, TLS certificate verification, and migration execution log (do not publish credentials).
- Confirmed schema tables, indexes, audit transaction, consent withdrawal, backup/restore, and restart persistence.
- Identity provider issuer/audience/algorithm verification; server-controlled administrator roles and revocation tests.
- Unauthorized member/admin API tests, editorial approval tests, and rate limiting.
- Stripe test-mode checkout creation, redirect behavior and subscription regression evidence.
- Staging URL, rollback instructions and approval by repository maintainers.

## Execution
Run `npm run test:research`, `npm run test:staging`, and `npm run test:schema` in CI. Schema tests are static and **do not apply migrations**.

Only run migrations from an approved staging deployment environment with reviewed credentials and backups. Do not expose secrets in logs. Keep Research API disabled until all gates pass.
