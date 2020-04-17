/**
 * Route: POST /login
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const _ = require('underscore');
const util = require('./util.js');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const fs = require('fs');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "user";

function comparePassword(eventPassword, userPassword) {
    return bcrypt.compare(eventPassword, userPassword);
}
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
        console.log(retData)
        if(!_.isEmpty(retData.Items)){
            let passwordHash = retData.Items[0].password
            let password = item.password
            let isValidPassword = await comparePassword(
                password,
                passwordHash
              );
            if (isValidPassword) {
                const privateKey = fs.readFileSync('jwtRS256.key')
                let user_found = retData.Items[0]
                const token = jwt.sign({ user: user_found }, privateKey, { algorithm: 'RS256'})

                return Promise.resolve({ auth: true, token: token, status: "SUCCESS" }).then(session => ({
                    statusCode: 200,
                    body: JSON.stringify(session)
                  }))
                //   .catch(err => {
                //     console.log({ err });
              
                //     return {
                //       statusCode: err.statusCode || 500,
                //       headers: { "Content-Type": "text/plain" },
                //       body: { stack: err.stack, message: err.message }
                //     };
                //   });
            }

        }else{
            let err = {}
            err.message = "Username doesn't exists"
            err.name = "Login error"
            throw err
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