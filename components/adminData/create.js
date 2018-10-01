'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient() // todo

function validateInput (event) {
  const req = JSON.parse((event.body));
  const name = req[0].type;
  let bool = true; 
    if (name === undefined) {
      console.log('name is undefined');
      bool = false;
   }
   return bool;
 }

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime()
  const dataBody = JSON.parse(event.body)
  console.log(`incoming payload${  dataBody}`)
  if (!validateInput(event)) {
    console.error('Validation Failed')
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t create the admin data item.'
    })
    return
  }

  const createItemsArray = [];
  for(let i=0; i<dataBody.length; i+=1){
  const item = {
    PutRequest : {
        Item : {
            'type' : dataBody[i].type,
            'subType' : dataBody[i].subType,
            'createdDate': timestamp,
            'updatedAt': timestamp

        }
      }
    };
    createItemsArray.push(item);
  }

  const params = {
    RequestItems : {
      'serverless-backend-adminData' : createItemsArray
    }
  };

  // const params = {
  //   TableName: process.env.ADMIN_DATA_DYNAMODB_TABLE,
  //   Item: {
  //     type: data.type,
  //     subType: data.subType,
  //     createdDate: timestamp,
  //     updatedAt: timestamp
  //   }
  // }

  // write the performActions to the database
  dynamoDb.batchWrite(params, (err, data) => {
    // handle potential errors
    if (err) {
      console.log('Batch create unsuccessful ...');
      console.error(err, err.stack);
      callback(null, {
        statusCode: err.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the adminData item.'
      })
      return
    } 
      console.log('Batch create successful ...');
      console.log(data);
      console.log('Logging any unprocessed records ...', data.UnprocessedItems);
    

    // create a response
    const response = {
      statusCode: 200,
      body: (data)
    }
    callback(null, response)
  })
}
