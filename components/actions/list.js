'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.list = (event, context, callback) => {
	const params = {
		TableName: process.env.ACTIONS_DYNAMODB_TABLE
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

		// create a response
		const response = {
			statusCode: 200,
			// body: result.Items,
			headers: {
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': '*'
			},
			body: JSON.stringify(result.Items)
		}
		callback(null, response)
	})
}
