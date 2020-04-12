/**
 * Route: GET /question/n/{subscription_id}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const _ = require('underscore');
const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "subscription"

exports.handler = async (event) => {
    try {
        let subscription_id = decodeURIComponent(event.pathParameters.subscription_id);

        let params = {
            TableName: tableName,
            IndexName: "subscription-subscription_id",
            KeyConditionExpression: "subscription_id = :uid",
            ExpressionAttributeValues: {
                ":uid": subscription_id
            },
            Limit: 1,
        };

        let data = await dynamodb.query(params).promise();
        if(!_.isEmpty(data.Items)) {
            return {
                statusCode: 200,
                headers: util.getResponseHeaders(),
                body: JSON.stringify(data.Items[0])
            };
        } else {
            return {
                statusCode: 404,
                headers: util.getResponseHeaders()
            };
        }  
    } catch (err) {
        console.log("Error", err);
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        };
    }
}