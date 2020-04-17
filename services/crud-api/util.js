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

async function getUserFromToken(token) {

    const publicKey = fs.readFileSync('jwtRS256.key.pub')
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] })

    return decoded;
}



module.exports = {
    getUserId,
    getResponseHeaders,
    getQuestionId,
    getUserFromToken
}