var ApiController = require('./controllers/apiController');
var helpers = require('./helpers/helpers');

exports.apiRouter = function(app) {

  app.get('/twitter', helpers.twitter);

  app.get('/tweetPerTrend',helpers.tweetsForTrend);

  app.get('/twitterTrendingCities', helpers.twitterTrendingCities);

  app.get('/googlenews', ApiController.getGoogleNewsResults.bind(ApiController));

  app.get('/instagram', ApiController.getInstagramPhotos.bind(ApiController));

  app.get('/flickr', ApiController.getCityBackgrounds.bind(ApiController));
};