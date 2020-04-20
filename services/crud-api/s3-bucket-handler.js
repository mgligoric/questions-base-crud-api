'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const BUCKET = 'bucket-for-question';
const filePathPrefix_userImage = 'avatars/'
const filePathSufix_userImages = '.jpg'
 
async function putUserImageIntoS3(username, image){
    console.log("Put image S3")
    let encodedImage = image;
    let decodedImage = Buffer.from(encodedImage, 'base64');
    var filePath = filePathPrefix_userImage + username + filePathSufix_userImages
    console.log('Filepath --- > ' + filePath)
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
                //console.log(err)
                reject(err) // this works like throw - your handler will get it
            }
            else{
                console.log("Successfully saved object to " + BUCKET + "/" + filePath);
                resolve(data) // will retur stringified data
            }
        });
      })
    
    return s3UploadResult

}

async function getUserImageFromS3(key){
    console.log("Get image S3")
    var params = {
        "Bucket": BUCKET,
        "Key": key
    };
    
    const s3GetImage = await new Promise((resolve, reject) => {
        s3.getObject(params, function(err, data){
            if (err){
                err.name = "S3 Loading error"
                err.message = "Didn't load image"
                //console.log(err)
                reject(err) // this works like throw - your handler will get it
            }
            else{
                //console.log("Successfully gets object from " + BUCKET + "/" + filePath);
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