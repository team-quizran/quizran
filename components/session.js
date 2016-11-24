var session = require('express-session');
var config = require('config');

var sessionConfig = config.get('session');

if (process.env.NODE_ENV === 'production') {
  var RedisStore = require('connect-redis')(session);
  sessionConfig.store = new RedisStore(config.get('redisStore'));
}

module.exports = sessionConfig;
