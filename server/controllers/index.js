module.exports = {
  _base: require('./baseController'),
  Flickr: require('./ApiControllers/FlickrController'),
  Google: require('./ApiControllers/GoogleController'),
  Twitter: require('./ApiControllers/TwitterController'),
  Instagram: require('./ApiControllers/InstagramController')
};