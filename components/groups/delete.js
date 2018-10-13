'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient()

function validateInput (event) {
	const req = JSON.parse((event.body))       
	const { name, members } = req
	console.log('name is:', name)
	console.log('members are:', members)
	let bool = true 
	if (name === undefined && members === undefined) {
		console.log('name and members are undefined')
		bool = false
	}
	return bool
}

module.exports.delete = (event, context, callback) => {
	const dataBody = JSON.parse(event.body)
	console.log(`incoming payload: ${dataBody}`)
	if (!validateInput(event)) {
		console.error('Validation Failed')
		callback(null, {
			statusCode: 400,
			headers: { 'Content-Type': 'text/plain' },
			body: 'Couldn\'t delete the group item(s).'
		})
		return
	}

	const deleteItemsArray = []
	console.log('membersArray', dataBody.members)   
	let members = dataBody.members
	for(let abc=0; abc < members.length; abc+=1){
		// arr.push({name:members[i]});
		const item = {
			DeleteRequest : {
				Key : {
					'name': dataBody.name
					// 'members': members[abc]
				}
			}
		}
		deleteItemsArray.push(item)
	}

	const params = {
		RequestItems : {
			'cis-serverless-backend-groups' : deleteItemsArray
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
				body: 'Couldn\'t delete the group item.'
			})
			return
		} 
		console.log('Batch create successful ...')
		console.log(data)
		console.log('Logging any unprocessed records ...', data.UnprocessedItems)

		// create a response
		const response = {
			statusCode: 200,
			body: (data)
		}
		callback(null, response)
	})
}
