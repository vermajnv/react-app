const express = require("express");
const { check } = require("express-validator");
const fileUpload = require('../middleware/file-upload');
const {
  getPlaceById,
  getUserPlaces,
  createPlace,
  updatePlace,
  deletePlace,
} = require("../controllers/places-controller");

const router = express.Router((req, res, next) => {
  next();
});

router.get("/:pid", getPlaceById);

router.get("/user/:uid", getUserPlaces);

router.post(
  "/",
  fileUpload.single('image'),
  [
    check("title").notEmpty(),
    check("description").isLength({
      min: 5,
    }),
    check("address"),
  ],
  createPlace
);

router.patch(
  "/",
  [
    check("title").notEmpty(),
    check("description").isLength({
      min: 5,
    }),
    check("address"),
  ],
  updatePlace
);

router.delete("/:placeId", deletePlace);

module.exports = router;
