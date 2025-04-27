const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const origins = require("aws-cdk-lib/aws-cloudfront-origins");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const cloudwatch = require("aws-cdk-lib/aws-cloudwatch");
const sns = require("aws-cdk-lib/aws-sns");
const subscriptions = require("aws-cdk-lib/aws-sns-subscriptions");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
const events = require("aws-cdk-lib/aws-events");
const targets = require("aws-cdk-lib/aws-events-targets");
const { LAMBDA_CONFIG, S3_BUCKET_NAME, ALARM_CONFIG, DISABLE_SCHEDULE, NOTIFICATION_EMAIL, DYNAMODB_CONFIG } = require('./constants');
const { policyStatements, resourceNames, createLambda, createAlarm } = require('./utils');

class CloudFrontStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const siteBucket = new s3.Bucket(this, "WebsiteBucket", {
      bucketName: S3_BUCKET_NAME,
      websiteIndexDocument: "index.html",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    siteBucket.addToResourcePolicy(policyStatements.s3PublicRead(siteBucket.bucketArn));

    const distribution = new cloudfront.Distribution(this, "WebsiteDistribution", {
      defaultBehavior: { 
        origin: new origins.S3StaticWebsiteOrigin(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
      },
    });

    const cleanupStateTable = new dynamodb.Table(this, resourceNames.table('CleanupState'), {
      partitionKey: { name: 'distributionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode[DYNAMODB_CONFIG.BILLING_MODE],
      removalPolicy: cdk.RemovalPolicy[DYNAMODB_CONFIG.REMOVAL_POLICY],
    });

    const alarmTopic = new sns.Topic(this, resourceNames.topic('HighUsageAlarm'), {
      displayName: 'High Usage Alarm Topic',
    });
    alarmTopic.addSubscription(new subscriptions.EmailSubscription(NOTIFICATION_EMAIL));

    const notifyLambda = createLambda(this, 'Notify', 'notify', {
      TABLE_NAME: cleanupStateTable.tableName,
      DISTRIBUTION_ID: distribution.distributionId
    }, LAMBDA_CONFIG);

    const disableLambda = createLambda(this, 'Disable', 'disable', {
      TABLE_NAME: cleanupStateTable.tableName,
      DISTRIBUTION_ID: distribution.distributionId,
      BUCKET_NAME: siteBucket.bucketName
    }, LAMBDA_CONFIG);

    const disableRule = new events.Rule(this, resourceNames.rule('DisableCloudFront'), {
      ruleName: 'DisableCloudFrontDistribution',
      schedule: events.Schedule.rate(cdk.Duration.parse(DISABLE_SCHEDULE)),
      targets: [new targets.LambdaFunction(disableLambda)]
    });
    const cancelLambda = createLambda(this, 'CancelDisable', 'cancel', {
      TABLE_NAME: cleanupStateTable.tableName,
      DISTRIBUTION_ID: distribution.distributionId,
      RULE_NAME: disableRule.ruleName
    }, LAMBDA_CONFIG);

    const enableLambda = createLambda(this, 'Enable', 'enable', {
      TABLE_NAME: cleanupStateTable.tableName,
      DISTRIBUTION_ID: distribution.distributionId
    }, LAMBDA_CONFIG);

    [notifyLambda, disableLambda, cancelLambda, enableLambda].forEach(lambda => {
      lambda.addToRolePolicy(policyStatements.dynamoDbAccess(cleanupStateTable.tableArn));
    });
    [disableLambda, enableLambda].forEach(lambda => {
      lambda.addToRolePolicy(policyStatements.cloudFrontAccess(
        `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`
      ));
    });
    cancelLambda.addToRolePolicy(policyStatements.eventBridgeAccess(
      `arn:aws:events:${this.region}:${this.account}:rule/${disableRule.ruleName}`
    ));

    alarmTopic.addSubscription(new subscriptions.LambdaSubscription(notifyLambda));

    const s3RequestsMetric = new cloudwatch.Metric({
      namespace: 'AWS/S3',
      metricName: 'AllRequests',
      dimensionsMap: { BucketName: siteBucket.bucketName },
      statistic: 'Sum',
      period: cdk.Duration.minutes(ALARM_CONFIG.PERIOD),
    });

    const cloudfrontRequestsMetric = new cloudwatch.Metric({
      namespace: 'AWS/CloudFront',
      metricName: 'Requests',
      dimensionsMap: {
        DistributionId: distribution.distributionId,
        Region: 'Global',
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(ALARM_CONFIG.PERIOD),
    });

    createAlarm(this, 'S3HighUsage', s3RequestsMetric, ALARM_CONFIG, alarmTopic);
    createAlarm(this, 'CloudFrontHighUsage', cloudfrontRequestsMetric, ALARM_CONFIG, alarmTopic);

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("./build")],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: distribution.distributionDomainName,
    });
    new cdk.CfnOutput(this, "CancelDisableLambda", {
      value: cancelLambda.functionName,
      description: "Use this Lambda to cancel the disable if needed"
    });
  }
}

module.exports = { CloudFrontStack };
