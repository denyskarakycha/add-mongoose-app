const User = require("../models/user");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport(
  smtpTransport({
    host: "mail.smtp2go.com",
    port: 2525,
    auth: {
      user: "node-shop",
      pass: "eSesZqoZUntf3Q6p",
    },
  })
);

exports.getLogin = async (req, res, next) => {
  let message = req.flash("error");
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationError: [],
  });
};

exports.getSignup = async (req, res, next) => {
  let message = req.flash("error");
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationError: [],
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationError: errors.array(),
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      cart: { item: [] },
    });
    await user.save();
    res.redirect("/login");
    return transporter.sendMail({
      from: "denys.karakycha@gmail.com",
      to: email,
      subject: "Successfully",
      html: `
      <h1>You have registered</h1>
      `,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationError: errors.array(),
    });
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "Invalid email");
      return res.redirect("/login");
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      req.session.user = user;
      req.session.isLoggedIn = true;
      return req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    }
    req.flash("error", "Invalid password");
    return res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getReset = async (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset",
    errorMessage: message,
  });
};

exports.postReset = async (req, res, next) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
        return res.redirect("/reset");
      }
      const token = buffer.toString("hex");
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        req.flash("error", "Invalid email");
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 36000000;
      await user.save();
      res.redirect("/");
      transporter.sendMail({
        from: "denys.karakycha@gmail.com",
        to: req.body.email,
        subject: "Password reset",
        html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        `,
      });
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }

    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "Change Password",
      errorMessage: message,
      passwordToken: token,
      userId: user._id.toString(),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postNewPassword = async (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  try {
    const user = await User.findOne({
      _id: userId,
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await resetUser.save();
    res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
