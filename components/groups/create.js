'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient()

function validateInput (event) {
  const req = JSON.parse((event.body));
  const { name } = req;
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
      body: 'Couldn\'t create the group item.'
    })
    return
  }

  // TODO add more attributes
  // const params = {
  //   TableName: process.env.DYNAMODB_TABLE_GROUPS,
  //   Item: {
  //     // id: uuid.v1(),
  //     name: dataBody.name, // add more attributes
  //     leader: dataBody.username,
  //     members: dataBody.groupMembers,
  //     zipCode: dataBody.zipCode,
  //     groupType: dataBody.groupType,
  //     groupSubType: dataBody.groupSubType,
  //     description: dataBody.description,
  //     groupAvatar: dataBody.groupAvatar,
  //     createdAt: timestamp,
  //     updatedAt: timestamp
  //   }
  // }

  const createGroupsArray = [];
  const arr = [];
  const members = dataBody.members.split(',');
  console.log("membersArray", members);
    
  for(let i=0; i < members.length; i+=1){
    arr.push({name:members[i]});
  const item = {
    PutRequest : {
        Item : {
          'name': dataBody.name, // add more attributes
          'leader': dataBody.username,
          'members': arr[i].name,
          'zipCode': dataBody.zipCode,
          'groupType': dataBody.groupType,
          'groupSubType': dataBody.groupSubType,
          'description': dataBody.description,
          'groupAvatar': dataBody.groupAvatar,
          'createdDate': timestamp,
          'updatedAt': timestamp

        }
      }
    };
    createGroupsArray.push(item);
  }

  const params = {
    RequestItems : {
      'cis-serverless-backend-groups' : createGroupsArray
    }
  };

  // write the todo to the database
  dynamoDb.batchWrite(params, (err, data) => {
    // handle potential errors
    if (err) {
      console.log('Batch create unsuccessful ...');
      console.error(err, err.stack);
      callback(null, {
        statusCode: err.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the group item.'
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
