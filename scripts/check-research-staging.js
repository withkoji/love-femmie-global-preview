'use strict';
const assert = require('node:assert/strict');
const { URL } = require('node:url');

function validate(env = process.env) {
  const required = ['DATABASE_URL', 'FEMMIE_JWT_HS256_SECRET', 'FEMMIE_JWT_ISSUER', 'FEMMIE_JWT_AUDIENCE'];
  const missing = required.filter(key => !env[key]);
  if (missing.length) throw Error('Missing staging configuration: ' + missing.join(', '));
  assert.ok(Buffer.byteLength(env.FEMMIE_JWT_HS256_SECRET) >= 32, 'JWT secret must be at least 32 bytes');
  const url = new URL(env.DATABASE_URL);
  assert.ok(['postgres:', 'postgresql:'].includes(url.protocol), 'DATABASE_URL must be PostgreSQL');
  assert.ok(url.hostname && url.username && url.password, 'Database URL must include host and credentials');
  assert.ok(url.searchParams.get('sslmode') === 'verify-full', 'Staging database must require verified TLS (sslmode=verify-full)');
  assert.ok(/^https:\/\//.test(env.FEMMIE_JWT_ISSUER), 'JWT issuer must be HTTPS');
  assert.ok(env.FEMMIE_JWT_AUDIENCE.trim(), 'JWT audience must be configured');
  assert.notEqual(env.FEMMIE_RESEARCH_ENABLED, 'true', 'Do not enable production Research route during staging readiness checks');
  return { readyForStagingValidation: true };
}
if (require.main === module) {
  try { validate(); console.log('Staging configuration shape valid; identity, TLS, database connectivity and migrations NOT verified.'); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { validate };
