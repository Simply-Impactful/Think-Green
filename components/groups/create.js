'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient()

function validateInput(event) {
	// const req = JSON.parse((event.body));
	// const { name } = req;
	// let bool = true; 
	//   if (name === undefined) {
	//     console.log('name is undefined');
	//     bool = false;
	//  }
	//  return bool;
	return event
}

module.exports.create = (event, context, callback) => {
	const timestamp = new Date().getTime()
	const dataBody = JSON.parse(event.body)
	console.log(`incoming payload${dataBody}`)
	if (!validateInput(event)) {
		console.error('Validation Failed')
		callback(null, {
			statusCode: 400,
			headers: { 'Content-Type': 'text/plain' },
			body: 'Couldn\'t create the group item.'
		})
		return
	}

	const createGroupsArray = []
	for (let i = 0; i < dataBody.length; i += 1) {
		// const arr = [];
		let members = []
		members = dataBody[i].members.split(' ')
		console.log('membersArray', members)
		for (let abc = 0; abc < members.length; abc += 1) {
			// arr.push({name:members[i]});
			const item = {
				PutRequest: {
					Item: {
						'name': dataBody[i].name,
						'leader': dataBody[i].username,
						'members': members[abc],
						'pointsEarned': dataBody[i].pointsEarned,
						'zipCode': dataBody[i].zipCode,
						'groupType': dataBody[i].groupType,
						'groupSubType': dataBody[i].groupSubType,
						'description': dataBody[i].description,
						'groupAvatar': dataBody[i].groupAvatar,
						'createdDate': timestamp,
						'updatedAt': timestamp

					}
				}
			}
			createGroupsArray.push(item)
		}
	}

	const params = {
		RequestItems: {
			'cis-serverless-backend-groups': createGroupsArray
		}
	}

	// write the todo to the database
	dynamoDb.batchWrite(params, (err, data) => {
		// handle potential errors
		if (err) {
			console.log('Batch create unsuccessful ...')
			console.error(err, err.stack)
			callback(null, {
				statusCode: err.statusCode || 501,
				headers: { 'Content-Type': 'text/plain' },
				body: 'Couldn\'t create the group item.'
			})
			return
		}
		console.log('Batch create successful ...')
		console.log(data)
		console.log('Logging any unprocessed records ...', data.UnprocessedItems)

		// create a response
		const response = {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': '*'
			},
			body: JSON.stringify(data)
		}
		callback(null, response)
	})
}
