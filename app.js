const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const PlacesRoutes = require('./Routes/places-routes');
const UsersRoutes = require('./Routes/users-routes');
const HttpError = require('./models/http-error');


app.use(express.json())

app.use(bodyParser.urlencoded({extended : true}))

app.use('/api/places', PlacesRoutes);
app.use('/api/user', UsersRoutes);

// URL not found
app.use((req, res, next) => {
    const error = new HttpError('Could not found this route', 404);
    throw error;
})
// Error Handling 
app.use((error, req, res, next) => {
    if(res.headerSent)
    {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({
        message : error.message || 'Unknown Error Occurred!'
    })
})

app.listen(4000);