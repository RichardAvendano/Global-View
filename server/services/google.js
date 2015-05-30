/**
* @module GoogleService
*/
var request = require('request'); 
var cheerio = require('cheerio');
var querystring = require('querystring');
var util = require('util');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Promise = require('bluebird');

var URL = 'http://www.google.com/search?hl=en&q=%s&start=0&sa=N&num=%s&ie=UTF-8&oe=UTF-8&tbm=nws';
var stories = 'li.g';
var sourceSelector = '.slp';
var descriptionSelector = 'div.st';
var titleSelector = 'h3.r a';
var removSel = 'div.s';

var GoogleService = function(url) {
  this.url = url;
  this.on('error', function(err) {
    console.log('Error:', err);
  });
};

util.inherits(GoogleService, EventEmitter);

GoogleService.prototype.getNewsResults = function(query, location, queryAmount) {
  var self = this;
  var url = self.url;
  var search = querystring.escape(query + ' location:' + location);
  var amount = (queryAmount > 50) ? 50 : queryAmount;
  var queryUrl = util.format(url, search, amount);

  return new Promise(function(resolve, reject) {
    request(queryUrl, function(error, res, body) {
      if (error) {
        self.emit('error', err);
        reject(err);
        return;
      }
      resolve(self._processBodyForResults(body));
    });    
  });
};

GoogleService.prototype._buildNewsItem = function(el, $) {
  var $title = $(el).find(titleSelector);
  var $description = $(el).find(descriptionSelector);
  var $source = $(el).find(sourceSelector);

  var href = querystring.parse($($title).attr('href'));
  var sourceTime = $source.text().split(' - ');

  var story = {};
  story.title = $($title).first().text() || null;
  story.description = $description.text() || null;
  story.source = sourceTime[0] || null;
  story.time = sourceTime[1] || null;
  story.link = href['/url?q'] || null;

  $(el).find(removSel).find('div').remove();
  return story;
};

GoogleService.prototype._processBodyForResults = function(body) {
  var $ = cheerio.load(body);
  var links = [];
  var self = this;

  $(stories).each(function(i, elem) {
    var link = self._buildNewsItem(elem, $);
    links.push(link);
  });

  return links;
};

module.exports = new GoogleService(URL);
// module.exports.getNewsResults('baseball', '55107', 5)
// .then(function(results) {
//   console.log('it worked!', results);
// })
// .catch(function(err) {
//   console.log('It Failed!', err);
// });
/* end new */

// var request = require('request'); 
// var cheerio = require('cheerio');
// var querystring = require('querystring');
// var util = require('util');

// var stories = 'li.g';
// var sourceSelector = '.slp';
// var descriptionSelector = 'div.st';
// var titleSelector = 'h3.r a';
// var removSel = 'div.s';

// var URL = 'http://www.google.com/search?hl=en&q=%s&start=0&sa=N&num=%s&ie=UTF-8&oe=UTF-8&tbm=nws';
/**
* Scrapes news.google.com and returns an array of results;
* @function queryGoogle
* @memberof module:queryGoogle
* @instance
* @param {string} query Search Term on news.google.com
* @param {string} location Search Location (City || State || Zip || Country) on news.google.com
* @param {number} queryAmount Number of results to return - Max 50 
* @param {function} callback Callback function is invoked with results of query - callback(err, results)
*/
// module.exports = function(query, location, queryAmount, callback) {
//   var search = query + ' location:' + location;
//   queryAmount = queryAmount > 50 ? 50 : queryAmount;
//   var site = util.format(URL, querystring.escape(search), queryAmount);

//   request(site, function(error, res, body) {
//     callback(error, getNews(body));
//   });
// };

/** 
* Takes an individual news story form google news DOM results and returns object
* @function
* @param {Object} element individual li.g element from DOM
* @param {Object} $ jQuery like object containing entire DOM from results page
* @returns {Object} Object containing title, link, source, description, & time for a single news result
*/
// var buildNewsStory = function(element, $) {
//   var titleEl = $(element).find(titleSelector);
//   var newsDescription = $(element).find(descriptionSelector);
//   var removeElem = $(element).find(removSel);
//   var newsSource = $(element).find(sourceSelector);

//   var href = querystring.parse($(titleEl).attr('href'));
//   var sourceTime = newsSource.text().split(' - ');

//   var item = {};
//   item.title = $(titleEl).first().text() || null;
//   item.link = href['/url?q'] || null;
//   item.source = sourceTime[0] || null;
//   item.description = newsDescription.text() || null;
//   item.time = sourceTime[1] || null;

//   $(removeElem).find('div').remove();
//   return item;
// };

/**
* Takes Body of results page and invokes buildNewsStory over every news story in the DOM
* @function
* @param {Object} body blah
* @returns {Array} Array of objects built from buildNewsStory
*/
// var getNews = function(body) {
//   var $ = cheerio.load(body);
//   var links = [];
//   $(stories).each(function(i, elem) {
//     links.push(buildNewsStory(elem, $));
//   });
//   return links;
// };