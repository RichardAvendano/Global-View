/**
* @module InstagramService
*/
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');
var requestAsync = Promise.promisify(require('request'));
var _ = require('lodash');
var instaKeys = require('../config').instagram;
var dayInMilliSeconds = 24 * 60 * 60 * 1000;

/**
* instaSettings contains the various API endpoint URLs
* Requests in which allParameters.callType === 'query' use queryGET and queryGET2
* All other requests use mediaGET
* locationGET can be used to resolve a set of lat, lng coordinates to a placeID
* photoGET and photoGET2 can be used to retrieve a set of pictures that are associated with a placeID
* @object
*/
var instaSettings = {
  headers: instaKeys,
  queryGET: 'https://api.instagram.com/v1/tags/',
  queryGET2: '/media/recent',
  mediaGET: 'https://api.instagram.com/v1/media/search',
  locationGET: 'https://api.instagram.com/v1/locations/search',
  photoGET: 'https://api.instagram.com/v1/locations/',
  photoGET2: '/media/recent'
};

var InstagramService = function(settings) {
  var url1 = settings.queryGET + '%s' + settings.queryGET2 + '?access_token=%s';
  var url2 = settings.mediaGET + '?access_token=%s&lat=%s&lng=%s&max_timestamp=%s&min_timestamp=%s&distance=%s';
  this.settings = settings;
  this.urls = [url1, url2];

  this.on('error', function(err) {
    console.log('Error:', err);
  });
};

util.inherits(InstagramService, EventEmitter);

/**
* Direct query of instagram media using lat, lng co-ordinates and date/time range OR query string
* @function
* @memberof module:InstagramService
* @param {object} allParameters Object of parameters passed in via query string.  May contain the following parameters (lat, lng, minDate, maxDate, query, distance, and callType)
* @param {function} callback Callback function invoked on response results
*/
InstagramService.prototype.getPhotos = function(parameters) {
  var query = (parameters.query || 'null').replace(/#/g,'').split(' ').join('').toLowerCase();
  var sortParams = parameters.callType === 'query' ? ['distance'] : ['tagMatch', 'distance'];
  var requestURL = this._buildUrl(parameters);
  var lat = parseFloat(parameters.lat) || null;
  var lng = parseFloat(parameters.lng) || null;
  var self = this;

  var parseData = function(res, body) {
    return JSON.parse(body).data;
  };
  return requestAsync(requestURL)
    .spread(parseData)
    .map(self._trimPhotoObject)
    .map(self._applyTagFilter.bind(self, query))
    .map(self._calculateDistance.bind(self, lat, lng))
    .then(self._sortResults.bind(self, sortParams))
    .catch(self.emit.bind(self, 'error'));
};

/**
* Builds Url from parameters
* @function
* @memberof module:InstagramService
* @param {object} allParameters Object of parameters passed in via query string.  May contain the following parameters (lat, lng, minDate, maxDate, query, distance, and callType)
* @param {function} callback Callback function invoked on response results
*/
InstagramService.prototype._buildUrl = function(parameters) {
  var minDate = Math.floor(parameters.minDate/1000) || Date.now() - dayInMilliSeconds;
  var maxDate = Math.floor(parameters.maxDate/1000) || Date.now();
  var lat = parseFloat(parameters.lat) || null;
  var lng = parseFloat(parameters.lng) || null;
  var query = (parameters.query || 'null').replace(/#/g,'').split(' ').join('').toLowerCase();
  var distance = parameters.distance || 1000;
  var self = this;

  if (parameters.callType === 'query') {
    return util.format(self.urls[0], query, self.settings.headers.instaToken);
  }
  return util.format(self.urls[1], self.settings.headers.instaToken, lat, lng, maxDate, minDate, distance);
};

/**
* trimResponse cleans up the response from Instagram's API and removes extraneous data
* @function
* @param {object} photoObj Object containing response (after invoking JSON.parse) from Instagram API call
* @returns {object} photoObj Object with attributes removed
*/
InstagramService.prototype._trimPhotoObject = function(photoObj) {
  delete photoObj.attribution;
  delete photoObj.comments;
  delete photoObj.filter;
  delete photoObj.likes.data;
  delete photoObj.likes.users_in_photo;
  delete photoObj.likes.user_has_liked;
  delete photoObj.likes.user;
  delete photoObj.users_in_photo;
  delete photoObj.user_has_liked;

  if (photoObj.caption) {
    delete photoObj.caption.created_time;
    delete photoObj.caption.from;
    delete photoObj.caption.id;
  }
  return photoObj;
};

/**
* Flag all results that have instagram hash tags that match (or partially match) the user's query string
* @function
* @param {string} query Query string corresponding to event (or trending topic)
* @param {object} results Object containing photo data from Instagram API call
* @returns {object} Object containing photo data with tagMatch attribute appended
*/
InstagramService.prototype._applyTagFilter = function(query, photoObj) {
  var tagFound = _.some(photoObj.tags, function(tag) {
    return tag.indexOf(query) > -1
  });

  return _.extend(photoObj, { tagMatch: tagFound ? 1 : 0 });
};

/**
* Calculate distance from lat/lng inputs in instaLocations
* @function
* @param {number} lat Latitude of event location
* @param {number} lng Longitude of event location
* @param {object} photoObj Object containing photo data from Instagram API call
* @returns {object} photoObj Object containing photo data with distance attribute appended - if photoObj.location is set to null, return value of 100,000 in order to sort it last
*/
InstagramService.prototype._calculateDistance = function(lat, lng, photoObj) {
  if (photoObj.location === null || lat === undefined ||  lng === undefined) {
    return _.extend(photoObj, { distance: 10000000 });
  }
  var firstLocation = {
    lat: lat,
    lng: lng
  };
  var secondLocation = {
    lat: photoObj.location.latitude,
    lng: photoObj.location.longitude
  };
  return _.extend(photoObj, { distance: distance(firstLocation, secondLocation) });
};

/**
* Sort results by parameters
* @function
* @param {array} parameters Array of sorting parameters in order of priority
* @param {object} results Object containing response from Instagram API call with additional appended attributes (ex. tagMatch, distance)
* @returns {array} Array of results sorted by parameters
*/
InstagramService.prototype._sortResults = function(parameters, results) {
  return _(results).sortBy(parameters).valueOf();
};

/**
* Derived from: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
* Helper function that calculates distance between two sets of lat/lng co-ordinates
* @function
* @param {object} loc1 Object containing lattitude, longitude of first location (lat, lng)
* @param {object} loc2 Object containing lattitude, longitude of second location (lat, lng)
* @returns {number} distance The distance between the first and second location
*/
function distance(loc1, loc2) {
  var RADIUS = 6371;
  var lngDiff = degreeToRadian(loc1.lng - loc2.lng);
  var latDiff = degreeToRadian(loc1.lat - loc2.lat);
  var dist = Math.pow(Math.sin(latDiff/2),2) + (Math.cos(degreeToRadian(loc1.lat)) * Math.cos(degreeToRadian(loc2.lat))) * Math.pow(Math.sin(lngDiff/2),2);

  var distance = Math.atan(Math.sqrt(dist), Math.sqrt(1-dist)) * 2 * RADIUS;

  return distance;
};

/**
* Calculations from: https://github.com/kvz/phpjs/blob/master/functions/math/deg2rad.js
* Helper function for distance function that converts degrees to randians
* @function
* @param {number} number
* @returns {number} The input number, which had been expressed in degrees, converted to radians
*/
function degreeToRadian(number) {
  return (number / 180) * Math.PI;
};

module.exports = new InstagramService(instaSettings);