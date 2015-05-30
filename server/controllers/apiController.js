var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');

var GoogleService = require('../services/google');
var queryInstagram = require('../services/instagram');
var queryTwitter = require('../services/twitter');
var queryFlickr = require('../services/flickr');

var ApiController = function(flickr, google, instagram, twitter){
  this.on('error', function(err) {
    console.error('Assignment controller Error:', err);
  });
};

util.inherits(ApiController, EventEmitter);

ApiController.prototype.getGoogleNewsResults = function(req, res) {
  var self = this;
  var query = req.query;
  query.amount = query.amount || 5;

  GoogleService.getNewsResults(query.query, query.location, query.amount)
    .then(function(results) {
      res.json({
        result: 'Request Received!',
        data: results
      });
    })
    .catch(function(error) {
      self.emit('error', error);
      res.json({
        result: 'Error!',
        error: error
      });
    });
};

module.exports = new ApiController();