var util = require('util');
var Promise = require('bluebird');
var BaseController = require('../baseController');
var InstagramService = require('../../services').Instagram;

var InstagramController = function(service) {
  this.InstagramService = service;
};

util.inherits(InstagramController, BaseController);

/**
* Receives GET requests from /api/instagram
* @function
* @memberof module:ApiController
* @alias exports.instagram
* @param {object} req Request Parameter from GET Request
* @param {object} res Response Parameter from GET Request
* @returns {json} Sends Client a JSON Object containing an Array of Instagram Photos
*/
InstagramController.prototype.getPhotos = function(req, res) {
  var self = this;
  var query = req.query;
  var qParams = {
    lat: query.lat,
    lng: query.lng,
    minDate: query.min_timestamp,
    maxDate: query.max_timestamp,
    distance: query.distance,
    query: query.query,
    callType: query.callType || 'query'
  };

  self.InstagramService
    .getPhotos(qParams)
    .then(self._onSuccess.bind(self, req, res))
    .catch(self._onError.bind(self, req, res));
};

module.exports = new InstagramController(InstagramService);