/**
* @module FlickrService
*/
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var requestAsync = Promise.promisify(require('request'));
var _ = require('lodash');
var Flickr = require("flickrapi");
var flickrKeys = require('../config').flickr;
var URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=%s&text=%s&sort=interestingness-desc&per_page=1&format=json&nojsoncallback=1';

var FlickrService = function(url) {
  this.url = url;
  this.on('error', function(err) {
    console.log('Error:', err);
  });
};

util.inherits(FlickrService, EventEmitter);

FlickrService.prototype.getCityPhotos = function(city) {
  var self = this;
  var place = city + ' skyline';
  var site = util.format(URL, flickrKeys.api_key, place);
  return requestAsync(site).spread(function(res, body) {
    return res;
  }).catch(self.emit.bind(self, 'erorr'));
};

module.exports = new FlickrService(URL);