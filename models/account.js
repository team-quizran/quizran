var Promise  = require('bluebird');
var bcrypt = require('bcrypt');
var Checkit = require('checkit');
var bookshelf = require('./bookshelf');
var logger = require('../components/logger');

var SALT_ROUNDS = 10;

var validations = {
  display_name: [{
    rule: 'required',
    message: '名前は必須です'
  },{
    rule: 'maxLength',
    message: '名前は20文字以内で入力してください',
    params: ['20']
  }],
  username: [{
    rule: 'required',
    message: 'ログインIDは必須です'
  },{
    rule: 'minLength',
    message: 'ログインIDは6文字以上で入力してください',
    params: ['6']
  },{
    rule: 'maxLength',
    message: 'ログインIDは50文字以内で入力してください',
    params: ['50']
  },{
    rule: 'alphaDash',
    message: 'ログインIDは半角英数字で入力してください',
  },{
    rule: function(val, params) {
      return Account.isUniqueUserName(val).then(function(ret) {
        if (!ret) {
          throw new Error('ログインIDは既に使用されています');
        }
      });
    }
  }],
  password: [{
    rule: 'required',
    message: 'パスワードは必須です'
  },{
    rule: 'minLength',
    message: 'パスワードは8文字以上で入力してください',
    params: ['8']
  },{
    rule: 'maxLength',
    message: 'パスワードは100文字以内で入力してください',
    params: ['100']
  },{
    rule: 'alphaDash',
    message: 'パスワードは半角英数字で入力してください',
  },]
};

var Account = module.exports = bookshelf.Model.extend({
  tableName: 't_account',
  idAttribute: 'account_id'
}, {
  create: function(name, password, username) {
    var self = this;
    return new Checkit(validations).run({
      display_name: name,
      password: password,
      username: username
    }).then(function(ret) {
      return generateHash(password).then(function(hashedPassword) {
        return new self({
          display_name: name,
          password: hashedPassword,
          username: username
        }).save();
      }).catch(function(err) {
        return Promise.reject(err);
      });
    }).caught(Checkit.Error, function(err) {
      return Promise.reject({
        Checkit: err.errors
      });
    })
  },
  authenticate: function(username, password) {
    var self = this;
    return self.where({username: username}).fetch().then(function(user) {
      if (user) {
        return compareHash(password, user.attributes.password).then(function(ret) {
          if (ret) {
            return self.setLastLoginDate(user.id).then(function(ret) {
              return Promise.resolve(user.attributes);
            }).catch(function(err) {
              return Promise.reject(err);
            });
          } else {
            logger.info('username:' + username + ' authenticate password error');
            return Promise.resolve(null);
          }
        }).catch(function(err) {
          return Promise.reject(err);
        });
      } else {
        logger.info('username:' + username + ' authenticate username error');
        return Promise.resolve(null);
      }
    }).catch(function(err) {
      return Promise.reject(err);
    });
  },
  findById: function(id) {
    return this.where({account_id: id}).fetch().then(function(user) {
      return Promise.resolve(user.attributes);
    }).catch(function(err) {
      return Promise.reject(err);
    });
  },
  isUniqueUserName: function(username) {
    return this.where({username: username}).fetch().then(function(ret) {
      if (ret === null) {
        return Promise.resolve(true);
      } else {
        return Promise.resolve(false);
      }
    }).catch(function(err) {
      return Promise.reject(err);
    });
  },
  setLastLoginDate: function(id) {
    return this.where({account_id: id}).save({last_login_date: new Date()}, {method: 'update'}).then(function(user) {
      return Promise.resolve(user.attributes);
    }).catch(function(err) {
      return Promise.reject(err);
    });
  },
  setPoint: function(id, currentPoint, trx) {
    return this.where({account_id: id}).save({point: currentPoint}, {method: 'update', transacting: trx}).then(function(user) {
      return Promise.resolve(user.attributes);
    }).catch(function(err) {
      return Promise.reject(err);
    });
  },
  setLastFreeGachaTime: function(id, trx) {
    return this.where({account_id: id}).save({last_free_gacha_time: new Date()}, {method: 'update', transacting: trx}).then(function(user) {
      return Promise.resolve(user.attributes);
    }).catch(function(err) {
      return Promise.reject(err);
    });
  }
});

function compareHash(password, hash) {
  return new Promise(function(onFulfilled, onRejected) {
    bcrypt.compare(password, hash, function(err, res) {
      if (err) {
        onRejected(err);
      } else {
        onFulfilled(res);
      }
    });
  });
};

function generateHash(password) {
  return new Promise(function(onFulfilled, onRejected) {
    bcrypt.genSalt(SALT_ROUNDS, function(err, salt) {
      if (err) {
        onRejected(err);
      } else {
        bcrypt.hash(password, salt, function(err, hash) {
          if (err) {
            onRejected(err);
          } else {
            onFulfilled(hash);
          }
        });
      }
    });
  });
}
