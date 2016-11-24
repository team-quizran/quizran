var config = require('config');
var settings = require('../../config/settings');

var PUBLIC_IMAGE_URL = config.get('publicImageURL');

var CreateLink = module.exports = {};

CreateLink.createImageUrl = function(shortId) {
  return PUBLIC_IMAGE_URL + shortId;
};

CreateLink.createMapUrl = function(name, latitude, longitude) {
  if (name && latitude && longitude) {
    // google map
    return `http://maps.google.com/maps?q=${name}@${latitude},${longitude}`;
  }
  return '';
};
