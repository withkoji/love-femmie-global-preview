'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { verifyJwt } = require('./auth');
const secret = 'phase10-test-secret-at-least-32-bytes';
const now = Math.floor(Date.now()/1000);
const claims = { sub: 'member-1', role: 'member', iss: 'issuer', aud: 'audience', iat: now, exp: now+300 };
function sign(payload=claims, alg='HS256', key=secret) {
 const head=Buffer.from(JSON.stringify({alg,typ:'JWT'})).toString('base64url');
 const body=Buffer.from(JSON.stringify(payload)).toString('base64url');
 const sig=crypto.createHmac('sha256',key).update(head+'.'+body).digest('base64url');
 return [head,body,sig].join('.');
}
const verify = t => verifyJwt(t,secret,{issuer:'issuer',audience:'audience'});
test('accepts signed member token',()=>assert.deepEqual(verify(sign()),{id:'member-1',role:'member'}));
test('rejects unsigned and algorithm-substitution tokens',()=>{assert.throws(()=>verify(sign(claims,'none')));assert.throws(()=>verify(sign(claims,'RS256')));});
test('rejects signature signed with another secret',()=>assert.throws(()=>verify(sign(claims,'HS256','another-secret-at-least-32-bytes'))));
test('rejects wrong issuer and audience',()=>{assert.throws(()=>verify(sign({...claims,iss:'other'})));assert.throws(()=>verify(sign({...claims,aud:'other'})));});
test('rejects expired, future-issued and excessively long-lived tokens',()=>{
 assert.throws(()=>verify(sign({...claims,exp:now-1})));
 assert.throws(()=>verify(sign({...claims,iat:now+120})));
 assert.throws(()=>verify(sign({...claims,exp:now+7200})));
});
test('unknown role cannot gain admin access',()=>assert.deepEqual(verify(sign({...claims,role:'superadmin'})),{id:'member-1',role:'member'}));
