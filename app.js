const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();

const bodyParser = require('body-parser');

const PlacesRoutes = require('./Routes/places-routes');
const UsersRoutes = require('./Routes/users-routes');
const HttpError = require('./models/http-error');


app.use(express.json())

app.use(bodyParser.urlencoded({extended : true}))

app.use('/uploads/profile/images', express.static(path.join('uploads', 'profile', 'images')));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
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
app.use((error, req, res, next) => {
    if(req.file)
    {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
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

mongoose.connect('mongodb+srv://user_mern:hRmZWcIjXfrJqYO4@cluster0.ci1kzfa.mongodb.net/u_places?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
        app.listen(4000)
    })
    .catch((error) => {
        console.log(error);
    })

