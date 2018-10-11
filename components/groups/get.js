'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies
const shape = require('shape-json');

const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.get = (event, context, callback) => {
  let params = {};
  if (event.queryStringParameters.name){
    params = {
    TableName: process.env.GROUPS_DYNAMODB_TABLE,
    KeyConditionExpression: "#name = :name",
    ExpressionAttributeNames:{
      "#name": "name"
    },
    ExpressionAttributeValues: {
      ":name": event.queryStringParameters.name
    }
  };
} else {
    params = {
    TableName: process.env.GROUPS_DYNAMODB_TABLE,
    KeyConditionExpression: "#members = :members",
    ExpressionAttributeNames:{
      "#members": "members"
    },
    ExpressionAttributeValues: {
      ":members": event.queryStringParameters.members
    }
  };
}

  // fetch action from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error)
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the group item.'
      })
      return
    }

    console.log("result from ddb", result.Items);
    const finalResult = result.Items;

    const scheme = {
      "$group[groups](name)": {
      "name": "name",
      "leader": "leader",
      "description": "description",
      "zipCode": "zipCode",
      "groupAvatar": "groupAvatar",
      "groupSubType":"groupSubType",
      "groupType":"groupType",
      "createdDate": "createdDate",
      "updatedAt":"updatedAt",
      "$group[members](members)": {
        "member": "members",
        "pointsEarned": "pointsEarned"
        }
      }
    };
    const parsedResult = shape.parse(finalResult, scheme);
    console.log("hierarchical resultset", JSON.stringify(parsedResult.groups));// todo-divya test with empty data


    // create a response
    const response = {
      statusCode: 200,
      body: (parsedResult.groups)
    }
    callback(null, response)
  })
}
