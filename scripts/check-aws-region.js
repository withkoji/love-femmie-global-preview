'use strict';
const assert = require('node:assert/strict');
const config = require('../research-network/aws/staging.config.json');
function validate(value=config) {
 assert.equal(value.environment,'staging');
 assert.equal(value.region,'us-east-1');
 assert.equal(value.hosting,'amplify');
 assert.equal(value.researchEnabled,false);
 return true;
}
if(require.main===module){validate();console.log('AWS staging region locked to us-east-1; no AWS resources verified.');}
module.exports={validate};
