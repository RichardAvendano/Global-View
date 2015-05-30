var Controllers = require('./controllers');

/* ============== ROUTES: /api ============== */
exports.apiRouter = function(app) {

  // app.get('/twitter', Controllers.Twitter.somethingTwitter.bind(Controllers.Twitter));
  app.get('/tweetPerTrend', Controllers.Twitter.getTweetsForTrend.bind(Controllers.Twitter));
  app.get('/twitterTrendingCities', Controllers.Twitter.getTrendingCities.bind(Controllers.Twitter));

  app.get('/googlenews', Controllers.Google.getNewsResults.bind(Controllers.Google));
  app.get('/instagram', Controllers.Instagram.getPhotos.bind(Controllers.Instagram));
  app.get('/flickr', Controllers.Flickr.getCityBackgrounds.bind(Controllers.Flickr));
};