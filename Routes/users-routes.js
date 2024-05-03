const express = require('express');
const {check} = require('express-validator');
const { getUsers, loginUser, signupUser } = require('../controllers/user-controller');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', getUsers); 

router.post('/login', [
    check('email')
        .isEmail(),
    check('password')
        .notEmpty()
], loginUser);

router.post('/signup', 
    fileUpload(process.env.USER_IMAGE_PATH).single('image'),
    [
        check('name')
            .notEmpty(),
        check('email')
            .normalizeEmail()
            .isEmail(),
        check('password')
            .isLength({ min : 6})
    ],signupUser)

module.exports = router;