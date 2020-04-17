/**
 * Route: POST /question
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const util = require('./util.js');
var jwt = require('jsonwebtoken');
const fs = require('fs');


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

exports.handler = async (event, context, callback) => {
    try {
        console.log("authorizer")

        //Ovo postoji vec
        const token = event.authorizationToken.replace("Bearer ", ""); 
        console.log("token -- " + token)
        const methodArn = event.methodArn;

        if (!token || !methodArn){
          console.log("Unauthorized")
          return callback(null, "Unauthorized");
        }

        const publicKey = fs.readFileSync('jwtRS256.key.pub')
        // verifies token
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] })
        console.log("Juhu " + decoded.user_id)

        if (decoded && decoded.user && decoded.user.user_id) {
            return callback(null, generateAuthResponse(decoded.user.user_id, "Allow", methodArn));
        } else {
            return callback(null, generateAuthResponse(decoded.user.user_id, "Deny", methodArn));
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