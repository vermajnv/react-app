const express = require('express');
const { getUsers, loginUser, signupUser } = require('../controllers/user-controller');

const router = express.Router();

router.get('/', getUsers); 

router.post('/login', loginUser);

router.post('/signup', signupUser)

module.exports = router;