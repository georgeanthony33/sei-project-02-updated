module.exports = {
  // Resource Names
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'fun-findr-s3-bucket',
  
  // Lambda Configuration
  LAMBDA_CONFIG: {
    RUNTIME: 'NODEJS_18_X',
    TIMEOUT: process.env.LAMBDA_TIMEOUT || 30,
    MEMORY_SIZE: process.env.LAMBDA_MEMORY_SIZE || 128,
  },
  
  // CloudWatch Alarms
  ALARM_CONFIG: {
    THRESHOLD: process.env.ALARM_THRESHOLD || 150,
    EVALUATION_PERIODS: 1,
    DATAPOINTS_TO_ALARM: 1,
    PERIOD: 5, // minutes
  },
  
  // EventBridge Schedule
  DISABLE_SCHEDULE: process.env.DISABLE_SCHEDULE || 'PT1H',
  
  // Email Configuration
  NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL,
  
  // DynamoDB Configuration
  DYNAMODB_CONFIG: {
    BILLING_MODE: 'PAY_PER_REQUEST',
    REMOVAL_POLICY: 'DESTROY',
  }
}; 