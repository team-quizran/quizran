var Promise  = require('bluebird');
var _ = require('lodash');
var bookshelf = require('./bookshelf');
var account = require('./account');
var puzzle = require('./puzzle_item');
var collection = require('./collection');
var settings = require('../config/settings');

var Gacha = module.exports = {};

Gacha.freeLot = function(user) {
  return bookshelf.transaction(function(trx) {
    return lot(user.account_id, trx).then(function(item) {
      return account.setLastFreeGachaTime(user.account_id, trx).then(function(user) {
        return Promise.resolve({item: item, user: user});
      }).catch(function(err) {
        return Promise.reject(err);
      });
    }).catch(function(err) {
      return Promise.reject(err);
    });
  });
};

Gacha.pointLot = function(user, usePoint) {
  return bookshelf.transaction(function(trx) {
    return lot(user.account_id, trx).then(function(item) {
      var currentPoint = user.point - usePoint;

      return account.setPoint(user.account_id, currentPoint, trx).then(function(user) {
        return Promise.resolve({item: item, user: user});
      }).catch(function(err) {
        return Promise.reject(err);
      });
    }).catch(function(err) {
      return Promise.reject(err);
    });
  });
};

function lot(userId, trx) {
  var rarity = randWeightKey()

  return puzzle.findRandom(rarity, trx).then(function(item) {
    return collection.addCollection(userId, item[0].puzzle_item_id, trx).then(function(ret) {
      if (ret.attributes.count === undefined) {
        item[0].new = true;
      } else {
        item[0].new = false;
      }
      return Promise.resolve(item[0]);
    }).catch(function(err) {
      return Promise.reject(err);
    });
  }).catch(function(err) {
    return Promise.reject(err);
  });
};

function randWeightKey() {
  var sum = _.reduce(settings.gachaProbability, function(sum, value, key) { return sum + value; });
  var rand = Math.floor(Math.random() * (sum - 1) + 1);
  var rarity = 0;

  _.some(settings.gachaProbability, function(value, key) {
    if ((sum -= value) < rand) {
      rarity = key
      return true;
    }
  });
  return rarity;
}

Gacha.checkPoint = function(currentPoint, usePoint) {
  return currentPoint - usePoint >= 0;
};

Gacha.checkAvailableFreeGacha = function(lastFreeGachaTime) {
  // 当日の0:00から23:59ではないか
  return dateFormat(lastFreeGachaTime) !== dateFormat(new Date());
};

function dateFormat(date) {
  return date.getFullYear() + date.getMonth() + date.getDate();
}
