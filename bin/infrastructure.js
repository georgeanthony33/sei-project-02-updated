#!/usr/bin/env node

require('dotenv').config();

const cdk = require('aws-cdk-lib');
// const { WafStack } = require('../infra/waf-stack');
const { CloudFrontStack } = require('../infra/cloudfront-stack');

const app = new cdk.App();

// new WafStack(app, "WafStack", {
//   env: { account: process.env.AWS_ACCOUNT_ID, region: process.env.WAF_REGION },
// });

new CloudFrontStack(app, "FunFindrStack", {
  env: { account: process.env.AWS_ACCOUNT_ID, region: process.env.CLOUDFRONT_REGION },
});