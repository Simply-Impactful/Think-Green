// 'use strict'

// const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

// AWS.config.update({ accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, region: process.env.AWS_REGION });

// const lambda = new AWS.lambda({region: 'us-east-1', apiVersion: '2015-03-31'});

// var pullParams = {
//   FunctionName : 'listActions',
//   InvocationType : 'RequestResponse',
//   LogType : 'None'
// };

// lambda.invoke(pullParams, function(err, data) {
//     if (err) {
//       console.log(err);
//     } else {
//       var pullResults = JSON.parse(data.Payload);
//       console.log(pullResults);
//     }
//   )};


// //   // fetch action from the database
// //   dynamoDb.scan(params, (error, result) => {
// //     // handle potential errors
// //     if (error) {
// //       console.error(error)
// //       callback(null, {
// //         statusCode: error.statusCode || 501,
// //         headers: { 'Content-Type': 'text/plain' },
// //         body: 'Couldn\'t fetch the action items.'
// //       })
// //       return
// //     }

// //     // create a response
// //     const response = {
// //       statusCode: 200,
// //       body: result.Items
// //     }
// //     callback(null, response)
// //   })
// // }
