'use strict';
const assert = require('node:assert/strict');
function validate(env=process.env) {
 for(const key of ['AWS_REGION','FEMMIE_COGNITO_USER_POOL_ID','FEMMIE_COGNITO_CLIENT_ID','FEMMIE_STAGING_API_URL']) {
   assert.ok(env[key]?.trim(), 'Missing staging configuration: '+key);
 }
 assert.match(env.AWS_REGION,/^[a-z]{2}-[a-z]+-\d+$/,'Invalid AWS region');
 assert.ok(env.FEMMIE_COGNITO_USER_POOL_ID.startsWith(env.AWS_REGION+'_'),'Cognito pool region mismatch');
 const api=new URL(env.FEMMIE_STAGING_API_URL);
 assert.equal(api.protocol,'https:','Staging API must use HTTPS');
 assert.notEqual(env.FEMMIE_RESEARCH_ENABLED,'true','Production Research route must remain disabled');
 return true;
}
if(require.main===module){try{validate();console.log('AWS staging configuration shape valid; cloud resources and connectivity NOT verified.');}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={validate};
