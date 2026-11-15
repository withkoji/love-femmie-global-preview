'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');
const { buildRouter } = require('./router');

const secret = 'test-only-research-jwt-secret-long-enough';
function bearer(role = 'member', sub = 'member-a') {
  const now = Math.floor(Date.now() / 1000);
  const head = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ sub, role, iss: 'test-issuer', aud: 'test-audience', iat: now, exp: now + 300 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(head + '.' + body).digest('base64url');
  return 'Bearer ' + [head, body, sig].join('.');
}
async function withApi(pool, run) {
  const app = express();
  app.use('/api/research-network', buildRouter(pool));
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port + '/api/research-network';
    await run(async (path, opts = {}) => {
      const response = await fetch(base + path, opts);
      return { status: response.status, body: await response.json() };
    });
  } finally { await new Promise(resolve => server.close(resolve)); }
}
test('public topics accessible without credentials; private routes reject anonymous', async () => {
  const pool = { query: async () => ({ rows: [] }) };
  await withApi(pool, async request => {
    assert.equal((await request('/topics')).status, 200);
    assert.equal((await request('/me/preferences')).status, 401);
    assert.equal((await request('/matches')).status, 401);
    assert.equal((await request('/admin/drafts')).status, 401);
  });
});
test('member cannot use editorial endpoints', async () => {
  process.env.FEMMIE_JWT_HS256_SECRET = secret;
  process.env.FEMMIE_JWT_ISSUER = 'test-issuer';
  process.env.FEMMIE_JWT_AUDIENCE = 'test-audience';
  await withApi({ query: async () => { throw Error('should not query database'); } }, async request => {
    assert.equal((await request('/admin/drafts', { headers: { Authorization: bearer() } })).status, 403);
    assert.equal((await request('/admin/import', { method: 'POST', headers: { Authorization: bearer(), 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [] }) })).status, 403);
  });
});
test('consent withdrawn yields zero matches and disables discoverability', async () => {
  process.env.FEMMIE_JWT_HS256_SECRET = secret;
  process.env.FEMMIE_JWT_ISSUER = 'test-issuer';
  process.env.FEMMIE_JWT_AUDIENCE = 'test-audience';
  const calls = [];
  const pool = { query: async (sql, params) => {
    calls.push({ sql, params });
    if (sql.startsWith('SELECT member_id AS id,interests')) return { rows: [{ id: 'member-a', interests: [], matchingConsent: false }] };
    return { rows: [], rowCount: 1 };
  } };
  await withApi(pool, async request => {
    const headers = { Authorization: bearer(), 'Content-Type': 'application/json' };
    const result = await request('/me/preferences', { method: 'PUT', headers, body: JSON.stringify({ displayName: 'A', interests: [], matchingConsent: false, discoverable: true }) });
    assert.equal(result.status, 200);
    const save = calls.find(x => x.sql.startsWith('INSERT INTO member_discovery_preferences'));
    assert.equal(save.params[3], false);
    assert.equal(save.params[4], false);
    const matches = await request('/matches', { headers });
    assert.equal(matches.status, 200);
    assert.deepEqual(matches.body.matches, []);
    assert.equal(calls.filter(x => x.sql.includes('member_id<>$1')).length, 0);
  });
});
test('admin import requires valid HTTPS source and role', async () => {
  process.env.FEMMIE_JWT_HS256_SECRET = secret;
  process.env.FEMMIE_JWT_ISSUER = 'test-issuer';
  process.env.FEMMIE_JWT_AUDIENCE = 'test-audience';
  const writes = [];
  const pool = { query: async (sql, params) => { writes.push({ sql, params }); return { rows: [], rowCount: 1 }; } };
  await withApi(pool, async request => {
    const result = await request('/admin/import', { method: 'POST', headers: { Authorization: bearer('admin', 'editor-a'), 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ url: 'http://unsafe.example', title: 'Unsafe', source: 'Test' }, { url: 'https://example.org/story', title: 'Verified', source: 'Test' }] }) });
    assert.equal(result.status, 200);
    assert.equal(result.body.added, 1);
    assert.equal(writes.length, 1);
    assert.equal(writes[0].params[4], 'https://example.org/story');
  });
});
