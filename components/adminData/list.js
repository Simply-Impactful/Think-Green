'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies
const shape = require('shape-json')


const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.list = (event, context, callback) => {
	const params = {
		TableName: process.env.ADMIN_DATA_DYNAMODB_TABLE
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

		const scheme = {
			'$group[type](type)': {
				'type': 'type',
				'createdDate': 'createdDate',
				'updatedAt': 'updatedAt',
				'$group[subType](subType)': {
					'subType': 'subType'
				}
			}
		}
		const parsedResult = shape.parse(result.Items, scheme)
		console.log('hierarchical resultset', JSON.stringify(parsedResult.type))// todo-divya test with empty data

		// create a response
		const response = {
			statusCode: 200,
			// body: (parsedResult.type)
			headers: {
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': '*'
			},
			body: JSON.stringify(parsedResult.type)
		}
		callback(null, response)
	})
}
