'use strict'

const AWS = require('aws-sdk') // eslint-disable-line import/no-extraneous-dependencies
const shape = require('shape-json')

const dynamoDb = new AWS.DynamoDB.DocumentClient()

module.exports.list = (event, context, callback) => {
	const params = {
		TableName: process.env.GROUPS_DYNAMODB_TABLE
	}

	// fetch action from the database
	dynamoDb.scan(params, (error, result) => {
		// handle potential errors
		if (error) {
			console.error(error)
			callback(null, {
				statusCode: error.statusCode || 501,
				headers: { 'Content-Type': 'text/plain' },
				body: 'Couldn\'t fetch the group items.'
			})
			return
		}
		console.log('result from ddb', result.Items)

		const scheme = {
			'$group[groups](name)': {
				'name': 'name',
				'leader': 'leader',
				'description': 'description',
				'zipCode': 'zipCode',
				'groupAvatar': 'groupAvatar',
				'groupSubType': 'groupSubType',
				'groupType': 'groupType',
				'createdDate': 'createdDate',
				'updatedAt': 'updatedAt',
				'totalPoints': 'totalPoints',
				'$group[members](members)': {
					'member': 'members',
					'pointsEarned': 'pointsEarned'
				}
			}
		}
		const parsedResult = shape.parse(result.Items, scheme)
		console.log('hierarchical resultset', JSON.stringify(parsedResult.groups))// todo-divya test with empty data

		const { groups } = parsedResult
		const groupsLength = groups.length
		const newGroups = []
		console.log('groupsLength', groupsLength)
		if (groupsLength > 0) {
			console.log('entering  loop to calculate total scores for each member')
			for (let i = 0; i < groupsLength; i += 1) {
				const newGroup = groups[i]
				const { members } = groups[i]
				let score = 0
				for (let act = 0; act < members.length; act += 1) {
					score += Number(members[act].pointsEarned)
				}
				// userAction.totalPoints = score;
				newGroup.totalPoints = score
				newGroups.push(newGroup)
			}
		}
		console.log('final response', newGroups)



		// sample json response
		// [  
		//    {  
		//       "name":"soccer-team",
		//       "description":"a soccer team",
		//       "groupAvatar":"http://ww.google.com",
		//       "groupSubType":"organization",
		//       "groupType":"non-profit",
		//       "members":[  
		//          {  
		//             "member":"jane",
		//             "createdDate":1538950806988
		//          },
		//          {  
		//             "member":"joe",
		//             "createdDate":1538950806988
		//          },
		//          {  
		//             "member":"john",
		//             "createdDate":1538950806988
		//          }
		//       ]
		//    }
		// ]


		// create a response
		const response = {
			statusCode: 200,
			// body: (newGroups)
			headers: {
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': '*'
			},
			body: JSON.stringify(newGroups)
		}
		callback(null, response)
	})
}
