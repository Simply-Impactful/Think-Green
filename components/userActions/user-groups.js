// 'use strict';

// function checkUserExistsInGroup(dynamoDb, username){
//     const groupParams = {
//         TableName: 'cis-serverless-backend-groups'
//       }
    
//       // fetch action from the database
//       dynamoDb.scan(groupParams, (error, groupResult) => {
//         // handle potential errors
//         if (error) {
//           console.error(error)
//           callback(null, {
//             statusCode: error.statusCode || 501,
//             headers: { 'Content-Type': 'text/plain' },
//             body: 'Couldn\'t fetch the action items.'
//           })
//           return false;
//         }
//     }
// }