const uuid = require('uuid');
const multer = require('multer');
const {multerS3Storage} = require('../utils/s3-config');

const MIME_TYPE = {
    "image/jpg" : 'jpg',
    "image/jpeg" : 'jpeg',
    "image/png" : 'png'
}
const fileUpload = (bucket_path) =>  multer({
    limits : 50000,
    // storage : multer.diskStorage({
    //     destination : (req, file, cb) => {
    //         cb(null, 'uploads/profile/images');
    //     },
    //     filename : (req, file, cb) => {
    //         const ext = MIME_TYPE[file.mimetype];
    //         cb(null, uuid.v1() + '.' + ext);
    //     },
    //     fileFilter : (req, file, cb) => {
    //         const isValid = !!MIME_TYPE[file.mimetype];
    //         let error = isValid ? null : new Error('Invalid mime type')
    //         cb(error, isValid);
    //     }
    // })
    storage : multerS3Storage(bucket_path),
    fileFilter : (req, file, cb) => {
            const isValid = !!MIME_TYPE[file.mimetype];
            let error = isValid ? null : new Error('Invalid mime type')
            cb(error, isValid);
        }
});

module.exports = fileUpload