var util = require('util');
var Promise = require('bluebird');
var BaseController = require('../baseController');
var TwitterService = require('../../services').Twitter;

var TwitterController = function(service) {
  this.TwitterService = service;
};

util.inherits(TwitterController, BaseController);

TwitterController.prototype.getTrendingCities = function(req, res) {
  var self = this;

  self.TwitterService
    .getAvailableTrendingCities()
    .then(self._onSuccess.bind(self, req, res))
    .catch(self._onError.bind(self, req, res))
};

TwitterController.prototype.getTweetsForTrend = function(req, res) {
  var query = req.query;
  var self = this;

  self.TwitterService
    .getTweetsForTrendObjects([query])
    .then(self._onSuccess.bind(self, req, res))
    .catch(self._onError.bind(self, req, res))
};

// TwitterController.prototype.somethingTwitter = function(req, res) {
//   var query = req.query;
//   console.log(query);
//   queryTwitter.getAvailableTrendingCities(function(err, trendingCities){
//     if(!!err){ throw 'Error: ' + err;}
//     var woeid = queryTwitter.getCityId(query, trendingCities);
//     if(Array.isArray(woeid)){
//       queryTwitter.getClosestTrendingCity(query, function(err, data){
//         //console.log(data);
//         if(!!err){ throw 'Error: ' + err;}
//         queryTwitter.getTrendingTopics(data[0].woeid, function(err, trendingTopics){
//           if(!!err){ throw 'Error: '+err;}
//           queryTwitter.getTweetsForTrendObjects(trendingTopics, 0, function(err, tweets){
//             var response = {
//               status:200,
//               result: 'Request Received!',
//               data: tweets
//             };
//             res.end(JSON.stringify(response));
//           });
//         });
//       });
//     } else{
//         queryTwitter.getTrendingTopics(woeid, function(err, trendingTopics){
//           if(!!err){ throw 'Error: '+err;}
//           queryTwitter.getTweetsForTrendObjects(trendingTopics, function(err, tweets){
//             var response = {
//               status:200,
//               result: 'Request Received!',
//               data: tweets
//             };
//             res.end(JSON.stringify(response));
//           });
//         });
//     }
//   });
//   //queryTwitter.getTweet(queryObject, function(err, twitterResults){
// };

module.exports = new TwitterController(TwitterService);