var winston = require('winston');
winston.emitErrs = true;

var logger = module.exports = new winston.Logger({
  transports: [
    // https://github.com/winstonjs/winston/blob/master/docs/transports.md
    new (winston.transports.Console)({
      level: 'info',
      colorize: true,
      timestamp: true,
      json: false,
      handleExceptions: true
    })
  ]
});
