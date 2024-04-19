const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const uuid = require("uuid");
const getCoordinatesFromAddress = require("../utils/location");
const Place = require("../models/Place");
const mongoose = require('mongoose');
const User = require('../models/User')

exports.getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).exec();
  } catch (err) {
    return next(
      new HttpError("Error while getting the place. Please try again", 500)
    );
  }
  if (!place) {
    return next(new HttpError("Could not find place for the provided id", 404));
  }
  res.json({ message: "success", place: place.toObject({ getters: true }) });
};

exports.getUserPlaces = async (req, res, next) => {
  const userId = req.params.uid;
  let userPlaces;
  try {
    userPlaces = await Place.find({ creator: userId });
  } catch (err) {
    return next(
      new HttpError(
        "Error while getting user Places. Please try agan later",
        500
      )
    );
  }

  if (!userPlaces.length) {
    return next(new HttpError("Could not find place for the provided id", 404));
  }

  res.json({
    message: "Success",
    userPlaces: userPlaces.map((place) => place.toObject({ getters: true })),
  });
};

exports.createPlace = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError("Please inter a valid input."), 422);
  }
  const { title, description, address, creator } = req.body;
  let coordinates = "";

  try {
    coordinates = await getCoordinatesFromAddress(address);
  } catch (error) {
    return next(new HttpError(error, 500));
  }
  
  const place = {
    title: title,
    description: description,
    location: coordinates,
    image: "http://localhost:4000/image.jpg",
    address: address,
    creator: creator,
  };
  let user;
  try {
    user = await User.findById(creator);
  }
  catch (err)
  {
    return next(new HttpError('Something went wrong', 500))
  }

  if(!user)
  {
    return next(new HttpError('Creating place failed. User not exist', 404))
  }

  const createPlace = new Place(place);
  try {
    const ses = await mongoose.startSession();
    ses.startTransaction();
    await createPlace.save({ session : ses});
    user.places.push(createPlace)
    await user.save({ session : ses})
    await ses.commitTransaction();
  } 
  catch (err) {
    return next(
      new HttpError(err, 500)
      );
  }
  res.status(201).json({ place: place });
};

exports.updatePlace = async (req, res, next) => {
    const { placeId, title, description } = req.body;
    let place;
    // console.log(placeId);
    try {
        place = await Place.findById(placeId);
        if(!place)
        {
            return next(new HttpError('Place not found', 404));
        }

        place.title = title;
        place.description = description;
        await place.save();
    }
    catch (err) {
        return next(new HttpError(err, 500));
    }

    res.status(200).json({ place: place.toObject({ getters : true})});
};

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.placeId;
    let place;
  try {
    place = await Place.deleteOne({ _id : mongoose.Types.ObjectId.createFromHexString(placeId)});
    console.log(place);
  }
  catch (err) {
    return next(new HttpError(err, 500));
  }
  (place.deletedCount) ? res.status(200).json({ message: "Place deleted successfully." }) : res.status(404).json({ message: "No place found with given id" });
};
