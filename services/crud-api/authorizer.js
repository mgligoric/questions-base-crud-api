/**
 * Route: POST /question
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: 'eu-central-1' });

const util = require('./util.js');
const jwtFunc = require('./jwt-func')

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
        util.logger.info("authorizer")
        console.log(event.authorizationToken)

        if (!event.authorizationToken){
            return callback(null, generateAuthResponse(decoded.user.user_id, "Deny", methodArn));
        }
        const token = event.authorizationToken.replace("Bearer ", ""); 
        const methodArn = event.methodArn;

        if (!token || !methodArn){
          util.logger.warn("Unauthorized");
          return callback(null, "Unauthorized");
        }

        // verifies token
        const decoded = await jwtFunc.getUserFromToken(token)

        if (decoded && decoded.user) {
            return callback(null, generateAuthResponse(decoded.user, "Allow", methodArn));
        } else {
            return callback(null, generateAuthResponse(decoded.user, "Deny", methodArn));
        }

    } catch (err) {
        util.logger.error("Error", err);
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
