/**
 * Route: DELETE /subscription/t/{timestamp}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const moment = require('moment');
const uuidv4 = require('uuid/v4');
const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "subscription";
const sanitizer = require('./sanitizer')
const authHeaders = require('./auth-headers')

exports.handler = async (event) => {
    try {
        let user_id = await authHeaders.getUserId(event.headers)
        let timestamp = parseInt(event.queryStringParameters.timestamp)
        user_id = sanitizer.sanitizeString(user_id)
        if(!user_id || !timestamp){
            util.logger.error('Authorization failure')
            let err = {}
            err.name = "ValidationException"
            err.message = "Authorization failure"
            throw err
        }
        
        let params = {
            TableName: tableName,
            Key: {
                'user_id' : user_id,
                'timestamp' : timestamp
            }
        };

        await dynamodb.delete(params).promise();

        return {
            statusCode: 200,
            headers: authHeaders.getResponseHeaders()
        };
    } catch (err) {
        util.logger.error("Error", err);
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