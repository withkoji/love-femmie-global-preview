'use strict';
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const schema = readFileSync(path.join(__dirname, '../research-network/secure/schema.sql'), 'utf8');
function checkSchema(sql = schema) {
  for (const table of ['research_articles', 'member_discovery_preferences', 'research_audit_events']) {
    assert.match(sql, new RegExp('CREATE TABLE IF NOT EXISTS\\s+' + table + '\\b', 'i'), 'Missing table ' + table);
  }
  assert.match(sql, /matching_consent\s+BOOLEAN\s+NOT NULL\s+DEFAULT FALSE/i);
  assert.match(sql, /discoverable\s+BOOLEAN\s+NOT NULL\s+DEFAULT FALSE/i);
  assert.match(sql, /CHECK\s*\(status IN\s*\('Draft','Approved','Rejected','Published'\)\)/i);
  return true;
}
if (require.main === module) { checkSchema(); console.log('Schema static checks passed; migration has not been executed.'); }
module.exports = { checkSchema };
