const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const User = require('../models/User')
const bcrypt = require('bcrypt');

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
    let identifiedUser;
    try{
        identifiedUser = await User.findOne({ email : email}).select('+password')
        if(!identifiedUser) {
            return next(new HttpError('Could not identify the user, credentials seems to be wrong.'));
        }
        const validPassword = await bcrypt.compare(password, identifiedUser.password);
        if(!validPassword) {
            return next(new HttpError('Could not identify the user, Invalid password.'));
        }
    }
    catch (err)
    {
        return next(new HttpError(err, 500))
    }

    identifiedUser.toObject({ getters : true});
    identifiedUser.password = undefined;
    res.status(200).json({
        user : identifiedUser,
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
        places : []
    });
    let newUser;
    try {
        newUser = await createdUser.save();
    }
    catch (err)
    {
        return next(new HttpError(err, 500));
    }
    newUser.password = undefined;
    res.status(201).json({user : newUser})
}