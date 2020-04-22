/**
 * Route: GET /question/n/{subscription_id}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const _ = require('underscore');
const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "subscription"
const authHeaders = require('./auth-headers')

exports.handler = async (event) => {
    try {
        let user_id = await authHeaders.getUserId(event.headers)
        if(!user_id){
            let err = {}
            err.name = "ValidationException"
            err.message = "Authorization failure"
            throw err
        }
        let subject = event.queryStringParameters.subject;

        let params = {
            TableName: tableName,
            IndexName: "subject-index",
            KeyConditionExpression: "subject = :subject",
            ExpressionAttributeValues: {
                ":subject": subject
            }
        };

        let data = await dynamodb.query(params).promise();
        if(!_.isEmpty(data.Items)) {
            return {
                statusCode: 200,
                headers: authHeaders.getResponseHeaders(),
                body: JSON.stringify(data.Items)
            };
        } else {
            return {
                statusCode: 404,
                headers: authHeaders.getResponseHeaders()
            };
        }  
    } catch (err) {
        util.logger.error("Error " + err);
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: authHeaders.getResponseHeaders(),
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        };
    }
}