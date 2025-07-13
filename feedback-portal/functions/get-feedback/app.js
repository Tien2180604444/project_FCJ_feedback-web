const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

// Nên để origin trong biến môi trường hoặc hard-code nếu chỉ 1 domain
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const params = {
      TableName: tableName
    };

    console.log('Scanning DynamoDB table:', tableName);
    const result = await dynamodb.scan(params).promise();
    console.log('Scan result count:', result.Items.length);

    const items = result.Items.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
      },
      body: JSON.stringify({
        items: items,
        count: items.length
      })
    };
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to fetch feedback',
        message: error.message
      })
    };
  }
};
