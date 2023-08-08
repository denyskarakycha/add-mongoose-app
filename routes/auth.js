const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, {req}) => { // кастом для того щоб створювати свої помилки, от як наприклад створити заборону на якійсь адрес
        if (value === 'test@test.com') {
            throw new Error ('This email forbidden'); 
        }
        return true;
    }),
  body('password', 'Please enter password > 5 characters.')
    .isLength({min: 5})
    .isAlphanumeric(),
  body('confirmPassword').custom((value, {req}) => {
    if (value !== req.body.password) {
        throw new Error('Passwords have to match');
    }
  })
  ],
  authController.postSignup
);

router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
