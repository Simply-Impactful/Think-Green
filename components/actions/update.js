'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

function ValidateInput(data){
  //TODO add input validation
}

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  // validation
  if (!ValidateInput(data)) {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t update the action item.',
    });
    return;
  }

  const params = {
    TableName: process.env.ACTIONS_DYNAMODB_TABLE,
    Key: {
      name: event.pathParameters.name,
    },
    ExpressionAttributeValues: {
      ':frequencyCadence': data.frequencyCadence,
      ':updatedAt': timestamp,
    },
    UpdateExpression: 'SET frequencyCadence = :frequencyCadence, updatedAt = :updatedAt',
    ReturnValues: 'UPDATED_NEW',
  };

  // update the action in the database
  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the action item.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};
