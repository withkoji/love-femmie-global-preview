# Phase 11 — AWS Amplify staging architecture

## Proposed separation
- Amplify Hosting deploys the frontend from a dedicated staging branch, with an environment-specific API URL.
- API Gateway HTTP API invokes a dedicated Lambda for the Research API; the existing Stripe Express server remains separate and unchanged.
- RDS PostgreSQL is private in a VPC; Lambda uses least-privilege security groups and verified TLS. Prefer RDS Proxy when connection concurrency warrants it.
- Secrets Manager stores database credentials; do not store secrets in Amplify public environment variables or commit them.
- Cognito User Pool issues JWTs; validate signature using published JWKS, exact issuer, client/audience, token_use, expiration and key rotation. Assign admin permissions only from trusted claims and explicitly review role mapping.
- CloudWatch provides request logs, alarms and error-rate monitoring without logging JWTs, secrets or personal profile data.

## Existing code incompatibilities
- `research-network/secure/auth.js` only verifies HS256 shared-secret tokens; Cognito signs with asymmetric keys. Do not accept Cognito JWTs until the verifier is replaced and tested.
- `research-network/secure/router.js` currently instantiates a PostgreSQL Pool from DATABASE_URL; configure certificate verification and bounded Lambda pool connections before real staging use.
- Express router requires an adapter/handler for Lambda; do not mount it into the Stripe production server.
- Schema migration is SQL only; no AWS deployment, database, migrations, or cloud resources are created by this PR.

## AWS staging checklist
1. Confirm AWS account, region, domain and deployment branch.
2. Configure Amplify Hosting staging branch with no production traffic.
3. Provision private PostgreSQL and backups; verify TLS, migration, rollback and restricted network access.
4. Configure Cognito user pool, app client, admin role strategy and test identities.
5. Implement and test Cognito JWT verifier and Lambda HTTP handler; configure API Gateway CORS allowlist, throttling and observability.
6. Verify anonymous/member/admin access, consent revocation, audit transactions and errors against staging RDS.
7. Exercise Stripe **test-mode** checkout regression independently from Research API.
8. Obtain passing CI, security review and deployment approval before production enablement.

## Rollback
Disable the staging API integration and revert the Amplify staging branch. Preserve database backups and audit history; do not delete production data.
