'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies
// const userGroups = require('./user-groups');

const dynamoDb = new AWS.DynamoDB.DocumentClient()

function validateInput (event) {
	const req = JSON.parse((event.body))
	const { username } = req
	let bool = true 
	if (username === undefined) {
		console.log('username is undefined')
		bool = false
	}
	return bool
}

module.exports.create = (event, context, callback) => {
	const date = new Date(Date.now()).toLocaleString().slice(0,9)
	const timestamp = new Date().getTime()
	console.log(`incoming event body${  JSON.stringify(event.body)}`)
	console.log(`incoming JSON event${  JSON.stringify(event)}`)
	const data = JSON.parse(event.body)
	console.log(`incoming payload${  data}`)
	if (!validateInput(event)) {
		console.error('Validation Failed')
		callback(null, {
			statusCode: 400,
			headers: { 'Content-Type': 'text/plain' },
			body: 'Couldn\'t create the performActions item.'
		})
		return
	}

	const params = {
		TableName: process.env.USERACTIONS_DYNAMODB_TABLE,
		Item: {
			username: data.username,
			actionTaken: data.actionTaken,
			email: data.email,
			zipcode: data.zipcode,
			pointsEarned: data.pointsEarned,
			carbonPointsEarned: data.carbonPointsEarned,
			recordedFrequency: data.recordedFrequency,
			createdAt: timestamp,
			updatedAt: timestamp,
			date
		}
	}

	// write the performActions to the database
	dynamoDb.put(params, (error) => {
		// handle potential errors
		if (error) {
			console.error(error)
			callback(null, {
				statusCode: error.statusCode || 501,
				headers: { 'Content-Type': 'text/plain' },
				body: 'Couldn\'t create the performActions item.'
			})
			return
		}

		// Check if user exists in a group yet
		// userGroups.checkUserExistsInGroup(dynamoDb, data.username);

		// create a response
		const response = {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': '*'
			},
			body: JSON.stringify(params.Item)
		}
		callback(null, response)
	})
}