/**
 * Route: GET /user
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const moment = require('moment');
const uuidv4 = require('uuid/v4');
const authorizer = require('./authorizer.js');
const util = require('./util.js');
const s3 = require('./s3-bucket-handler.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "user";

exports.handler = async (event) => {
    try {
        console.log('Get user')
        const token = event.headers.Authorization.replace("Bearer ", "");
        const userObj = await authorizer.getUserFromToken(token);

        let params = {
            TableName: tableName,
            Key: {
                'user_id' : userObj
            },
            KeyConditionExpression: '#user_id = :user_id',
            ExpressionAttributeNames:{
                '#user_id' : 'user_id'
            },
            ExpressionAttributeValues:{
                ":user_id" : userObj
            },
        };

        retData = await dynamodb.query(params).promise()
        if (retData.image){
             retData.image = await s3.getUserImageFromS3(retData.image)
        }

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(retData)//JSON.stringify(item)
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