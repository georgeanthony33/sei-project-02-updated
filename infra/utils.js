const cdk = require("aws-cdk-lib");
const iam = require('aws-cdk-lib/aws-iam');
const lambda = require('aws-cdk-lib/aws-lambda');
const cloudwatch = require('aws-cdk-lib/aws-cloudwatch');
const path = require('path');

// Common IAM Policy Statements
const policyStatements = {
  dynamoDbAccess: (tableArn) => new iam.PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem'],
    resources: [tableArn]
  }),

  cloudFrontAccess: (distributionArn) => new iam.PolicyStatement({
    actions: ['cloudfront:GetDistribution', 'cloudfront:UpdateDistribution'],
    resources: [distributionArn]
  }),

  eventBridgeAccess: (ruleArn) => new iam.PolicyStatement({
    actions: ['events:RemoveTargets', 'events:DisableRule'],
    resources: [ruleArn]
  }),

  s3PublicRead: (bucketArn) => new iam.PolicyStatement({
    actions: ['s3:GetObject'],
    resources: [`${bucketArn}/*`],
    principals: [new iam.Anyone()]
  })
};

// Resource Naming
const resourceNames = {
  lambda: (name) => `${name}Function`,
  alarm: (name) => `${name}Alarm`,
  topic: (name) => `${name}Topic`,
  table: (name) => `${name}Table`,
  rule: (name) => `${name}Rule`
};

// Lambda Creation Helper
const createLambda = (scope, name, handler, env, config) => {
  return new lambda.Function(scope, resourceNames.lambda(name), {
    runtime: lambda.Runtime[config.RUNTIME],
    handler: `${handler}.handler`,
    code: lambda.Code.fromAsset(path.join(__dirname, 'lambdas')),
    timeout: cdk.Duration.seconds(config.TIMEOUT),
    memorySize: config.MEMORY_SIZE,
    environment: env
  });
};

// CloudWatch Alarm Creation Helper
const createAlarm = (scope, name, metric, config, alarmTopic) => {
  return new cloudwatch.Alarm(scope, resourceNames.alarm(name), {
    metric,
    threshold: config.THRESHOLD,
    evaluationPeriods: config.EVALUATION_PERIODS,
    datapointsToAlarm: config.DATAPOINTS_TO_ALARM,
    comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    alarmDescription: `Alarm when ${name} requests exceed ${config.THRESHOLD} in ${config.PERIOD} minutes`,
    alarmActions: [alarmTopic],
  });
};

module.exports = {
  policyStatements,
  resourceNames,
  createLambda,
  createAlarm
}; 