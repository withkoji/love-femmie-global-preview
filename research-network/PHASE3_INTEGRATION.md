# Phase 3: Research + Network integration

## What is included
- A standalone admin review UI at `/research-admin.html` for the existing development API.
- Draft imports, publisher attribution, original summaries, and approval/rejection/publishing controls.
- Existing member preview at `/research-network.html` remains unchanged.

## Backend integration
The repository's current `server.js` requires Stripe configuration at startup. For development, mount the Research + Network router with:
```js
app.use('/api/research-network', require('./research-network/server'));
```
This is intentionally **not** mounted on the live Stripe server yet. The current demo admin header is **not authentication**. Production admin endpoints currently fail closed. Do not deploy the admin UI or enable writes until authenticated roles, CSRF protection, audit logging and rate limits are implemented.

## Persistence and identity
- Replace the in-memory `Map` with a durable database table for article drafts, status, publisher, source URL, timestamps and reviewer ID.
- Connect actual authenticated member IDs; do not trust viewer IDs, roles or consent flags from a browser request.
- Store member interests, opt-in, opt-out, discoverability and audit timestamps. Never expose private profiles.
- Enforce role-based access and tenant boundaries server-side.
- Add an automated feed adapter with vetted source allowlist and safe network fetching; schedule after review.
- Implement server-side tests for authentication, authorization, deduplication, approvals, privacy and restart persistence.

## Acceptance gates
1. Tests pass and the application starts with correct environment configuration.
2. Unauthenticated requests cannot read admin drafts or modify articles.
3. Only explicitly opted-in members are eligible for matching.
4. Editorial approval is required before any news appears publicly.
5. Restart does not lose stored records.
6. Zite UI and GitHub backend are connected and deployment verified.

**Current status:** UI preview committed; authentication, persistence, backend mount, integration tests and deployment remain outstanding.
