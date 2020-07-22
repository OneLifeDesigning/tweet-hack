const mongoose = require('mongoose')
const User = require('../models/user.model')
const nodemailer = require('../config/mailer.config');
const passport = require('passport')

module.exports.login = (req, res, next) => {
  res.render('users/login')
}

module.exports.doSocialLogin = (req, res, next) => {
  const passportController = passport.authenticate("slack", (error, user) => {
    if (error) {
      next(error);
    } else {
      req.session.userId = user._id;
      res.redirect("/");
    }
  })
  
  passportController(req, res, next);
}

module.exports.doLogin = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        user.checkPassword(req.body.password)
          .then(match => {
            if (match) {
              if (user.activation.active) {
                req.session.userId = user._id

                res.redirect('/tweets')
              } else {
                res.render('users/login', {
                  error: {
                    validation: {
                      message: 'Your account is not active, check your email!'
                    }
                  }
                })
              }
            } else {
              res.render('users/login', {
                error: {
                  email: {
                    message: 'user not found'
                  }
                }
              })
            }
          })
      } else {
        res.render("users/login", {
          error: {
            email: {
              message: "user not found",
            },
          },
        });
      }
    })
    .catch(next)
}

module.exports.signup = (req, res, next) => {
  res.render('users/signup')
}

module.exports.createUser = (req, res, next) => {
  const userParams = req.body;
  userParams.avatar = req.file ? `/uploads/${req.file.filename}` : undefined;
  const user = new User(userParams);

  user.save()
    .then(user => {
      nodemailer.sendValidationEmail(user.email, user.activation.token, user.name);
      res.render('users/login', {
        message: 'Check your email for activation'
      })
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.render("users/signup", { error: error.errors, user });
      } else if (error.code === 11000) { // error when duplicated user
        res.render("users/signup", {
          user,
          error: {
            email: {
              message: 'user already exists'
            }
          }
        });
      } else {
        next(error);
      }
    })
    .catch(next)
}

module.exports.activateUser = (req, res, next) => {
  User.findOne({ "activation.token": req.params.token })
    .then(user => {
      if (user) {
        user.activation.active = true;
        user.save()
          .then(user => {
            res.render('users/login', {
                message: 'Your account has been activated, log in below!'
              })
          })
        .catch(e => next)
      } else {
        res.render('users/login', {
          error: {
            validation: {
              message: 'Invalid link'
            }
          }
        })
      }
    })
    .catch(e => next)
}

module.exports.logout = (req, res, next) => {
  req.session.destroy()

  res.redirect('/login')
}