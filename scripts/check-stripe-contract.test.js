'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {check}=require('./check-stripe-contract');
test('existing Stripe checkout retains required static contract',()=>assert.equal(check(),true));
test('missing subscription mode is detected',()=>{
 const source=fs.readFileSync('server.js','utf8').replace("mode: 'subscription'","mode: 'payment'");
 assert.throws(()=>check(source),/Subscription mode/);
});
