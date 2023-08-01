const User = require('../models/user');

const bcrypt = require('bcryptjs');

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

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({email: email})
  .then(userDoc => {
    if (userDoc) {
      return res.redirect('/signup');
    }
    return bcrypt.hash(password, 12).then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {item: []}
      });
      return user.save();
    }).then(result => {
      res.redirect('/login');
    })
  }) 
  .catch(err => {
    console.log(err);
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err)=>{
    console.log(err);
    res.redirect('/');
  });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findByOne({email: email})
    .then(user => {
      if (!user) {
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save(err => { 
              console.log(err);
              res.redirect('/');
            })
          }
          return res.redirect('/login');
        })
        .catch(err => {
          console.log(err)
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
}
