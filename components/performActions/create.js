'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

function ValidateInput(data){
  //TODO add input validation
}


module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);
  if (!ValidateInput(data)) {
    console.error('Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create the performActions item.',
    });
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE_PERFORM_ACTIONS,
    Item: {
      id: uuid.v1(),
      actionName: data.actionName,
      username: data.Username,
      pointsEarned: data.pointsEarned,
      frequency: data.frequency,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  // write the performActions to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the performActions item.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};
