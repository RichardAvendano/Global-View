var util = require('util');
var Promise = require('bluebird');
var BaseController = require('../baseController');
var GoogleService = require('../../services').Google;

var GoogleController = function(service) {
  this.GoogleService = service;
};

util.inherits(GoogleController, BaseController);

/**
* Receives GET requests from /api/google
* @function
* @memberof module:ApiController
* @alias exports.google
* @param {object} req Request Parameter from GET Request
* @param {object} res Response Parameter from GET Request
* @returns {json} Sends Client a JSON Object containing an Array of Google News Stories
*/
GoogleController.prototype.getNewsResults = function(req, res) {
  var self = this;
  var query = req.query;
  query.amount = query.amount || 5;

  self.GoogleService
    .getNewsResults(query.query, query.location, query.amount)
    .then(self._onSuccess.bind(self, req, res))
    .catch(self._onError.bind(self, req, res));
};

module.exports = new GoogleController(GoogleService);