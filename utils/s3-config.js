const multerS3 = require('multer-s3');
const {S3Client} = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    credentials : {
        accessKeyId : process.env.AWS_ACCESS_KEY,
        secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY
    },
    region : 'ap-south-1'
});

const multerS3Storage = multerS3({
    s3 : s3Client,
    bucket : process.env.S3_BUCKET,
    metadata : function(req, file, cb) {
        cb(null, { fieldName : file.fieldname})
    },
    key : function(req, file, cb) {
        const fileName = Date.now().toString() + "_" + file.fieldname + "_" + file.originalname;
        cb(null, fileName);
    }
});

const s3BaseUrl = () => {
    return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`
}
module.exports = {s3Client, multerS3Storage, s3BaseUrl}