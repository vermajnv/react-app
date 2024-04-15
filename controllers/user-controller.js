const uuid = require('uuid')
const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const DUMMY_USERS = [
    {
        id : 'u1',
        name : 'Nayan',
        email : 'nayan@gmail.com',
        password : 'nayan@'
    },
    {
        id : 'u2',
        name : 'Golu',
        email : 'golu@gmail.com',
        password : 'nayan@'
    },
    {
        id : 'u3',
        name : 'Prabhat',
        email : 'prabhat@gmail.com',
        password : 'nayan@'
    }
]

exports.getUsers = (req, res, next) => {
    return res.json({
        users : DUMMY_USERS
    })
}

exports.loginUser = (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty())
    {
        return next(new HttpError('Invalid Inputs please check', 422))
    }
    const { email, password} = req.body;

    const identifiedUser = DUMMY_USERS.find((user) => {
        return user.email === email;
    })

    if(!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not identify the user, credentials seems to be wrong.');
    }

    res.status(200).json({
        user : identifiedUser,
        message : 'User logged in'
    });

}

exports.signupUser = (req, res, next) => {
    const error = validationResult(req);
    console.log(error);
    if(!error.isEmpty())
    {
        return next(new HttpError('Invalid Inputs please check', 422))
    }
    const {name, email, password} = req.body;

    const hasUser = DUMMY_USERS.find((user) => user.email === email)

    if(hasUser) {
        throw new HttpError('Could Not create, User already exists', 422)
    }
    const createdUser = {
        id : uuid.v4(),
        name,
        email,
        password
    } 

    DUMMY_USERS.push(createdUser);

    res.status(201).json({user : createdUser})
}