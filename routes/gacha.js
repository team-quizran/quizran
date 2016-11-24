var express = require('express');
var passport = require('../components/passport');
var gacha = require('../models/gacha');
var settings = require('../config/settings');
var errorMessage = require('../config/error_message');
var router = module.exports = express.Router();

var USE_POINT = settings.usePoint;

/** ガチャ画面 */
router.get('/',
  passport.isLogined,
  function(req, res, next) {
    res.locals.csrfToken = req.csrfToken();

    if (!(req.user && req.user.last_free_gacha_time && req.user.point != null)) {
      var err = new Error(errorMessage.BAD_REQUEST);
      err.status = 400;
      return next(err);
    }

    var gachaInfo = {
      usePoint: USE_POINT,
      free: gacha.checkAvailableFreeGacha(req.user.last_free_gacha_time),
      point: gacha.checkPoint(req.user.point, USE_POINT)
    };
    res.render('gacha', {gachaInfo: gachaInfo});
  });

/** ガチャ引く(一日一回) */
router.post('/daily',
  passport.isLogined,
  function(req, res, next) {
    if (!(req.user && req.user.last_free_gacha_time)) {
      var err = new Error(errorMessage.BAD_REQUEST);
      err.status = 400;
      return next(err);
    }

    // フリーガチャを引けるかチェック
    if (!gacha.checkAvailableFreeGacha(req.user.last_free_gacha_time)) {
      res.redirect('/gacha/');
      return;
    }

    gacha.freeLot(req.user).then(function(value) {
      res.render('gacha_get', {item: value.item});
    }).catch(function(err) {
      next(err);
    });
  });

/** ガチャ引く(ポイント消費) */
router.post('/point',
  passport.isLogined,
  function(req, res, next) {
    if (!(req.user && req.user.point)) {
      var err = new Error(errorMessage.BAD_REQUEST);
      err.status = 400;
      return next(err);
    }

    // ポイントが足りているかチェック
    if (!gacha.checkPoint(req.user.point, USE_POINT)) {
      res.redirect('/gacha/');
      return;
    }

    gacha.pointLot(req.user, USE_POINT).then(function(value) {
      res.locals.user.point = value.user.point;
      res.render('gacha_get', {item: value.item});
    }).catch(function(err) {
      next(err);
    });
  });
