const Home = require("../model/home");
const Booking = require("../model/booking");
const { saveImage, deleteImage } = require("../utils/imageStorage");

const renderHomeForm = (req, res, home = null) => res.render("host/edit-home", {
  home,
  pageTitle: home ? "Edit Your Home Details" : "Add Home to StayCation",
  currentPage: home ? "host-homes" : "addHome",
  editing: Boolean(home),
  isLoggedIn: true,
  user: req.session.user,
});

const getAddHome = (req, res) => renderHomeForm(req, res);

const getEditHome = async (req, res, next) => {
  try {
    const home = await Home.findOne({
      _id: req.params.homeId,
      ownerId: req.session.user._id,
    });
    if (!home) return res.sendStatus(404);
    renderHomeForm(req, res, home);
  } catch (error) { next(error); }
};

const getHostHomes = async (req, res, next) => {
  try {
    const registerHomes = await Home.find({ ownerId: req.session.user._id });
    res.render("host/host-home-list", {
      registerHomes,
      pageTitle: "Your Homes",
      currentPage: "host-homes",
      isLoggedIn: true,
      user: req.session.user,
    });
  } catch (error) { next(error); }
};

function validHome(body) {
  if (typeof body.houseName !== "string" || typeof body.location !== "string") return false;
  if (body.description !== undefined && typeof body.description !== "string") return false;
  const price = Number(body.price);
  const rating = Number(body.rating);
  return body.houseName?.trim() && body.location?.trim() &&
    Number.isFinite(price) && price > 0 &&
    Number.isFinite(rating) && rating >= 0 && rating <= 5;
}

const postAddHome = async (req, res, next) => {
  if (!validHome(req.body) || !req.file) return res.sendStatus(422);
  let photo;
  try {
    photo = await saveImage(req.file);
    await Home.create({
      houseName: req.body.houseName.trim(),
      price: Number(req.body.price),
      location: req.body.location.trim(),
      rating: Number(req.body.rating),
      description: req.body.description?.trim(),
      photo,
      ownerId: req.session.user._id,
    });
    res.redirect("/host/host-home-list");
  } catch (error) {
    if (photo) await deleteImage(photo).catch(console.error);
    next(error);
  }
};

const postEditHome = async (req, res, next) => {
  if (!validHome(req.body)) return res.sendStatus(422);
  try {
    const home = await Home.findOne({ _id: req.body.id, ownerId: req.session.user._id });
    if (!home) return res.sendStatus(404);
    const oldPhoto = home.photo;
    home.houseName = req.body.houseName.trim();
    home.price = Number(req.body.price);
    home.location = req.body.location.trim();
    home.rating = Number(req.body.rating);
    home.description = req.body.description?.trim();
    if (req.file) home.photo = await saveImage(req.file);
    try {
      await home.save();
    } catch (error) {
      if (home.photo !== oldPhoto) await deleteImage(home.photo).catch(console.error);
      throw error;
    }
    if (home.photo !== oldPhoto) await deleteImage(oldPhoto).catch(console.error);
    res.redirect("/host/host-home-list");
  } catch (error) { next(error); }
};

const postDeleteHome = async (req, res, next) => {
  try {
    const home = await Home.findOne({
      _id: req.params.homeId,
      ownerId: req.session.user._id,
    });
    if (!home) return res.sendStatus(404);
    if (await Booking.exists({ homeId: req.params.homeId })) {
      return res.status(409).send("This home has bookings and cannot be deleted");
    }
    await home.deleteOne();
    await deleteImage(home.photo).catch(console.error);
    res.redirect("/host/host-home-list");
  } catch (error) { next(error); }
};

module.exports = {
  getAddHome, postAddHome, getHostHomes, getEditHome, postEditHome, postDeleteHome,
};
