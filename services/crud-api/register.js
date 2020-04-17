/**
 * Route: POST /question
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const moment = require('moment');
const uuidv4 = require('uuid/v4');
const util = require('./util.js');
const bcrypt = require('bcrypt');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "user";

// hash the password with the salt
async function hashPassword (saltRounds, password) {  
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) reject(err)
        resolve(hash)
      });
    })
  
    return hashedPassword
  }

//TODO DODATI PROVERU DAL LI TAKAV MEJL VEC POSTOJI
exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
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
        if (item.type != 'P' && item.type != 'S'){
            let err = {}
            err.name = "ValidationException"
            err.message = "Type of user - wrong format"
            throw err
        }

        const saltRounds = 10;
        const myPlaintextPassword = item.password;
        item.password  = await hashPassword(saltRounds,myPlaintextPassword);
        item.user_id = uuidv4()

        let data = await dynamodb.put({
            TableName: tableName,
            Item: item
        }).promise();

        item.password = 'Secret'
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