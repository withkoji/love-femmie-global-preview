'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validate}=require('./check-aws-region');
const config=require('../research-network/aws/staging.config.json');
test('staging region is us-east-1',()=>assert.equal(validate(),true));
test('rejects alternate region',()=>assert.throws(()=>validate({...config,region:'us-east-2'})));
test('rejects production activation',()=>assert.throws(()=>validate({...config,researchEnabled:true})));
