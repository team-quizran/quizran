var express = require('express');
var account = require('../models/account');
var errorMessage = require('../config/error_message');
var passport = require('../components/passport');

var router = module.exports = express.Router();

/** 利用登録画面 */
router.get('/register', function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  res.locals.error = req.flash('error');
  res.render('register', req.flash());
});

/** 利用登録 */
router.post('/register', function(req, res, next) {
  account.create(req.body.name, req.body.password, req.body.username).then(function(model) {
    req.flash('message', 'アカウント登録が完了しました。');
    res.redirect('login');
  }).catch(function(err) {
    if (err.Checkit) {
      req.flash('error', err.Checkit);
      res.redirect('register');
    } else {
      next(err);
    }
  });
});

/** ログイン画面 */
router.get('/login', function(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  res.locals.message = req.flash('message');
  res.locals.error = req.flash('error');
  res.render('login', req.flash());
});

/** ログイン */
router.post('/login',
  passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login', failureFlash: true}),
  function(req, res, next) {
    res.render('index');
  });

/** ログアウト */
router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

/** トップ画面 */
router.get('/',
  passport.isLogined,
  function(req, res, next) {
    res.render('index');
  });
