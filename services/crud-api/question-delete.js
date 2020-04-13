/**
 * Route: DELETE /subscription/t/{timestamp}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const moment = require('moment');
const uuidv4 = require('uuid/v4');
const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "question";

exports.handler = async (event) => {
    try {
        let professor_id = util.getUserId(event.headers)
        if(!professor_id){
            let err = {}
            err.name = "ValidationException"
            err.message = "Authorization failure"
            throw err
        }
        let question_id = event.queryStringParameters.question_id;
        if(!question_id){
            let err = {}
            err.name = "Nothing to delete"
            err.message = "Missing question_id to delete"
            throw err
        }
        let params = {
            TableName: tableName,
            Key: {
                'question_id' : question_id
            },
            ConditionExpression: '#professor_id = :professor_id',
            ExpressionAttributeNames:{
                '#professor_id' : 'professor_id'
            },
            ExpressionAttributeValues:{
                ":professor_id" : professor_id
            },
        };

        await dynamodb.delete(params).promise();

        return {
            statusCode: 200,
            headers: util.getResponseHeaders()
        };
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