'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const BUCKET = 'bucket-for-question';
const filePathPrefix_userImage = 'avatars/'
const filePathSufix_userImages = '.jpg'

// module.exports.appendText = text => {
//   return getS3Object(BUCKET, OBJECTKEY).then(data => appendText(data.Body, text)).then(buffer => putS3Object(BUCKET, OBJECTKEY, buffer)).then(() => getSignedUrl(BUCKET, OBJECTKEY));
// };

// function getS3Object(bucket, key) {
//   return S3.getObject({
//     Bucket: bucket,
//     Key: key,
//     ResponseContentType: 'text/plain'
//   })
//     .promise()
//     .then(file => {
//       return file;
//     })
//     .catch(error => {
//       //file not found
//       return putS3Object(bucket, key, '');
//     });
// }

// function appendText(data, text) {
//   if (data === undefined) {
//     return text;
//   }
//   return data.toString('ascii') + '\n' + text;
// }

// function putS3Object(bucket, key, body) {
//   return S3.putObject({
//     Body: body,
//     Bucket: bucket,
//     ContentType: 'text/plain',
//     Key: key
//   }).promise();
// }

// function getSignedUrl(bucket, key) {
//   const params = { Bucket: bucket, Key: key };
//   return S3.getSignedUrl('getObject', params);
// }

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
                console.log(err)
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
                console.log(err)
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