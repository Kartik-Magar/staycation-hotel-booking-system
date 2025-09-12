// external module
const express = require("express");
const hostRouter = express.Router();

// Local module
const {
  getAddHome,
  postAddHome,
  getHostHomes,
  getEditHome,
  postEditHome,
  postDeleteHome,
} = require("../controllers/hostController");

hostRouter.get("/add-home", getAddHome);
hostRouter.post("/add-home", postAddHome);
hostRouter.get("/host-home-list", getHostHomes);
hostRouter.get("/edit-home/:homeId", getEditHome);
hostRouter.post("/edit-home", postEditHome);
hostRouter.post("/delete-home/:homeId", postDeleteHome);
module.exports = hostRouter;
