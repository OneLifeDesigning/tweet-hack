const express = require('express');
const router = express.Router();
const multer = require('multer');
const tweetsController = require('../controllers/tweets.controller')
const usersController = require('../controllers/users.controller')
const sessionMiddleware = require('../middlewares/session.middleware')
const uploads = multer({ dest: './public/uploads' });

router.get('/auth/slack', sessionMiddleware.isNotAuthenticated, usersController.doSocialLogin);
router.get('/login', sessionMiddleware.isNotAuthenticated, usersController.login);
router.post('/login', sessionMiddleware.isNotAuthenticated, usersController.doLogin);
router.get('/signup', sessionMiddleware.isNotAuthenticated, usersController.signup);
router.post('/users', sessionMiddleware.isNotAuthenticated, uploads.single('avatar'), usersController.createUser);
router.get('/activate/:token', sessionMiddleware.isNotAuthenticated, usersController.activateUser);
router.post('/logout', sessionMiddleware.isAuthenticated, usersController.logout);
router.get('/tweets', sessionMiddleware.isAuthenticated, tweetsController.list);
router.post('/tweets/:id/like', sessionMiddleware.isAuthenticated, tweetsController.like)

router.get("/", (req, res) => {
  res.redirect("/tweets");
});

module.exports = router;
