/**
 * Route: GET /user
 */

'use strict';

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
        console.log('User id = ' + userObj.user)
        let params = {
            TableName: tableName,
            Key: {
                'user_id' : userObj.user
            },
            KeyConditionExpression: '#user_id = :user_id',
            ExpressionAttributeNames:{
                '#user_id' : 'user_id'
            },
            ExpressionAttributeValues:{
                ":user_id" : userObj.user
            },
        };

        let retData = await dynamodb.query(params).promise()
        if (retData && retData.Items[0] && retData.Items[0].image){
             console.log('User has an image - ') 
             let imageObjS3 = await s3.getUserImageFromS3(retData.Items[0].image)
             let body = imageObjS3.Body
             console.log(body)
             let data = imageObjS3.Body.data
             console.log('d - ' + data)
             let buf = Buffer.from(body);
             let base64 = buf.toString('base64')
             retData.image = base64//JSON.parse(imageObjS3).Body//JSON.parse(imageObjS3).Body
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