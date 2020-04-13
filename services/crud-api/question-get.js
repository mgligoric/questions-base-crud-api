/**
 * Route: GET /question/n/{subscription_id}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const _ = require('underscore');
const util = require('./util.js');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "question"

//TODO vidi kako da se zastitis od sql injection i 
//nemoj da prosledjujes paramatre u query odmah
exports.handler = async (event) => {
    try {
        user_id = util.getUserId(event.headers)
        if(!user_id){
            let err = {}
            err.name = "ValidationException"
            err.message = "Authorization failure"
            throw err
        }
        let indexName = ''
        let query = ''
        let expressionAttributeNames = {}
        let expressionAttributeValues = {}
        let emptyQueryParams = 0
        let notEmptyQuestionIdParam = 0
        let filterExpression = ''
        let firstInFilterExpression = 1
        let params = {}

        if(!event.queryStringParameters){
            console.log('All Empty query params')
            params = {
                TableName:tableName
            };
            emptyQueryParams = 1
        }else if(event.queryStringParameters.question_id){
            console.log('Not Empty question_id param')
            question_id = event.queryStringParameters.question_id
            console.log(question_id)
            params = {
                TableName:tableName,
                Key: {
                    "question_id" : question_id
                },
                KeyConditionExpression: "#q = :question",
                ExpressionAttributeNames: {
                    '#q' : 'question_id'
                },
                ExpressionAttributeValues: {
                    ":question" : question_id
                }
            };
            notEmptyQuestionIdParam = 1
        }
        else{
            console.log('Not Empty query paramters')
            let category = ''
            let timestamp = ''
            let professor_id = ''
            let points = ''

            if (event.queryStringParameters.category){
                category = event.queryStringParameters.category
                if (!points && !timestamp && !professor_id){
                    indexName = 'question-category-index'
                    query = '#category = :category'
                }else{
                    if (firstInFilterExpression){
                        filterExpression = '#category = :category'
                        firstInFilterExpression = 0
                    }else{
                        filterExpression = filterExpression + ' and ' + '#category = :category'
                    }
                }
                expressionAttributeNames['#category'] = 'category'
                expressionAttributeValues[':category'] = category
                console.log('Category - ' + category)
            }

            if (event.queryStringParameters.timestamp){
                timestamp = event.queryStringParameters.timestamp
                if (!category && !points && !professor_id){
                    indexName = 'question-timestamp-index'
                    query = '#timestamp = :timestamp'
                }else{
                    if (firstInFilterExpression){
                        filterExpression = '#timestamp = :timestamp'
                        firstInFilterExpression = 0
                    }else{
                        filterExpression = filterExpression + ' and ' + '#timestamp = :timestamp'
                    }
                }
                expressionAttributeNames['#timestamp'] = 'timestamp'
                expressionAttributeValues[':timestamp'] = timestamp
                console.log('Timestamp - ' + timestamp)
            }

            if (event.queryStringParameters.professor_id){
                professor_id = event.queryStringParameters.professor_id
                if (!category && !timestamp){
                    indexName = 'question-professor_id-index'
                    query = '#professor_id = :professor_id'
                }else{
                    if (firstInFilterExpression){
                        filterExpression = '#professor_id = :professor_id'
                        firstInFilterExpression = 0
                    }else{
                        filterExpression = filterExpression + ' and ' + '#professor_id = :professor_id'
                    }
                }
                expressionAttributeNames['#professor_id'] = 'professor_id'
                expressionAttributeValues[':professor_id'] = professor_id
                console.log('ProfId - ' + professor_id)
            }

            if (event.queryStringParameters.points){
                points = event.queryStringParameters.points
                if (!category && !timestamp && !professor_id){
                    indexName = 'question-points-index'
                    query = '#points = :points'
                }else{
                    if (firstInFilterExpression){
                        filterExpression = '#points = :points'
                        firstInFilterExpression = 0
                    }else{
                        filterExpression = filterExpression + ' and ' + '#points = :points'
                    }
                }
                expressionAttributeNames['#points'] = 'points'
                expressionAttributeValues[':points'] = parseInt(points)
                console.log('Points - ' + points)
            }

        
            params['TableName'] = tableName
            params['IndexName'] = indexName
            params['KeyConditionExpression'] = query
            if (filterExpression){
                params['FilterExpression'] = filterExpression
            }
            params['ExpressionAttributeNames'] = expressionAttributeNames
            params['ExpressionAttributeValues'] = expressionAttributeValues
        }
    
        let retData = {}
        console.log('Params - ')
        console.log(params)
        if (emptyQueryParams){
            console.log('scab')
            retData = await dynamodb.scan(params).promise()
        // }if (notEmptyQuestionIdParam){   --> this for returning only one 
        //     retData = await dynamodb.get(params).promise()
        }else{
            console.log('query')
            retData = await dynamodb.query(params).promise()
        }
        
        console.log('Returned from quering')
        console.log(retData)
        if(!_.isEmpty(retData.Items)){
            return {
                statusCode: 200,
                headers: util.getResponseHeaders(),
                body: JSON.stringify(retData.Items)
            };
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