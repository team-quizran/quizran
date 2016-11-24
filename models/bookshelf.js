var config = require('config');

var knex = require('knex')(config.get('knex'));
var bookshelf = require('bookshelf')(knex);
module.exports = bookshelf;
