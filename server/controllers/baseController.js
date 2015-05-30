/**
* @module BaseController
*/
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');

var BaseController = function() {
  this.on('error', function(err) {
    console.error('Controller Error:', err);
  });
};

util.inherits(BaseController, EventEmitter);

BaseController.prototype._onError = function(req, res, err) {
  if (err === undefined) {
    throw new Error('Error: You did not pass an error argument into _onError.');
    return;
  }
  this.emit('error', err);
  res.json({
    result: 'Error!',
    error: error
  });
};

BaseController.prototype._onSuccess = function(req, res, results) {
  if (results === undefined) {
    throw new Error('Error: You did not pass a results argument into _onSuccess.');
    return;
  }
  res.json({
    result: 'Request Received!',
    data: results
  });
};

module.exports = BaseController;