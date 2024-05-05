const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
    try 
    {
        console.log(req.headers);
        const token = req.headers.authorization.split(' ')[1]; // Authorization : 'Bearer TOKEN'
    
        if(!token)
        {
            throw new HttpError('Authorization error', 401);
        }

        const decodedToken = jwt.verify(token, process.env.PRIVATE_KEY);
        req.userData = { id : decodedToken.id, email : decodedToken.email};
        next()
    }
    catch (err)
    {
        return next(new HttpError('Authorization error', 401))
    }
}

module.exports = checkAuth;