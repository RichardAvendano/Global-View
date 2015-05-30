var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');

var GoogleService = require('../services/google');
var InstagramService = require('../services/instagram');
var queryTwitter = require('../services/twitter');
var FlickrService = require('../services/flickr');

var ApiController = function(flickr, google, instagram, twitter){
  this.on('error', function(err) {
    console.error('Assignment controller Error:', err);
  });
};

util.inherits(ApiController, EventEmitter);

ApiController.prototype._onError = function(req, res, err) {
  if (err === undefined) {
    throw new Error('Error You did not pass an error argument into _onError');
    return;
  }
  this.emit('error', err);
  res.json({
    result: 'Error!',
    error: error
  });
};

ApiController.prototype._onSuccess = function(req, res, results) {
  res.json({
    result: 'Request Received!',
    data: results
  });
};

ApiController.prototype.getGoogleNewsResults = function(req, res) {
  var self = this;
  var query = req.query;
  query.amount = query.amount || 5;

  GoogleService
    .getNewsResults(query.query, query.location, query.amount)
    .then(self._onSuccess.bind(self, req, res))
    .catch(self._onError.bind(self, req, res));
};

ApiController.prototype.getCityBackgrounds = function(req, res){
  var self = this;

  FlickrService
    .getCityPhotos(req.query.city)
    .then(self._onSuccess.bind(self, req, res))
    .catch(self._onError.bind(self, req, res));
};

ApiController.prototype.getInstagramPhotos = function(req, res) {
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

  InstagramService
    .getPhotos(qParams)
    .then(self._onSuccess.bind(self, req, res))
    .catch(self._onError.bind(self, req, res));
};

module.exports = new ApiController();