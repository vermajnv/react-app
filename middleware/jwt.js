const jwt = require('jsonwebtoken');

const generateWebToken = (user) => {
    try
    {
        return jwt.sign({ id : user.id, email : user.email}, process.env.PRIVATE_KEY, { expiresIn : process.env.JWT_EXP_IN});
    }
    catch (err)
    {
        throw new Error(err);
    }
}

module.exports = generateWebToken;