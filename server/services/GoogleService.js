/**
* @module GoogleService
*/
var Promise = require('bluebird');
var requestAsync = Promise.promisify(require('request')); 
var cheerio = require('cheerio');
var querystring = require('querystring');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

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

/** 
* Takes an individual news story form google news DOM results and returns object
* @function
* @param {Object} element individual li.g element from DOM
* @param {Object} $ jQuery like object containing entire DOM from results page
* @returns {Object} Object containing title, link, source, description, & time for a single news result
*/
GoogleService.prototype.getNewsResults = function(query, location, queryAmount) {
  var self = this;
  var url = self.url;
  var search = querystring.escape(query + ' location:' + location);
  var amount = (queryAmount > 50) ? 50 : queryAmount;
  var queryUrl = util.format(url, search, amount);

  var processBody = function(res, body) {
    return self._processBodyForResults(body);
  };

  return requestAsync(queryUrl)
    .spread(processBody)
    .catch(self.emit.bind(self, 'error'));
};

/** 
* Takes an individual news story form google news DOM results and returns object
* @function
* @param {Object} element individual li.g element from DOM
* @param {Object} $ jQuery like object containing entire DOM from results page
* @returns {Object} Object containing title, link, source, description, & time for a single news result
*/
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

/**
* Takes Body of results page and invokes buildNewsStory over every news story in the DOM
* @function
* @param {Object} body blah
* @returns {Array} Array of objects built from buildNewsStory
*/
GoogleService.prototype._processBodyForResults = function(body) {
  var $ = cheerio.load(body);
  var self = this;

  return _.reduce($(stories), function(mem, elem){
    mem.push(self._buildNewsItem(elem, $));
    return mem;
  }, []);
};

module.exports = new GoogleService(URL);