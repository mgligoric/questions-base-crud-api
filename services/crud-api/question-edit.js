/**
 * Route: PATCH /question
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const moment = require('moment');
const uuidv4 = require('uuid/v4');
const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "question";
const sanitizer = require('./sanitizer')
const authHeaders = require('./auth-headers')

exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item
        item.professor_id = await authHeaders.getUserId(event.headers)
        if(!item.professor_id){
            let err = {}
            err.name = "ValidationException"
            err.message = "Authorization failure"
            throw err
        }
        item.question_id = authHeaders.getQuestionId(event.headers)
        let question_id_expected = item.question_id
        item.question_id = question_id_expected

        var params = {
            TableName:tableName,
            Key:{
                "question_id": question_id_expected
            },
            UpdateExpression: "set #text = :t, #answer = :a",
            ExpressionAttributeNames:{
                '#text': 'text',
                '#answer' : 'answer'
            },
            ExpressionAttributeValues:{
                ":t": item.text,
                ":a": item.answer
            },
            ReturnValues:"UPDATED_NEW"
        };
        
        util.logger.info("Updating the item...");
        dynamodb.update(params, function(err, data) {
            if (err) {
                err.error = 'Database error'
                err.message = 'Unable to update item. Error JSON:' +  JSON.stringify(err, null, 2)
                throw err
            } 
        });

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