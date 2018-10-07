'use strict'

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const shape = require('shape-json');

const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.list = (event, context, callback) => {
  const params = {
    TableName: process.env.USERACTIONS_DYNAMODB_TABLE
  }

  // fetch action from the database
  dynamoDb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error)
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the action items.'
      })
      return;
    }
    console.log("result from ddb", result.Items);
    // const finalResult = result.Items;
    // console.log("finalresult", finalResult);    

    // //Transforming the response, to be refactored into a separate class
    // var users = [];
    // for (let i=0; i < resultLength; i+=1){
    //   //let index = result.Items[i];
    //   //console.log("index", index)
    //   users.push(result.Items[i].username);
    // }
    // console.log(" users", users);
    // var distinctUsers = new Set(users)
    // console.log("distinct users", distinctUsers);

      //   let outputResponse = [];
  //   for (let i=o; i < resultLength; i+=1){
  //     for (let j=o; j < distinctUsers.length; j+=1){
  //        if (finalResult[i].username === distinctUsers[j]){
  //         let userAction = {
  //           user: distinctUsers[j],

  //         } 
  //         outputResponse.push
  //        }
  //   }
  // }

    const scheme = {
      "$group[userActions](username)": {
      "username": "username",
      "email": "email",
      "zipcode": "zipcode",      
      "$group[actionsTaken](createdAt)": {
        "actionTaken": "actionTaken",
        "recordedFrequency": "recordedFrequency",
        "pointsEarned": "pointsEarned",
        "carbonPointsEarned": "carbonPointsEarned",
        "createdAt": "createdAt",
        "date": "date"
        },
      "totalPoints": "totalPoints",
      "totalCarbonPoints":"totalCarbonPoints"
      }
    };
    const parsedResult = shape.parse(result.Items, scheme);
    console.log("hierarchical resultset", JSON.stringify(parsedResult.userActions));// todo-divya test with empty data

  //   {  
  //     "userAction":[  
  //        {  
  //           "username":"divya17",
  //           "email":"abc@gmail.com",
  //           "zipcode":"03054",
  //           "actionsTaken":[  
  //              {  
  //                 "actionTaken":"save-water",
  //                 "recordedFrequency":2,
  //                 "pointsEarned":5,
  //                 "carbonPointsEarned":10000
  //              },
  //              {  
  //                 "actionTaken":"no-straws",
  //                 "recordedFrequency":2,
  //                 "pointsEarned":5,
  //                 "carbonPointsEarned":10000
  //              },
  //              {  
  //                 "actionTaken":"no-plastic",
  //                 "recordedFrequency":2,
  //                 "pointsEarned":5,
  //                 "carbonPointsEarned":10000
  //              }
  //           ]
  //        },
  //        {  
  //           "username":"divya16",
  //           "email":"abc@gmail.com",
  //           "zipcode":"03054",
  //           "actionsTaken":[  
  //              {  
  //                 "actionTaken":"no-straws",
  //                 "recordedFrequency":2,
  //                 "pointsEarned":5,
  //                 "carbonPointsEarned":10000
  //              },
  //              {  
  //                 "actionTaken":"no-plastic",
  //                 "recordedFrequency":2,
  //                 "pointsEarned":5,
  //                 "carbonPointsEarned":10000
  //              },
  //              {  
  //                 "actionTaken":"save-water",
  //                 "recordedFrequency":2,
  //                 "pointsEarned":5,
  //                 "carbonPointsEarned":10000
  //              }
  //           ]
  //        }
  //     ]
  //  }


    const {userActions} = parsedResult;
    const userActionsLength = userActions.length;
    const newUserActions = [];
    console.log("userActionsLength", userActionsLength)
    if (userActionsLength > 0){
      console.log ("entering  loop to calculate total scores for each user")
      let count = 0;
      for (let i=0; i < userActionsLength; i+=1){
        count +=1;
        console.log("count", count)
        const newUserAction = userActions[i];
        const {actionsTaken} = userActions[i];
        let score = 0;
        let carbonScore = 0;
        for(let act =0; act < actionsTaken.length; act+=1){ 
          score += actionsTaken[act].pointsEarned;
          carbonScore += actionsTaken[act].carbonPointsEarned;
        }
        // userAction.totalPoints = score;
        newUserAction.totalPoints = score;
        newUserAction.totalCarbonPoints = carbonScore;
        console.log("newUserAction", newUserAction);
        newUserActions.push(newUserAction);
      }
    }
    console.log("final response", newUserActions);


    // create a response
    const response = {
      statusCode: 200,
      body: (newUserActions)
    }
    callback(null, response)
  })
}
