const AWS = require('aws-sdk');
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
  const message = JSON.parse(event.Records[0].Sns.Message);
  const distributionId = process.env.DISTRIBUTION_ID;
  const timestamp = new Date().toISOString();

  try {
    log('info', 'Processing alarm notification', { 
      requestId: context.awsRequestId,
      message,
      timestamp 
    });

    // Record alarm state in DynamoDB
    await dynamodb.put({
      TableName: process.env.TABLE_NAME,
      Item: {
        distributionId: distributionId,
        status: 'ALARM_TRIGGERED',
        message,
        timestamp: timestamp,
        scheduledDisable: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        canCancel: true
      }
    }).promise();

    log('info', 'Successfully recorded alarm state', {
      requestId: context.awsRequestId,
      distributionId,
      scheduledDisable: new Date(Date.now() + 3600000).toISOString()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Alarm triggered. Distribution will be disabled in 1 hour. Use the cancel-cleanup Lambda to prevent disable if needed.'
      })
    };
  } catch (error) {
    log('error', 'Failed to process alarm notification', {
      requestId: context.awsRequestId,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    });
    throw error;
  }
}; 