var bookshelf = require('./bookshelf');
var createLink = require('./utils/create_link');

module.exports = bookshelf.Model.extend({
  tableName: 'm_item',
  idAttribute: 'item_id'
}, {
  findByShortId: function(shortId) {
    return this.where({short_id: shortId})
    .fetch().then(function(item) {
      item.attributes.image_url = createLink.createImageUrl(item.attributes.short_id);
      item.attributes.map_url = createLink.createMapUrl(item.attributes.name, item.attributes.ido, item.attributes.keido);
      return Promise.resolve(item.attributes);
    }).catch(function(err) {
      return Promise.reject(err);
    });
  },
  findList: function(itemIds) {
    return this.query()
    .select(
      'item_id',
      'short_id',
      'rarity',
      'sort_key',
      'puzzle_rows',
      'puzzle_columns',
      'name',
      'description',
      'ido',
      'keido',
      'ref_url_title',
      'ref_url',
      'ref_image_title',
      'ref_image'
    ).from('m_item')
    .whereIn('item_id', itemIds)
    .map(function(row) {
      row.image_url = createLink.createImageUrl(row.short_id);
      return row;
    });
  }
});
