# Research + Network (development foundation)

This isolated Express router implements topic discovery, attributed news draft ingestion, deduplication, admin review states, and consent-based member matching. It is **not wired into the live Zite application**.

## Development integration
Mount with `app.use('/api/research-network', require('./research-network/server'))` in an authenticated development server. No production authentication is implemented here. In development, admin endpoints require the explicit `x-demo-admin: true` header; **in production they fail closed with HTTP 503**.

Endpoints:
- `GET /topics`
- `GET /members` (demo profiles)
- `POST /matches` body `{"viewer":{"id":"viewer","matchingConsent":true,"interests":["Cooking"]}}`
- `GET /news` (approved and published items only)
- `GET /admin/drafts` (development admin)
- `POST /admin/import` body `{"items":[{"title":"...","source":"...","url":"https://...","topic":"Cooking"}]}`
- `PATCH /admin/drafts/:id` body `{"status":"Approved"}` then `{"status":"Published","summary":"Original summary"}`

## Production blockers
1. Connect Zite identity and enforce server-side role checks and member opt-in.
2. Persist drafts and member preferences in a database; the in-memory store resets on restart.
3. Add a trusted feed connector, URL validation and SSRF-safe fetching, rate limits, attribution and editorial fact checks.
4. Implement a real scheduled job; 60-second refresh is a target, **not a guarantee**.
5. Build and connect member and admin UIs in the actual Zite app, then run end-to-end tests.
6. Review privacy, accessibility, and content licensing before publishing.

No external news is scraped or republished automatically. Publishing requires an admin action and an original summary.
