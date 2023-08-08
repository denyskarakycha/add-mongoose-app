const User = require('../models/user');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport(smtpTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  auth: {
    user: 'node-shop',
    pass: 'eSesZqoZUntf3Q6p',
  }
}))

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "signup",
    errorMessage: message
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password[0];
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) { 
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "signup",
      errorMessage: errors.array()[0].msg 
    });
  }
  User.findOne({email: email})
  .then(userDoc => {
    if (userDoc) {
      req.flash('error', 'User already exists');
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
      return transporter.sendMail({
        from: 'denys.karakycha@gmail.com',
        to: email,
        subject: 'Не ссы',
        html: `
        <h1>Раслабся братанчик!</h1>
        <form action="http://porno365.sexy/">  
            <button type="submit">НАЖМИ НА МЕНЯ</button>
        </form>
        `
      });
    }).catch(err => console.log(err));
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
    User.findOne({email: email})
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password');
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
          req.flash('error', 'Invalid email or password');
          return res.redirect('/login');
        })
        .catch(err => {
          console.log(err)
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset",
    errorMessage: message
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
          req.flash('error', 'Invalid email');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 36000000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          from: 'denys.karakycha@gmail.com',
          to: req.body.email,
          subject: 'Password reset',
          html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `
        });
      })
      .catch(err => console.log(err));
  });
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
      let message = req.flash('error');
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
        userId: user._id.toString()
      });
    })
    .catch(err => console.log(err));
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({_id: userId, resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}})
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => res.redirect('/login'))
  .catch(err => console.log(err))
}
