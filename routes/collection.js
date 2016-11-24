var express = require('express');
var collection = require('../models/collection');
var item = require('../models/item');
var errorMessage = require('../config/error_message');
var passport = require('../components/passport');
var router = module.exports = express.Router();

/** コレクション一覧画面 */
router.get('/',
  passport.isLogined,
  function(req, res, next) {
    if (!(req.user && req.user.account_id)) {
      var err = new Error(errorMessage.BAD_REQUEST);
      err.status = 400;
      return next(err);
    }

    collection.findList(req.user.account_id).then(function(items) {
      res.render('collection', {items: items});
    }).catch(function(err) {
      next(err);
    });
  });

/** コレクション詳細画面 */
router.get('/:uid',
  passport.isLogined,
  function(req, res, next) {
    // req.params.uid.length < 50 はとりあえず長い文字列弾く
    if (!(req.params && req.params.uid && req.params.uid.length < 50)) {
      var err = new Error(errorMessage.BAD_REQUEST);
      err.status = 400;
      return next(err);
    }

    var uid = req.params.uid;
    item.findByShortId(uid).then(function(item) {
      // 現状、アイテムのuidをランダムなものにしているので
      res.render('collection_item', {item: item});
    }).catch(function(err) {
      next(err);
    });
  });
