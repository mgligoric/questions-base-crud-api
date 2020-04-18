/**
 * Route: POST /question
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const util = require('./util.js');
var jwt = require('jsonwebtoken');
const fs = require('fs');


async function getUserFromToken(token){
  console.log('getUserToken')
  const publicKey = fs.readFileSync('jwtRS256.key.pub')
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, function(err, data){
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

  return decoded
}
function generatePolicyDocument(effect, methodArn) {
    if (!effect || !methodArn) return null;
  
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: methodArn
        }
      ]
    };
  
    return policyDocument;
  }

function generateAuthResponse(principalId, effect, methodArn) {
    const policyDocument = generatePolicyDocument(effect, methodArn);
  
    return {
      principalId,
      policyDocument
    };
}

module.exports.handler = async (event, context, callback) => {
    try {
        console.log("authorizer")
        console.log(event.authorizationToken)

        if (!event.authorizationToken){
            //return callback(null, generateAuthResponse(decoded.user.user_id, "Deny", methodArn));
        }
        const token = event.authorizationToken.replace("Bearer ", ""); 
        //console.log("token -- " + token)
        const methodArn = event.methodArn;

        if (!token || !methodArn){
          console.log("Unauthorized")
          //return callback(null, "Unauthorized");
        }

        const publicKey = fs.readFileSync('jwtRS256.key.pub')
        // verifies token
        const decoded = await getUserFromToken(token)
        console.log("Juhu " + decoded.user)

        if (decoded && decoded.user) {
            return callback(null, generateAuthResponse(decoded.user, "Allow", methodArn));
        } else {
            return callback(null, generateAuthResponse(decoded.user, "Deny", methodArn));
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

module.exports.getUserFromToken = getUserFromToken
