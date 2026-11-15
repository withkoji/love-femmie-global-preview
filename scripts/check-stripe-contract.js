'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
function check(source = fs.readFileSync('server.js','utf8')) {
 assert.match(source, /app\.post\('\/create-checkout-session'/, 'Stripe checkout route missing');
 assert.match(source, /stripe\.checkout\.sessions\.create\(/, 'Stripe checkout call missing');
 assert.match(source, /mode:\s*'subscription'/, 'Subscription mode missing');
 assert.match(source, /success_url:/, 'Success redirect missing');
 assert.match(source, /cancel_url:/, 'Cancel redirect missing');
 assert.match(source, /STRIPE_SECRET_KEY/, 'Stripe secret configuration missing');
 return true;
}
if (require.main === module) { check(); console.log('Stripe static contract passed; no payment or live API call was executed.'); }
module.exports = { check };
