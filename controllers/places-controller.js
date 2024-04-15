const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator')
const uuid = require('uuid')

let DUMMY_PLACES = [
    {
        id : 'p1',
        title : 'Empire State Building',
        description : 'One of the most famous sky scraper in the world',
        location : {
            lat : 40.7484112,
            long : -74.0680653
        },
        address : '20 W 34th St., New York, NY 10001, United States',
        creator : 'u1'
    },
    {
        id : 'p2',
        title : 'Empire State Building',
        description : 'One of the most famous sky scraper in the world',
        location : {
            lat : 40.7484112,
            long : -74.0680653
        },
        address : '20 W 34th St., New York, NY 10001, United States',
        creator : 'u1'
    }
];

exports.getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const [place] = DUMMY_PLACES.filter((place) => {
        return place.id == placeId;
    })
    if(!place)
    {
        throw new HttpError('Could not find place for the provided id', 404)
    }
    res.json({message : 'success', place : place})
}

exports.getUserPlaces = (req, res, next) => {
    const userId = req.params.uid;
    const userPlaces = DUMMY_PLACES.filter((place) => {
        return place.creator === userId;
    });

    if(!userPlaces.length)
    {
        return next(new HttpError('Could not find place for the provided id', 404))
    }

    res.json({
        message : 'Success',
        userPlaces : userPlaces
    })
}

exports.createPlace = (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty())
    {
        console.log(error);
        return next(new HttpError('error.'), 422)
    }
    const {title, description, coordinates, address, creator} = req.body;
    console.log(req.body);
    const place = {
        id : uuid.v4(),
        title : title,
        description : description,
        location : coordinates,
        address : address,
        creator : creator
    };

    DUMMY_PLACES.push(place);
    res.status(201).json({place : place})
}

exports.updatePlace = (req, res, next) => {
    const {placeId, title, description} = req.body;
    console.log(placeId);
    const place = {...DUMMY_PLACES.find((place) => place.id === placeId)};

    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;
    DUMMY_PLACES[placeIndex] =  updatedPlace;
    res.status(200).json({place : updatedPlace})
}


exports.deletePlace = (req, res, next) => {
    const placeId = req.params.placeId;

    const DUMMY_PLACES = DUMMY_PLACES.filter((place) => place.id !== placeId);
    res.status(200).json({message : 'Place deleted successfully.'})
}