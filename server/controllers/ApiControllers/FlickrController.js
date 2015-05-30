var util = require('util');
var Promise = require('bluebird');
var BaseController = require('../baseController');
var FlickrService = require('../../services').Flickr;

var FlickrController = function(service) {
  this.FlickrService = service;
};

util.inherits(FlickrController, BaseController);

/**
* Receives GET requests from /api/flickr
*/
FlickrController.prototype.getCityBackgrounds = function(req, res){
  var self = this;

  self.FlickrService
    .getCityPhotos(req.query.city)
    .then(self._onSuccess.bind(self, req, res))
    .catch(self._onError.bind(self, req, res));
};

module.exports = new FlickrController(FlickrService);