// External module
const express = require("express");
const storeRouter = express.Router();
const requireGuest = (req, res, next) => {
  if (!req.session.user) return res.redirect("/login");
  if (req.session.user.userType !== "guest") return res.sendStatus(403);
  next();
};

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
storeRouter.get("/bookings", requireGuest, getBookings);
storeRouter.get("/favourites", requireGuest, getFavouriteList);

storeRouter.get("/homes/:homeId", getHomeDetails);

storeRouter.post("/favourites", requireGuest, postAddToFavourite);
storeRouter.post("/favourites/delete/:homeId", requireGuest, postRemoveFromFavourite);

storeRouter.get("/book/:homeId", requireGuest, getBookNowPage);
storeRouter.post("/book/:homeId", requireGuest, postBookNow);
storeRouter.post("/check-availability", checkAvailability);

module.exports = storeRouter;
