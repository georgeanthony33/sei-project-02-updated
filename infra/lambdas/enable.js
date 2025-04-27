const AWS = require('aws-sdk');
const cloudfront = new AWS.CloudFront();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const log = (level, message, context = {}) => {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    requestId: context.requestId || 'unknown',
    distributionId: process.env.DISTRIBUTION_ID,
    ...context
  };
  console.log(JSON.stringify(logEntry));
};

exports.handler = async (event, context) => {
  const distributionId = process.env.DISTRIBUTION_ID;

  try {
    log('info', 'Starting distribution enable process', {
      requestId: context.awsRequestId,
      distributionId
    });

    // Get current state
    const state = await dynamodb.get({
      TableName: process.env.TABLE_NAME,
      Key: { distributionId }
    }).promise();

    if (!state.Item) {
      log('info', 'No state found for distribution', {
        requestId: context.awsRequestId,
        distributionId
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'UNKNOWN',
          canCancel: false
        })
      };
    }

    if (state.Item.status === 'ENABLED') {
      log('info', 'Distribution is already enabled', {
        requestId: context.awsRequestId,
        distributionId
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'ENABLED',
          canCancel: false
        })
      };
    }

    // Update state to ENABLING
    await dynamodb.update({
      TableName: process.env.TABLE_NAME,
      Key: { distributionId },
      UpdateExpression: 'SET #status = :status, #canCancel = :canCancel',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#canCancel': 'canCancel'
      },
      ExpressionAttributeValues: {
        ':status': 'ENABLING',
        ':canCancel': true
      }
    }).promise();

    log('info', 'Updated state to ENABLING', {
      requestId: context.awsRequestId,
      distributionId
    });

    // Get distribution config
    const { DistributionConfig } = await cloudfront.getDistributionConfig({
      Id: distributionId
    }).promise();

    // Enable the distribution
    await cloudfront.updateDistribution({
      Id: distributionId,
      DistributionConfig: {
        ...DistributionConfig,
        Enabled: true
      },
      IfMatch: DistributionConfig.ETag
    }).promise();

    log('info', 'Distribution enabled successfully', {
      requestId: context.awsRequestId,
      distributionId
    });

    // Update state to ENABLED
    await dynamodb.update({
      TableName: process.env.TABLE_NAME,
      Key: { distributionId },
      UpdateExpression: 'SET #status = :status, #canCancel = :canCancel',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#canCancel': 'canCancel'
      },
      ExpressionAttributeValues: {
        ':status': 'ENABLED',
        ':canCancel': false
      }
    }).promise();

    log('info', 'Updated state to ENABLED', {
      requestId: context.awsRequestId,
      distributionId
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'ENABLED',
        canCancel: false
      })
    };
  } catch (error) {
    log('error', 'Failed to enable distribution', {
      requestId: context.awsRequestId,
      distributionId,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    });
    throw error;
  }
};
