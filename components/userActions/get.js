'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies
const shape = require('shape-json')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

// function ValidateInput(data){
//   //TODO add input validation
//   return data;
// }

module.exports.get = (event, context, callback) => {
	const params = {
		TableName: process.env.USERACTIONS_DYNAMODB_TABLE,
		KeyConditionExpression: '#user = :username',
		ExpressionAttributeNames:{
			'#user': 'username'
		},
		ExpressionAttributeValues: {
			':username': event.pathParameters.username
		}
	}

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
		console.log('result from ddb', result.Items)
		const finalResult = result.Items

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
		const parsedResult = shape.parse(finalResult, scheme)
		console.log('hierarchical resultset', JSON.stringify(parsedResult.userActions))// todo-divya test with empty data

		let score = 0
		let carbonScore = 0
		const { userActions } = parsedResult
		const newUserActions = []
		const userActionsLength = userActions.length
		if (userActionsLength > 0){
			console.log ('entering  loop to calculate scores')
			const [ userAction ] = userActions
			const { actionsTaken } = userAction
			for (let i=0; i < actionsTaken.length; i+=1){
				score += Number(actionsTaken[i].pointsEarned)
				console.log('logging score', score)
				carbonScore += Number(actionsTaken[i].carbonPointsEarned)
				console.log('logging carbon score', carbonScore)
			}
			userAction.totalPoints = score
			userAction.totalCarbonPoints = carbonScore
			newUserActions.push(userAction)
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
