
const sanitizer = require('./sanitizer')
const jwtFunc = require('./jwt-func.js');
const util = require('./util.js')

async function getUserId(headers){
    util.logger.info('Headers - getUserId')
    const token = sanitizer.sanitizeString(headers.Authorization);
    console.log('1')
    if (!token){
        console.log('1')
        util.logger.info('Not valid token - getUserId')
        let err = {}
        err.name = "ValidationException"
        err.message = "Authorization failure"
        throw err
    }
    console.log('1')
    const userObj = await jwtFunc.getUserFromToken(token);
    userObj.user = sanitizer.sanitizeString(userObj.user)
    if (!userObj.user){
        util.logger.info('Not valid user id - getUserId')
        let err = {}
        err.message = 'User ID error'
        err.name = 'Invalid user ID'
        throw err
    }
    console.log(userObj.user)
    return userObj.user
}

const getQuestionId = (headers) => {
    return headers.question_id;
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
}