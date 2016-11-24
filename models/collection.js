var Promise  = require('bluebird');
var _ = require('lodash');
var bookshelf = require('./bookshelf');
var item = require('./item');
var createLink = require('./utils/create_link');
var settings = require('../config/settings');
var logger = require('../components/logger');

var RARITY_DEFAULTS = _.transform(settings.rarities, function(result, value, key) {
  result[value] = {};
  return result;
});

module.exports = bookshelf.Model.extend({
  tableName: 't_collection',
  idAttribute: 'collection_id'
}, {
  addCollection: function(accountId, itemId, trx) {
    return this.where({account_id: accountId, puzzle_item_id: itemId}).fetch({transacting: trx}).then(function(collection) {
      if (collection) {
        // 更新(カウントアップ)
        var count = collection.attributes.count + 1;
        return this.where({collection_id: collection.id}).save({count: count}, {method: 'update', transacting: trx});
      } else {
        // 新規追加
        return this.save({account_id: accountId, puzzle_item_id: itemId}, {transacting: trx});
      }
    }).catch(function(err) {
      return Promise.reject(err);
    });
  },
  /**
   * {
   *   "<rarity>": {
   *     "<item_sort_key>": {
   *       // 揃ってない時はパズルの中身
   *       "pieces": {
   *         "<puzzle_sort_key>": {
   *           "item_id": Number,
   *           "rarity": Number,
   *           "sort_key": Number,
   *           "short_id":" String,
   *           "count": Number
   *         }
   *       },
   *       "puzzle_rows": Number,
   *       "puzzle_columns": Number
   *     },
   *     // 揃ってる時はアイテムの中身
   *     "<item_sort_key>" :{
   *       "item_id": Number,
   *       "short_id": String,
   *       "rarity": Number,
   *       "sort_key": Number,
   *       "puzzle_rows": Number,
   *       "puzzle_columns": Number
   *       "name": String,
   *       "description": String,
   *       "ido": String,
   *       "keido": String,
   *       "ref_url_title": String,
   *       "ref_url": String,
   *       "ref_image_title": String,
   *       "ref_image": String,
   *     },
   *     "available_item_count": Number,
   *     "complete_count": Number
   *   },
   *   "<rarity>" :{
   *     },
   *     "available_item_count": Number,
   *     "complete_count": Number
   *   }
   * }
   */
  findList: function(userId) {
    return this.findPuzzles(userId).then(function(puzzles) {
      return item.findList(_.keys(puzzles)).then(function(items) {
        var list = _.chain(items).groupBy(function(row){
          return row.rarity;
        }).defaults(RARITY_DEFAULTS)
        .transform(function(result, item, rarity) {
          var completeCount = 0;
          result[rarity] = _.transform(item, function(result2, item2, key2) {
            var child_count = item2.puzzle_rows * item2.puzzle_columns;
            if (child_count === _.size(puzzles[item2.item_id])) {
              // 揃っている
              result2[item2.sort_key] = item2;
              completeCount += 1;
            } else {
              // 揃ってない
              result2[item2.sort_key] = {
                pieces: puzzles[item2.item_id],
                puzzle_rows: item2.puzzle_rows,
                puzzle_columns: item2.puzzle_columns
              };
            }
            return result2;
          }, {});
          result[rarity].available_item_count = settings.availableItemCount[rarity];
          result[rarity].complete_count = completeCount;
          return result;
        }).value();

        logger.debug('collection findList: %j', list);
        return Promise.resolve(list);
      }).catch(function(err) {
        return Promise.reject(err)
      });
    }).catch(function(err) {
      return Promise.reject(err)
    });
  },
  findPuzzles: function(userId) {
    return this.query()
    .select()
    .from('t_collection')
    .innerJoin('m_puzzle_item', 't_collection.puzzle_item_id', 'm_puzzle_item.puzzle_item_id')
    .where('account_id', userId)
    .map(function(row) {
      row.image_url = createLink.createImageUrl(row.short_id);
      return row;
    }).then(function(val) {
      var list = _.chain(val).groupBy(function(row){
        return row.item_id;
      }).transform(function(result, value, key) {
        result[key] = _.keyBy(value, 'sort_key');
        return result;
      }, {}).value();
      return Promise.resolve(list);
    }).catch(function(err) {
      return Promise.reject(err);
    });
    }
});
