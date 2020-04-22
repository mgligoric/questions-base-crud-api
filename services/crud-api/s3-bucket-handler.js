'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const BUCKET = 'bucket-for-question';
const filePathPrefix_userImage = 'avatars/'
const filePathSufix_userImages = '.jpg'
const util = require('./util.js')
 
async function putUserImageIntoS3(username, image){
    util.logger.info("Put image S3")
    let encodedImage = image;
    let decodedImage = Buffer.from(encodedImage, 'base64');
    var filePath = filePathPrefix_userImage + username + filePathSufix_userImages
    util.logger.info('Filepath --- > ' + filePath)
    var params = {
        "Body": decodedImage,
        "Bucket": BUCKET,
        "Key": filePath  
    };

    const s3UploadResult = await new Promise((resolve, reject) => {
        s3.upload(params, function(err, data){
            if (err){
                err.name = "S3 Uploading error"
                err.message = "Didn't upload image"
                util.logger.error('Did not upload image')
                reject(err) // this works like throw - your handler will get it
            }
            else{
                util.logger.info("Successfully saved object to " + BUCKET + "/" + filePath);
                resolve(data) // will retur stringified data
            }
        });
      })
    
    return s3UploadResult

}

async function getUserImageFromS3(key){
    util.logger.info("Get image S3")
    var params = {
        "Bucket": BUCKET,
        "Key": key
    };
    
    const s3GetImage = await new Promise((resolve, reject) => {
        s3.getObject(params, function(err, data){
            if (err){
                err.name = "S3 Loading error"
                err.message = "Didn't load image"
                util.logger.error('Did not load image')
                reject(err) // this works like throw - your handler will get it
            }
            else{
                util.logger.info("Successfully gets object from " + BUCKET);
                resolve(data) // will retur stringified data
            }
        });
      })
    
    return s3GetImage
}

module.exports = {
    putUserImageIntoS3,
    getUserImageFromS3
}