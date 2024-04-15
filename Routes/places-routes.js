const express = require('express');
const {getPlaceById, getUserPlaces, createPlace, updatePlace, deletePlace} = require('../controllers/places-controller');

const router = express.Router((req, res, next) => {
    next();
})

router.get('/:pid', getPlaceById);

router.get('/user/:uid', getUserPlaces);

router.post('/', createPlace);

router.patch('/', updatePlace);

router.delete('/:placeId', deletePlace);
module.exports = router;


