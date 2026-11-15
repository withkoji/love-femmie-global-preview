# LOVE FEMMIE GLOBAL — Project Fields and Milestones

## Suggested project fields
| Field | Type | Values |
| --- | --- | --- |
| Status | Single select | Backlog, Ready, In progress, In review, Blocked, Done |
| Priority | Single select | Critical, High, Medium, Low |
| Workstream | Single select | Stripe, Security, Membership, Website/App, Legal, QA, DevOps, Content, Release |
| Milestone | Milestone | M1, M2, M3, M4 |
| Target environment | Single select | Local, Staging, Production |
| Owner | Assignee | GitHub account |
| Estimate | Number | Story points |
| Blocked by | Text | Issue references |
| Test evidence | Text | Workflow or PR links |

These fields are a **proposed schema**, not created GitHub Project fields.

## Milestone assignments
- **M1 — Payment Foundation:** #3 Stripe, #4 secrets, #5 webhooks
- **M2 — Membership Experience:** #6 identity/entitlements, #7 Zite/app integration
- **M3 — Production Readiness:** #8 legal/tax, #9 QA, #10 deployment, #11 content/licensing
- **M4 — Launch & Release:** #12 release; parent epic #2 tracks all phases

Milestones are **not created or assigned** by this file; configure them in GitHub Issues > Milestones.

## Checkout form and API fields
| Field | Source | Validation |
| --- | --- | --- |
| tier | User form | One of essential, plus, elite |
| price | Server environment | Matching configured recurring Stripe Price ID |
| mode | Server constant | subscription for memberships |
| quantity | Server constant | 1 |
| success_url / cancel_url | Server configuration | Trusted HTTPS origin in production |
| billing address / phone / tax ID | Stripe hosted form | Collected by Stripe; never copied into application logs |
| terms consent | Stripe hosted form | Required; published terms and privacy must be verified |
| session_id | Stripe redirect | Display only; not proof of payment |
| stripe_customer_id / subscription_id | Verified backend webhook | Persist securely and map to authenticated user |
| subscription_status | Verified Stripe state | Governs membership access |

## Release gate
Do not activate paid access or announce launch until verified webhooks, persistent entitlements, tests, deployment, legal review, and account-specific Stripe configuration are complete.
