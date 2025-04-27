const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const events = new AWS.EventBridge();

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
    log('info', 'Starting cancel disable process', {
      requestId: context.awsRequestId,
      distributionId
    });

    const state = await dynamodb.get({
      TableName: process.env.TABLE_NAME,
      Key: { distributionId }
    }).promise();

    if (!state.Item || state.Item.status !== 'ALARM_TRIGGERED') {
      log('info', 'Cannot cancel disable - either not in progress or too late', {
        requestId: context.awsRequestId,
        distributionId,
        currentState: state.Item?.status || 'no state found'
      });
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Cannot cancel disable - either not in progress or too late'
        })
      };
    }

    log('info', 'Removing EventBridge rule target', {
      requestId: context.awsRequestId,
      distributionId,
      ruleName: process.env.RULE_NAME
    });

    // Remove the EventBridge rule target to prevent the disable Lambda from running
    await events.removeTargets({
      Rule: process.env.RULE_NAME,
      Ids: ['DisableTarget']
    }).promise();

    log('info', 'Disabling EventBridge rule', {
      requestId: context.awsRequestId,
      distributionId,
      ruleName: process.env.RULE_NAME
    });

    // Disable the EventBridge rule
    await events.disableRule({
      Name: process.env.RULE_NAME
    }).promise();

    log('info', 'Updating state to CANCELLED', {
      requestId: context.awsRequestId,
      distributionId
    });

    // Update state
    await dynamodb.update({
      TableName: process.env.TABLE_NAME,
      Key: { distributionId },
      UpdateExpression: 'SET canCancel = :canCancel, status = :status',
      ExpressionAttributeValues: {
        ':canCancel': false,
        ':status': 'CANCELLED'
      }
    }).promise();

    log('info', 'Successfully cancelled disable operation', {
      requestId: context.awsRequestId,
      distributionId
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Disable cancelled successfully'
      })
    };
  } catch (error) {
    log('error', 'Failed to cancel disable operation', {
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