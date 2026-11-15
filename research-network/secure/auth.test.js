'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {verifyJwt,adminOnly}=require('./auth');
const secret='development-only-32-byte-secret-for-tests';
const now=Math.floor(Date.now()/1000);
function token(claims){const head=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');const body=Buffer.from(JSON.stringify(claims)).toString('base64url');const signature=crypto.createHmac('sha256',secret).update(head+'.'+body).digest('base64url');return [head,body,signature].join('.');}
const valid={sub:'member-123',role:'member',iss:'femmie-test',aud:'research-test',iat:now,exp:now+300};
test('valid signed token returns member identity',()=>assert.deepEqual(verifyJwt(token(valid),secret,{issuer:'femmie-test',audience:'research-test'}),{id:'member-123',role:'member'}));
test('tampered token rejected',()=>assert.throws(()=>verifyJwt(token(valid).slice(0,-2)+'aa',secret,{issuer:'femmie-test',audience:'research-test'})));
test('expired token rejected',()=>assert.throws(()=>verifyJwt(token({...valid,exp:now-1}),secret,{issuer:'femmie-test',audience:'research-test'})));
test('wrong audience rejected',()=>assert.throws(()=>verifyJwt(token(valid),secret,{issuer:'femmie-test',audience:'other'})));
test('member cannot access admin',()=>{let status;adminOnly({identity:{role:'member'}},{status(n){status=n;return {json(){}}}},()=>assert.fail('must not pass'));assert.equal(status,403);});
