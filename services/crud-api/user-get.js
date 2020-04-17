/**
 * Route: GET /user
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const moment = require('moment');
const uuidv4 = require('uuid/v4');
const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "user";

exports.handler = async (event) => {
    try {
        const token = event.headers.Authorization.replace("Bearer ", "");
        const userObj = await util.getUserFromToken(token);
        

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(userObj)//JSON.stringify(item)
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