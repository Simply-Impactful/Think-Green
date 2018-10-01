'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient()

function validateInput (event) {
 const req = JSON.parse((event.body));
  const { name } = req;
  console.log('name is:', name);
  let bool = true; 
if (name === undefined) {
  console.log('name is undefined');
  bool = false;
  }
  return bool;
}

module.exports.create = (event, context, callback) => {
  console.log(`incoming event body${  JSON.stringify(event.body)}`)
  console.log(`incoming JSON event${  JSON.stringify(event)}`)
  const timestamp = new Date().getTime()
  const data = JSON.parse(event.body)
  console.log(`incoming payload${  data}`)
  if (!validateInput(event)) {
    console.error('Validation Failed')
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create the action item.'
    })
    return
  }

  // TODO add more attributes
  const params = {
    TableName: process.env.ACTIONS_DYNAMODB_TABLE,
    Item: {
      // id: uuid.v1(),
      name: data.name,
      frequencyCadence: data.frequencyCadence,
      eligiblePoints: data.eligiblePoints,
      maxFrequency: data.maxFrequency,
      funFact: data.funFact,
      funFactImageUrl: data.funFactImageUrl,
      tileIconUrl: data.tileIconUrl,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  }

  // write the todo to the database
  dynamoDb.put(params, (error) => {
    console.log('inside the ddb put')
    console.log('params', params)

    // handle potential errors
    if (error) {
      console.error(error)
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the action item.'
      })
      return
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item)
    }
    callback(null, response)
  })
}
