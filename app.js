const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({path : path.join(__dirname, '.env')})


const {deleteObject} = require('./utils/s3-config');

const mongoose = require('mongoose');
const fs = require('fs');


const app = express();

const bodyParser = require('body-parser');


const PlacesRoutes = require('./Routes/places-routes');
const UsersRoutes = require('./Routes/users-routes');
const HttpError = require('./models/http-error');


app.use(express.json())

app.use(bodyParser.urlencoded({extended : true}))

app.use('/social/images', express.static(path.join('social', 'images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
    res.setHeader('Referer-Policy', 'no-referer-when-downgrade')
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    return next();
})

app.use('/api/places', PlacesRoutes);
app.use('/api/users', UsersRoutes);

// URL not found

app.use((req, res, next) => {
    const error = new HttpError('Could not found this route', 404);
    throw error;
})

// Error Handling 
app.use(async (error, req, res, next) => {
    if(req.file)
    {
        deleteObject(req.file.bucket, req.file.key);
    }
    if(res.headerSent)
    {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({
        message : error.message || 'Unknown Error Occurred!'
    })
})

mongoose.connect(process.env.MONGO_END_POINT)
    .then(() => {
        app.listen(process.env.PORT)
    })
    .catch((error) => {
        console.log(error);
    })

