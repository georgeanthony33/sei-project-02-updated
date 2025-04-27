const cdk = require("aws-cdk-lib");
const wafv2 = require("aws-cdk-lib/aws-wafv2");

const { USAGE_RESTRICTIONS } = require('./usage-restrictions')
const INVOCATION_THRESHOLD = USAGE_RESTRICTIONS.INVOCATION_THRESHOLD

class WafStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const wafAcl = new wafv2.CfnWebACL(this, "FunFindrWafAcl", {
      name: "FunFindrWafAcl",
      scope: "CLOUDFRONT",
      defaultAction: { allow: {} },
      visibilityConfig: {
        sampledRequestsEnabled: true,
        cloudWatchMetricsEnabled: true,
        metricName: "FunFindrWafAclMetric",
      },
      rules: [
        {
          name: "RateLimitRule",
          priority: 1,
          action: { block: {} },
          visibilityConfig: {
            sampledRequestsEnabled: true,
            cloudWatchMetricsEnabled: true,
            metricName: "RateLimitMetric",
          },
          statement: {
            rateBasedStatement: {
              limit: INVOCATION_THRESHOLD.INDIVIDUAL_IP.COUNT,
              evaluationWindowSec: (
                  INVOCATION_THRESHOLD.INDIVIDUAL_IP.PERIOD_IN_MINS
                  * 60
              ),
              aggregateKeyType: "IP",
          }
          },
        },
      ],
    });

    this.wafArn = wafAcl.attrArn
  }
}

module.exports = { WafStack };
