'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validate}=require('./check-aws-staging-config');
const valid={AWS_REGION:'us-east-1',FEMMIE_COGNITO_USER_POOL_ID:'us-east-1_Example',FEMMIE_COGNITO_CLIENT_ID:'client',FEMMIE_STAGING_API_URL:'https://staging.example.com'};
test('valid staging configuration shape',()=>assert.equal(validate(valid),true));
test('rejects mismatched Cognito region',()=>assert.throws(()=>validate({...valid,FEMMIE_COGNITO_USER_POOL_ID:'us-west-2_Example'})));
test('rejects insecure API URL',()=>assert.throws(()=>validate({...valid,FEMMIE_STAGING_API_URL:'http://staging.example.com'})));
test('rejects production route activation',()=>assert.throws(()=>validate({...valid,FEMMIE_RESEARCH_ENABLED:'true'})));
