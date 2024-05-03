import { s3Client, GetObjectCommand, PutObjectCommand} from '@aws-sdk/client-s3';
const Jimp = require('jimp');

export const handler = async (event, context, cb) => {
  // TODO implement
  const s3Bucket = event.Records[0].s3.bucket.name;
  const s3Key = event.Records[0].s3.bucket.key;
  const destinationBucket = s3Bucket;
  const destinationKey = `/thumbnails/${s3Key}`
  
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key,
    })
  );
  // const image = s3.getObject({
  //   Bucket : s3Bucket,
  //   Key : s3Key
  // }).promise();
  
  const resizedImage = await Jimp.resize(Body).resize(200).toBuffer();
  
  // await s3.putObject({
  //   Bucket : destinationBucket,
  //   Key : destinationKey,
  //   Body : resizedImage
  // }).promise();
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: destinationBucket,
      Key: destinationKey,
      Body: resizedImage,
    })
  );
  
  cb(null, `Successfully resized ${s3Bucket}/${s3Key} and uploaded to ${destinationBucket}/${destinationKey}`);
};
  // const response = {
  //   statusCode: 200,
  //   body: JSON.stringify('Hello from Lambda!'),
  // };
  // return response;
// };
