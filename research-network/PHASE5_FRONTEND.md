# Phase 5 — Secure frontend integration

New preview routes:
- `/research-network-secure.html` for published articles, authenticated preferences, and consent-based matches.
- `/research-admin-secure.html` for staff editorial review.
- `/research-client.js` is a shared same-origin API client that holds the bearer token in memory only.

## Identity integration contract
The actual LOVE FEMMIE sign-in system must dispatch a trusted integration event after login:
```js
window.dispatchEvent(new CustomEvent('femmie:authenticated',{detail:{accessToken: verifiedProviderToken}}));
```
On logout:
```js
window.dispatchEvent(new Event('femmie:signed-out'));
```
This is an **integration interface, not an authentication implementation**. Do not create, store, or mint access tokens in client JavaScript. Tokens must be issued by the configured identity provider, verified server-side and limited in lifetime. A production integration should prefer an identity SDK with refresh and revocation support. Avoid including the token in logs, URLs, localStorage or analytics. Events carrying credentials should be replaced with a narrower trusted module boundary where possible.

## Backend requirements
Phase 4 secure router must be mounted at `/api/research-network`, PostgreSQL provisioned and migrated, and `pg` installed. The old development router is incompatible with these new pages and must not be mounted in production.

## Verification checklist
- Anonymous visitors see only approved news and cannot read drafts.
- Signed-out users cannot save preferences or view matches.
- Members cannot access editorial queue or publish.
- Only admins can import, approve, reject, or publish.
- Revoking consent removes the member from matching and discoverability.
- Publishing requires an original summary and records an audit event.
- All interfaces work on mobile; error states are clear.
- CI tests, database migration, identity integration and live deployment must be verified separately.

**Status:** Frontend integration code committed; not connected to live identity or deployed.
