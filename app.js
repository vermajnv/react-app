const express = require('express');
const bodyParser = require('body-parser');
const PlacesRoutes = require('./Routes/places-routes');
const UsersRoutes = require('./Routes/users-routes');

const app = express();

app.use(bodyParser.urlencoded({extended : false}))

app.use('/api/places', PlacesRoutes);
app.use('/api/user', UsersRoutes);

app.use((error, req, res, next) => {
    if(res.headerSent)
    {
        return next(errror)
    }
    res.status(error.code || 500)
    res.json({
        message : error.message || 'Unknown Error Occurred!'
    })
})
app.listen(4000);