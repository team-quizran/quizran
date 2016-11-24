var passport = module.exports = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var logger = require('./logger');
var account = require('../models/account');

passport.use(new LocalStrategy(
  function(username, password, done) {
    if (!(username && username.length <= 50 && password && password.length <= 100)) {
      return done(null, false, { message: '入力が不正です。' });
    }

    account.authenticate(username, password).then(function(user) {
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'ユーザーIDまたはパスワードが間違っています。' });
      }
    }).catch(function(err) {
      return done(err);
    });
  }
));

passport.serializeUser(function(user, cb) {
  logger.debug('passport.serializeUser: %j', user);

  cb(null, user.account_id);
});

passport.deserializeUser(function(id, cb) {
  logger.debug('passport.deserializeUser: %j', id);

  account.findById(id).then(function(user) {
    cb(null, user);
  }).catch(function(err) {
    cb(err);
  });
});

passport.isLogined = function(req, res, next){
  logger.debug('passport.isLogined');
  if(req.isAuthenticated()) {
    // viewのローバルオブジェクトのプロパティにする
    res.locals.user = req.user;
    return next();
  }
  res.redirect("/login");
};
