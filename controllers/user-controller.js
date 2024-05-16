const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const User = require('../models/User')
const bcrypt = require('bcrypt');
const generateWebToken = require('../middleware/jwt');
const { OAuth2Client } = require('google-auth-library');

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

exports.socialLogin = async (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Referrer-Policy', 'no-referrer-when-downgrade');

    const redirectUrl = 'http://localhost:4000/api/users/oauth/callback/google';
    let authorizedUrl = '';
    try
    {
        const oAuth2Client = new OAuth2Client (
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        );
    
        authorizedUrl = oAuth2Client.generateAuthUrl({
            access_type : 'offline',
            scope : 'https://www.googleapis.com/auth/userinfo.profile openid',
            prompt : 'consent'
        });
    }
    catch (err)
    {
        console.log(err);
    }

    res.json({
        authorizedUrl
    })
}

exports.socialCallback = async (req, res, next) => {
    const code = req.query.code;
    try {
        const redirectUrl = 'http://localhost:4000/api/users/oauth/callback/google';
        const oAuth2Client = new OAuth2Client (
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            redirectUrl
        );

        const response = await oAuth2Client.getToken(code);

        await oAuth2Client.setCredentials(response.tokens);
        const user = oAuth2Client.credentials;
        console.log('user', user);

        data = await getUserData(user.access_token);
        res.redirect('http://localhost:3000/');
    }
    catch (err)
    {
        console.log('Error while signing in with google', err);
    }
}

async function getUserData(access_token) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);

    const data = await response.json();
    console.log('data', data);
    return data;
}