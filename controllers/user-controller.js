const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const User = require('../models/User')
const bcrypt = require('bcrypt');
const generateWebToken = require('../middleware/jwt');

exports.getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}).exec();
    }
    catch (err)
    {
        return next(new HttpError(err, 500));
    }
    return res.json({
        users : users
    })
}

exports.loginUser = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty())
    {
        return next(new HttpError('Invalid Inputs please check', 422))
    }
    const { email, password} = req.body;
    let identifiedUser, jwt;
    try{
        identifiedUser = await User.findOne({ email : email}).select('+password')
        if(!identifiedUser) {
            return next(new HttpError('Could not identify the user, credentials seems to be wrong.', 422));
        }
        const validPassword = await bcrypt.compare(password, identifiedUser.password);
        if(!validPassword) {
            return next(new HttpError('Could not identify the user, Invalid password.', 422));
        }
        jwt = generateWebToken(identifiedUser);
    }
    catch (err)
    {
        return next(new HttpError(err, 500))
    }

    identifiedUser.toObject({ getters : true});
    identifiedUser.password = undefined;
    res.status(200).json({
        user : identifiedUser,
        token : jwt,
        message : 'User logged in'
    });
}

exports.signupUser = async (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty())
    {
        return next(new HttpError('Invalid Inputs please check', 422))
    }
    const {name, email, password} = req.body;

    const existingUser = await User.findOne({ email : email})
    if(existingUser) {
        return next(new HttpError('Could Not create, User already exists', 422))
    }

    const createdUser = new User({
        name,
        email,
        password,
        image : {
            key : req.file.key,
            location : req.file.location
        },
        places : []
    });
    let newUser, jwt;
    try {
        newUser = await createdUser.save();
        jwt = generateWebToken(newUser);
    }
    catch (err)
    {
        return next(new HttpError(err, 500));
    }
    newUser.password = undefined;
    res.status(201).json({user : newUser, token : jwt, message : 'User registerd successfully'})
}