'use strict';
const test=require('node:test');const assert=require('node:assert/strict');
const {dedupeNews,matchMembers,createDraft,transition}=require('./engine');
test('removes repeated URLs and rejects invalid links',()=>{const a={title:'Example',source:'Publisher',url:'https://example.com/story'};assert.equal(dedupeNews([a,a,{...a,url:'javascript:alert(1)'}]).length,1);});
test('requires mutual consent for matching',()=>{const a={id:'a',matchingConsent:true,interests:['Cooking']};const b={id:'b',displayName:'B',matchingConsent:true,discoverable:true,interests:['Cooking']};assert.equal(matchMembers(a,[b]).length,1);assert.equal(matchMembers({...a,matchingConsent:false},[b]).length,0);});
test('requires admin review and original summary before publishing',()=>{const d=createDraft({title:'Story',source:'Publisher',url:'https://example.com/story',topic:'Cooking'});assert.throws(()=>transition(d,'Approved',{}));const approved=transition(d,'Approved',{id:'admin',isAdmin:true});assert.throws(()=>transition(approved,'Published',{id:'admin',isAdmin:true}));assert.equal(transition({...approved,summary:'Original commentary'},'Published',{id:'admin',isAdmin:true}).status,'Published');});
