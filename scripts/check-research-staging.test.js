'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validate } = require('./check-research-staging');
const base = {
 DATABASE_URL: 'postgresql://staging_user:secret@db.example.org/femmie?sslmode=verify-full',
 FEMMIE_JWT_HS256_SECRET: 'test-only-secret-with-at-least-32-bytes',
 FEMMIE_JWT_ISSUER: 'https://identity.example.org',
 FEMMIE_JWT_AUDIENCE: 'femmie-research',
 FEMMIE_RESEARCH_ENABLED: 'false'
};
test('accepts structurally valid staging settings without connecting', () => assert.deepEqual(validate(base), { readyForStagingValidation: true }));
test('rejects missing credentials', () => assert.throws(() => validate({ ...base, DATABASE_URL: '' }), /Missing/));
test('rejects insecure database transport', () => assert.throws(() => validate({ ...base, DATABASE_URL: 'postgresql://u:p@db.example.org/x?sslmode=disable' }), /TLS/));
test('rejects weak signing secret', () => assert.throws(() => validate({ ...base, FEMMIE_JWT_HS256_SECRET: 'weak' }), /32 bytes/));
test('rejects non-HTTPS issuer', () => assert.throws(() => validate({ ...base, FEMMIE_JWT_ISSUER: 'http://identity.example.org' }), /HTTPS/));
test('rejects accidental live enablement', () => assert.throws(() => validate({ ...base, FEMMIE_RESEARCH_ENABLED: 'true' }), /Do not enable/));
