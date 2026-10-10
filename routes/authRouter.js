const express = require("express");
const authRouter = express.Router();

const authController = require("../controllers/authController");
const { check } = require("express-validator");

authRouter.get("/login", authController.getLogin);
authRouter.post("/login", check("email").normalizeEmail(), authController.postLogin);
authRouter.post("/logout", authController.postLogout);
authRouter.get("/signup", authController.getSignup);
authRouter.post("/signup", authController.postSignup);

module.exports = authRouter;
