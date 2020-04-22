/**
 * Route: POST /login
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const _ = require('underscore');
const util = require('./util.js');
const crypto = require('./crypt');
const jwtFunc = require('./jwt-func')

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "user";

exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
        if (!item.username || !item.password){
            let err = {}
            err.name = "ValidationException"
            err.message = "Missing expected values while process of logging in"
            throw err
        }

        let params = {
            TableName: tableName,
            IndexName: 'user-username-index',
            KeyConditionExpression: '#username = :username',
            ExpressionAttributeNames:{
                '#username' : 'username'
            },
            ExpressionAttributeValues:{
                ":username" : item.username
            },
        };

        retData = await dynamodb.query(params).promise()

        if(!_.isEmpty(retData.Items)){
            util.logger.info('User exists')
            let passwordHash = retData.Items[0].password
            let password = item.password
            let isValidPassword = await crypto.comparePassword(
                password,
                passwordHash
              );
            if (isValidPassword) {
                let user_found = retData.Items[0]
                const token = await jwtFunc.signUserToToken(user_found.user_id)
                util.logger.info('Valid password')

                return Promise.resolve({ auth: true, token: token, status: "SUCCESS" }).then(session => ({
                    statusCode: 200,
                    body: JSON.stringify(session)
                  }))
            }

        }else{
            let err = {}
            err.message = "Username doesn't exists"
            err.name = "Login error"
            throw err
        }


    } catch (err) {
        util.logger.error('Error - ' + err)
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