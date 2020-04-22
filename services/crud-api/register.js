/**
 * Route: POST /question
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const uuidv4 = require('uuid/v4');
const util = require('./util.js');
const s3 = require('./s3-bucket-handler.js');
const crypto = require('./crypt')

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "user";
const sanitizer = require('./sanitizer')
const authHeaders = require('./auth-headers')

//TODO DODATI PROVERU DAL LI TAKAV MEJL VEC POSTOJI USERNAME MORA BITI JEDINSTVENO !!!
exports.handler = async (event, context, callback) => {
    try {
        let item = JSON.parse(event.body).Item;
        item.username = sanitizer.sanitizeString(item.username)
        item.password = sanitizer.sanitizeString(item.password)
        item.email = sanitizer.sanitizeString(item.email)
        if (!item.username || !item.password || !item.email){
            let err = {}
            err.name = "ValidationException"
            err.message = "Missing expected values while process of registration"
            throw err
        }
        if (!item.type){
            let err = {}
            err.name = "ValidationException"
            err.message = "Missing user type"
            throw err
        }
        if (item.type != 'Professor' && item.type != 'Student'){
            let err = {}
            err.name = "ValidationException"
            err.message = "Type of user - wrong format"
            throw err
        }


        let paramsUsername = {
            TableName: tableName,
            IndexName : 'user-username-index',
            KeyConditionExpression: '#un = :un',
            ExpressionAttributeNames:{
                '#un' : 'username'
            },
            ExpressionAttributeValues:{
                ":un" : item.username
            },
        };

        let retData = await dynamodb.query(paramsUsername).promise()
        if (retData.Items && retData.Items[0]){
            util.logger.error('Username - ' + item.username + ' already exists')
            let err = {}
            err.name = 'User exists'
            err.message = 'User with that username already exists'
            throw err
        }

        let paramsEmail = {
            TableName: tableName,
            IndexName : 'email-index',
            KeyConditionExpression: '#e = :e',
            ExpressionAttributeNames:{
                '#e' : 'email'
            },
            ExpressionAttributeValues:{
                ":e" : item.email
            },
        };

        retData = await dynamodb.query(paramsEmail).promise()

        if (retData.Items && retData.Items[0]){
            util.logger.error('Email - ' + item.email + ' already exists')
            let err = {}
            err.name = 'User exists'
            err.message = 'User with that email already exists'
            throw err
        }

        const saltRounds = 10;
        const myPlaintextPassword = item.password;
        item.password  = await crypto.hashPassword(saltRounds,myPlaintextPassword);
        item.user_id = uuidv4()
        if (item.image){
            util.logger.info('Image')
            let s3UploadResult = await s3.putUserImageIntoS3(item.username, item.image) // if in this function is called reject(err) that means that it will be catched by this handler-s catch - bottom of the file -> so you don't need to ask here 
            util.logger.info("s3UploadResult -----" + JSON.stringify(s3UploadResult))
            item.image = s3UploadResult.key
            util.logger.info("url img - " + item.image)
        }

        let data = await dynamodb.put({
            TableName: tableName,
            Item: item
        }).promise();

        item.password = 'Secret'
        return {
            statusCode: 200,
            headers: authHeaders.getResponseHeaders(),
            body: JSON.stringify(item)
        };

    } catch (err) {
        util.logger.error("Error --> " + err);
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