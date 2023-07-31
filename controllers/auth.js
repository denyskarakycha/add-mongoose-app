const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "signup",
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postSignup = (req, res, next) => {};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err)=>{
    console.log(err);
    res.redirect('/');
  });
}

exports.postLogin = (req, res, next) => {
    User.findById('64b6b96daf9dea22397d35b0')
    .then(user => {
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.session.save(err => { 
        console.log(err);
        return res.redirect('/');
      })
    })
    .catch(err => console.log(err));
}
