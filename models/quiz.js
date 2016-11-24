var Promise  = require('bluebird');
var bookshelf = require('./bookshelf');
var account = require('./account');
var settings = require('../config/settings');

module.exports = bookshelf.Model.extend({
  tableName: 'm_quiz',
  idAttribute: 'quiz_id'
}, {
  findRandom: function() {
    return this.query(function(qb) {
      qb.orderByRaw('RANDOM()').limit(1);
    }).fetch().then(function(quiz) {
      return Promise.resolve(quiz.attributes);
    }).catch(function(err) {
      return Promise.reject(err);
    });
  },
  checkAnswer: function(quiz_id, choice, user) {
    var self = this;
    return bookshelf.transaction(function(trx) {
      return self.where({quiz_id: parseInt(quiz_id, 10)}).fetch({transacting: trx}).then(function(quiz) {
        if (quiz.attributes.correct_number == choice) {
          // 正解
          var addPoint = settings.getPoint[quiz.attributes.level];
          var currentPoint = user.point + addPoint;
          return account.setPoint(user.account_id, currentPoint, trx).then(function(user) {
            return Promise.resolve({quiz: quiz.attributes, point: addPoint, user: user})
          }).catch(function(err) {
            return Promise.reject(err);
          });
        } else {
          // 不正解
          return Promise.resolve({quiz: quiz.attributes})
        }
      }).catch(function(err) {
        return Promise.reject(err);
      });
    });
  }
});
