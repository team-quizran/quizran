var bookshelf = require('./bookshelf');
var createLink = require('./utils/create_link');

module.exports = bookshelf.Model.extend({
  tableName: 'm_puzzle_item',
  idAttribute: 'puzzle_item_id'
}, {
  findRandom: function(rarity) {
    return this.query()
    .select(
      'm_puzzle_item.puzzle_item_id',
      'm_puzzle_item.item_id',
      'm_puzzle_item.short_id',
      'm_puzzle_item.rarity',
      'm_puzzle_item.sort_key',
      'm_item.sort_key as item_sort_key'
    ).from('m_puzzle_item')
    .innerJoin('m_item', 'm_puzzle_item.item_id', 'm_item.item_id')
    .where('m_puzzle_item.rarity', rarity)
    .orderByRaw('RANDOM()')
    .limit(1)
    .map(function(row) {
      row.image_url = createLink.createImageUrl(row.short_id);
      return row;
    });
  }
});
