'use strict'

const AWS = require('aws-sdk')
 
const ses = new AWS.SES()
const myEmail = process.env.EMAIL
const myDomain = process.env.DOMAIN

function generateResponse (code, payload) {
	return {
		statusCode: code,
		headers: {
			'Access-Control-Allow-Origin': myDomain,
			'Access-Control-Allow-Headers': 'x-requested-with',
			'Access-Control-Allow-Credentials': true
		},
		body: JSON.stringify(payload)
	}
}

function generateError (code, err) {
	console.log(err)
	return {
		statusCode: code,
		headers: {
			'Access-Control-Allow-Origin': myDomain,
			'Access-Control-Allow-Headers': 'x-requested-with',
			'Access-Control-Allow-Credentials': true
		},
		body: JSON.stringify(err.message)
	}
}

function generateEmailParams (body) {
	const { firstName, lastName, content, senderEmail } = JSON.parse(body)
	console.log( firstName, lastName, content, senderEmail )
	if (!(firstName && lastName && content && senderEmail)) {
		throw new Error('Missing parameters! Make sure to add parameters \'email\', \'name\', \'content\'.')
	}

	return {
		Source: myEmail,
		Destination: { ToAddresses: [myEmail] },
		ReplyToAddresses: [senderEmail],
		Message: {
			Body: {
				Text: {
					Charset: 'UTF-8',
					Data: `New Message from ItAllAddsUp by ${firstName}  ${lastName} \nContent: ${content}`
				}
			},
			Subject: {
				Charset: 'UTF-8',
				// Data: `You received a message from ${myDomain}!`
				Data: 'You received a message from ItAllAddsUp!'
			}
		}
	}
}

module.exports.send = async (event) => {
	try {
		console.log('email body', JSON.parse(event.body))
		const emailParams = generateEmailParams(event.body)
		const data = await ses.sendEmail(emailParams).promise()
		return generateResponse(200, data)
	} catch (err) {
		return generateError(500, err)
	}
}