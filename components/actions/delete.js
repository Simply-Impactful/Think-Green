'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

function validateInput (event) {
  const req = JSON.parse((event.body));       
  const [ reqArray ] = req;
  const { name } = reqArray;
  console.log('name is:', name);
  let bool = true; 
    if (name === undefined) {
      console.log('name is undefined');
      bool = false;
   }
   return bool;
 }

module.exports.delete = (event, context, callback) => {
  const dataBody = JSON.parse(event.body);
  console.log(`incoming payload: ${dataBody}`);
  if (!validateInput(event)) {
    console.error('Validation Failed')
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Couldn\'t delete the action item(s).'
    })
    return
  }

  const deleteItemsArray = [];
  for(let i=0; i<dataBody.length; i+=1){
  const item = {
    DeleteRequest : {
        Key : {
            'name' : dataBody[i].name    
        }
      }
    };
    deleteItemsArray.push(item);
  }

  const params = {
    RequestItems : {
      'cis-serverless-backend-actions' : deleteItemsArray
    }
  };
  
  // delete the action from the database
  dynamoDb.batchWrite(params, (err, data) => {
    // handle potential errors
    if (err) {
      console.log('Batch delete unsuccessful ...');
      console.error(err, err.stack);
      callback(null, {
        statusCode: err.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t remove the action item.'
      })
      return
    } 
      console.log('Batch delete successful ...');
      console.log(data);
      console.log('Logging any unprocessed records ...', data.UnprocessedItems);
    

    // create a response
    const response = {
      statusCode: 200,
      body: ({data})
    }
    callback(null, response)
  });
}
