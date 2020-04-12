/**
 * Route: POST /question
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
        let item = JSON.parse(event.body).Item;
        item.professor_id = util.getUserId(event.headers)
        if(!item.professor_id){
            let err = {}
            err.name = "ValidationException"
            err.message = "Authorization failure"
            throw err
        }
        item.question_id = item.professor_id + ':' + uuidv4()
        item.timestamp = moment().unix() + '';
        item.points = parseInt(item.points)

        let data = await dynamodb.put({
            TableName: tableName,
            Item: item
        }).promise();
        
        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(item)
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