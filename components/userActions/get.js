'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// function ValidateInput(data){
//   //TODO add input validation
//   return data;
// }

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.USERACTIONS_DYNAMODB_TABLE,
    Key: {
      username: event.pathParameters.username,
      actionTaken: event.pathParameters.actionTaken
    },
  };

  // fetch performActions from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the performActions item for this user.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
    callback(null, response);
  });
};
