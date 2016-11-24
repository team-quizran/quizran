// https://github.com/lorenwest/node-config
module.exports = {
  // http://bookshelfjs.org/
  knex: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 1,
      max: 10
    },
    debug: false
  },
  // https://github.com/expressjs/session
  session: {
    cookie: {
      httpOnly: true,
      maxAge: 3600000 * 24,
      secure: true
    },
    proxy: true,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
  },
  // https://github.com/tj/connect-redis
  redisStore: {
    url: process.env.REDIS_URL
  },
  ga: {
    tracker: process.env.GA_TRACKER
  },
  publicImageURL: process.env.PUBLIC_IMAGE_URL
}
