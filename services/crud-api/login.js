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

async function sign(user_found){
    console.log('user token sign')
    const privateKey = fs.readFileSync('jwtRS256.key')
    const signed = await new Promise((resolve, reject) => {
        jwt.sign({ user: user_found }, privateKey, { algorithm: 'RS256'} ,function(err, data){
          if (err){
              err.name = "JSON verify error"
              err.message = "Not verified"
              reject(err) // this works like throw - your handler will get it
          }
          else{
              //console.log("Successfully saved object to " + BUCKET + "/" + filePath);
              resolve(data) // will retur stringified data
          }
      });
    })
  
    return signed
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
        //console.log(retData)
        if(!_.isEmpty(retData.Items)){
            let passwordHash = retData.Items[0].password
            let password = item.password
            let isValidPassword = await comparePassword(
                password,
                passwordHash
              );
            if (isValidPassword) {
                let user_found = retData.Items[0]
                const privateKey = fs.readFileSync('jwtRS256.key')
                const token = jwt.sign({ user: user_found.user_id }, privateKey, { algorithm: 'RS256'}) // msm da moja funkcija sign - gore i ovo dole isto rade
                console.log('User signed')

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
        //console.log("Error", err);
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