/**
 * Route: POST /subscription
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
        let item = JSON.parse(event.body).Item;
        item.user_id = await authHeaders.getUserId(event.headers);
        item.user_id = sanitizer.sanitizeString(item.user_id)
        if(!item.user_id){
            let err = {}
            err.name = "ValidationException"
            err.message = "Authorization failure"
            throw err
        }
        item.timestamp = moment().unix();
        item.count = 0
        item.subscription_id = uuidv4() + ''

        let data = await dynamodb.put({
            TableName: tableName,
            Item: item
        }).promise();

        return {
            statusCode: 200,
            headers: authHeaders.getResponseHeaders(),
            body: JSON.stringify(item)
        };
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