'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { checkSchema } = require('./verify-research-schema');
test('schema defines required tables and consent defaults', () => assert.equal(checkSchema(), true));
test('schema without consent default is rejected', () => {
  const { readFileSync } = require('node:fs');
  const sql = readFileSync('research-network/secure/schema.sql', 'utf8').replace('matching_consent BOOLEAN NOT NULL DEFAULT FALSE', 'matching_consent BOOLEAN');
  assert.throws(() => checkSchema(sql));
});
