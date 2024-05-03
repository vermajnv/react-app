const fs = require('fs');
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const getCoordinatesFromAddress = require("../utils/location");
const Place = require("../models/Place");
const mongoose = require("mongoose");
const User = require("../models/User");
const {s3BaseUrl, deleteObject} = require('../utils/s3-config');

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
    userPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  if (!userPlaces) {
    return next(new HttpError("Could not find place for the provided id", 404));
  }


  res.json({
    message: "Success",
    userPlaces: userPlaces.places.map((place) =>
      place.toObject({ getters: true })
    )
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
  console.log(req.file);
  const place = {
    title: title,
    description: description,
    location: coordinates,
    image: {
      location : req.file.location,
      key : req.file.key
      },
    address: address,
    creator: creator,
  };
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!user) {
    return next(new HttpError("Creating place failed. User not exist", 404));
  }

  const createPlace = new Place(place);
  try {
    const ses = await mongoose.startSession();
    ses.startTransaction();
    await createPlace.save({ session: ses });
    user.places.push(createPlace);
    await user.save({ session: ses });
    await ses.commitTransaction();
  } catch (err) {
    return next(new HttpError(err, 500));
  }
  return res.status(201).json({ place: place });
};

exports.updatePlace = async (req, res, next) => {
  const { placeId, title, description } = req.body;
  let place;
  try {
    place = await Place.findById(placeId);
    if (!place) {
      return next(new HttpError("Place not found", 404));
    }

    place.title = title;
    place.description = description;
    await place.save();
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

exports.deletePlace = async (req, res, next) => {
  const placeId = req.params.placeId;
  let place;
  let placeImagePath;
  try {
    place = await Place.findById(placeId).populate("creator");
    placeImagePath = place.image;
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  if (!place) {
    return next(new HttpError("No place found.", 404));
  }

  try {
    const ses = await mongoose.startSession();
    ses.startTransaction();

    deletedPlace = await Place.findOneAndDelete(
      { _id: mongoose.Types.ObjectId.createFromHexString(placeId) },
      { session: ses }
    );
    place.creator.places.pull(place);
    await place.creator.save({ session: ses });

    ses.commitTransaction();
  } catch (err) {
    return next(new HttpError(err, 500));
  }
  deleteObject(process.env.S3_BUCKET, place.image.key);

  res.status(200).json({ message: "Place deleted successfully." });
};
