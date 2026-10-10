// local module
const Home = require("../model/home");
const User = require("../model/user");
const mongoose = require("mongoose");
const Booking = require("../model/booking");
const { parseBookingDates } = require("../utils/bookingDates");

// Homepage
const getIndex = async (req, res, next) => {
  try {
    const registerHomes = await Home.find();
    res.render("store/index", {
      registerHomes,
      pageTitle: "Airbnb Home (Index Here)",
      currentPage: "index",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching homes:", err);
    res.status(500).send("Error fetching homes");
  }
  console.log(req.url, req.method);
};

// Home list
const getHomes = (req, res, next) => {
  Home.find().then((registerHomes) => {
    res.render("store/home-list", {
      registerHomes,
      pageTitle: "Home list",
      currentPage: "home",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  }).catch(next);
  console.log(req.url, req.method);
};

// Bookings page (list of user's bookings)
const getBookings = async (req, res, next) => {
  try {
    const userId = req.session.user._id;

    const bookings = await Booking.find({ userId }).populate("homeId");

    res.render("store/bookings", {
      bookings,
      pageTitle: "My Bookings",
      currentPage: "bookings",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).send("Error fetching bookings");
  }
};

// Favourites list
const getFavouriteList = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id).populate("favourites");
    res.render("store/favourite-list", {
      favouriteHomes: user.favourites.filter(Boolean),
      pageTitle: "My Favourites",
      currentPage: "favourites",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  } catch (error) { next(error); }
};

// Add to favourites
const postAddToFavourite = async (req, res, next) => {
  try {
    const homeId = req.body.id;
    if (!mongoose.Types.ObjectId.isValid(homeId)) return res.sendStatus(400);
    if (!await Home.exists({ _id: homeId })) return res.sendStatus(404);
    await User.updateOne({ _id: req.session.user._id }, { $addToSet: { favourites: homeId } });
    res.redirect(`/homes/${homeId}`);
  } catch (error) { next(error); }
};

// Remove from favourites
const postRemoveFromFavourite = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    if (!mongoose.Types.ObjectId.isValid(homeId)) return res.sendStatus(400);
    await User.updateOne({ _id: req.session.user._id }, { $pull: { favourites: homeId } });
    res.redirect(`/homes/${homeId}`);
  } catch (error) { next(error); }
};

// Home details
const getHomeDetails = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;
    const home = await Home.findById(homeId);

    if (!home) {
      console.log("Home not found");
      return res.redirect("/homes");
    }

    let existingFav = false;
    if (req.session.user) {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      existingFav = Boolean(user?.favourites.some((fav) => fav.toString() === homeId));
    }

    res.render("store/home-detail", {
      home,
      pageTitle: "Home Detail",
      currentPage: "Home",
      existingFav,
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log("Error fetching home details:", err);
    res.status(500).send("Error fetching home details");
  }
};

// Booking form page
const getBookNowPage = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;

    if (!mongoose.Types.ObjectId.isValid(homeId)) {
      return res.status(400).send("Invalid home ID");
    }

    const home = await Home.findById(homeId);

    if (!home) {
      return res.redirect("/homes");
    }

    res.render("store/book-now", {
      home,
      pageTitle: "Book Now",
      currentPage: "book-now",
      isLoggedIn: req.session.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log("Error fetching booking page:", err);
    res.status(500).send("Error fetching booking page");
  }
};

// Handle booking submission
const postBookNow = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const homeId = req.params.homeId;
    const userId = req.session.user._id;
    const { checkin, checkout } = req.body;

    const dates = parseBookingDates(checkin, checkout);
    if (!dates || !mongoose.Types.ObjectId.isValid(homeId)) return res.status(400).send("Invalid dates or home ID");

    const home = await Home.findById(homeId);
    if (!home) return res.sendStatus(404);

    const existingBooking = await Booking.findOne({
      homeId,
      startDate: { $lt: dates.end },
      endDate: { $gt: dates.start },
    });

    if (existingBooking) {
      return res.status(409).send("This home is unavailable for the selected dates");
    }

    const totalPrice = dates.nights * home.price;

    const booking = new Booking({
      userId,
      homeId,
      startDate: dates.start,
      endDate: dates.end,
      totalPrice,
    });

    await booking.save();
    res.redirect("/bookings");
  } catch (err) {
    console.error("Error processing booking:", err);
    res.status(500).send("Error processing booking");
  }
};

const checkAvailability = async (req, res) => {
  const { homeId, checkin, checkout } = req.body;

  try {
    const dates = parseBookingDates(checkin, checkout);
    if (!dates || !mongoose.Types.ObjectId.isValid(homeId)) return res.sendStatus(400);
    if (!await Home.exists({ _id: homeId })) return res.sendStatus(404);
    const existingBooking = await Booking.findOne({
      homeId,
      startDate: { $lt: dates.end },
      endDate: { $gt: dates.start },
    });

    if (existingBooking) {
      return res.json({ available: false });
    }

    return res.json({ available: true });
  } catch (err) {
    console.error("Error checking availability:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Export all functions
module.exports = {
  getIndex,
  getHomes,
  getBookings,
  getFavouriteList,
  getHomeDetails,
  postAddToFavourite,
  postRemoveFromFavourite,
  getBookNowPage,
  postBookNow,
  checkAvailability,
};
