var express = require('express');
var config = require('config');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var ect = require('ect');
var helmet = require('helmet')
var flash = require('connect-flash');
var session = require('express-session');
var csrf = require('csurf');
var errorMessage = require('./config/error_message');
var passport = require('./components/passport');
var sessionConfig = require('./components/session');
var logger = require('./components/logger');
var routes = require('./routes/index');
var quiz = require('./routes/quiz');
var gacha = require('./routes/gacha');
var collection = require('./routes/collection');

var app = express();

// view engine setup
var ectRenderer = ect({ watch: true, root: __dirname + '/views', ext : '.ect' });
app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('common'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(csrf({ cookie: true }));

app.use(compression());
// Browser cache 86400000milliseconds = 1Day
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 86400000}));
app.use(helmet())

// routes
app.use('/', routes);
app.use('/quiz', quiz);
app.use('/gacha', gacha);
app.use('/collection', collection);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error(errorMessage.NOT_FOUND);
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  if (!err.status) {
    // unknown error
    logger.error(err);
    err.message = errorMessage.INTERNAL_SERVER_ERROR;
    err.status = 500;
  } else if (err.status === 'EBADCSRFTOKEN') {
    logger.info(err);
    // https://github.com/expressjs/csurf
    // invalid csrf token
    err.message = errorMessage.BAD_REQUEST;
    err.status = 403;
  } else {
    logger.info(err);
  }

  res.status(err.status);
  res.render('error', {
    message: err.message
  });
});

module.exports = app;
