const axios = require('axios');
const HttpError = require('../models/http-error');
const API_KEY = 'sdfkjdsflghnfrdjk'

const getCoordinatesFromAddress = async (address) => {
    // return {
    //     lat : 45.345656,
    //     long : -44.345646
    // }

    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`);

    const data = response.data;
    console.log(data);
    if(!data || data.status === 'ZERO_RESULTS')
    {
        throw new HttpError('Could not find location for specified address', 422);
    }

    const coordinates = data.results[0].geometory.location;
    return coordinates;
}

module.exports = getCoordinatesFromAddress;