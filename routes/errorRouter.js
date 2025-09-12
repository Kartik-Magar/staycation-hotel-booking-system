const express = require("express");
const errorRouter = express.Router();

// Local module
const { pageNotFound } = require("../controllers/errors");

errorRouter.use(pageNotFound);

module.exports = errorRouter;
