const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const fs = require('fs');

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
    getQuestionId
}