const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fs = require('fs');
const logger_service = require('./logger-service')
let logger = new logger_service.Logger()

const TAG = 'AWS QuestionsAPI'

const getUserId = (headers) => {
    return headers.app_user_id;
}

const getQuestionId = (headers) => {
    return headers.app_question_id;
}

const getResponseHeaders = () => {
    return {
        'Access-Control-Allow-Origin': '*'
    }
}


module.exports = {
    getUserId,
    getResponseHeaders,
    getQuestionId,
    TAG,
    logger
}