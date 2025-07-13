const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

// Đặt ALLOWED_ORIGIN = 'http://localhost:3000' hoặc lấy từ env
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const requestBody = JSON.parse(event.body);
    const { message } = requestBody;

    if (!message || message.trim() === '') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    const userId = event.requestContext.authorizer.claims.sub;
    const email = event.requestContext.authorizer.claims.email;
    const name = event.requestContext.authorizer.claims.name || email;

    const item = {
      id: uuidv4(),
      userId,
      email,
      name,
      message,
      timestamp: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: tableName,
      Item: item
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Feedback submitted successfully',
        id: item.id
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to submit feedback',
        message: error.message
      })
    };
  }
};
