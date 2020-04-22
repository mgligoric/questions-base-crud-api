/**
 * Route: GET /user
 */

'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const util = require('./util.js');
const authHeaders = require('./auth-headers')
const s3 = require('./s3-bucket-handler.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "user";

exports.handler = async (event) => {
    try {
        util.logger.info('Get user')
        let user_id = await authHeaders.getUserId(event.headers)

        util.logger.info('User id = ' + user_id)
        let params = {
            TableName: tableName,
            Key: {
                'user_id' : user_id
            },
            KeyConditionExpression: '#user_id = :user_id',
            ExpressionAttributeNames:{
                '#user_id' : 'user_id'
            },
            ExpressionAttributeValues:{
                ":user_id" : user_id
            },
        };

        let retData = await dynamodb.query(params).promise()
        if (retData && retData.Items[0] && retData.Items[0].image){
             util.logger.info('User has an image - ') 
             let imageObjS3 = await s3.getUserImageFromS3(retData.Items[0].image)
             let body = imageObjS3.Body
             util.logger.info(body)
             let buf = Buffer.from(body);
             let base64 = buf.toString('base64')
             retData.image = base64//JSON.parse(imageObjS3).Body//JSON.parse(imageObjS3).Body
        }

        return {
            statusCode: 200,
            headers: authHeaders.getResponseHeaders(),
            body: JSON.stringify(retData)//JSON.stringify(item)
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