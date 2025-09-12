// External module
const express = require("express");
const storeRouter = express.Router();

// Local module
const {
  getHomes,
  getBookings,
  getFavouriteList,
  getIndex,
  getHomeDetails,
  postAddToFavourite,
  postRemoveFromFavourite,
  getBookNowPage,
  postBookNow,
  checkAvailability,
} = require("../controllers/storeController");
// const {getBookings} = require('../controllers/storeController');
// const {getFavouriteList} = require('../controllers/storeController');
// const {getIndex}  = require('../controllers/storeController');
storeRouter.get("/", getIndex);
storeRouter.get("/homes", getHomes);
storeRouter.get("/bookings", getBookings);
storeRouter.get("/favourites", getFavouriteList);

storeRouter.get("/homes/:homeId", getHomeDetails);

storeRouter.post("/favourites", postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", postRemoveFromFavourite);

storeRouter.get("/book/:homeId", getBookNowPage);
storeRouter.post("/book/:homeId", postBookNow);
storeRouter.post("/check-availability", checkAvailability);

module.exports = storeRouter;
