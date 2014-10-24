/*
*  Global Data Stores all Tweets, News, and Photos
*/
angular.module('globalData', [])
.factory('StoredData', function() {
  var data = {
    news: [],
    photos: [],
    tweets: []
  };
  return {
    data: data
  };
});

/*
*  GlobalMethods stores all functionality that can change global Data
*/
angular.module('globalMethods', [
  'service_twitter', 
  'service_news', 
  'service_instagram', 
  'service_location'
  ])
.factory('GlobalMethods', function(GoogleNews, Instagram, Twitter, Location, StoredData) {
  var getNews = function(request) {
    GoogleNews.getNews(request)
      .then(function(result) {
        StoredData.data.news = result;
      });
  };
  var getPhotos = function(request) {
    var params = {
      street: request.street,
      city: request.city,
      state: request.state
    };
    Location.getLocation(params)
      .then(function(result) {
        var instaParams = {
          query: request.query,
          lat: result.latitude,
          lng: result.longitude,
          min_timestamp: +request.date,
          max_timestamp: moment(request.date).add(1, 'days').valueOf(),
          distance: 1000,
          amount: 8 //!!! need to change it when we get scrolling
        };
        Instagram.getPhotos(instaParams)
          .then(function(result) {
            StoredData.data.photos = result;
          });
      });
  };
  var getTweets = function(request) {
    // Twitter.getTweets(request)
    //   .then(function(data) {
    //     $scope.data = data;
    //     console.log('scope Cntrl', $scope.data);
    //   })
  };

  return {
    getPhotos: getPhotos,
    getTweets: getTweets,
    getNews: getNews
  };
});