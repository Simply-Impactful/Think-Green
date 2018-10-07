'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

// function ValidateInput(data){
//   //TODO add input validation
//   return data;
// }

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: process.env.USERACTIONS_DYNAMODB_TABLE,
    KeyConditionExpression: "#user = :username",
    ExpressionAttributeNames:{
      "#user": "username"
    },
    ExpressionAttributeValues: {
      ":username": event.pathParameters.username
    }
  };

  // fetch performActions from the database
  dynamoDb.query(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error)
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the userActions item for this user.'
      })
      return
    }
    console.log("starting computation", result.Items);
    const finalResult = result.Items;
        
  let score = 0;
  let carbonScore = 0;
  const resultLength = finalResult.length;
    if (resultLength > 0){
      console.log ("entering  loop to calculate scores")
    for (let i=0; i < result.Items.length; i+=1){
      score += result.Items[i].pointsEarned;
      carbonScore += result.Items[i].carbonPointsEarned;
     }
     finalResult.push({totalPoints: score});
     finalResult.push({totalCarbonPoints: carbonScore});
    }
    console.log("final response", finalResult);

    // create a response
    const response = {
      statusCode: 200,
      body: (finalResult)
    }
    callback(null, response)
  })
}
