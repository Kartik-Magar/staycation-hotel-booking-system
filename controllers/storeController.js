// local module
const Home = require("../model/home");
const User = require("../model/user");
const mongoose = require("mongoose");
const Booking = require("../model/booking");

// Homepage
const getIndex = async (req, res, next) => {
  try {
    console.log("session value ", req.session);
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
  });
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
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");
  res.render("store/favourite-list", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
  });
};

// Add to favourites
const postAddToFavourite = async (req, res, next) => {
  const homeId = req.body.id;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect(`/homes/${homeId}`);
};

// Remove from favourites
const postRemoveFromFavourite = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  if (user.favourites.includes(homeId)) {
    user.favourites = user.favourites.filter((fav) => fav != homeId);
    await user.save();
  }
  res.redirect(`/homes/${homeId}`);
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
      existingFav = user.favourites.includes(homeId);
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

    if (!checkin || !checkout) {
      return res.status(400).send("Check-in and Check-out dates are required");
    }

    const existingBooking = await Booking.findOne({
      userId,
      homeId,
      $or: [
        {
          startDate: { $lt: new Date(checkout) },
          endDate: { $gt: new Date(checkin) },
        },
      ],
    });

    if (existingBooking) {
      return res.status(400).redirect("/homes");
    }

    const totalDays =
      (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24);
    const home = await Home.findById(homeId);
    const totalPrice = totalDays * home.price;

    const booking = new Booking({
      userId,
      homeId,
      startDate: checkin,
      endDate: checkout,
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
    const existingBooking = await Booking.findOne({
      homeId,
      $or: [
        {
          startDate: { $lt: new Date(checkout) },
          endDate: { $gt: new Date(checkin) },
        },
      ],
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
