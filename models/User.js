const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        uniqe : true,
        validate : {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            }
        },
      message: 'Invalid email address format',
    },
    password : {
        type : String,
        required : true,
        minlength : 6
        // select : false
    },
    image : {
        type : String,
        required : true
    },
    places : [{
        type : mongoose.Types.ObjectId,
        required : true,
        ref : 'Place'
    }]
});

userSchema.pre('save', async function (next) {
    try {
        if(!this.isModified("password"))
        {
            next();
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    }
    catch (err) {
        throw new Error(err)
    }
})

userSchema.post('save', async function (next) {
    try
    {
        console.log('Log after saving the user');
    }
    catch (err) {
        console.log(err);
    }
})
module.exports = mongoose.model('User', userSchema)