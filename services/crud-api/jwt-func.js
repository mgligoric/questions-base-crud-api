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
  
  async function signUserToToken(user_id){
    const privateKey = fs.readFileSync('jwtRS256.key')
    const signed = await new Promise((resolve, reject) => {
        jwt.sign({ user: user_id }, privateKey, { algorithm: 'RS256'} ,function(err, data){
          if (err){
              util.logger.error('Not signed token to user')
              err.name = "JSON verify error"
              err.message = "Not verified"
              reject(err) // this works like throw - your handler will get it
          }
          else{
              resolve(data) // will retur stringified data
          }
      });
    })
  
    return signed
  }

  module.exports.getUserFromToken = getUserFromToken
  module.exports.signUserToToken = signUserToToken