'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies
const shape = require('shape-json')

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
			return
		}
		console.log('result from ddb', result.Items)

		const scheme = {
			'$group[userActions](username)': {
				'username': 'username',
				'email': 'email',
				'zipcode': 'zipcode',      
				'$group[actionsTaken](createdAt)': {
					'actionTaken': 'actionTaken',
					'recordedFrequency': 'recordedFrequency',
					'pointsEarned': 'pointsEarned',
					'carbonPointsEarned': 'carbonPointsEarned',
					'createdAt': 'createdAt',
					'date': 'date'
				},
				'totalPoints': 'totalPoints',
				'totalCarbonPoints':'totalCarbonPoints'
			}
		}
		const parsedResult = shape.parse(result.Items, scheme)
		console.log('hierarchical resultset', JSON.stringify(parsedResult.userActions))// todo-divya test with empty data

		// sample json response
		//   {  
		//     "userAction":[  
		//        {  
		//     "username":"divya17",
		//     "email":"abc@gmail.com",
		//     "zipcode":"03054",
		//     "actionsTaken":[  
		//        {  
		//           "actionTaken":"save-water",
		//           "recordedFrequency":2,
		//           "pointsEarned":5,
		//           "carbonPointsEarned":10000,
		//           "createdAt":1538939587993,
		//           "date":"2018-10-7 "
		//        },
		//        {  
		//           "actionTaken":"no-straws",
		//           "recordedFrequency":2,
		//           "pointsEarned":5,
		//           "carbonPointsEarned":10000,
		//           "createdAt":1538939603687,
		//           "date":"2018-10-7 "
		//        },
		//        {  
		//           "actionTaken":"no-plastic",
		//           "recordedFrequency":2,
		//           "pointsEarned":5,
		//           "carbonPointsEarned":10000,
		//           "createdAt":1538939614765,
		//           "date":"2018-10-7 "
		//        }
		//     ],
		//     "totalPoints":15,
		//     "totalCarbonPoints":30000
		//  },
		//  {  
		//     "username":"divya16",
		//     "email":"abc@gmail.com",
		//     "zipcode":"03054",
		//     "actionsTaken":[  
		//        {  
		//           "actionTaken":"no-straws",
		//           "recordedFrequency":2,
		//           "pointsEarned":5,
		//           "carbonPointsEarned":10000,
		//           "createdAt":1538939537976,
		//           "date":"2018-10-7 "
		//        },
		//        {  
		//           "actionTaken":"no-plastic",
		//           "recordedFrequency":2,
		//           "pointsEarned":5,
		//           "carbonPointsEarned":10000,
		//           "createdAt":1538939556127,
		//           "date":"2018-10-7 "
		//        },
		//        {  
		//           "actionTaken":"save-water",
		//           "recordedFrequency":2,
		//           "pointsEarned":5,
		//           "carbonPointsEarned":10000,
		//           "createdAt":1538939575793,
		//           "date":"2018-10-7 "
		//        }
		//     ],
		//     "totalPoints":15,
		//     "totalCarbonPoints":30000
		//     }
		//     ]
		//  }


		const {userActions} = parsedResult
		const userActionsLength = userActions.length
		const newUserActions = []
		console.log('userActionsLength', userActionsLength)
		if (userActionsLength > 0){
			console.log ('entering  loop to calculate total scores for each user')
			for (let i=0; i < userActionsLength; i+=1){
				const newUserAction = userActions[i]
				const {actionsTaken} = userActions[i]
				let score = 0
				let carbonScore = 0
				for(let act =0; act < actionsTaken.length; act+=1){ 
					score += Number(actionsTaken[act].pointsEarned)
					carbonScore += Number(actionsTaken[act].carbonPointsEarned)
				}
				// userAction.totalPoints = score;
				newUserAction.totalPoints = score
				newUserAction.totalCarbonPoints = carbonScore
				newUserActions.push(newUserAction)
			}
		}
		console.log('final response', newUserActions)


		// create a response
		const response = {
			statusCode: 200,
			// body: (newUserActions)
			headers: {
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': '*'
			},
			body: JSON.stringify(newUserActions)
		}
		callback(null, response)
	})
}
