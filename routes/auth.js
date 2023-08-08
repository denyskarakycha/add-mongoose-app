const express = require("express");
const { check, body } = require("express-validator");
const bcrypt = require('bcryptjs');

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("User already exists");
          }
        });
      }),
    body("password", "Please enter password > 5 characters.")
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
        console.log(value + "=" + req.body.confirmPassword);
      if (value !== req.body.password) {
        throw new Error("Passwords have to match");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.post(
  "/login",
[
  check("email")
   .isEmail()
    .withMessage("Please enter a valid email."),
    body("password", "Please entered invalid.")
      .isLength({ min: 5 })
      .isAlphanumeric()
],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
